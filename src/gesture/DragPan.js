/* 

DragPan 用户拖动平移

*/

import AbstractGesture from './AbstractGesture';
import Point from '../geometry/Point';
import Transitor from '../transition/Transitor';

const PAN_LINEARITY = 0.3;
const PAN_MAX_SPEED = 1400;
const PAN_DECELERATION = 2500;
const ROTATE_LINEARITY = 0.25;
const ROTATE_MAX_SPEED = 180;
const ROTATE_DECELERATION = 720;
const ZOOM_LINEARITY = 0.15;
const ZOOM_MAX_SPEED = 2.5;
const ZOOM_DECELERATION = 12;

function getPanInertia(flingOffset, flingDuration) {
    if (flingOffset.getLength() === 0 || flingDuration === 0) return;
    const velocity = flingOffset.multiply(PAN_LINEARITY / flingDuration);
    const length = velocity.getLength();
    let speed = length;
    if (speed > PAN_MAX_SPEED) {
        speed = PAN_MAX_SPEED;
        velocity.multiply(speed / length);
    }
    const duration = speed / (PAN_DECELERATION * PAN_LINEARITY);
    const offset = velocity.multiply(duration / 2);
    return { duration, offset };
}
export function getRotateInertia(flingDiff, flingDuration) {
    if (flingDiff === 0 || flingDuration === 0)
        return;
    const sign = flingDiff < 0 ? -1 : 1;
    let speed = Math.abs(flingDiff * (ROTATE_LINEARITY / flingDuration));
    if (speed > ROTATE_MAX_SPEED) {
        speed = ROTATE_MAX_SPEED;
    }
    const duration = speed / (ROTATE_DECELERATION * ROTATE_LINEARITY);
    const offset = sign * speed * (duration / 2);
    return { duration, offset };
}
export function getZoomInertia(flingDiff, flingDuration) {
    if (flingDiff === 0 || flingDuration === 0) return;
    let speed = flingDiff * ZOOM_LINEARITY / flingDuration;
    if (Math.abs(speed) > ZOOM_MAX_SPEED) {
        speed = (speed > 0 ? 1 : -1) * ZOOM_MAX_SPEED;
    }
    const duration = Math.abs(speed / (ZOOM_DECELERATION * ZOOM_LINEARITY));
    const offset = speed * duration / 2;
    return { duration, offset };
}

export default class DragPan extends AbstractGesture {
    constructor(mapView) {
        super(mapView);
    }
    enable() {
        this._state = 'enable';
    }
    disable() {
        this._state = 'disable';
    }
    onMousedown(e) {
        if (e.which !== 1 || this._state === 'disable') return;
        this._start(e);
    }
    onMousemove(e) {
        if (e.which !== 1 || this._state === 'disable' || !this._isCanMove) return;
        this._onMove(e);
    }
    onMouseup(e) {
        if (e.which !== 1) return;
        this._stopFrameUpdate(e);
    }
    onMouseleave(e) {
        if (e.which !== 1) return;
        this._stopFrameUpdate(e);
    }
    onTouchstart(e) {
        if (e.touches.length > 1 || this._state === 'disable') return;
        const touch = e.touches[0];
        this._start(touch);
    }
    _start(e) {
        this._state = 'pending';
        this._isCanMove = true;
        this._lastPos = new Point(e.clientX, e.clientY);
        this._inertias = [[Date.now(), this._lastPos]];
        if (this.transitor) {
            this.transitor.stop();
            this.transitor = undefined;
        }
    }
    onTouchmove(e) {
        if (e.touches.length > 1 || !this._isCanMove) return;
        this._onMove(e.touches[0]);
    }
    onTouchend(e) {
        this._stopFrameUpdate(e);
    }
    _onMove(e) {
        const renderer = this._mapView.getRenderer();
        if (!this._lastPos || !renderer) return;
        if (this._state === 'pending') {
            this._state = 'active';
            this._startFrameUpdate();
            this._mapView.fire('moveStart', e);
            this._mapView.fire('dragStart', e);
            this._mapView.fire('gestureStart');
        }
        this._curPos = new Point(e.clientX, e.clientY);
        this._inertias.push([Date.now(), this._curPos]);
    }
    _frameUpdate() {
        const renderer = this._mapView.getRenderer();
        if (renderer && this._lastPos && this._curPos) {
            const camera = renderer.getCamera();
            const world = camera.screenToWorldCoordinate(this._lastPos.x, this._lastPos.y);
            camera.setCenterAtPoint(world, this._curPos);
            this._lastPos = this._curPos;
            renderer.render();
            renderer.updateCollision(false);
        }
        this._mapView.fire('move');
        this._mapView.fire('drag');
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
        this._mapView.fire('dragEnd', e);
        this._initInertial();
        if (this._inertias.length < 2) {
            this._mapView.fire('moveEnd', e);
            this._mapView.fire('gestureEnd', e);
            return;
        }
        const end = this._inertias[this._inertias.length - 1];
        const start = this._inertias[0];
        const flingOffset = end[1].clone().subtract(start[1]);
        const flingDuration = (end[0] - start[0]) / 1000;
        const panInertia = getPanInertia(flingOffset, flingDuration);
        if (!panInertia) {
            this._mapView.fire('moveEnd', e);
            this._mapView.fire('gestureEnd', e);
            return;
        }
        const { offset, duration } = panInertia;
        this._moveInertia(offset, duration * 1000, e);
        this._inertias = [];
    }
    _moveInertia(offset, duration, event) {
        const renderer = this._mapView.getRenderer();
        if (!renderer) return;
        const camera = renderer.getCamera();
        const end = camera.getCenter();
        let pointAtOffset = camera.centerPoint.add(offset);
        const endWithInertia = camera.getPointWithInertia(end, pointAtOffset);
        // const { x: constrainedX, y: constrainedY } = camera.getConstrainedPoint(end);
        // const { x: constrainedInertiaX, y: constrainedInertiaY } = camera.getConstrainedPoint(endWithInertia);
        // // console.log(endWithInertia, constrainedInertiaX, constrainedInertiaY)
        // // TODO set offset to the contrained value instead of 0
        // if (end.x !== constrainedX || end.y !== constrainedY) {
        //     end.set(constrainedX, constrainedY);
        // }
        if (end.x !== endWithInertia.x) {
            offset.x = 0;
        }
        if (end.y !== endWithInertia.y) {
            offset.y = 0;
        }
        pointAtOffset = camera.centerPoint.add(offset);

        const locationAtOffset = camera.screenToWorldCoordinate(pointAtOffset.x, pointAtOffset.y);
        const from = locationAtOffset.clone();
        const centerDelta = end.clone().subtract(from);
        const transitor = new Transitor().init(0, 1, duration);
        this.transitor = transitor;
        transitor.setTimingFn('easeOutCirc');
        transitor.on('update', e => {
            const delta = centerDelta.clone().multiply(e.num);
            const newCenter = from.clone().add(delta);
            camera.setCenterAtPoint(newCenter, pointAtOffset);
            renderer.render();
            renderer.updateCollision(false);
            this._mapView.fire('move', event);
        }).on('complete', () => {
            this._mapView.fire('moveEnd', event);
            this._mapView.fire('gestureEnd', event);
            this.transitor = undefined;
        }).on('stop', () => {
            this._mapView.fire('moveEnd', event);
            this._mapView.fire('gestureEnd', event);
        }).start();
    }
}
