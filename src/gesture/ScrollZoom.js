/* 

ScrollZoom 用户滚动缩放

*/

import Point from '../geometry/Point';
import { getFit } from '../utils/common';

export default class ScrollZoom {
    constructor(mapView) {
        this._targetZoom = 0;
        this._isEnable = true;
        this._mapView = mapView;
        this._dom = this._mapView.getCanvasContainer();
    }
    enable() {
        this._isEnable = true;
    };
    disable() {
        this._isEnable = false;
    };
    onWheel(e) {
        if (!this._isEnable || e.deltaY === 0) return;
        const camera = this._mapView.getCamera();
        if (!camera) return;
        if (this._stopTimer) {
            clearTimeout(this._stopTimer);
            delete this._stopTimer;
        }
        const rect = this._dom.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._around = camera.screenToWorldCoordinate(x, y);
        this._aroundPoint = new Point(x, y);
        const minZoom = this._mapView._minZoom;
        const maxZoom = this._mapView._maxZoom;
        const zoom = camera.getZoom() + Math.log10(Math.abs(e.deltaY)) / 10 * (e.deltaY > 0 ? -1 : 1);
        this._targetZoom = getFit(zoom, minZoom, maxZoom);
        this._startFrameUpdate();
        this._stopTimer = setTimeout(this._stopFrameUpdate.bind(this), 300, 3);
    };
    _onScroll() {
        const camera = this._mapView.getCamera();
        if (!camera) return;
        let zoom = camera.getZoom();
        zoom += (this._targetZoom - zoom) / 2;
        camera.set({ zoom });
        if (this._around && this._aroundPoint) {
            camera.setCenterAtPoint(this._around, this._aroundPoint);
        }
    };
    _startFrameUpdate() {
        if (!this._timer) {
            this._mapView.fire('moveStart');
            this._mapView.fire('zoomStart');
            this._mapView.fire('gestureStart');
            this._frameUpdate();
        }
    };
    _frameUpdate() {
        const engine = this._mapView.getEngine();
        this._onScroll();
        if (engine) {
            engine.render();
            engine.updateCollision(false);
        }
        this._mapView.fire('move');
        this._mapView.fire('zoom');
        this._mapView.fire('gesture');
        this._timer = requestAnimationFrame(this._frameUpdate.bind(this));
    };
    _stopFrameUpdate(e) {
        if (this._timer) {
            cancelAnimationFrame(this._timer);
            delete this._timer;
            this._mapView.fire('moveEnd', e);
            this._mapView.fire('zoomEnd', e);
            this._mapView.fire('gestureEnd', e);
        }
    };
}
