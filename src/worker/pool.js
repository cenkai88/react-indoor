import WebWorker from './index';

export default class WebWorkerPool {
  constructor() {
    this._workerPool = [];
    this._freeIdx = [];
    this._taskMap = new Map();
    this._listeners = new Map();
    const concurrency = navigator.hardwareConcurrency || 4;
    for (let i = 0; i < concurrency; i += 1) {
      this._workerPool.push(new WebWorker());
      this._freeIdx.push(i);
      this._workerPool[i].addEventListener('message', ({ data }) => {
        this._onWorkerMessage(data);
        this._freeIndies.push(i);
      });
    }
  }
  addTask(data) {
    const layer = this._taskMap.get(data.id);
    if (layer) {
      layer.push(data.taskId);
    } else {
      this._taskMap.set(data.id, [data.taskId]);
    }

    if (this._freeIdx.length > 0) {
      this._postToWorker(data);
    } else if (data.sync) {
      // 没有空闲线程，用主线程跑
      const result = this._factor.calculate(data);
      if (result) this._onMessage(result);
    } else {
      const index = this._dataList.findIndex(item => item.id === data.id);
      if (index === -1) {
        this._dataList.push(data);
      } else {
        this._dataList[index] = data;
      }
    }
  }
  _onWorkerMessage(data) {
    const layer = this._taskMap.get(data.id);
    if (!layer) return;
    if (data.type === 'icon') {
      this._isNeedUpdateCollision = true;
    }
    const index = layer.indexOf(data.taskId);
    if (index === layer.length - 1) {
      this._taskMap.delete(data.id);
    }
    data.isRender = this._taskMap.size === 0;
    if (this._taskMap.size === 0) {
      if (this._isNeedUpdateCollision) {
        data.isUpdateCollision = true;
      }
      this._isNeedUpdateCollision = false;
    }
    const listener = this._listeners.get(data.id);
    if (listener && typeof listener === 'function') listener(data);
  }
  _postToWorker(data) {
    if (this._freeIndies.length === 0) return;
    const index = this._freeIndies.pop();
    this._workerPool[index].postMessage(data);
  }
  listen(layerId, listener) {
    this._listeners.set(layerId, listener);
  }
  unListen(layerId) {
    this._listeners.delete(layerId);
  }
  destory() {
    this._dataList.length = 0;
    this._taskMap.clear();
    this._listeners.clear();
    for (const worker of this._workerPool) {
      worker.terminate();
    }
  }
}
