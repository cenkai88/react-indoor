/**

@file CollisionManager calculate the result for collison detection when it is necessary.

*/

import Base from '../../base/Base';
import WebWorker from "../../worker/index";

export default class CollisionManager extends Base {
    constructor(camera, options) {
        super();
        this._collisionList = [];
        this._worker = new WebWorker();
        this._updateQueue = [];
        this._camera = camera;
        this._options = options;
        this._step = 1 / Math.floor(options.animateDuration / 16);
        this._worker.addEventListener('message', this._onMessage.bind(this));
    }
    getStep() {
        return this._step;
    }
    _frameUpdate() {
        if (this._updateQueue.length !== 0) {
            const params = this._updateQueue.shift();
            this._update(params);
        }
        else {
            this._stopFrameUpdate();
        }
    }
    _startFrameUpdate() {
        if (!this._updateTimer) {
            this._frameUpdate();
            const interval = Math.max(this._options.collisionDuration, this._options.animateDuration);
            this._updateTimer = window.setInterval(this._frameUpdate.bind(this), interval);
        }
    }
    _stopFrameUpdate() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
            delete this._updateTimer;
        }
    }
    _onMessage(e) {
        const result = e.data;
        if (result.type === 'collisionResult') {
            this.fire('change', result);
        }
    }
    add(item) {
        this._collisionList.push(item);
    }
    remove(item) {
        const index = this._collisionList.findIndex(a => a.id === item.id);
        index !== -1 && this._collisionList.splice(index, 1);
    }
    clear() {
        this._collisionList.length = 0;
    }
    update(isForce) {
        if (isForce) {
            this._updateQueue.length = 0;
            this._update(true);
            return;
        }
        if (this._updateQueue.length === 0) {
            this._updateQueue.push(false);
        }
        this._startFrameUpdate();
    }
    _update(isForce) {
        const { viewHeight, viewWidth } = this._options;
        const center = this._camera.getCenter();
        const offset = this._camera.getOffset();
        const collisionData = {
            type: 'collision',
            isForce,
            zoom: this._camera.getZoom(),
            z: this._camera.getZ(),
            center: { x: center.x + offset[0], y: center.y + offset[1] },
            onePixelToWorld: this._camera.getOnePixelToWorld(),
            view: { viewWidth, viewHeight },
            viewMatrix: this._camera.viewMatrix,
            projectionMatrix: this._camera.projectionMatrix,
            list: this._collisionList,
        };
        this._worker.postMessage(collisionData);
    }
    destroy() {
        console.log('c')
        this._worker.terminate();
        this.clear();
        this.clearListeners();
    }
    resize(width, height) {
        this._options.viewWidth = width;
        this._options.viewHeight = height;
    }
}
