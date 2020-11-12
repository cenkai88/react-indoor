/*

StyleManager
用于通过字符串动态更新Style

*/

import { equalObject } from '../utils/common';

export default class StyleManager {
  constructor(styleData) {
    this._style = styleData;
    this._parseStyle();
  }
  updateStyle(styleData) {
    return StyleManager.checkStyleDiff(this._style, styleData);
  }
  getstyleData() {
    return { ...this._style }
  }
  _parseStyle() {
    if (!this._style) return;
    const { frame, room, facility, roomIcon } = this._style;
    this._styleLayout = {
      frame,
      room,
      property: facility,
      roomIcon,
    };
  }
  getStyle(name) {
    if (!this._styleLayout) return;
    return this._styleLayout[name];
  }
  static checkStyleDiff(oldStyle, newStyle) {
    if (!oldStyle) {
      return ['frame', 'room', 'roomIcon', 'property'];
    }
    const arr = [];
    if (!equalObject(oldStyle.frame, newStyle.frame)) {
      arr.push('frame');
    }
    if (!equalObject(oldStyle.room, newStyle.room)) {
      arr.push('room');
    }
    if (!equalObject(oldStyle.roomIcon, newStyle.roomIcon)) {
      arr.push('roomIcon');
    }
    if (!equalObject(oldStyle.property, newStyle.property)) {
      arr.push('property');
    }
    return arr;
  }
}
