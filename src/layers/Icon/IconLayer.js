import AbstractLayer from '../AbstractLayer';
import TextBuffer from './IconBuffer';
import { getStyle } from '../../utils/style';
import { createScreenBounds } from '../../utils/common';

export default class IconLayer extends AbstractLayer {
  constructor(style) {
    super('Icon', {
      ...IconLayer.DEFAULT_STYLE,
      ...style,
    });
    this._dataItemList = [];
    this._geometryRenderList = [];
    this._collisionList = [];
    this._collisionRenderList = [];
    this._loadPromiseSet = new Set();
    this._collisionIndices = [];
  }
  _onCollisionChange(e) {
    const { showResult, normalResult } = e;
    const showArr = showResult[this.id] || [];
    const normalArr = normalResult[this.id] || [];
    this._collisionIndices = showArr.concat(normalArr);
  }
  _onBucketChange(data) {
    const oldNum = this._collisionRenderList.length;
    super._onBucketChange(data);
    const newNum = this._collisionRenderList.length;
    if (data.isRender && (oldNum !== newNum || newNum > 0) && this._renderer) {
      this._renderer.updateCollision();
    }
  }
  clear() {
    this._features.length = 0;
    this._collisionList.length = 0;
    this._geometryRenderList.length = 0;
    this._collisionRenderList.length = 0;
  }
  setLayout(layout) {
    this._layout = { ...this._layout, layout };
    if (this._features.length !== 0) this._update();
  }
  onAdd(renderer) {
    super.onAdd(renderer);
    const collisionMng = renderer.getCollisionMng();
    collisionMng.add(this.getCollisionData());
    this.listenerIdx = collisionMng.getWorkerPool().listen(this._renderer._mapId, this._onCollisionChange.bind(this));
  }
  unbind() {
    if (this._renderer) {
      const collisionMng = this._renderer.getCollisionMng();
      collisionMng.remove(this.getCollisionData());
      if (this.listenerIdx !== undefined) collisionMng.getWorkerPool().unListen(this._renderer._mapId, this.listenerIdx);
    }
    super.unbind();
  }
  getGeometryRenderList() {
    return this._geometryRenderList;
  }
  getCollisionRenderList() {
    return this._collisionRenderList;
  }
  getCollisionData() {
    return {
      data: this._collisionList,
      floorId: this.getGroupId(),
      id: this.id,
    };
  }
  queryFeaturesByWorld(x, y) {
    if (!this._renderer) return [];
    const screen = this._renderer.getCamera().worldToScreenCoordinate(x, y);
    const result = [];
    const collisionSet = new Set(this._collisionIndices);
    let index = 0;
    for (let i = 0; i < this._dataItemList.length; i += 1) {
      const { properties } = this._dataItemList[i];
      const visible = getStyle(this._layout, 'visible', properties);
      const collision = getStyle(this._layout, 'collision', properties);
      if (visible) {
        if (!collision || collisionSet.has(index)) {
          if (this._checkDataItem(this._dataItemList[i], screen)) {
            result.push({
              type: this._dataItemList[i].type,
              geometry: this._dataItemList[i].geometry,
              properties: this._dataItemList[i].properties,
            });
          }
        }
        index += 1;
      }
    }
    return result;
  }
  _checkDataItem(feature, screen) {
    if (!this._renderer) return false;
    const textBaseSize = this._renderer.getGlyphMng().getBaseSize();
    const { textSize, iconSize, properties } = feature;
    const textOffset = getStyle(this._layout, 'textOffset', properties);
    const textAnchor = getStyle(this._layout, 'textAnchor', properties);
    const textScale = getStyle(this._layout, 'textSize', properties) / textBaseSize;
    const iconAnchor = getStyle(this._layout, 'iconAnchor', properties);
    const iconOffset = getStyle(this._layout, 'iconOffset', properties);
    const iconScale = getStyle(this._layout, 'iconSize', properties);
    return (textSize && this._check(feature, screen, textAnchor, textOffset, textSize, textScale)) ||
      (iconSize && this._check(feature, screen, iconAnchor, iconOffset, iconSize, iconScale));
  }
  _check(feature, screen, anchor, offset, bounds, scale) {
    if (!this._renderer) return false;
    const size = [bounds[0] * scale, bounds[1] * scale];
    const { geometry } = feature;
    if (geometry.type === 'Point') {
      const point = this._renderer.getCamera().worldToScreenCoordinate(geometry.coordinates[0], geometry.coordinates[1]);
      const bounds_1 = createScreenBounds([point.x - offset[0], point.y - offset[1]], size[0], size[1], anchor);
      return IconLayer.checkInBounds(screen, bounds_1);
    }
    else if (geometry.type === 'MultiPoint') {
      for (let j = 0; j < geometry.coordinates.length; j += 1) {
        const point = this._renderer.getCamera().worldToScreenCoordinate(geometry.coordinates[j][0], geometry.coordinates[j][1]);
        const bounds_2 = createScreenBounds([point.x - offset[0], point.y - offset[1]], size[0], size[1], anchor);
        if (IconLayer.checkInBounds(screen, bounds_2)) return true
      }
    }
    return false;
  }
  _updateRenderList(data) {
    if (!this._renderer) return;
    this._collisionList.length = 0;
    this._geometryRenderList.length = 0;
    this._collisionRenderList.length = 0;
    const textureMng = this._renderer.getTextureMng();
    const { info } = data;
    for (let i = 0; i < info.length; i += 1) {
      const { isCollision, collision } = info[i];
      const arr = [];
      for (let j = 0; j < info[i].data.length; j += 1) {
        const geometry = info[i].data[j];
        const buffer = new TextBuffer(this._renderer.getGl());
        let texture = void 0;
        if (geometry.iconUrl) {
          const temp = textureMng.getTexture(geometry.iconUrl, IconLayer.TEXTURE_PARAMS);
          if (temp) {
            texture = temp.texture;
          }
        }
        buffer.update({
          vertices: geometry.vertices,
          texCoords: geometry.texCoords,
          texture: texture,
          textOptions: geometry.textOptions,
        });
        buffer.setGlyphMng(this._renderer.getGlyphMng());
        const render = {
          point: geometry.point,
          base: geometry.base,
          opacity: geometry.opacity,
          buffer: buffer,
          offset: geometry.offset,
        };
        arr.push(render);
      }
      if (isCollision) {
        this._collisionList.push(collision);
        this._collisionRenderList.push(arr);
      }
      else {
        this._geometryRenderList.push(arr);
      }
    }
  }
  _update() {
    if (!this._renderer) return;
    const dataItemList = [];
    for (let i = 0; i < this._features.length; i += 1) {
      this._calcPoint(this._features[i], res => {
        dataItemList.push(res);
      });
    }
    this._dataItemList = dataItemList;
    const workerPool = this._renderer.getWorkerPool();
    const data = {
      type: 'icon',
      layout: this._layout,
      features: this._dataItemList,
      offset: this._renderer.getOffset(),
      baseTextSize: this._renderer.getGlyphMng().getBaseSize(),
      id: this.id,
      taskId: this._getTaskId(),
      sync: this.getSync(),
    };
    if (this._loadPromiseSet.size === 0) {
      workerPool.addTask(data);
    }
    else {
      new Promise(resolve => {
        Promise.all(this._loadPromiseSet).then(resolve).catch(resolve);
      }).then(() => {
        workerPool.addTask(data);
      });
    }
  }
  async _calcPoint(feature, cb) {
    let iconSize;
    let textSize;
    let textArr;
    if (!this._renderer) return;
    const glyphMng = this._renderer.getGlyphMng();
    const textureMng = this._renderer.getTextureMng();
    const iconUrl = getStyle(this._layout, 'iconImage', feature.properties);
    let tempTexture;
    if (iconUrl) {
      tempTexture = textureMng.getTexture(iconUrl, IconLayer.TEXTURE_PARAMS);
      if (!tempTexture) {
        const promise = textureMng.loadTexture(iconUrl, IconLayer.TEXTURE_PARAMS);
        this._loadPromiseSet.add(promise);
        promise.then(() => this._loadPromiseSet.delete(promise));
        tempTexture = await promise;
      }
      iconSize = [tempTexture.width, tempTexture.height];
    }
    const textField = getStyle(this._layout, 'textField', feature.properties);
    if (
      textField &&
      feature.properties &&
      feature.properties[textField] !== undefined &&
      feature.properties[textField] !== null
    ) {
      const text = feature.properties[textField].toString();
      const textBounds = glyphMng.getTextBound(text);
      textSize = [textBounds.width, textBounds.height];
      textArr = textBounds.textArr;
    }
    cb({
      ...feature,
      iconSize,
      textArr,
      textSize,
    });
  }
  checkInBounds(point, bounds) {
    const { leftBottom, rightTop } = bounds;
    return leftBottom[0] <= point.x && point.x <= rightTop[0] &&
      leftBottom[1] <= point.y && point.y <= rightTop[1];
  }
  static get DEFAULT_STYLE() {
    return {
      visible: true,
      base: 0,
      opacity: 1,
      weight: 0,
      margin: 0,
      iconAnchor: 'center',
      iconSize: 1,
      iconOffset: [0, 0],
      iconZHeight: 0,
      textColor: '#666666',
      textAnchor: 'center',
      textSize: 16,
      textOffset: [0, 0],
      textZHeight: 0,
    }
  }
  static get TEXTURE_PARAMS() {
    return { xRepeat: false, yRepeat: false }
  }
}
