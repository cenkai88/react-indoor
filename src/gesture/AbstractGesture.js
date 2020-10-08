/* 

AbstractGesture 所有Gesture的基础类

*/

export default class AbstractGesture {
    constructor(mapView) {
        this._state = 'pending';
        this._isCanMove = false;
        this._inertias = [];
        this._mapView = mapView;
    }
    _startFrameUpdate() {
        if (!this._timer) this._frameUpdate();
    }
    _stopFrameUpdate(e) {
        if (this._timer) {
            cancelAnimationFrame(this._timer);
            this._state = 'pending';
        }
        this._isCanMove = false;
    }
    _initInertial() {
        const now = Date.now();
        let index = 0;
        for (let i = this._inertias.length - 1; i >= 0; i -= 1) {
            if (now - this._inertias[i][0] > 160) {
                index = i;
                break;
            }
        }
        this._inertias = this._inertias.slice(index + 1);
    }
    get transitor() {
        return this._mapView.gestureManager.getTransitor();
    }
    set transitor(transitor) {
        this._mapView.gestureManager.setTransitor(transitor);
    }
}
