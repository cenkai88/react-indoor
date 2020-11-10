/* 

GestureManager 用于管理用户的交互行为，封装为MapEvent发出

*/

import { getFit } from '../utils/common';
import Transitor from '../transition/Transitor';
import Point from '../geometry/Point';
import DragPan from './DragPan';
import DragRotate from './DragRotate';
import ScrollZoom from './ScrollZoom';
import TouchZoomRotate from './TouchZoomRotate';
import MapEvent from './MapEvent';

export default class GestureManager {
  constructor(mapView) {
    this._touchNum = 0;
    this._lastTouchTime = Date.now();
    this._mapView = mapView;
    this._dragPan = new DragPan(mapView);
    this._touchZoomRotate = new TouchZoomRotate(mapView);
    this._scrollZoom = new ScrollZoom(mapView);
    this._dragRotate = new DragRotate(mapView);
    this._dom = this._mapView.getCanvasContainer();
    this._dom.addEventListener('click', this._onClick.bind(this));
    this._dom.addEventListener('mousedown', this._onMousedown.bind(this));
    this._dom.addEventListener('mousemove', this._onMousemove.bind(this));
    this._dom.addEventListener('mouseup', this._onMouseup.bind(this));
    this._dom.addEventListener('mouseleave', this._onMouseleave.bind(this));
    this._dom.addEventListener('dblclick', this._onDbClick.bind(this));
    this._dom.addEventListener('touchstart', this._onTouchstart.bind(this));
    this._dom.addEventListener('touchmove', this._onTouchmove.bind(this));
    this._dom.addEventListener('touchend', this._onTouchend.bind(this));
    this._dom.addEventListener('contextmenu', this._onContextmenu.bind(this));
    this._dom.addEventListener('wheel', this._onWheel.bind(this));
  }
  _onWheel(e) {
    GestureManager.stopOriginEvent(e);
    this._scrollZoom.onWheel(e);
  }
  _onContextmenu(e) {
    GestureManager.stopOriginEvent(e);
  }
  _onClick(e) {
    GestureManager.stopOriginEvent(e);
    this._fireClick(e);
  }
  _fireClick(e) {
    const pos = e instanceof MouseEvent ? new Point(e.clientX, e.clientY) : new Point(e.touches[0].clientX, e.touches[0].clientY);
    if (this._startPos && pos.distanceTo(this._startPos) < 1) {
      const renderer = this._mapView.getRenderer();
      const event = new MapEvent(e, this._mapView);
      if (renderer) renderer.fire('click', event);
      if (!event.isCancel()) this._mapView.fire('click', event);
    }
  }
  _onDbClick(e) {
    GestureManager.stopOriginEvent(e);
    this._fireDbClick(e);
  }
  getTransitor() {
    return this._transitor;
  }
  setTransitor(transitor) {
    this._transitor = transitor;
  }
  _animateDbClickZoom(point, zoomDelta) {
    this._transitor && this._transitor.stop();
    const renderer = this._mapView.getRenderer();
    if (!renderer)
      return;
    const camera = renderer.getCamera();
    const rect = this._dom.getBoundingClientRect();
    const x = point.x - rect.left;
    const y = point.y - rect.top;
    const around = camera.screenToWorldCoordinate(x, y);
    const startZoom = camera.getZoom();
    const endZoom = getFit(startZoom + zoomDelta, this._mapView._minZoom, this._mapView._maxZoom);
    this._transitor = new Transitor().init(startZoom, endZoom, 500);
    this._transitor.setTimingFn('easeOutCirc');
    this._fireEvent({ zoom: zoomDelta }, 'Start');
    this._mapView.fire('gestureStart');
    this._transitor.on('update', e => {
      this._fireEvent({ zoom: e.num }, '');
      this._mapView.fire('gesture');
      camera.set({ zoom: e.num });
      camera.setCenterAtPoint(around, { x, y });
      renderer.render();
      renderer.updateCollision(false);
    }).on('complete', () => {
      this._fireEvent({ zoom: zoomDelta }, 'End');
      this._mapView.fire('gestureEnd');
      delete this._transitor;
    }).start();
  };
  _fireEvent(params, suffix) {
    const { rotate, pitch, zoom } = params;
    this._mapView.fire("move" + suffix);
    typeof rotate === 'number' && this._mapView.fire("rotate" + suffix);
    typeof pitch === 'number' && this._mapView.fire("pitch" + suffix);
    typeof zoom === 'number' && this._mapView.fire("zoom" + suffix);
  }
  _onMousedown(e) {
    GestureManager.stopOriginEvent(e);
    this._startPos = new Point(e.clientX, e.clientY);
    this._dragPan.onMousedown(e);
    this._dragRotate.onMousedown(e);
    const renderer = this._mapView.getRenderer();
    const event = new MapEvent(e, this._mapView);
    renderer && renderer.fire('mousedown', event);
    !event.isCancel() && this._mapView.fire('mousedown', event);
  }
  _onMousemove(e) {
    GestureManager.stopOriginEvent(e);
    this._dragPan.onMousemove(e);
    this._dragRotate.onMousemove(e);
    const renderer = this._mapView.getRenderer();
    const event = new MapEvent(e, this._mapView);
    renderer && renderer.fire('mousemove', event);
    !event.isCancel() && this._mapView.fire('mousemove', event);
  }
  _onMouseup(e) {
    GestureManager.stopOriginEvent(e);
    this._dragPan.onMouseup(e);
    this._dragRotate.onMouseup(e);
    const renderer = this._mapView.getRenderer();
    const event = new MapEvent(e, this._mapView);
    renderer && renderer.fire('mouseup', event);
    !event.isCancel() && this._mapView.fire('mouseup', event);
  }
  _onMouseleave(e) {
    this._dragPan.onMouseleave(e);
    this._dragRotate.onMouseleave(e);
    const renderer = this._mapView.getRenderer();
    const event = new MapEvent(e, this._mapView);
    renderer && renderer.fire('mouseleave', event);
    !event.isCancel() && this._mapView.fire('mouseleave', event);
  }
  _onTouchstart(e) {
    GestureManager.stopOriginEvent(e);
    this._touchEvent = e;
    const touch = e.touches[0];
    this._touchNum = e.touches.length;
    this._startPos = new Point(touch.clientX, touch.clientY);
    delete this._lastPos;
    this._dragPan.onTouchstart(e);
    this._touchZoomRotate.onTouchstart(e);
    this._mapView.fire('touchstart', new MapEvent(e, this._mapView));
  }
  _onTouchmove(e) {
    GestureManager.stopOriginEvent(e);
    this._touchEvent = e;
    const touch = e.touches[0];
    this._dragPan.onTouchmove(e);
    this._touchZoomRotate.onTouchmove(e);
    this._touchNum = e.touches.length;
    this._lastPos = new Point(touch.clientX, touch.clientY);
    this._mapView.fire('touchmove', new MapEvent(e, this._mapView));
  }
  _onTouchend(e) {
    GestureManager.stopOriginEvent(e);
    if (!this._touchEvent) return;
    const now = Date.now();
    if (this._startPos && this._touchNum === 1 &&
      (!this._lastPos || this._lastPos.distanceTo(this._startPos) < 1)) {
      this._fireClick(this._touchEvent);
      if (now - this._lastTouchTime < 300) {
        this._fireDbClick(this._touchEvent);
      }
    }
    this._lastTouchTime = now;
    this._touchNum = 0;
    this._dragPan.onTouchend(e);
    this._touchZoomRotate.onTouchend(e);
    this._mapView.fire('touchend', new MapEvent(this._touchEvent, this._mapView));
    delete this._touchEvent;
  }
  _fireDbClick(e) {
    const point = e instanceof MouseEvent ? new Point(e.clientX, e.clientY) :
      new Point(e.touches[0].clientX, e.touches[0].clientY);
    this._animateDbClickZoom(point, 1);
    this._mapView.fire('dbClick', new MapEvent(e, this._mapView));
  }
  destroy() {
    this._dom.removeEventListener('click', this._onClick.bind(this));
    this._dom.removeEventListener('mousedown', this._onMousedown.bind(this));
    this._dom.removeEventListener('mousemove', this._onMousemove.bind(this));
    this._dom.removeEventListener('mouseup', this._onMouseup.bind(this));
    this._dom.removeEventListener('mouseleave', this._onMouseleave.bind(this));
    this._dom.removeEventListener('dblclick', this._onDbClick.bind(this));
    this._dom.removeEventListener('touchstart', this._onTouchstart.bind(this));
    this._dom.removeEventListener('touchmove', this._onTouchmove.bind(this));
    this._dom.removeEventListener('touchend', this._onTouchend.bind(this));
    this._dom.removeEventListener('contextmenu', this._onContextmenu.bind(this));
    this._dom.removeEventListener('wheel', this._onWheel.bind(this));
  }
  disableDrag() {
    this._dragPan.disable();
  }
  enableDrag() {
    this._dragPan.enable();
  }
  disableZoom() {
    this._scrollZoom.disable();
    this._touchZoomRotate.disableZoom();
  }
  enableZoom() {
    this._scrollZoom.enable();
    this._touchZoomRotate.enableZoom();
  }
  disableRotate() {
    this._dragRotate.disableRotate();
    this._touchZoomRotate.disableRotate();
  }
  enableRotate() {
    this._dragRotate.enableRotate();
    this._touchZoomRotate.enableRotate();
  }
  disablePitch() {
    this._dragRotate.disablePitch();
    this._touchZoomRotate.disablePitch();
  }
  enablePitch() {
    this._dragRotate.enablePitch();
    this._touchZoomRotate.enablePitch();
  }
  static stopOriginEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }
}
