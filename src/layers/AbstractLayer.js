/**
 * @file 
 * Shared methods and properties among different layer Class(mainly event related)

*/

import { GlobalIdGenerator } from '../utils/common';
import Base from '../base/Base';

const config = {
  Fill: { order: 1, shaderName: 'fill' },
  Picture: { order: 2, shaderName: 'picture' },
  Line: { order: 2, shaderName: 'line' },
  Connection: { order: 2, shaderName: 'connection' },
  FillExtrusion: { order: 3, shaderName: 'fillExtrusion' },
  Track: { order: 4, shaderName: 'track' },
  Circle: { order: 5, shaderName: 'circle' },
  Heatmap: { order: 5, shaderName: 'heatmap' },
  Symbol: { order: 6, shaderName: 'symbol' },
  Model: { order: 7, shaderName: 'model' },
};

export default class AbstractLayer extends Base {
  constructor(type, layout) {
    super();
    this._id = GlobalIdGenerator.getId();
    this._name = 'layer';
    this._features = [];
    this._alwaysShow = false;
    this._isSync = false;
    this._ignoreMultiFade = false;
    this._bindMap = new Map();
    const { shaderName, order } = config[type];
    this._shaderName = shaderName;
    this._order = order;
    this._type = type;
    this._layout = { ...layout };
    this._lastLayout = { ...layout };
  }

  on(type, listener) {
    super.on(type, listener);
    switch (type) {
      case 'click':
        this._checkBind('click', this._onclick.bind(this));
        break;
      case 'mousedown':
        this._checkBind('mousedown', this._onmousedown.bind(this));
        break;
      case 'mousemove':
        this._checkBind('mousemove', this._onmousemove.bind(this));
        break;
      case 'mouseup':
        this._checkBind('mouseup', this._onmouseup.bind(this));
        break;
    }
    return this;
  }

  off(type, listener) {
    super.off(type, listener);
    switch (type) {
      case 'click':
        this._checkOff('click', this._onclick.bind(this));
        break;
      case 'mousedown':
        this._checkOff('mousedown', this._onmousedown.bind(this));
        break;
      case 'mousemove':
        this._checkOff('mousemove', this._onmousemove.bind(this));
        break;
      case 'mouseup':
        this._checkOff('mouseup', this._onmouseup.bind(this));
        break;
    }
    return this;
  }

  _checkBind(type, listener) {
    if (this._bindMap.has(type) || !this._engine) return;
    const listeners = this.getListeners(type);
    if (listeners && listeners.length !== 0) {
      this._engine.on(type, listener, { order: this._order, type: 'top' });
      this._bindMap.set(type, true);
    }
  }

  _checkOff(type, listener) {
    const listeners = this.getListeners(type);
    if (!listeners || listeners.length === 0) {
      this._bindMap.delete(type);
      if (this._engine) this._engine.off(type, listener);
    }
  }

  setIgnoreMultiFade(flag) {
    this._ignoreMultiFade = flag;
  }

  getIgnoreMultiFade() {
    return this._ignoreMultiFade;
  }

  _getTaskId() {
    return GlobalIdGenerator.getId();
  }

  setSync(sync) {
    this._isSync = sync;
  }

  getSync() {
    return this._isSync;
  }

  setAlwaysShow(alwaysShow) {
    this._alwaysShow = alwaysShow;
  }

  getAlwaysShow() {
    return this._alwaysShow;
  }

  getLayout() {
    return this._layout;
  }

  setFeatures(features) {
    this._features = features;
    this._update();
    return this;
  }

  getFeatures() {
    return this._features;
  }

  resetLayout() {
    this._layout = { ...this._lastLayout };
    this._update();
  }

  setFloorId(floorId) {
    this._floorId = floorId;
    this._groupId = floorId;
    return this;
  }

  getFloorId() {
    return this._floorId;
  }

  getShaderName() {
    return this._shaderName;
  }

  getType() {
    return this._type;
  }

  setName(name) {
    this._name = name;
    return this;
  }

  getName() {
    return this._name;
  }

  getOrder() {
    return this._order;
  }

  setOrder(order) {
    this._order = order;
  }

  setGroupId(groupId) {
    this._groupId = groupId;
  }

  getGroupId() {
    return this._groupId;
  }

  onAdd(engine) {
    const hasAdd = Boolean(this._engine);
    this._engine = engine;
    this._checkBind('click', this._onclick.bind(this));
    this._checkBind('mousedown', this._onmousedown.bind(this));
    this._checkBind('mousemove', this._onmousemove.bind(this));
    this._checkBind('mouseup', this._onmouseup.bind(this));
    if (!hasAdd) {
      const bucketMng = this._engine.getBucketMng();
      bucketMng.register(this._id, this._onBucketChange.bind(this));
      this._update();
    }
  }

  unbind() {
    if (this._engine) {
      this._engine.off('click', this._onclick.bind(this));
      this._engine.off('mousedown', this._onmousedown.bind(this));
      this._engine.off('mousemove', this._onmousemove.bind(this));
      this._engine.off('mouseup', this._onmouseup.bind(this));
      this._bindMap.clear();
    }
  }

  onRemove() {
    this.clear();
    this.unbind();
    if (this._engine) {
      const bucketMng = this._engine.getBucketMng();
      bucketMng.unregister(this._id);
      delete this._engine;
    }
  }

  _onBucketChange(data) {
    this._updateRenderList(data);
    if (this._engine) {
      if (data.isRender) this._engine.render();
      if (data.isUpdateCollision) this._engine.updateCollision();
    }
  }

  _fireEvent(type, e) {
    const world = e.getWorld();
    const features = this.queryFeaturesByWorld(world.x, world.y);
    if (features.length !== 0) this.fire(type, { e, features });
  }

  _onclick(e) {
    if (!e.isCancel()) this._fireEvent('click', e);
  }

  _onmousedown(e) {
    if (!e.isCancel()) this._fireEvent('mousedown', e);
  }

  _onmousemove(e) {
    if (!e.isCancel()) this._fireEvent('mousemove', e);
  }

  _onmouseup(e) {
    if (!e.isCancel()) this._fireEvent('mouseup', e);
  }

  get id() {
    return this._id
  }
}
