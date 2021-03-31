import AbstractLayer from '../AbstractLayer';
import { linesContain } from '../../utils/common';
import LineBuffer from './LineBuffer';
import { getStyle } from '../../utils/style';
// import Vector2 from '../../geometry/Vector2';

export default class LineLayer extends AbstractLayer {
  constructor(style) {
    super('Line', {
      ...LineLayer.DEFAULT_STYLE,
      ...style,
    });
    this._geometryRenderList = [];
    this._loadPromiseSet = new Set();
  }
  clear() {
    this._features.length = 0;
    this._geometryRenderList.length = 0;
  }
  _updateRenderList(data) {
    if (!this._renderer) return;
    this._geometryRenderList.length = 0;
    const textureMng = this._renderer.getTextureMng();
    const { info } = data;
    for (let i = 0; i < info.length; i += 1) {
      const buffer = new LineBuffer(this._renderer.getGl());
      let texture = textureMng.getEmptyTexture();
      let imgSize = [0, 0];
      const iconUrl = info[i].iconUrl;
      if (iconUrl) {
        const item = textureMng.getTexture(iconUrl, LineLayer.TEXTURE_PARAMS);
        if (item) {
          texture = item.texture;
          imgSize = [item.width, item.height];
        }
      }
      buffer.update({
        vertices: info[i].vertices,
        texCoords: info[i].texCoords,
        normals: info[i].normals,
        texture: texture,
        deviation: info[i].deviation,
        indices: info[i].indices,
      });
      this._geometryRenderList.push({
        buffer: buffer,
        lineColor: info[i].color,
        base: info[i].base,
        opacity: info[i].opacity,
        useTexture: Boolean(iconUrl),
        lineWidth: info[i].width,
        imgSize: imgSize,
      });
    }
  }
  setLayout(layout) {
    this._layout = { ...this._layout, ...layout };
    if (this._features.length !== 0) this._update();
  }
  queryFeaturesByWorld(x, y) {
    if (!this._renderer) return [];
    const onePixelToWorld = this._renderer.getCamera().getOnePixelToWorld();
    return linesContain(this._layout, this._features, { x, y }, onePixelToWorld);
  }
  getGeometryRenderList() {
    return this._geometryRenderList;
  }
  _update() {
    if (!this._renderer) return;
    for (let i = 0; i < this._features.length; i += 1) {
      this._calcPolyline(this._features[i]);
    }
    const workerPool = this._renderer.getWorkerPool();
    const data = {
      id: this.id,
      mapInsId:  this._renderer.getMapId(),
      type: 'line',
      features: this._features,
      layout: this._layout,
      offset: this._renderer.getOffset(),
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
  async _calcPolyline(feature) {
    if (!this._renderer) return;
    const textureMng = this._renderer.getTextureMng();
    const lineImage = getStyle(this._layout, 'lineImage', feature.properties);
    if (lineImage) {
      const tempTexture = textureMng.getTexture(lineImage, LineLayer.TEXTURE_PARAMS);
      if (!tempTexture) {
        const promise = textureMng.loadTexture(lineImage, LineLayer.TEXTURE_PARAMS);
        this._loadPromiseSet.add(promise);
        promise.then(() => this._loadPromiseSet.delete(promise));
      }
    }
  }
  static get TEXTURE_PARAMS() {
    return { xRepeat: true, yRepeat: true }
  }
  static get DEFAULT_STYLE() {
    return {
      visible: true,
      lineWidth: 10,
      opacity: 1,
      base: 0,
      lineColor: '#666666',
    }
  }
}
