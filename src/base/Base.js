/** 
  
@file Base: Basic class with event related functions
  
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
  clearListeners() {
    this._listeners = {};
    this._onetimeListeners = {};
  }
  getListeners(type) {
    return this._listeners[type] || this._onetimeListeners[type];
  }
}