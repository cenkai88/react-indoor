/* 

DragRotate 用户拖动旋转

*/

import AbstractGesture from './AbstractGesture';
import Point from '../geometry/Point';
import Camera from '../camera/Camera';
import Transitor from '../transition/Transitor';
import { getRotateInertia } from './DragPan';

export default class DragRotate extends AbstractGesture {
    constructor(mapView) {
        super(mapView);
        this._rotateEnable = true;
        this._pitchEnable = true;
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
    _isEnable() {
        return this._rotateEnable || this._pitchEnable;
    }
    onMousedown(e) {
        if (e.which !== 3 || !this._isEnable()) return;
        this._isCanMove = true;
        this._lastPos = new Point(e.clientX, e.clientY);
        this._inertias = [[Date.now(), this._mapView.rotate]];
        if (this.transitor) {
            this.transitor.stop();
            this.transitor = undefined;
        }
    };
    onMousemove(e) {
        if (e.which !== 3 || !this._isEnable() || !this._isCanMove) return
        this._onMove(e);
    }
    onMouseup(e) {
        if (e.which !== 3) return;
        this._stopFrameUpdate(e);
    }
    onMouseleave(e) {
        if (e.which !== 3) return;
        this._stopFrameUpdate(e);
    }
    _onMove(e) {
        if (this._state === 'pending') {
            this._state = 'active';
            this._startFrameUpdate();
            this._mapView.fire('moveStart', e);
            this._rotateEnable && this._mapView.fire('rotateStart', e);
            this._pitchEnable && this._mapView.fire('pitchStart', e);
            this._mapView.fire('gestureStart');
        }
        this._curPos = new Point(e.clientX, e.clientY);
    }
    _frameUpdate() {
        const engine = this._mapView.getEngine();
        if (engine && this._lastPos && this._curPos) {
            const camera = engine.getCamera();
            const angle = this._curPos.x - this._lastPos.x;
            let rotate = camera.getRotate();
            rotate += angle / 3;
            let pitch = camera.getPitch();
            const deltaY = this._curPos.y - this._lastPos.y;
            pitch -= deltaY / 3;
            const params = {};
            if (this._pitchEnable) {
                params.pitch = pitch;
            }
            if (this._rotateEnable) {
                params.rotate = rotate;
                const last = this._inertias[this._inertias.length - 1];
                this._inertias.push([Date.now(), Camera.normalizeRotate(rotate, last[1])]);
            }
            camera.set(params);
            this._lastPos = this._curPos;
            engine.render();
            engine.updateCollision(false);
        }
        this._mapView.fire('move');
        this._rotateEnable && this._mapView.fire('rotate');
        this._pitchEnable && this._mapView.fire('pitch');
        this._mapView.fire('gesture');
        this._timer = requestAnimationFrame(this._frameUpdate.bind(this));
    }
    _stopFrameUpdate(e) {
        super._stopFrameUpdate(e);
        if (this._timer) {
            delete this._timer;
            this._inertialEnd(e);
        }
        delete this._lastPos;
        delete this._curPos;
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
        const rotateInertia = getRotateInertia(end[1] - start[1], flingDuration);
        if (!rotateInertia || Math.abs(rotateInertia.offset) < 2) {
            this._fireEnd(e);
            return;
        }
        const { offset, duration } = rotateInertia;
        this._rotateInertia(offset, duration * 1000, e);
        this._inertias = [];
    }
    _rotateInertia(offset, duration, event) {
        const engine = this._mapView.getEngine();
        if (!engine) return;
        const camera = engine.getCamera();
        const startRotate = camera.getRotate();
        const transitor = new Transitor().init(0, 1, duration);
        this.transitor = transitor;
        transitor.setTimingFn('easeOutCirc');
        transitor.on('update', e => {
            const curRotate = offset * e.num + startRotate;
            camera.set({ rotate: curRotate });
            engine.render();
            engine.updateCollision(false);
            this._mapView.fire('move', e);
            this._mapView.fire('rotate', e);
        }).on('complete', () => {
            this._fireEnd(event);
            this.transitor = undefined;
        }).on('stop', () => {
            this._fireEnd(event);
        }).start();
    }
    _fireEnd(e) {
        this._mapView.fire('moveEnd', e);
        this._rotateEnable && this._mapView.fire('rotateEnd');
        this._pitchEnable && this._mapView.fire('pitchEnd');
        this._mapView.fire('gestureEnd');
    }
}
