import earcut from 'earcut';

import { getStyle, parseColor } from "../../utils/style";
import AbstractBucket from "../AbstractBucket";
import { GlobalIdGenerator } from "../../utils/common";
import { Indices } from "../../utils/common";

export default class PolygonBucket extends AbstractBucket {
    constructor(data) {
        super(data);
        this._geometryMap = {};
    }
    init() {
        for (let i = 0; i < this._features.length; i += 1) {
            const { geometry, properties } = this._features[i];
            const visible = getStyle(this._layout, 'visible', properties);
            if (visible) {
                if (geometry.type === 'Polygon') {
                    this._calcPolygon(geometry.coordinates, properties);
                }
            }
        }
        for (const key in this._geometryMap) {
            const item = this._geometryMap[key];
            this._geometryInfo.push({
                vertices: item.vertices,
                fillIndices: item.fillIndices.getValue(),
                outlineIndices: item.outlineIndices.getValue(),
                fillColor: item.fillColor,
                outlineColor: item.outlineColor,
                opacity: item.opacity,
                outlineOpacity: item.outlineOpacity
            });
        }
    }
    _calcPolygon(polygon, properties) {
        if (polygon.length === 0) return;
        const offset = this._offset;
        const vertices = [];
        const holes = [];
        const outlineIndices = [];
        for (let i = 0; i < polygon.length; i += 1) {
            const face = polygon[i];
            for (let j = 0; j < face.length; j += 1) {
                const verticesCount = vertices.length / 2;
                if (j < face.length - 1) {
                    outlineIndices.push(verticesCount, verticesCount + 1);
                }
                vertices.push(face[j][0] + offset[0], face[j][1] + offset[1]);
            }
            if (i < polygon.length - 1) {
                holes.push(vertices.length / 2);
            }
        }
        const fillIndices = earcut(vertices, holes.length === 0 ? undefined : holes, 2);
        const fillColor = parseColor(getStyle(this._layout, 'fillColor', properties));
        const outlineColor = parseColor(getStyle(this._layout, 'outlineColor', properties));
        const opacity = getStyle(this._layout, 'opacity', properties);
        const outlineOpacity = getStyle(this._layout, 'outlineOpacity', properties);
        const key = this._getGeometryKey(properties);
        if (this._geometryMap[key] &&
            this._geometryMap[key].vertices.length / 2 + vertices.length / 2 < 65536) {
            const geometry = this._geometryMap[key];
            const oldVerticesCount = geometry.vertices.length / 2;
            geometry.fillIndices.add(fillIndices, oldVerticesCount);
            geometry.outlineIndices.add(outlineIndices, oldVerticesCount);
            geometry.vertices = geometry.vertices.concat(vertices);
        }
        else {
            if (this._geometryMap[key]) {
                this._geometryMap[GlobalIdGenerator.getId()] = this._geometryMap[key];
            }
            this._geometryMap[key] = {
                vertices,
                outlineColor,
                fillColor,
                fillIndices: new Indices(fillIndices),
                outlineIndices: new Indices(outlineIndices),
                opacity,
                outlineOpacity,
            };
        }
    }
    _getGeometryKey(properties) {
        const arr = [];
        for (let i = 0; i < PolygonBucket.GEOMETRY_KEYS.length; i += 1) {
            const style = getStyle(this._layout, PolygonBucket.GEOMETRY_KEYS[i], properties);
            style !== undefined && arr.push(style);
        }
        return arr.join('-');
    }
    static get GEOMETRY_KEYS() {
        return ['fillColor', 'outlineColor', 'opacity', 'outlineOpacity']
    }
}
