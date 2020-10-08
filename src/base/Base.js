/*
  
基础类，几乎所有class都是由此extend出
  
*/

const defaultOptions = {
  order: 0,
  type: 'bottom',
};

const validateParameter = (type, listener) => {
  const valid = typeof type === 'string' && typeof listener === 'function';
  if (!valid) console.warn('type is expected to be string and listener is expected to function');
  return valid
}

export default class Base {
  constructor() {
    this._listeners = {};
    this._onetimeListeners = {};
  }
  // 仅内部使用
  getIndexByOrder(arr, options) {
    for (let i = 0; i < arr.length; i += 1) {
      if (options.type === 'top') {
        if (arr[i].order <= options.order) {
          return i;
        }
      } else if (arr[i].order < options.order) {
        return i;
      }
    }
    return arr.length;
  }
  // 绑定事件
  on(type, listener, options) {
    if (!validateParameter(type, listener)) return this
    const arr = this._listeners[type];
    const opts = {
      ...defaultOptions,
      ...options,
    };
    if (arr) {
      const index = this.getIndexByOrder(arr, opts);
      arr.splice(index, 0, {
        callback: listener,
        order: opts.order,
      });
    } else {
      this._listeners[type] = [{
        callback: listener,
        order: opts.order,
      }];
    }
    return this;
  }
  // // 绑定一次性事件
  once(type, listener, options) {
    if (!validateParameter(type, listener)) return this
    const arr = this._onetimeListeners[type];
    const opts = {
      ...defaultOptions,
      ...options,
    };
    if (arr) {
      const index = this.getIndexByOrder(arr, opts);
      arr.splice(index, 0, {
        callback: listener,
        order: opts.order,
      });
    } else {
      this._onetimeListeners[type] = [{
        callback: listener,
        order: opts.order,
      }];
    }
    return this;
  }
  // 解绑事件
  off(type, listener) {
    if (!validateParameter(type, listener)) return this
    const arr = this._listeners[type] || [];
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (arr[i].callback === listener) {
        arr.splice(i, 1);
      }
    }
    if (arr.length === 0) delete this._listeners[type];
    const onetimeArr = this._onetimeListeners[type] || [];
    for (let i = onetimeArr.length - 1; i >= 0; i -= 1) {
      if (onetimeArr[i].callback === listener) {
        onetimeArr.splice(i, 1);
      }
    }
    if (onetimeArr.length === 0) delete this._onetimeListeners[type];
    return this;
  }
  // 触发事件
  fire(type, eventData) {
    const arr = Array.from(this._listeners[type] || []);
    for (let i = 0; i < arr.length; i += 1) {
      arr[i].callback(eventData);
    }
    const onetimeArr = Array.from(this._onetimeListeners[type] || []);
    for (let i = 0; i < onetimeArr.length; i += 1) {
      onetimeArr[i].callback(eventData);
    }
    delete this._onetimeListeners[type];
    return this;
  }
  // 清除所有已绑定事件
  clearListeners() {
    this._listeners = {};
    this._onetimeListeners = {};
  }
  getListeners(type) {
    return this._listeners[type] || this._onetimeListeners[type];
  }
}