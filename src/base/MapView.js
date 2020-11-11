import uuid from 'uuid';

import Base from './Base';

import GestureManager from '../gesture/GestureManager';
import Renderer from '../core/Renderer';
import Point from '../geometry/Point';
import StyleManager from '../style/Style';

import FrameLayer from '../layers/Frame/FrameLayer';
import RoomLayer from '../layers/Room/RoomLayer';
import IconLayer from '../layers/Icon/IconLayer';
import { createFeaturePoint, step } from '../utils/common';
import { MAX_ROOM_PER_RENDER } from '../utils/constants';

export default class MapView extends Base {
  constructor(options) {
    super();
    this._canvasContainer = options.container;
    this._mapCanvas = options.mapCanvas;
    this._glyphCanvas = options.glyphCanvas;
    this._textureCanvas = options.textureCanvas;
    this._layers = [];
    this._styleMng = new StyleManager(options.styleData);
    this._hasDrawFloorId = new Set();
    this._minZoom = options.minZoom;
    this._maxZoom = options.maxZoom;
    this._options = options;
    this._id = uuid();
    this.on('moveEnd', this._onMoveEnd.bind(this));
    // gesture
    this._gestureManager = new GestureManager(this);
  }
  init(currentFloor, style) {
    this._renderer = new Renderer(
      this._canvasContainer,
      {
        mapId: this._id,
        mapCanvas: this._mapCanvas,
        glyphCanvas: this._glyphCanvas,
        textureCanvas: this._textureCanvas,
      }, {
        zoom: this._options.zoom,
        rotate: this._options.rotate,
        pitch: this._options.pitch,
        lightPos: this._options.lightPos,
        localFontFamily: this._options.localFontFamily,
        fontWeight: this._options.fontWeight,
        maxTextSize: this._options.maxTextSize,
        textSplit: this._options.textSplit,
    });
    this._renderer.getCamera().set({ center: this._options.center });
    // set camera
    this._initCamera(currentFloor);
  }

  _onMoveEnd() {
    if (this._renderer) this._renderer.updateCollision();
  }
  _initCamera(currentFloor) {
    if (!this._renderer) return;
    const camera = this._renderer.getCamera();
    const [x, y] = currentFloor.center.coordinates;
    const { bounds } = currentFloor;
    camera.setMaxBounds(bounds && {
      topLeft: { x: bounds[0][0], y: bounds[1][1] },
      bottomRight: { x: bounds[1][0], y: bounds[0][1] },
    });
    this._renderer.setOffset(-x, -y);
    if (!this._options.center) camera.set({ center: { x, y } });
  }
  _update(floors) {
    if (!this._renderer) return;
    this._renderer.clear();
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
        this._renderer.addLayer(value[i]);
      }
    });
    this._renderer.sortLayer();
    this._renderer.render();
    this._renderer.updateCollision();
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
    this._drawFloorLayers(floorData);
    this._update(this._floors);
  }
  _drawFloorLayers(floorData) {
    const { id: floorId } = floorData;
    if (this._hasDrawFloorId.has(floorId)) return;
    const { frame, property, room } = floorData;
    this._drawFrame(frame.features, floorId);
    const { text } = this._drawRoom(room.features, floorId);
    this._drawIcon(text, floorId);
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
  _drawRoom(features, floorId) {
    if (!this._styleMng) return { text: [], extra: [] };
    const roomStyle = this._styleMng.getStyle('room');
    if (!roomStyle) return { text: [], extra: [] };
    const roomFeatures = [];
    const roomIconFeatures = [];
    for (let i = 0; i < features.length; i += 1) {
      const { properties } = features[i];
      roomFeatures.push(features[i]);
      const point = properties && (properties.labelpoint || properties.center);
      if (point) roomIconFeatures.push(createFeaturePoint(point, properties));
    }

    if (roomFeatures.length !== 0) {
      step(roomFeatures, MAX_ROOM_PER_RENDER, item => {
        const layer = new RoomLayer(roomStyle);
        layer.setFeatures(item).setName('room').setFloorId(floorId);
        this._layers.push(layer);
      });
    }
    return { text: roomIconFeatures };
  }
  _drawIcon(features, floorId) {
    if (!this._styleMng || features.length === 0) return;
    const roomIconStyle = this._styleMng.getStyle('roomIcon');
    if (!roomIconStyle) return;
    const layer = new IconLayer(roomIconStyle);
    layer.setFeatures(features).setName('icon').setFloorId(floorId);
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
    if (this._renderer) this._renderer.removeLayer(layer);
  }
  hasLayer(layer) {
    for (let i = 0; i < this._layers.length; i += 1) {
      if (this._layers[i].id === layer.id) return true;
    }
    return false;
  }
  updateLayer(layer) {
    const floorId = layer.getFloorId();
    if (!this._renderer || !floorId) return;
    const isContain = this._renderer.contains(layer);
    let isNeedUpdate = false;
    if (this._checkIsNeedAdd(layer)) {
      if (!isContain) {
        this._renderer.addLayer(layer);
        this._renderer.sortLayer();
        isNeedUpdate = true;
      }
    } else if (isContain) {
      this._renderer.removeLayer(layer, false);
      isNeedUpdate = true;
    }
    if (isNeedUpdate) {
      this._renderer.render();
      if (layer.getType() === 'Icon' && layer.getCollisionRenderList().length > 0) this._renderer.updateCollision();
    }
  }
  _checkIsNeedAdd(layer) {
    if (!this.currentFloor) return false;
    return layer.getFloorId() === this.currentFloor.floorId || layer.getAlwaysShow();
  }
  screenToWorldCoordinate(screenX, screenY) {
    if (!this._renderer) return new Point(0, 0);
    const camera = this._renderer.getCamera();
    return camera.screenToWorldCoordinate(screenX, screenY);
  }
  worldToScreenCoordinate(worldX, worldY) {
    if (!this._renderer) return new Point(0, 0);
    const camera = this._renderer.getCamera();
    return camera.worldToScreenCoordinate(worldX, worldY);
  }
  getRenderer() {
    return this._renderer;
  }
  getCamera() {
    return this._renderer && this._renderer.getCamera();
  }
  getCanvasContainer() {
    return this._canvasContainer;
  }
  get gestureManager() {
    return this._gestureManager
  }
}
