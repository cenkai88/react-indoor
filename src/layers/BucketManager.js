/**
 * @file BucketManager
 send collision computing task to each bucket in web worker and process the result

*/

import BucketFactor from './BucketFactor';
import workers from "../worker/index";

const { BucketWorker } = workers;

export default class BucketManager {
    constructor() {
        this._workerPool = [];
        this._freeIndies = [];
        this._dataList = [];
        this._taskMap = new Map();
        this._isInNormalize = false;
        this._isNeedUpdateCollision = false;
        this._factor = new BucketFactor();
        this._listeners = new Map();
        const num = (navigator.hardwareConcurrency || 4) - 1;
        for (let i = 0; i < num; i += 1) {
            this._workerPool.push(new BucketWorker());
            this._freeIndies.push(i);
            this._workerPool[i].addEventListener('message', e => {
                this._freeIndies.push(i);
                
                this._onMessage(e.data);
                if (this._dataList.length > 0) {
                    const data = this._dataList.shift();
                    this._update(data);
                }
            });
        }
    }
    enableNormalize() {
        this._isInNormalize = true;
    }
    isInNormalize() {
        return this._isInNormalize;
    }
    _onMessage(data) {
        const item = this._taskMap.get(data.id);
        if (!item) return;
        if (this._isInNormalize && data.type === 'symbol') {
            this._isNeedUpdateCollision = true;
        }
        const index = item.indexOf(data.taskId);
        if (index === item.length - 1) {
            this._taskMap.delete(data.id);
        }
        data.isRender = !this._isInNormalize || this._taskMap.size === 0;
        if (this._taskMap.size === 0) {
            if (this._isNeedUpdateCollision) {
                data.isUpdateCollision = true;
            }
            this._isInNormalize = false;
            this._isNeedUpdateCollision = false;
        }
        const listener = this._listeners.get(data.id);
        listener && listener(data);
    }
    update(data) {
        const item = this._taskMap.get(data.id);
        if (item) {
            item.push(data.taskId);
        }
        else {
            this._taskMap.set(data.id, [data.taskId]);
        }
        if (this._freeIndies.length > 0) {
            this._update(data);
        } else if (data.sync) {
            // 没有空闲线程，用主线程跑
            const result = this._factor.calculate(data);
            if (result) this._onMessage(result);
        } else {
            const index = this._dataList.findIndex(item => item.id === data.id);
            if (index === -1) {
                this._dataList.push(data);
            }
            else {
                this._dataList[index] = data;
            }
        }
    }
    _update(data) {
        if (this._freeIndies.length === 0) return;
        const index = this._freeIndies.pop();
        this._workerPool[index].postMessage(data);
    }
    register(id, listener) {
        this._listeners.set(id, listener);
    }
    unregister(id) {
        this._listeners.delete(id);
    }
    clearRegister() {
        this._listeners.clear();
    }
    clear() {
        this._dataList.length = 0;
        this._taskMap.clear();
    }
    destroy() {
        this.clear();
        for (let i = 0; i < this._workerPool.length; i += 1) {
            this._workerPool[i].terminate();
        }
        this._listeners.clear();
    }
}
