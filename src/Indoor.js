/**
 * @file 
 * The entrance Indoor Class for react-indoor. Map initiation and 

*/

import MapView from './base/MapView';
import Camera from './camera/Camera';
import Point from './geometry/Point';
import Transitor from './transition/Transitor';
import { getFit } from './utils/common';
import timgingFns from './utils/timgingFns';

const defaultOptions = {
  pitch: 75,
  rotate: 0,
  zoom: 19,
  minZoom: 10,
  maxZoom: 30,
};

export default class Indoor extends MapView {
  constructor(options) {
    super({
      ...defaultOptions,
      ...options,
    });
    this.zoom = options.zoom;
    this.maxZoom = options.maxZoom;
    this.minZoom = options.minZoom;
    this.pitch = options.pitch;
    this.rotate = options.rotate;
    this.center = options.center;
    // status enum: INITIATED RENDERERING ERROR RENDERED
    this._status = 'INITIATED';
    this._floors = [];
    this._floorMap = new Map();
    this._floorDataMap = new Map();
    window.addEventListener('resize', event => {
      if (event.isTrusted) this.resize();
    });
  }
  async init({ floorData = [], buildingData = [] }, style = {}) {
    if (!Array.isArray(floorData) || !Array.isArray(buildingData) || !buildingData.find(item => item.defaultFloor)) {
      this._status = 'ERROR';
      this.fire('error');
      return
    }
    this._status = 'RENDERERING';
    this.fire('render');
    this._floors = [...buildingData];
    buildingData.forEach(item => {
      this._floorMap.set(item.floorId, item)
    });
    floorData.forEach(item => {
      this._floorDataMap.set(item.id, item)
    });

    const currentFloor = buildingData.find(item => item.defaultFloor);
    super.init(currentFloor, style);
    // draw the floor
    this.currentFloorId = currentFloor.floorId;
    this._status = 'RENDERED';
    this.fire('rendered')
  }
  destroy() {
    this._renderer && this._renderer.destroy();
    if (this._canvasContainer) delete this._canvasContainer;
    this._gestureManager.destroy();
    this._reset();
  }
  resize() {
    if (this._renderer) this._renderer.resize();
    this.fire('move');
  }
  jumpTo(params = {}) {
    if (!this._renderer) return;
    const camera = this._renderer.getCamera();
    const {
      center,
      zoom,
      rotate,
      pitch,
      offset = [0, 0],
    } = params;
    const cameraOptions = {};
    if (typeof zoom === 'number' && zoom > 0) {
      cameraOptions.zoom = getFit(zoom, this._options.minZoom, this._options.maxZoom);
    }
    if (typeof rotate === 'number') {
      cameraOptions.rotate = rotate;
    }
    if (typeof pitch === 'number') {
      cameraOptions.pitch = pitch;
    }
    const pointAtOffset = camera.centerPoint.add(new Point(offset[0], offset[1]));
    const locationAtOffset = camera.screenToWorldCoordinate(pointAtOffset.x, pointAtOffset.y);
    const endCenter = center ? new Point(center.x, center.y) : locationAtOffset.clone();
    camera.set(cameraOptions);
    camera.setCenterAtPoint(endCenter, pointAtOffset);
    this._renderer.render();
    this._fireEvent(params, 'Start');
    this._fireEvent(params, '');
    this._fireEvent(params, 'End');
  }
  easeTo(params = {}) {
    if (!this._renderer) return;
    const camera = this._renderer.getCamera();
    const startZoom = camera.getZoom();
    const startRotate = camera.getRotate();
    const startPitch = camera.getPitch();
    if (this._transitor) this.transitor.stop();
    let {
      center,
      zoom = startZoom,
      rotate = startRotate,
      pitch = startPitch,
      offset = [0, 0],
      duration = 500,
      timingFn = 'easeOutCirc',
    } = params;
    zoom = getFit(zoom, this._options.minZoom, this._options.maxZoom);
    const pointAtOffset = camera.centerPoint.add(new Point(offset[0], offset[1]));
    const locationAtOffset = camera.screenToWorldCoordinate(pointAtOffset.x, pointAtOffset.y);
    const endCenter = center ? new Point(center.x, center.y) : locationAtOffset.clone();
    const from = locationAtOffset.clone();
    const centerDelta = endCenter.clone().subtract(from);
    this._fireEvent(params, 'Start');
    this._transitor = (new Transitor).init(0, 1, duration);
    if (timgingFns[timingFn]) this._transitor.setTimingFn(timingFn);
    const endRotate = Camera.normalizeRotate(rotate, startRotate);
    this._transitor.on('update', (e) => {
      if (!this._renderer) return;
      const progress = e.num / 1;
      const cameraOptions = {
        zoom: startZoom + (zoom - startZoom) * progress,
        rotate: startRotate + (endRotate - startRotate) * progress,
        pitch: startPitch + (pitch - startPitch) * progress,
      };
      camera.set(cameraOptions);
      const delta = centerDelta.clone().multiply(progress);
      const newCenter = from.clone().add(delta);
      camera.setCenterAtPoint(newCenter, pointAtOffset);
      this._renderer.render();
      this._renderer.updateCollision(false);
      this._fireEvent(params, '');
    }).on('complete', () => {
      delete this._transitor
      this._fireEvent(params, 'End');
      if (params.complete) params.complete();
    }).start();
  }
  zoomIn() {
    if (!this._renderer) return;
    const endZoom = getFit(this.zoom + 1, this._options.minZoom, this._options.maxZoom);
    this.easeTo({ zoom: endZoom, duration: 550 });
  }
  zoomOut() {
    if (!this._renderer) return;
    const endZoom = getFit(this.zoom - 1, this._options.minZoom, this._options.maxZoom);
    this.easeTo({ zoom: endZoom, duration: 550 });
  }
  fitBounds(bounds, padding = 0) {
    if (!this._renderer) return;
    const { topLeft, bottomRight } = bounds;
    if (!topLeft || !bottomRight) return;
    const world1 = new Point(topLeft.x, topLeft.y);
    const world2 = new Point(bottomRight.x, bottomRight.y);
    const camera = this._renderer.getCamera();
    const center = {
      x: (world1.x + world2.x) / 2,
      y: (world1.y + world2.y) / 2,
    };
    const p0world = camera.project(world1);
    const p1world = camera.project(world2);
    const upperRight = new Point(Math.max(p0world.x, p1world.x), Math.max(p0world.y, p1world.y));
    const lowerLeft = new Point(Math.min(p0world.x, p1world.x), Math.min(p0world.y, p1world.y));
    const size = upperRight.clone().subtract(lowerLeft);
    const scaleX = (camera.getWidth() - (padding * 2)) / size.x;
    const scaleY = (camera.getHeight() - (padding * 2)) / size.y;
    let zoom;
    if (scaleX < 0 || scaleY < 0) {
      zoom = camera.getZoom();
    }
    const { minZoom, maxZoom } = this._options;
    const startScale = Math.pow(2, camera.getZoom());
    zoom = getFit(Math.log2(startScale * Math.min(scaleX, scaleY)), minZoom, maxZoom);
    this.easeTo({ center, zoom, rotate: 0 });
  }
  addLayers(layers) {
    for (let i = 0; i < layers.length; i += 1) {
      if (!this.hasLayer(layers[i])) {
        this._addLayer(layers[i]);
        if (this._checkIsNeedAdd(layers[i])) {
          if (this._renderer) this._renderer.addLayer(layers[i]);
        }
      }
    }
    if (!this._renderer) return;
    this._renderer.sortLayer();
  }
  addLayer(layer) {
    if (this.hasLayer(layer)) return;
    this._addLayer(layer);
    if (this._checkIsNeedAdd(layer) && this._renderer) {
      this._renderer.addLayer(layer);
      this._renderer.sortLayer();
    }
  }
  removeLayers(layers) {
    for (let i = 0; i < layers.length; i += 1) {
      this._removeLayer(layers[i]);
    }
    if (this._renderer) this._renderer.updateCollision();
  }
  removeLayer(layer) {
    const isNeedUpdateCollision = layer.getType() === 'Icon' && layer.getCollisionRenderList().length > 0;
    this._removeLayer(layer);
    if (this._renderer) {
      this._renderer.render();
      if (isNeedUpdateCollision) this._renderer.updateCollision();
    }
  }

