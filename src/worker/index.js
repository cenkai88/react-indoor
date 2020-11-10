export default class WebWorker {
  constructor() {
    this._worker = new Worker('./reactIndoorWorker.js');
  }
  addEventListener(type, listener) {
    this._worker.addEventListener(type, listener);
  }
  removeEventListener(type, listener) {
    this._worker.removeEventListener(type, listener);
  }
  terminate() {
    this._worker.terminate();
  }
  postMessage(message, options) {
    this._worker.postMessage(message, options);
  }
  static get onmessage() {
    return this._worker.onmessage;
  }
  static set onmessage(listener) {
    this._worker.onmessage = listener;
  }
  static get onerror() {
    return this._worker.onerror;
  }
  static set onerror(listener) {
    this._worker.onerror = listener;
  }
}

