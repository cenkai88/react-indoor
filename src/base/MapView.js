import Base from './Base';

import GestureManager from '../gesture/GestureManager';
import Core from '../core/Core';
import Point from '../geometry/Point';
import StyleManager from '../style/Style';

import FrameLayer from '../layers/Frame/FrameLayer';

export default class MapView extends Base {
  constructor(options) {
    super();
    this._canvasContainer = options.container;
    this._mapCanvas = options.mapCanvas;
    this._layers = [];
    this._styleMng = new StyleManager(options.styleJson);
    this._hasDrawFloorId = new Set();
    this._minZoom = options.minZoom;
    this._maxZoom = options.maxZoom;
    this._options = options;
    this.on('moveEnd', this._onMoveEnd.bind(this));
     // gesture
     this._gestureManager = new GestureManager(this);
  }
  init(currentFloor, style) {
    this._engine = new Core(this._canvasContainer, this._mapCanvas, {
      zoom: this._options.zoom,
      rotate: this._options.rotate,
      pitch: this._options.pitch,
      lightPos: this._options.lightPos,
      localFontFamily: this._options.localFontFamily,
      fontWeight: this._options.fontWeight,
      maxTextSize: this._options.maxTextSize,
      textSplit: this._options.textSplit,
    });
    this._engine.getCamera().set({ center: this._options.center });
    // set camera
    this._initCamera(currentFloor);
  }

  _onMoveEnd() {
    if (this._engine) this._engine.updateCollision();
  }
  _initCamera(currentFloor) {
    if (!this._engine) return;
    const camera = this._engine.getCamera();
    const [x, y] = currentFloor.center.coordinates;
    const { bounds } = currentFloor;
    camera.setMaxBounds(bounds && {
      topLeft: { x: bounds[0][0], y: bounds[1][1] },
      bottomRight: { x: bounds[1][0], y: bounds[0][1] },
    });
    this._engine.setOffset(-x, -y);
    if (!this._options.center) camera.set({ center: { x, y } });
  }
  _update(floors) {
    if (!this._engine) return;
    this._engine.clear();
    const layerMap = new Map();
    for (let i = 0; i < floors.length; i += 1) {
      layerMap.set(floors[i].floorId, []);
    }
    for (let i = 0; i < this._layers.length; i += 1) {
      if (this._checkIsNeedAdd(this._layers[i])) {
        this._processLayer(this._layers[i], layerMap, false);
      }
    }
    layerMap.forEach(value => {
      for (let i = 0; i < value.length; i += 1) {
        this._engine.addLayer(value[i]);
      }
    });
    this._engine.sortLayer();
    this._engine.render();
    this._engine.updateCollision();
  }
  _processLayer(layer, layerMap) {
    let groupId = this.currentFloor.floorId;
    layer.setGroupId(groupId);
    const item = layerMap.get(groupId);
    if (item) item.push(layer);
  }
  async _drawFloor(floorData) {
    if (!this._styleMng) return
    if (this._hasDrawFloorId.has(floorData.id)) {
      this._update(this._floors);
      return;
    }
    this._drawFloorLayer(floorData);
    this._update(this._floors);
  }
  _drawFloorLayer(floorData) {
    const { id: floorId } = floorData;
    if (this._hasDrawFloorId.has(floorId)) return;
    const { frame, area, property, room } = floorData;
    this._drawFrame(frame.features, floorId);
    this._hasDrawFloorId.add(floorId);
  }
  _drawFrame(features, floorId) {
    // just add the layer into this._layers
    if (!this._styleMng) return;
    const frameStyle = this._styleMng.getStyle('frame');
    if (!frameStyle) return;
    const layer = new FrameLayer(frameStyle);
    layer.setFeatures(features).setFloorId(floorId).setName('frame');
    this._layers.push(layer);
  }
  _fireEvent(params, suffix) {
    const {
      zoom,
      rotate,
      pitch,
    } = params;
    this.fire(`move${suffix}`);
    if (typeof zoom === 'number' && zoom > 0) this.fire();
    if (typeof rotate === 'number') this.fire(`rotate${suffix}`);
    if (typeof pitch === 'number') this.fire(`pitch${suffix}`);
  }
 
  _addLayer(layer) {
    this._layers.push(layer);
  }
  _removeLayer(layer) {
    const index = this._layers.findIndex(item => item.id === layer.id);
    if (index !== -1) this._layers.splice(index, 1);
    if (this._engine) this._engine.removeLayer(layer);
  }
  hasLayer(layer) {
    for (let i = 0; i < this._layers.length; i += 1) {
      if (this._layers[i].id === layer.id) return true;
    }
    return false;
  }
  updateLayer(layer) {
    const floorId = layer.getFloorId();
    if (!this._engine || !floorId) return;
    const isContain = this._engine.contains(layer);
    let isNeedUpdate = false;
    if (this._checkIsNeedAdd(layer)) {
      if (!isContain) {
        this._engine.addLayer(layer);
        this._engine.sortLayer();
        isNeedUpdate = true;
      }
    } else if (isContain) {
      this._engine.removeLayer(layer, false);
      isNeedUpdate = true;
    }
    if (isNeedUpdate) {
      this._engine.render();
      if (layer.getType() === 'Symbol' && layer.getCollisionRenderList().length > 0) this._engine.updateCollision();
    }
  }
  _checkIsNeedAdd(layer) {
    if (!this.currentFloor) return false;
    return layer.getFloorId() === this.currentFloor.floorId || layer.getAlwaysShow();
  }
  screenToWorldCoordinate(screenX, screenY) {
    if (!this._engine) return new Point(0, 0);
    const camera = this._engine.getCamera();
    return camera.screenToWorldCoordinate(screenX, screenY);
  }
  worldToScreenCoordinate(worldX, worldY) {
    if (!this._engine) return new Point(0, 0);
    const camera = this._engine.getCamera();
    return camera.worldToScreenCoordinate(worldX, worldY);
  }
  getEngine() {
    return this._engine;
  }
  getCamera() {
    return this._engine && this._engine.getCamera();
  }
  getCanvasContainer() {
    return this._canvasContainer;
  }
  get gestureManager() {
    return this._gestureManager
  }
}
