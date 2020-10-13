import FrameBucket from './Frame/FrameBucket';
import RoomBucket from './Room/RoomBucket';
// import CircleBucket from './CircleBucket';
import IconBucket from './Icon/IconBucket';
import Matrix4 from '../geometry/Matrix4';
import Vector4 from '../geometry/Vector4';
import { containedInContour, createScreenBounds, filter } from '../utils/common';
// import ConnectionBucket from './ConnectionBucket';
// import HeatmapBucket from './HeatmapBucket';
// import LineBucket from './LineBucket';
// import ModelBucket from './ModelBucket';
// import TrackBucket from './TrackBucket';
// import PictureBucket from './PictureBucket';

export default class BucketFactor {
    calculate(data) {
        let bucket;
        if (data.type === 'frame') {
            bucket = new FrameBucket(data);
        }
        else if (data.type === 'room') {
            bucket = new RoomBucket(data);
        }
        // else if (data.type === 'circle') {
        //     bucket = new CircleBucket(data);
        // }
        else if (data.type === 'icon') {
            bucket = new IconBucket(data);
        }
        // else if (data.type === 'connection') {
        //     bucket = new ConnectionBucket(data);
        // }
        // else if (data.type === 'heatmap') {
        //     bucket = new HeatmapBucket(data);
        // }
        // else if (data.type === 'line') {
        //     bucket = new LineBucket(data);
        // }
        // else if (data.type === 'model') {
        //     bucket = new ModelBucket(data);
        // }
        // else if (data.type === 'track') {
        //     bucket = new TrackBucket(data);
        // }
        // else if (data.type === 'picture') {
        //     bucket = new PictureBucket(data);
        // }
        if (bucket) {
            bucket.init();
            return bucket.getDrawInfo();
        }
    }
}

class Collision {
    constructor(data) {
        this._lastResult = new Map();
        this._view = data.view;
        this._viewMatrix = new Matrix4(data.viewMatrix);
        this._projectionMatrix = new Matrix4(data.projectionMatrix);
        this._zoom = data.zoom;
        this._z = data.z;
        this._center = data.center;
        this._onePixelToWorld = data.onePixelToWorld;
        const { viewWidth, viewHeight } = this._view;
        this._max = Math.sqrt(Math.pow(viewWidth, 2) + Math.pow(viewHeight, 2)) / 2;
    }
    updateOptions(t) {
        this._view = t.view;
        this._viewMatrix = new Matrix4(t.viewMatrix);
        this._projectionMatrix = new Matrix4(t.projectionMatrix);
        this._zoom = t.zoom;
        this._z = t.z;
        this._center = t.center;
        this._onePixelToWorld = t.onePixelToWorld;
        const { viewWidth, viewHeight } = this._view;
        this._max = Math.sqrt(Math.pow(viewWidth, 2) + Math.pow(viewHeight, 2)) / 2 / this._viewMatrix.getValue()[10];
    }
    _checkCenter(t) {
        return Math.sqrt(Math.pow(t[0] - this._center.x, 2) + Math.pow(t[1] - this._center.y, 2)) / this._onePixelToWorld * this._viewMatrix.getValue()[10] <= this._max;
    }
    calculate(data) {
        const idDataMapping = new Map();
        for (let i = 0; i < data.length; i += 1) {
            const floor = data[i];
            for (let j = 0; j < floor.data.length; j += 1) {
                const { zoomRange, point } = floor.data[j];
                if (this._checkZoomRange(zoomRange) && this._checkCenter(point)) {
                    const floorData = idDataMapping.get(floor.floorId);
                    const newData = {
                        id: floor.id,
                        index: j,
                        ...floor.data[j],
                    };
                    if (floorData) {
                        floorData.push(newData)
                    } else {
                        idDataMapping.set(floor.floorId, [newData])
                    }
                }
            }
        }
        const idIndexMapping = new Map();
        idDataMapping.forEach(floorData => {
            this._calculateFloor(floorData).forEach((value, id) => {
                idIndexMapping.set(id, value);
            });
        })
        return this._generateResult(idIndexMapping);
    }
    _generateResult(idIndexMapping) {
        const showResult = {};
        const hideResult = {};
        const normalResult = {};
        idIndexMapping.forEach((value, id) => {
            const lastValue = this._lastResult.get(id);
            if (lastValue) {
                const { result, filterResult } = filter(value, lastValue);
                showResult[id] = result;
                normalResult[id] = filterResult;
            } else
                showResult[id] = value;
        });
        this._lastResult.forEach((lastValue, id) => {
            const value = idIndexMapping.get(id);
            if (value) {
                hideResult[id] = filter(lastValue, value).result;
            } else
                hideResult[id] = lastValue;
        });
        this._lastResult = idIndexMapping;
        return {
            hideResult,
            showResult,
            normalResult,
        }
    }
    _checkZoomRange(t) {
        return !t || (null === t[0] || t[0] <= this._zoom) && (null === t[1] || this._zoom < t[1]);
    }
    _calculateFloor(data) {
        const sortedFloorData = data.sort((a, b) => a.weight - b.weight);
        const pointIdIndexMapping = new Map();
        const contourTotal = [];
        for (let i = 0; i < sortedFloorData.length; i += 1) {
            const { point, id, data, margin, index } = sortedFloorData[i];
            const pointList = [];
            const pointInScreenCoordinate = this._worldToScreenCoordinate(point);
            for (let j = 0; j < data.length; j += 1) {
                const { offset, width, height, anchor } = data[j];
                const { x, y } = pointInScreenCoordinate;
                const bounds = createScreenBounds([
                    x - offset[0],
                    y - offset[1],
                ], width, height, anchor);
                const leftBottom = [
                    bounds.leftBottom[0] - margin,
                    bounds.leftBottom[1] - margin,
                ];
                const rightTop = [
                    bounds.rightTop[0] + margin,
                    bounds.rightTop[1] + margin,
                ];
                pointList.push({
                    leftBottom,
                    rightTop,
                });
            }
            if (this._isInView(pointInScreenCoordinate) && !containedInContour(contourTotal, pointList)) {
                contourTotal.push.apply(contourTotal, pointList);
                pointIdIndexMapping.get(id) ? pointIdIndexMapping.get(id).push(index) : pointIdIndexMapping.set(id, [index]);
            }
        }
        return pointIdIndexMapping;
    }
    _worldToScreenCoordinate(point) {
        const [oriX, oriY] = point;
        const vector = new Vector4([
            oriX,
            oriY,
            this._z,
            1,
        ]);
        const matrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
        const convertedVector = vector.multiplyMat4(matrix);
        const { x, y, w } = convertedVector;
        return {
            x: (x + w) / (2 * w) * this._view.viewWidth,
            y: (1 - (y + w) / (2 * w)) * this._view.viewHeight,
        }
    }
    _isInView({ x, y }) {
        return 0 <= x && x < this._view.viewWidth && 0 <= y && y < this._view.viewHeight;
    }
}

let collision;
onmessage = function (t) {
    const { data } = t;
    const { type, view, viewMatrix, projectionMatrix, zoom, z, center, onePixelToWorld, isForce, list } = data;
    if (type === 'collision') {
        const params = {
            view,
            viewMatrix,
            projectionMatrix,
            zoom,
            z,
            center,
            onePixelToWorld,
        };
        if (collision) {
            collision.updateOptions(params);
        } else {
            collision = new Collision(params);
        }
        const i = { type: "collisionResult", ...collision.calculate(list), isForce };
        postMessage(i);
    } else {
        const result = (new BucketFactor).calculate(data);
        if (result) postMessage(result)
    }
}