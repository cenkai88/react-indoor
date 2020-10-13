import earcut from 'earcut';

import AbstractBucket from "../AbstractBucket";
import { getStyle, parseColor } from "../../utils/style";
import Vector2 from "../../geometry/Vector2";
import GlobalIdGenerator from "../../utils/common";
import { Indices } from "../../utils/common";

export default class RoomBucket extends AbstractBucket {
    constructor(data) {
        super(data);
        this._geometryMap = {};
    }
    init() {
        for (let i = 0; i < this._features.length; i += 1) {
            this._update(this._features[i]);
        }
        this._fireMessage();
    }
    _fireMessage() {
        this._geometryInfo.length = 0;
        for (const key in this._geometryMap) {
            const item = this._geometryMap[key];
            this._geometryInfo.push({
                vertices: item.vertices,
                fillIndices: item.fillIndices.getValue(),
                outlineIndices: item.outlineIndices.getValue(),
                fillColor: item.fillColor,
                outlineColor: item.outlineColor,
                base: item.base,
                opacity: item.opacity,
                normals: item.normals,
                height: item.height,
                zoomRange: item.zoomRange,
            });
        }
    }
    _update(feature) {
        const geometry = feature.geometry, properties = feature.properties;
        const visible = getStyle(this._layout, 'visible', properties);
        if (visible) {
            if (geometry.type === 'Polygon') {
                this._calcPolygon(geometry.coordinates, properties);
            }
            else if (geometry.type === 'MultiPolygon') {
                for (let i = 0; i < geometry.coordinates.length; i += 1) {
                    this._calcPolygon(geometry.coordinates[i], properties);
                }
            }
        }
    }
    _calcPolygon(polygon, properties) {
        const offset = this._offset;
        const vertices = [];
        const sideVertices = [];
        const sideIndices = [];
        const holes = [];
        const outlineIndices = [];
        const normals = [];
        const topNormals = [];
        const enableOutline = getStyle(this._layout, 'enableOutline', properties);
        const height = getStyle(this._layout, 'height', properties);
        for (let i = 0; i < polygon.length; i += 1) {
            const face = polygon[i];
            for (let j = 0; j < face.length; j += 1) {
                const curX = face[j][0] + offset[0];
                const curY = face[j][1] + offset[1];
                const sideCount = sideVertices.length / 2;
                if (j < face.length - 1) {
                    if (enableOutline) {
                        const verticesCount = vertices.length / 2;
                        outlineIndices.push(verticesCount, verticesCount + 1);
                    }
                    const normalVector = new Vector2(face[j], face[j + 1]).normal();
                    normals.push(normalVector.x, normalVector.y, 0);
                    normals.push(normalVector.x, normalVector.y, 1);
                    normals.push(normalVector.x, normalVector.y, 0);
                    normals.push(normalVector.x, normalVector.y, 1);
                    sideIndices.push(sideCount + 0, sideCount + 1, sideCount + 2);
                    sideIndices.push(sideCount + 1, sideCount + 2, sideCount + 3);
                    sideVertices.push(curX, curY);
                    sideVertices.push(curX, curY);
                    const nextX = face[j + 1][0] + offset[0];
                    const nextY = face[j + 1][1] + offset[1];
                    sideVertices.push(nextX, nextY);
                    sideVertices.push(nextX, nextY);
                }
                topNormals.push(0, 0, RoomBucket.FACTOR + 1);
                vertices.push(curX, curY);
            }
            if (i < polygon.length - 1) {
                holes.push(vertices.length / 2);
            }
        }
        const indices = earcut(vertices, holes.length === 0 ? undefined : holes, 2);
        const topFaceCount = vertices.length / 2;
        for (let i = 0; i < sideIndices.length; i += 1) {
            indices.push(sideIndices[i] + topFaceCount);
        }
        const totalCount = topFaceCount + sideVertices.length / 2;
        const fillColor = parseColor(getStyle(this._layout, 'fillColor', properties));
        const outlineColor = parseColor(getStyle(this._layout, 'outlineColor', properties));
        const base = getStyle(this._layout, 'base', properties);
        const opacity = getStyle(this._layout, 'opacity', properties);
        const zoomRange = getStyle(this._layout, 'zoomRange', properties);
        const key = this._getGeometryKey(properties);
        if (this._geometryMap[key] &&
            this._geometryMap[key].vertices.length / 2 + totalCount < 65536) {
            const geometry = this._geometryMap[key];
            const oldVerticesCount = geometry.vertices.length / 2;
            geometry.fillIndices.add(indices, oldVerticesCount);
            geometry.outlineIndices.add(outlineIndices, oldVerticesCount);
            geometry.vertices = geometry.vertices.concat(vertices).concat(sideVertices);
            geometry.normals = geometry.normals.concat(topNormals).concat(normals);
        }
        else {
            if (this._geometryMap[key]) {
                this._geometryMap[GlobalIdGenerator.getId()] = this._geometryMap[key];
            }
            this._geometryMap[key] = {
                vertices: vertices.concat(sideVertices),
                normals: topNormals.concat(normals),
                fillIndices: new Indices(indices),
                outlineIndices: new Indices(outlineIndices),
                fillColor,
                outlineColor,
                height,
                base,
                opacity,
                zoomRange,
            };
        }
    }
    _getGeometryKey(properties) {
        const arr = [];
        for (let i = 0; i < RoomBucket.GEOMETRY_KEYS.length; i += 1) {
            const style = getStyle(this._layout, RoomBucket.GEOMETRY_KEYS[i], properties);
            style !== undefined && arr.push(style);
        }
        return arr.join('-');
    }
    static get GEOMETRY_KEYS() {
        return ['fillColor', 'outlineColor', 'height', 'base', 'opacity', 'zoomRange']
    }
    static get FACTOR() {
        return Math.pow(2, 13);
    }
}

