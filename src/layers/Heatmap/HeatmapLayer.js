import AbstractLayer from '../AbstractLayer';
import { pointsContain } from '../../utils/common';
import CircleBuffer from './HeatmapBuffer';
import Vector2 from '../../geometry/Vector2';

export default class HeatmapLayer extends AbstractLayer {
  constructor(style) {
    super('Heatmap', {
      ...HeatmapLayer.DEFAULT_STYLE,
      ...style,
    });
    this._geometryRenderList = [];
  }
  getGeometryRenderList() {
    return this._geometryRenderList;
  }
  queryFeaturesByWorld(x, y) {
    if (!this._renderer) return [];
    const onePixelToWorld = this._renderer.getCamera().getOnePixelToWorld();
    return pointsContain(this._layout, this._features, { x, y }, onePixelToWorld);
  }
  getBuffer() {
    return this._buffer;
  }
  onAdd(renderer) {
    super.onAdd(renderer);
    this._buffer = new CircleBuffer(renderer.getGl());
    const normals = HeatmapLayer.getCircleNormals();
    this._buffer.update({ normals: normals });
  }
  clear() {
    this._features.length = 0;
    this._geometryRenderList.length = 0;
  }
  onRemove() {
    super.onRemove();
    delete this._buffer;
  }
  setLayout(layout) {
    this._layout = { ...this._layout, ...layout };
    if (this._features.length !== 0) this._update();
  }
  _updateRenderList(e) {
    this._geometryRenderList.length = 0;
    const { info } = e;
    this._geometryRenderList = this._geometryRenderList.concat(info);
  }
  _update() {
    if (!this._renderer) return;
    const data = {
      id: this.id,
      features: this._features,
      type: 'heatmap',
      offset: this._renderer.getOffset(),
      layout: this._layout,
      taskId: this._getTaskId(),
      sync: this.getSync(),
    };
    const workerPool = this._renderer.getWorkerPool();
    workerPool.addTask(data);
  }
  getBase() {
    return this._layout.base;
  }
  static getCircleNormals() {
    if (!HeatmapLayer.CIRCLE_NORMALS) {
      HeatmapLayer.CIRCLE_NORMALS = [0, 0];
      const rotateV = new Vector2([0, 1]);
      const step = 16 / 180 * Math.PI;
      const max = Math.PI * 2 + step;
      for (let i = 0; i < max; i += step) {
        const rotate = i > Math.PI * 2 ? Math.PI * 2 : i;
        const item = rotateV.clone().rotate(rotate);
        HeatmapLayer.CIRCLE_NORMALS.push(item.x, item.y);
      }
    }
    return HeatmapLayer.CIRCLE_NORMALS;
  }
  static get DEFAULT_STYLE() {
    return {
      visible: true,
      base: 0,
      opacity: 1,
      radius: 20,
    }
  }
}
