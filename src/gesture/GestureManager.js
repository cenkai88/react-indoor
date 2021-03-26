/* 

GestureManager 用于管理用户的交互行为，封装为MapEvent发出

*/
import { get } from 'dot-prop';

import { convertWorldToPercent, getFit } from '../utils/common';
import Transitor from '../transition/Transitor';
import Point from '../geometry/Point';
import DragPan from './DragPan';
import DragRotate from './DragRotate';
import ScrollZoom from './ScrollZoom';
import TouchZoomRotate from './TouchZoomRotate';
import MapEvent from './MapEvent';
import RoomLayer from '../layers/Room/RoomLayer';

import { polygonsContain, contain } from '../utils/common';
import IconLayer from '../layers/Icon/IconLayer';

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
    this._dom.addEventListener('dragover', e => e.preventDefault());
    this._dom.addEventListener('drop', this._onDrop.bind(this));
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
  _onDrop(e) {
    GestureManager.stopOriginEvent(e);
    const renderer = this._mapView.getRenderer();
    if (!renderer) return
    const point = renderer.getCamera().screenToWorldCoordinate(e.offsetX, e.offsetY);

    const { bbox } = this._mapView.getFloorData().frame.features[0];
    const deltaX = bbox[1][0] - bbox[0][0];
    const deltaY = bbox[1][1] - bbox[0][1];

    const layer = renderer.getLayers().find(layer => layer instanceof RoomLayer);
    const rooms = polygonsContain(layer.getLayout(), layer.getFeatures(), point);
    let room;
    if (rooms.length > 0) {
      room = rooms[0];
    }
    const [x, y] = convertWorldToPercent(point, bbox, deltaX, deltaY);
    this._mapView.fire('drop', {
      point: { x, y },
      room
    });
  }
  _fireClick(e) {
    const pos = e instanceof MouseEvent ? new Point(e.clientX, e.clientY) : new Point(e.touches[0].clientX, e.touches[0].clientY);
    if (this._startPos && pos.distanceTo(this._startPos) < 1) {
      const renderer = this._mapView.getRenderer();
      const layer = renderer.getLayers().find(layer => layer instanceof RoomLayer);
      const point = renderer.getCamera().screenToWorldCoordinate(e.offsetX, e.offsetY);
      const rooms = polygonsContain(layer.getLayout(), layer.getFeatures(), point);
      let room;
      if (rooms.length > 0) {
        room = rooms[0];
      }
      const event = new MapEvent(e, { ...this._mapView });
      event._room = room;
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
  }
  _hoverHandler(point) {
    const renderer = this._mapView.getRenderer();
    const camera = renderer.getCamera();
    const worldCoordinate = camera.screenToWorldCoordinate(point.x, point.y);
    // Check Marker
    const markerLayer = renderer.getLayers().filter(layer => layer instanceof IconLayer && layer._layout.subType === 'Marker');
    let markerIndex;
    const hoveredMarker = markerLayer.find((item, index) => {
      if (item._dataItemList.length === 0) return
      const centerInScreen = camera.worldToScreenCoordinate(...item._dataItemList[0].geometry.coordinates);
      const iconSizeRadius = item._dataItemList[0].iconSize.map(jtem => jtem * item._layout.iconSize / 2);
      const coordinates = [[
        [centerInScreen.x + iconSizeRadius[0], centerInScreen.y + iconSizeRadius[1]],
        [centerInScreen.x + iconSizeRadius[0], centerInScreen.y - iconSizeRadius[1]],
        [centerInScreen.x - iconSizeRadius[0], centerInScreen.y - iconSizeRadius[1]],
        [centerInScreen.x - iconSizeRadius[0], centerInScreen.y + iconSizeRadius[1]],
      ]];
      const res = contain(coordinates, [point.x, point.y]);
      if (res) markerIndex = index;
      return res
    });
    if (hoveredMarker) {
      const centerInScreen = camera.worldToScreenCoordinate(...hoveredMarker._dataItemList[0].geometry.coordinates);
      if (renderer.getHoveredMarkerId() !== hoveredMarker.id) {
        this._mapView.fire("enterMarker", { id: hoveredMarker.id, point: centerInScreen, index: markerIndex });
        renderer.setHoveredMarkerId(hoveredMarker.id);
        renderer.setHoveredRoomId();
      }
    }
    // Check Room
    else {
      if (renderer.getHoveredMarkerId()) this._mapView.fire("leaveMarker", { id: renderer.getHoveredMarkerId() });
      renderer.setHoveredMarkerId();
      const roomLayer = renderer.getLayers().find(layer => layer instanceof RoomLayer);
      if (roomLayer) {
        const room = polygonsContain(roomLayer.getLayout(), this._mapView._currentFloorData.room.features, worldCoordinate);
        const roomId = get(room, '0.properties.id');
        if (renderer.getHoveredRoomId() !== roomId) {
          renderer.setHoveredRoomId(roomId);
          roomLayer.resetLayout();
        }
      }
    }
  }
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
    if (renderer) {
      this._hoverHandler({ x: e.offsetX, y: e.offsetY });
      renderer.fire('mousemove', event);
    }
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
