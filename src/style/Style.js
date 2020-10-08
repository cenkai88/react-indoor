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
  getStyleJson() {
    return { ...this._style }
  }
  _parseStyle() {
    if (!this._style) return;
    this._styleLayout = {
      mapBackgroundColor: this._style.mapBackgroundColor,
      frame: this._style.frame,
      area: {
        ...this._style.area.default,
        keys: this._style.area.style.keys,
        values: this._parseValues(this._style.area.style.values),
      },
      property: {
        ...this._style.property.default,
        keys: this._style.property.style.keys,
        values: this._parseValues(this._style.property.style.values),
      },
      areaText: {
        ...this._style.areaText.default,
        keys: this._style.areaText.style.keys,
        values: this._parseValues(this._style.areaText.style.values),
      },
    };
    if (this._style.extra) {
      this._styleLayout.extra = {
        ...this._style.extra.default,
        keys: this._style.extra.style.keys,
        values: this._parseValues(this._style.extra.style.values),
      };
    }
  }
  filterExtra(properties) {
    if (!this._styleLayout || !this._styleLayout.extra || !properties) return false;
    const { keys, values } = this._styleLayout.extra;
    if (!keys || !values) return false;
    for (let i = 0; i < keys.length; i += 1) {
      if (values[properties[keys[i]]] !== undefined) {
        return true;
      }
    }
    return false;
  }
  _parseValues(values) {
    const result = {};
    for (let i = 0; i < values.length; i += 1) {
      const key = values[i].key;
      for (let j = 0; j < key.length; j += 1) {
        let otherObj = { ...values[i] };
        delete otherObj.key;
        result[key[j]] = { ...result[key[j]], ...otherObj };
      }
    }
    return result;
  }
  getStyle(name) {
    if (!this._styleLayout) return;
    return this._styleLayout[name];
  }
  static checkStyleDiff(oldStyle, newStyle) {
    if (!oldStyle) {
      return ['frame', 'area', 'areaText', 'property', 'extra'];
    }
    const arr = [];
    if (!equalObject(oldStyle.frame, newStyle.frame)) {
      arr.push('frame');
    }
    if (!equalObject(oldStyle.area, newStyle.area)) {
      arr.push('area');
    }
    if (!equalObject(oldStyle.areaText, newStyle.areaText)) {
      arr.push('areaText');
    }
    if (!equalObject(oldStyle.property, newStyle.property)) {
      arr.push('property');
    }
    if (!equalObject(oldStyle.extra, newStyle.extra)) {
      arr.push('extra');
    }
    return arr;
  }
}
