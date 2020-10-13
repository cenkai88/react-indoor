import Line from "../geometry/Line";
import StyleUtils from "./style";
import { EPSILON } from "./constants";

export function contain(polygon, point) {
  const px = point[0], py = point[1];
  let flag = false;
  for (let m = 0; m < polygon.length; m += 1) {
    const face = polygon[m];
    for (let i = 0, l = face.length, j = l - 1; i < l; j = i, i++) {
      const sx = face[i][0];
      const sy = face[i][1];
      const tx = face[j][0];
      const ty = face[j][1];
      if ((sx === px && sy === py) || (tx === px && ty === py)) {
        return true;
      }
      if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
        const x = sx + (py - sy) * (tx - sx) / (ty - sy);
        if (Math.abs(x - px) <= EPSILON) {
          return true;
        }
        if (x > px) {
          flag = !flag;
        }
      }
    }
  }
  return flag;
}

export function measure(points) {
  let result = 0;
  const n = points.length - 1;
  for (let i = 0; i < n; i += 1) {
    result += (points[i][0] * points[i + 1][1] - points[i][1] * points[i + 1][0]) / 2;
  }
  result += (points[n][0] * points[0][1] - points[n][1] * points[0][0]) / 2;
  return Math.abs(result);
}

export function measurePolygon(polygon) {
  const total = measure(polygon[0]);
  let divide = 0;
  for (let i = 1; i < polygon.length; i += 1) {
    divide += measure(polygon[i]);
  }
  return total - divide;
}

export const polygonsContain = (layout, features, point) => {
  const result = [];
  for (let i = 0; i < features.length; i += 1) {
    const geometry = features[i].geometry;
    const visible = StyleUtils.getStyle(layout, 'visible', features[i].properties);
    if (visible) {
      if (geometry.type === 'Polygon') {
        const isContain = contain(geometry.coordinates, [point.x, point.y]);
        isContain && result.push(features[i]);
      }
      else if (geometry.type === 'MultiPolygon') {
        for (let j = 0; j < geometry.coordinates.length; j += 1) {
          const isContain = contain(geometry.coordinates[j], [point.x, point.y]);
          if (isContain) {
            result.push(features[i]);
            break;
          }
        }
      }
    }
  }
  return result;
}

export const pointsContain = (layout, features, point, unit) => {
  const result = [];
  const x = point.x, y = point.y;
  for (let i = 0; i < features.length; i += 1) {
    const { geometry, properties } = features[i];
    const visible = StyleUtils.getStyle(layout, 'visible', properties);
    const maxDis = (StyleUtils.getStyle(layout, 'radius', properties) || 5) * unit;
    if (visible) {
      if (geometry.type === 'Point') {
        const [x1, y1] = geometry.coordinates;
        const dis = Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2));
        dis < maxDis && result.push(features[i]);
      }
      else if (geometry.type === 'MultiPoint') {
        for (let j = 0; j < geometry.coordinates.length; j += 1) {
          const [x1, y1] = geometry.coordinates[j];
          const dis = Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2));
          if (dis < maxDis) {
            result.push(features[i]);
            break;
          }
        }
      }
    }
  }
  return result;
}

export const linesGetMinDis = (lines, point) => {
  const start = [lines[0][0], lines[0][1]];
  const end = [lines[1][0], lines[1][1]];
  let minDis = new Line(start, end).getClosest(point).distance;
  for (let i = 1; i < lines.length - 1; i += 1) {
    const itemStart = [lines[i][0], lines[i][1]];
    const itemEnd = [lines[i + 1][0], lines[i + 1][1]];
    const distance = new Line(itemStart, itemEnd).getClosest(point).distance;
    if (distance < minDis) {
      minDis = distance;
    }
  }
  return minDis;
}

export const linesContain = (layout, features, point, unit) => {
  const result = [];
  for (let i = 0; i < features.length; i += 1) {
    const { geometry, properties } = features[i];
    const visible = StyleUtils.getStyle(layout, 'visible', properties);
    const maxDis = (StyleUtils.getStyle(layout, 'lineWidth', properties) || 10) / 2 * unit;
    if (visible) {
      if (geometry.type === 'LineString') {
        const dis = linesGetMinDis(geometry.coordinates, point);
        dis < maxDis && result.push(features[i]);
      }
      else if (geometry.type === 'MultiLineString') {
        for (let j = 0; j < geometry.coordinates.length; j += 1) {
          const dis = linesGetMinDis(geometry.coordinates[j], point);
          if (dis < maxDis) {
            result.push(features[i]);
            break;
          }
        }
      }
    }
  }
  return result;
}

