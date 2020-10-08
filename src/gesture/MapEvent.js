/*

MapEvent, 是室内地图的事件类，用户触发事件后会由GestureManager发送MapEvent给地图引擎

*/

import Point from "../geometry/Point";

export default class MapEvent {
  constructor(event, target) {
    this._isCancel = false;
    this._originEvent = event;
    this._target = target;
    const e = event instanceof MouseEvent ? event : event.touches[0];
    this._screen = new Point(e.clientX, e.clientY);
  }
  getScreen() {
    return this._screen;
  }
  getWorld() {
    if (!this._world) {
      const rect = this._target.getCanvasContainer().getBoundingClientRect();
      const x = this._screen.x - rect.left;
      const y = this._screen.y - rect.top;
      this._world = this._target.screenToWorldCoordinate(x, y);
    }
    return this._world;
  }
  cancel() {
    this._isCancel = true;
  }
  getOriginEvent() {
    return this._originEvent;
  }
  isCancel() {
    return this._isCancel;
  }
  static get world() {
    return this.getWorld()
  }
  static get point() {
    return this._screen
  }
}