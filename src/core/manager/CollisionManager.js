/**

@file CollisionManager calculate the result for collison detection when it is necessary.

*/

import { GlobalIdGenerator } from "../../utils/common";

export default class CollisionManager {
    constructor(camera, options) {
        this._collisionList = [];
        this._workerPool = options.workerPool;
        this._updateQueue = [];
        this._camera = camera;
        this._options = options;
        this._step = 1 / Math.floor(options.animateDuration / 16);
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
            this._updateTimer = setInterval(this._frameUpdate.bind(this), interval);
        }
    }
    _stopFrameUpdate() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
            delete this._updateTimer;
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
            id: this._options.mapId,
            taskId: GlobalIdGenerator.getId('task'),
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
        this._workerPool.addTask(collisionData);
    }
    resize(width, height) {
        this._options.viewWidth = width;
        this._options.viewHeight = height;
    }
    getWorkerPool() {
        return this._workerPool
    }
}
