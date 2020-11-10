import { getStyle, parseColor } from "../../utils/style";
import AbstractBucket from "../AbstractBucket";
import { Indices } from "../../utils/common";
import Vector2 from "../../geometry/Vector2";

export default class LineBucket extends AbstractBucket {
  constructor(data) {
    super(data);
    this._geometryMap = {};
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { properties, geometry } = this._features[i];
      const visible = getStyle(this._layout, 'visible', properties);
      if (visible) {
        if (geometry.type === 'LineString') {
          this._calcPolyline(geometry.coordinates, properties);
        }
        else if (geometry.type === 'MultiLineString') {
          for (let j = 0; j < geometry.coordinates.length; j += 1) {
            this._calcPolyline(geometry.coordinates[j], properties);
          }
        }
      }
    }
    for (const key in this._geometryMap) {
      this._geometryInfo.push({
        ...this._geometryMap[key],
        indices: this._geometryMap[key].indices.getValue()
      });
    }
  };
  _calcPolyline(polyline, properties) {
    const offset = this._offset;
    const base = getStyle(this._layout, 'base', properties);
    const opacity = getStyle(this._layout, 'opacity', properties);
    const width = getStyle(this._layout, 'lineWidth', properties);
    const color = parseColor(getStyle(this._layout, 'lineColor', properties));
    const iconUrl = getStyle(this._layout, 'lineImage', properties);
    const vertices = [];
    const normals = [];
    const deviation = [];
    const texCoords = [];
    const indices = [];
    for (let i = 0; i < polyline.length; i += 1) {
      const point = [polyline[i][0] + offset[0], polyline[i][1] + offset[1]];
      let startNum = vertices.length / 2;
      if (i === 0) {
        const dir = new Vector2(polyline[i], polyline[i + 1]);
        const normal = dir.normal().unit();
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, 1, 0, 0);
        deviation.push(0, 0, 0, 0, 0, 0);
        normals.push(normal.x, normal.y, -normal.x, -normal.y);
        indices.push(startNum + 0, startNum + 1);
      }
      else if (i < polyline.length - 1) {
        const lastPoint = [polyline[i - 1][0] + offset[0], polyline[i - 1][1] + offset[1]];
        const nextPoint = [polyline[i + 1][0] + offset[0], polyline[i + 1][1] + offset[1]];
        const dir1 = new Vector2(lastPoint, point);
        const length1 = dir1.getLength();
        const unitDir1 = dir1.unit();
        const normal1 = unitDir1.normal();
        const dir2 = new Vector2(point, nextPoint);
        const length2 = dir2.getLength();
        const unitDir2 = dir2.unit();
        const normal2 = unitDir2.normal();
        let angle = Math.abs(normal1.angleTo(normal2));
        angle = angle === 180 ? 0 : angle;
        angle = angle / 180 * Math.PI;
        const offsetNum = Math.tan(angle / 2);
        unitDir1.multiply(-offsetNum);
        unitDir2.multiply(offsetNum);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(1 * length1, 1, 1 * length1, 0);
        deviation.push(unitDir1.x, unitDir1.y, length1, unitDir1.x, unitDir1.y, length1);
        indices.push(startNum, startNum - 1, startNum, startNum + 1);
        normals.push(normal1.x, normal1.y, -normal1.x, -normal1.y);
        const flat = normal1.cross(normal2) <= 0 ? -1 : 1;
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, flat === -1 ? 1 : 0, 0, flat === -1 ? 0 : 0.93);
        deviation.push(unitDir1.x, unitDir1.y, length1, unitDir1.x, unitDir1.y, length1);
        normals.push(normal1.x, normal1.y, -normal1.x, -normal1.y);
        startNum += 2;
        const { indices: subIndices, vertices: subVertices, normals: subNormals, texCoords: subTexCoords, deviation: subDeviation } = LineBucket.getLineJoin(point, normal1, normal2, vertices.length / 2);
        vertices.push.apply(vertices, subVertices);
        indices.push.apply(indices, subIndices);
        normals.push.apply(normals, subNormals);
        deviation.push.apply(deviation, subDeviation);
        texCoords.push.apply(texCoords, subTexCoords);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, flat === -1 ? 1 : 0, 0, flat === -1 ? 0 : 0.93);
        deviation.push(unitDir2.x, unitDir2.y, length2, unitDir2.x, unitDir2.y, length2);
        normals.push(normal2.x, normal2.y, -normal2.x, -normal2.y);
        startNum += 2;
        const subNum = subVertices.length / 2;
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, 1, 0, 0);
        deviation.push(unitDir2.x, unitDir2.y, length2, unitDir2.x, unitDir2.y, length2);
        indices.push(startNum + 2 + subNum, startNum + 3 + subNum);
        normals.push(normal2.x, normal2.y, -normal2.x, -normal2.y);
      }
      else {
        const lastPoint = [polyline[i - 1][0] + offset[0], polyline[i - 1][1] + offset[1]];
        const dir = new Vector2(lastPoint, point);
        const length = dir.getLength();
        const normal = dir.normal().unit();
        vertices.push.apply(vertices, [...point, ...point]);
        deviation.push(0, 0, 0, 0, 0, 0);
        texCoords.push(1 * length, 1, 1 * length, 0);
        indices.push(startNum, startNum - 1, startNum, startNum + 1);
        normals.push(normal.x, normal.y, -normal.x, -normal.y);
      }
    }
    const key = this._getGeometryKey(properties);
    if (this._geometryMap[key] &&
      this._geometryMap[key].vertices.length / 2 + vertices.length / 2 < 65536) {
      const geometry = this._geometryMap[key];
      const oldVerticesCount = geometry.vertices.length / 2;
      geometry.indices.add(indices, oldVerticesCount);
      geometry.vertices = geometry.vertices.concat(vertices);
      geometry.texCoords = geometry.texCoords.concat(texCoords);
      geometry.normals = geometry.normals.concat(normals);
      geometry.deviation = geometry.deviation.concat(deviation);
    }
    else {
      this._geometryMap[key] = {
        vertices,
        normals,
        base,
        opacity,
        width,
        color,
        deviation,
        iconUrl,
        texCoords,
        indices: new Indices(indices),
      };
    }
  }
  _getGeometryKey(properties) {
    const arr = [];
    for (let i = 0; i < LineBucket.GEOMETRY_KEYS.length; i += 1) {
      const style = getStyle(this._layout, LineBucket.GEOMETRY_KEYS[i], properties);
      style !== undefined && arr.push(style);
    }
    return arr.join('-');
  }
  static getLineJoin(point, v0, v1, indexOffset) {
    const vertices = [];
    const texCoords = [];
    const deviation = [];
    const normals = [];
    const indices = [];
    const step = Math.PI / 16;
    const maxAngle = Math.abs(v0.angleTo(v1)) / 180 * Math.PI + step;
    const dir = v0.clone().add(v1).unit();
    const normal = dir.normal();
    const dir1Normal = v0.unit().normal();
    const num = 1 / normal.dot(dir1Normal);
    const flat = v0.cross(v1) <= 0 ? -1 : 1;
    dir.multiply(num * flat);
    vertices.push.apply(vertices, point);
    texCoords.push(0, 0.7);
    deviation.push(0, 0, 0);
    normals.push(0, 0);
    if (maxAngle > step) {
      indices.push(indexOffset - 1, indexOffset, indexOffset + 1, indexOffset - 2, indexOffset - 1, flat === -1 ? indexOffset + 1 : indexOffset);
    }
    const v0_scale = v0.clone().multiply(-1 * flat);
    let index = indexOffset;
    for (let angle = 0; angle < maxAngle; angle += step) {
      const rotateVector = v0_scale.clone().rotate(angle * flat);
      vertices.push.apply(vertices, point);
      texCoords.push(0, 0.93);
      deviation.push(0, 0, 0);
      normals.push(rotateVector.x, rotateVector.y);
      if (angle + step < maxAngle) {
        indices.push(indexOffset + 0);
        indices.push(index + 1);
        indices.push(index + 2);
      } else {
        indices.push(indexOffset, index + 1, index + 3, flat === -1 ? index + 1 : indexOffset, index + 2, index + 3);
      }
      index += 1;
    }
    return { vertices, indices, normals, texCoords, deviation };
  }
  static get GEOMETRY_KEYS() {
    return ['lineColor', 'lineWidth', 'base', 'opacity', 'lineImage'];
  }
}