  set currentFloorId(floorId) {
    this.currentFloor = this._floorMap.get(floorId);
    this.currentFloorData = this._floorDataMap.get(floorId);
    this.fire('changeFloor', floorId);
    this._drawFloor(this.currentFloorData);
  }

  set maxZoom(maxZoom) {
    const minZoom = this._options.minZoom;
    if (maxZoom <= minZoom) {
      console.warn('maxZoom need to be larger than minZoom ');
      return;
    }
    this._options.maxZoom = maxZoom;
    if (this.zoom > maxZoom) {
      this.jumpTo({ zoom: maxZoom });
    }
  }

  set minZoom(minZoom) {
    const maxZoom = this._options.maxZoom;
    if (minZoom >= maxZoom) {
      console.warn('minZoom need to be smaller than maxZoom');
      return;
    }
    this._options.minZoom = minZoom;
    if (this.zoom < minZoom) {
      this.jumpTo({ zoom: minZoom });
    }
  }

  get center() {
    return this._renderer && this._renderer.getCamera().getCenter();
  }
  set center(center) {
    this.jumpTo({ center });
  }

  get zoom() {
    return this._renderer && this._renderer.getCamera().getZoom();
  }
  set zoom(zoom) {
    this.jumpTo({ zoom });
  }

  get rotate() {
    return this._renderer && this._renderer.getCamera().getRotate();
  }
  set rotate(rotate) {
    this.jumpTo({ rotate });
  }

  get pitch() {
    return this._renderer && this._renderer.getCamera().getPitch();
  }
  set pitch(pitch) {
    this.jumpTo({ pitch });
  }

  _reset() {
    this._layers.length = 0;
    this._floors.length = 0;
    this._floorMap.clear();
    this._floorDataMap.clear();
    this._hasDrawFloorId.clear();
  }
}
