import WebWorker from './index';

export default class WebWorkerPool {
  constructor(mapInsId) {
    this._mapInsIdSet = new Set([mapInsId]);
    this._workerPool = [];
    this._freeIdxList = [];
    this._taskMap = new Map();
    this._taskDataList = [];
    this._listenerMap = new Map();
    const concurrency = navigator.hardwareConcurrency || 4;
    for (let i = 0; i < concurrency; i += 1) {
      this._workerPool.push(new WebWorker());
      this._freeIdxList.push(i);
      this._workerPool[i].addEventListener('message', ({ data }) => {
        if (this._taskDataList.length > 0) {
          const data = this._dataList.shift();
          this._postToWorker(data);
        }
        this._onWorkerMessage(data);
        this._freeIdxList.push(i);
      });
    }
  }
  addMapInsId(id){
    this._mapInsIdSet.add(id);
  }
  addTask(data) {
    if (data.type==='collision') {
      // for collision use mapId as key
      const map = this._taskMap.get(data.mapId);
      if (map) {
        map.push(data.taskId);
      } else {
        this._taskMap.set(data.mapId, [data.taskId]);
      }
    } else {
      const layer = this._taskMap.get(data.id);
      if (layer) {
        layer.push(data.taskId);
      } else {
        this._taskMap.set(data.id, [data.taskId]);
      }
    }

    if (this._freeIdxList.length > 0) {
      this._postToWorker(data);
    } else if (data.sync) {
      // sync为true且没有空闲线程，用主线程跑
      const result = this._factor.calculate(data);
      if (result) this._onMessage(result);
    } else {
      // 加入待处理中
      const index = this._taskDataList.findIndex(item => item.id === data.id);
      if (index === -1) {
        this._taskDataList.push(data);
      } else {
        this._taskDataList[index] = data;
      }
    }
  }
  _onWorkerMessage(data) {
    const item = this._taskMap.get(data.id);
    if (!item) return;
    const index = item.indexOf(data.taskId);
    if (index === item.length - 1) {
      this._taskMap.delete(data.id);
    }
    let result = data;
    if (data.result && data.result.type=== 'collisionResult') {
      result = data.result
    } else {
      if (data.type === 'icon') {
        this._isNeedUpdateCollision = true;
      }
      data.isRender = this._taskMap.size === 0;
      if (this._taskMap.size === 0) {
        if (this._isNeedUpdateCollision) {
          data.isUpdateCollision = true;
        }
        this._isNeedUpdateCollision = false;
      }
    }
    const listenerList = this._listenerMap.get(data.id) || [];
    listenerList.forEach(listener => {
      if (listener && typeof listener === 'function') listener(result);
    })
  }
  _postToWorker(data) {
    if (this._freeIdxList.length === 0) return;
    const index = this._freeIdxList.pop();
    this._workerPool[index].postMessage(data);
  }
  listen(id, listener) {
    this._listenerMap.set(id, [...(this._listenerMap.get(id)||[]), listener]);
  }
  unListen(id) {
    this._listenerMap.delete(id);
  }
  destroy(id) {
    this._mapInsIdSet.delete(id);
    if (this._mapInsIdSet.size===0) {
      this._taskDataList.length = 0;
      this._taskMap.clear();
      this._listenerMap.clear();
      for (const worker of this._workerPool) {
        worker.terminate();
      }
      window.indoorWorkerPool = undefined;
    }
  }
}
