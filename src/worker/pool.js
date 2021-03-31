import WebWorker from './index';

export default class WebWorkerPool {
  constructor(mapInsId) {
    this._mapInsIdSet = new Set([mapInsId]);
    this._workerPool = [];
    this._freeIdxList = [];
    this._taskMap = { [mapInsId]: new Map() };
    this._taskDataList = [];
    this._listenerMap = new Map();
    const concurrency = navigator.hardwareConcurrency || 4;
    for (let i = 0; i < concurrency; i += 1) {
      this._workerPool.push(new WebWorker());
      this._freeIdxList.push(i);
      this._workerPool[i].addEventListener('message', ({ data }) => {
        if (this._taskDataList.length > 0) {
          const data = this._taskDataList.shift();
          this._postToWorker(data);
        }
        this._onWorkerMessage(data);
        this._freeIdxList.push(i);
      });
    }
  }
  addMapInsId(id) {
    this._mapInsIdSet.add(id);
    this._taskMap[id] = new Map();
  }
  addTask(data) {
    const { mapInsId } = data;
    if (!mapInsId) return;
    // for collision use mapId as key, layers' are layerId
    const item = this._taskMap[mapInsId].get(data.id);
    if (item) {
      item.push(data.taskId);
    } else {
      this._taskMap[mapInsId].set(data.id, [data.taskId]);
    }

    if (this._freeIdxList.length > 0) {
      this._postToWorker(data);
    } else if (data.sync) {
      // sync为true且没有空闲线程，用主线程跑
      const result = this._factor.calculate(data);
      if (result) {
        result.mapInsId = mapInsId;
        this._onWorkerMessage(result);
      }
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
    const { mapInsId } = data;
    if (!mapInsId) return
    const item = this._taskMap[mapInsId].get(data.id);
    if (!item) return;
    const index = item.indexOf(data.taskId);
    if (index === item.length - 1) {
      this._taskMap[mapInsId].delete(data.id);
    }
    let result = data;
    if (data.result && data.result.type === 'collisionResult') {
      result = data.result
    } else {
      const updateCollisionKey = `${mapInsId}_isNeedUpdateCollision`;
      if (data.type === 'icon') {
        this[updateCollisionKey] = true;
      }
      data.isRender = this._taskMap[mapInsId].size === 0;
      if (this._taskMap[mapInsId].size === 0) {
        if (this[updateCollisionKey]) {
          data.isUpdateCollision = true;
        }
        this[updateCollisionKey] = false;
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
    this._listenerMap.set(id, [...(this._listenerMap.get(id) || []), listener]);
    return this._listenerMap.get(id).length - 1;
  }
  unListen(id, listenerIdx) {
    const listeners = this._listenerMap.get(id).filter((item, idx) => idx !== listenerIdx);
    this._listenerMap.set(id, listeners);
    if (this._listenerMap.size === 0) this._listenerMap.delete(id);
  }
  destroy(id) {
    this._mapInsIdSet.delete(id);
    this._taskMap[id].clear();
    this._listenerMap.delete(id);
    this._taskDataList = this._taskDataList.filter(item => item.id !== id);
    if (this._mapInsIdSet.size === 0) {
      for (const worker of this._workerPool) {
        worker.terminate();
      }
      window.indoorWorkerPool = undefined;
    }
  }
}
