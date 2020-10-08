/* 

TouchZoomRotate 用户触屏缩放旋转

*/

import AbstractGesture from './AbstractGesture';
import Camera from '../camera/Camera';
import Transitor from '../transition/Transitor';
import { getFit } from '../utils/common';
import Vector2 from '../geometry/Vector2';
import Point from '../geometry/Point';
import { getZoomInertia, getRotateInertia } from './DragPan';

export default class TouchZoomRotate extends AbstractGesture {
    constructor(mapView) {
        super(mapView);
        this._zoomEnable = true;
        this._rotateEnable = true;
        this._pitchEnable = true;
        this._isPitch = false;
        this._dom = mapView.getCanvasContainer();
    }
    enableZoom() {
        this._zoomEnable = true;
    }
    disableZoom() {
        this._zoomEnable = false;
    }
    enableRotate() {
        this._rotateEnable = true;
    }
    disableRotate() {
        this._rotateEnable = false;
    }
    enablePitch() {
        this._pitchEnable = true;
    }
    disablePitch() {
        this._pitchEnable = false;
    }
    onTouchstart(e) {
        if (e.touches.length < 2 || !this._isEnable()) return;
        this._isCanMove = true;
        const { clientX: x1, clientY: y1 } = e.touches[0];
        const { clientX: x2, clientY: y2 } = e.touches[e.touches.length - 1];
        const camera = this._mapView.getCamera();
        const rect = this._dom.getBoundingClientRect();
        const x = (x1 + x2) / 2 - rect.left;
        const y = (y1 + y2) / 2 - rect.top;
        this._startAround = camera.screenToWorldCoordinate(x, y);
        this._startTouches = this._lastTouches = [[x1, y1], [x2, y2]];
        if (this.transitor) {
            this.transitor.stop();
            this.transitor = undefined;
        }
    }
    onTouchmove(e) {
        if (e.touches.length < 2 || !this._isEnable() || !this._isCanMove) return;
        const { clientX: x1, clientY: y1 } = e.touches[0];
        const { clientX: x2, clientY: y2 } = e.touches[e.touches.length - 1];
        this._curTouches = [[x1, y1], [x2, y2]];
        this._eventData = this._getEventData(this._lastTouches, this._curTouches);
        this._lastTouches = this._curTouches;
        this._pushInertias();
        if (this._state === 'pending') {
            this._state = 'active';
            this._inertias = [];
            this._startTimer = setTimeout(() => {
                delete this._startTimer;
                this._mapView.fire('moveStart');
                if (this._zoomEnable) this._mapView.fire('zoomStart');
                if (this._rotateEnable) this._mapView.fire('rotateStart');
                if (this._pitchEnable) this._mapView.fire('pitchStart');
                this._mapView.fire('gestureStart');
                const { zoomScale, rotateDelta, pitchDelta } = this._getEventData(this._startTouches, this._curTouches);
                this._isPitch = (this._pitchEnable && Math.abs(1 - zoomScale) < 0.5 && Math.abs(rotateDelta) < 6 && pitchDelta !== 0);
                this._startFrameUpdate();
            }, 64);
        }
    }
    _pushInertias() {
        if (!this._eventData) return;
        const { zoomScale, rotateDelta, center } = this._eventData;
        const camera = this._mapView.getCamera();
        let zoom = camera.getZoom();
        zoom = Math.log2(Math.pow(2, zoom) * zoomScale);
        zoom = getFit(zoom, this._mapView._minZoom, this._mapView._maxZoom);
        const rotate = camera.getRotate() - rotateDelta;
        const last = this._inertias[this._inertias.length - 1] || camera.getRotate();
        this._inertias.push([Date.now(), zoom, Camera.normalizeRotate(rotate, last[2]), center]);
    }
    onTouchend(e) {
        this._stopFrameUpdate(e);
        if (this._startTimer) {
            this._state = 'pending';
            clearTimeout(this._startTimer);
            delete this._startTimer;
        }
    }
    _isEnable() {
        return this._zoomEnable || this._pitchEnable || this._rotateEnable;
    }
    _frameUpdate() {
        const engine = this._mapView.getEngine();
        if (engine && this._startAround && this._eventData) {
            const { center, rotateDelta, zoomScale, pitchDelta } = this._eventData;
            const camera = engine.getCamera();
            const params = {};
            if (this._isPitch) {
                params.pitch = camera.getPitch() - pitchDelta;
            }
            else {
                let zoom = camera.getZoom();
                if (this._zoomEnable) {
                    zoom = Math.log2(Math.pow(2, zoom) * zoomScale);
                    zoom = getFit(zoom, this._mapView._minZoom, this._mapView._maxZoom);
                    params.zoom = zoom;
                }
                let rotate = camera.getRotate();
                if (this._rotateEnable && Math.abs(rotateDelta) > 0.1) {
                    rotate = camera.getRotate() - rotateDelta;
                    params.rotate = rotate;
                }
                if (this._zoomEnable || this._rotateEnable) {
                    const last = this._inertias[this._inertias.length - 1] || camera.getRotate();
                    this._inertias.push([Date.now(), zoom, Camera.normalizeRotate(rotate, last[2]), center]);
                }
            }
            camera.set(params);
            if (!this._isPitch) {
                camera.setCenterAtPoint(this._startAround, center);
            }
            engine.render();
            engine.updateCollision(false);
            this._lastTouches = this._curTouches;
        }
        this._timer = requestAnimationFrame(this._frameUpdate.bind(this));
        this._mapView.fire('move');
        if (this._isPitch) {
            this._pitchEnable && this._mapView.fire('pitch');
        }
        else {
            this._zoomEnable && this._mapView.fire('zoom');
            this._rotateEnable && this._mapView.fire('rotate');
        }
        this._mapView.fire('gesture');
    }
    _getEventData(start, end) {
        const lastVector = new Vector2(start[0], start[1]);
        const curVector = new Vector2(end[0], end[1]);
        const [x1, y1] = end[0];
        const [x2, y2] = end[1];
        const rect = this._dom.getBoundingClientRect();
        const center = new Point((x1 + x2) / 2 - rect.left, (y1 + y2) / 2 - rect.top);
        const rotateDelta = curVector.angleTo(lastVector);
        const zoomScale = curVector.getLength() / lastVector.getLength();
        const deltaY1 = y1 - start[0][1];
        const deltaY2 = y2 - start[1][1];
        let pitchDelta = 0;
        if (deltaY1 * deltaY2 >= 0 && Math.abs(deltaY1 - deltaY2) < 20) {
            pitchDelta = (deltaY1 + deltaY2) / 2;
        }
        return { center, rotateDelta, zoomScale, pitchDelta };
    }
    _stopFrameUpdate(e) {
        super._stopFrameUpdate(e);
        if (this._timer) {
            delete this._timer;
            if (!this._isPitch) this._inertialEnd(e);
        }
        this._isPitch = false;
        delete this._lastTouches;
        delete this._curTouches;
        delete this._startAround;
    }
    _inertialEnd(e) {
        this._initInertial();
        if (this._inertias.length < 2) {
            this._fireEnd(e);
            return;
        }
        const start = this._inertias[0];
        const end = this._inertias[this._inertias.length - 1];
        const flingDuration = (end[0] - start[0]) / 1000;
        const zoomInertia = this._zoomEnable && getZoomInertia(end[1] - start[1], flingDuration);
        const rotateInertia = this._rotateEnable && getRotateInertia(end[2] - start[2], flingDuration);
        if (!zoomInertia && !rotateInertia) {
            this._fireEnd(e);
            return;
        }
        let zoomOffset = 0, rotateOffset = 0, duration = 0;
        if (zoomInertia && rotateInertia) {
            duration = Math.max(zoomInertia.duration, rotateInertia.duration);
            zoomOffset = zoomInertia.offset;
            rotateOffset = rotateInertia.offset;
        }
        else if (zoomInertia) {
            duration = zoomInertia.duration;
            zoomOffset = zoomInertia.offset;
        }
        else if (rotateInertia) {
            duration = rotateInertia.duration;
            rotateOffset = rotateInertia.offset;
        }
        this._zoomInertia(zoomOffset, rotateOffset, duration * 1000, end[3], e);
        this._inertias = [];
    }
    _zoomInertia(zoomOffset, rotateOffset, duration, center, event) {
        const engine = this._mapView.getEngine();
        const around = this._startAround;
        if (!engine || !around)
            return;
        const camera = engine.getCamera();
        const startZoom = camera.getZoom();
        const startRotate = camera.getRotate();
        const endZoom = getFit(startZoom + zoomOffset, this._mapView._minZoom, this._mapView._maxZoom);
        const transitor = new Transitor().init(0, 1, duration);
        this.transitor = transitor;
        transitor.setTimingFn('easeOutCirc');
        transitor.on('update', e => {
            const itemZoom = startZoom + (endZoom - startZoom) * e.num;
            const itemRotate = startRotate + rotateOffset * e.num;
            camera.set({ zoom: itemZoom, rotate: itemRotate });
            camera.setCenterAtPoint(around, center);
            engine.render();
            engine.updateCollision(false);
            this._mapView.fire('move', event);
            this._mapView.fire('rotate', event);
        }).on('complete', () => {
            this._fireEnd(event);
        }).on('stop', () => {
            this._fireEnd(event);
        }).start();
    }
    _fireEnd(e) {
        this._mapView.fire('moveEnd', e);
        if (this._isPitch) {
            this._pitchEnable && this._mapView.fire('pitchEnd', e);
        }
        else {
            this._zoomEnable && this._mapView.fire('zoomEnd', e);
            this._rotateEnable && this._mapView.fire('rotateEnd', e);
        }
        this._mapView.fire('gestureEnd', e);
    }
    static get LINEARITY() {
        return 0.15
    }
    static get MAX_SPEED() {
        return 2.5
    }
    static get DECELERATION() {
        return 12
    }
}