export const createRect = (point, width, height, anchor = 'center') => {
  const AnchorMap = {
    center: [0.5, 0.5],
    top: [0.5, 1],
    bottom: [0.5, 0],
    left: [0, 0.5],
    right: [1, 0.5],
    'top-left': [0, 1],
    'top-right': [1, 1],
    'bottom-left': [0, 0],
    'bottom-right': [1, 0],
  };
  const anchorArr = AnchorMap[anchor] || [0.5, 0.5];
  return [
    point[0] - anchorArr[0] * width, point[1] + (1 - anchorArr[1]) * height,
    point[0] - anchorArr[0] * width, point[1] - anchorArr[1] * height,
    point[0] + (1 - anchorArr[0]) * width, point[1] + (1 - anchorArr[1]) * height,
    point[0] + (1 - anchorArr[0]) * width, point[1] - anchorArr[1] * height,
  ];
}
export const createScreenBounds = (point, width, height, anchor = 'center') => {
  const AnchorMap = {
    center: [0.5, 0.5],
    top: [0.5, 0],
    bottom: [0.5, 1],
    left: [0, 0.5],
    right: [1, 0.5],
    'top-left': [0, 0],
    'top-right': [1, 0],
    'bottom-left': [0, 1],
    'bottom-right': [1, 1],
  };
  const anchorArr = AnchorMap[anchor] || [0.5, 0.5];
  return {
    leftBottom: [
      point[0] - anchorArr[0] * width, point[1] - anchorArr[1] * height,
    ],
    rightTop: [
      point[0] + (1 - anchorArr[0]) * width, point[1] + (1 - anchorArr[1]) * height,
    ],
  };
}
export const createPointGeometry = (point, width, height, anchor) => {
  const vertices = createRect(point, width, height, anchor);
  const texCoords = [0, 1, 0, 0, 1, 1, 1, 0];
  return { vertices: vertices, texCoords: texCoords };
}

export const createFeaturePoint = (point, properties) => {
  return {
    type: 'Feature',
    properties: properties,
    geometry: {
      type: 'Point',
      coordinates: point,
    },
  };
}

export const sleep = (ms = 0) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export const getFit = (num, min, max) => {
  if (num < min)
    return min;
  if (num < max)
    return num;
  return max;
}


export const sort = (arr, callback) => {
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      if (callback(arr[j], arr[j + 1]) > 0) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}

export const filter = (arr, filterArr) => {
  const set = new Set(filterArr);
  const result = [];
  const filterResult = [];
  for (let i = 0; i < arr.length; i += 1) {
    set.has(arr[i]) ? filterResult.push(arr[i]) : result.push(arr[i]);
  }
  return { result, filterResult };
}

export function equalObject(obj1, obj2) {
  if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) {
    return obj1 === obj2;
  }
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  for (const key in obj1) {
    if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
      const flag = equalObject(obj1[key], obj2[key]);
      if (!flag) return false;
    }
    else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}
export function step(arr, step, callback) {
  const num = Math.ceil(arr.length / step);
  for (let i = 0; i < num; i += 1) {
    const start = i * step;
    const end = Math.min((i + 1) * step, arr.length);
    callback(arr.slice(start, end));
  }
}

export function containedInContour(contour, pointList) {
  for (let i = 0; i < contour.length; i += 1)
    for (let j = 0; j < pointList.length; j += 1) {
      const {
        leftBottom: [x1, y1],
        rightTop: [x2, y2],
      } = contour[i];
      const {
        leftBottom: [x3, y3],
        rightTop: [x4, y4],
      } = pointList[j];
      const deltaX1 = Math.abs(x1 + x2 - x3 - x4);
      const deltaX2 = Math.abs(x1 - x2) + Math.abs(x3 - x4);
      const deltaY1 = Math.abs(y1 + y2 - y3 - y4);
      const deltaY2 = Math.abs(y1 - y2) + Math.abs(y3 - y4);
      if (deltaX1 <= deltaX2 && deltaY1 <= deltaY2)
        return true;
    }
  return false;
}

export class GlobalIdGenerator {
  static getId(prefix = 'react-indoor') {
    GlobalIdGenerator.id += 1;
    return `${prefix}-${GlobalIdGenerator.id}`;
  }
}
GlobalIdGenerator.id = 0;

export class Indices {
  constructor(indices = []) {
    this._value = indices;
  }
  add(indices, offset) {
    if (offset === 0) {
      this._value = this._value.concat(indices);
    }
    else {
      for (let i = 0; i < indices.length; i += 1) {
        this._value.push(offset + indices[i]);
      }
    }
  };
  clear() {
    this._value = [];
  };
  getValue() {
    return this._value;
  };
}


export const UTILS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createRect,
  createScreenBounds,
  createPointGeometry,
  createFeaturePoint,
  contain,
  measure,
  measurePolygon,
  polygonsContain,
  pointsContain,
  sleep,
  getFit,
  sort,
  filter,
  equalObject,
  step,
});

export default UTILS;