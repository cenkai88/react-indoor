/**
 * @file Camera
 * Camera is used to change the rotate, pitch, scale, position of the map view.
 * This Class is just about maintaining the status in memory (viewMatrix, projectionMatrix and normalMatrix) and has nothing directly to do with rendering.

*/

import Point from "../geometry/Point";
import Matrix4 from "../geometry/Matrix4";
import Vector4 from "../geometry/Vector4";
import { getFit } from "../utils/common";

export default class Camera {
    constructor(width, height, options = {}) {
        this._NATIVE_ZOOM = 0;
        this._onePixelToWorld = 0;
        this._z = 0;
        this._viewMatrix = new Matrix4();
        this._projectionMatrix = new Matrix4();
        this._projectionInvertMatrix = new Matrix4();
        this._viewInvertMatrix = new Matrix4();
        this._normalMatrix = new Matrix4();
        this._far = 9E9;
        this._fov = 45;
        this._near = 0.5;
        this._center = new Point(0, 0);
        this._zoom = 10;
        this._pitch = 0;
        this._rotate = 0;
        this._maxBounds = null;
        this._offset = [0, 0];
        this._width = width;
        this._height = height;
        if (typeof options.zoom === 'number') {
            this._zoom = options.zoom;
        }
        if (typeof options.rotate === 'number') {
            this._rotate = options.rotate;
        }
        if (typeof options.pitch === 'number') {
            this._pitch = Camera.processPitch(options.pitch);
        }
        this._init();
    }
    setMaxBounds(maxBounds) {
        this._maxBounds = maxBounds;
        this._constrain();
    }
    getMaxBounds() {
        return this._maxBounds;
    }
    setOffset(offset) {
        this._offset = offset;
        this._calcViewMatrix();
    }
    getOffset() {
        return [this._offset[0], this._offset[1]];
    }
    getFov() {
        return this._fov;
    }
    getFar() {
        return this._far;
    }
    getNear() {
        return this._near;
    }
    _setFar(far) {
        this._far = far;
        this._projectionMatrix.setPerspective(this._fov, this._width / this._height, this._near, this._far);
        // this._projectionMatrix.setOrtho(0, this._width / 2, 0, this._height / 2, this._near, this._far);
        this._projectionInvertMatrix = this._projectionMatrix.clone().invert();
    }
    _constrain() {
        if (!this._maxBounds) return;
        const point = this._center;
        const w = this._width / 2 * this._onePixelToWorld;
        const h = this._height / 2 * this._onePixelToWorld;
        const minX = this._maxBounds.topLeft.x - w;
        const maxX = this._maxBounds.bottomRight.x + w;
        const minY = this._maxBounds.bottomRight.y - h;
        const maxY = this._maxBounds.topLeft.y + h;
        this._center.set(getFit(point.x, minX, maxX), getFit(point.y, minY, maxY));
    }
    _init() {
        const tan = 2 * Math.tan(this._fov / 2 / 180 * Math.PI);
        this._NATIVE_ZOOM = Math.log2(0.11423 * this._height / tan) + 19;
        this._setFar(this._far);
        this._calcViewMatrix();
        this._calcNormalMatrix();
        this._calcOnePixelToWorld();
    }
    resize(width, height) {
        this._width = width;
        this._height = height;
        this._init();
    }
    set(params) {
        const { zoom, rotate, pitch, center } = params;
        if (typeof zoom === 'number' && zoom > 0) {
            this._zoom = zoom;
        }
        if (typeof rotate === 'number') {
            this._rotate = Camera.processRotate(rotate);
        }
        if (typeof pitch === 'number') {
            this._pitch = Camera.processPitch(pitch);
        }
        if (center) {
            this._center.set(center.x, center.y);
            this._constrain();
        }
        this._calcViewMatrix();
        if (zoom !== undefined && zoom > 0) this._calcOnePixelToWorld();
        if (rotate !== undefined) this._calcNormalMatrix();
    }
    setCenterAtPoint(coordinate, point) {
        const a = this.screenToWorldCoordinate(point.x, point.y);
        const x = coordinate.x - (a.x - this._center.x);
        const y = coordinate.y - (a.y - this._center.y);
        this._center.set(x, y);
        this._calcViewMatrix();
    }
    getCenter() {
        return this._center.clone();
    }
    getPitch() {
        return this._pitch;
    }
    getRotate() {
        return this._rotate;
    }
    getZoom() {
        return this._zoom;
    }
    setZ(z) {
        this._z = z;
        this._calcViewMatrix();
    }
    getOnePixelToWorld() {
        return this._onePixelToWorld;
    }
    _calcNormalMatrix() {
        this._normalMatrix = new Matrix4();
        this._normalMatrix.rotate(-this._rotate, 0, 0, 1);
    }
    /**
     * Update the view matrix of camera.
    */
    _calcViewMatrix() {
        const focalLength = Math.pow(2, (this._NATIVE_ZOOM - this._zoom));
        if (focalLength > this._far) {
            this._setFar(focalLength + 100);
        }
        const center = { x: this._center.x + this._offset[0], y: this._center.y + this._offset[1] };
        const { eye, target, up } = Camera.calcEyeTargetUp(this._rotate, this._pitch, focalLength, center, this._z);
        this._viewMatrix.setLookAt(eye, target, up);
        this._viewInvertMatrix = this._viewMatrix.clone().invert();
    }
    _calcOnePixelToWorld() {
        const focalLength = Math.pow(2, (this._NATIVE_ZOOM - this._zoom));
        const top = Math.tan(this._fov / 2 / 180 * Math.PI) * focalLength;
        this._onePixelToWorld = top * 2 / this._height;
    }
    screenToWorldCoordinate(screenX, screenY) {
        const tempTenWorldPoint = new Vector4([0, 0, -10, 1]);
        const tempOneWorldPoint = new Vector4([0, 0, -1, 1]);
        const invertPV = this._viewInvertMatrix.clone().multiply(this._projectionInvertMatrix);
        const { z: tenProjZ, w: tenProjW } = tempTenWorldPoint.multiplyMat4(this._projectionMatrix);
        const { z: oneProjZ, w: oneProjW } = tempOneWorldPoint.multiplyMat4(this._projectionMatrix);
        const halfWidth = this._width / 2;
        const halfHeight = this._height / 2;
        const tenProjX = (screenX - halfWidth) / halfWidth * tenProjW;
        const tenProjY = (halfHeight - screenY) / halfHeight * tenProjW;
        const tenProjPoint = new Vector4([tenProjX, tenProjY, tenProjZ, tenProjW]);
        const tenWorldPoint = tenProjPoint.multiplyMat4(invertPV);
        const oneProjX = (screenX - halfWidth) / halfWidth * oneProjW;
        const oneProjY = (halfHeight - screenY) / halfHeight * oneProjW;
        const oneProjPoint = new Vector4([oneProjX, oneProjY, oneProjZ, oneProjW]);
        const oneWorldPoint = oneProjPoint.multiplyMat4(invertPV);
        const resultX = (this._z - tenWorldPoint.z) * (tenWorldPoint.x - oneWorldPoint.x) / (tenWorldPoint.z - oneWorldPoint.z) + tenWorldPoint.x;
        const resultY = (this._z - tenWorldPoint.z) * (tenWorldPoint.y - oneWorldPoint.y) / (tenWorldPoint.z - oneWorldPoint.z) + tenWorldPoint.y;
        return new Point(resultX - this._offset[0], resultY - this._offset[1]);
    }
    worldToScreenCoordinate(worldX, worldY) {
        const point = new Vector4([worldX + this._offset[0], worldY + this._offset[1], this._z, 1]);
        const worldVector = point.multiplyMat4(this._projectionMatrix.clone().multiply(this._viewMatrix));
        const x = (worldVector.x + worldVector.w) / (worldVector.w * 2);
        const y = 1 - ((worldVector.y + worldVector.w) / (worldVector.w * 2));
        const screenX = x * this._width;
        const screenY = y * this._height;
        return new Point(screenX, screenY);
    }
    getWidth() {
        return this._width;
    }
    getHeight() {
        return this._height;
    }
    getZ() {
        return this._z;
    }
    project(coordinate) {
        const x = coordinate.x / this._onePixelToWorld;
        const y = coordinate.y / this._onePixelToWorld;
        return new Point(x, y);
    }
    /**
     * Similar to setLookAtM function in OpenGL ES 2.0
     * eye: position of the camera
     * target: the normalized coordinate(use top left of the floor bound as an offset) of map center
     * up: the vector from camera to target
     * @param {number} rotate 
     * @param {number} pitch 
     * @param {number} focalLength 
     * @param {Object} center 
     * @param {number} z
     * @return {Object}
    */
    static calcEyeTargetUp(rotate, pitch, focalLength, center, z) {
        const target = [center.x, center.y, z];
        const p = -pitch / 180 * Math.PI;
        const sinP = Math.sin(p);
        const cosP = Math.cos(p);
        const r = -rotate / 180 * Math.PI;
        const sinR = Math.sin(r);
        const cosR = Math.cos(r);
        const tv = focalLength * sinP;
        const tw = focalLength * cosP;
        const eye = [-tv * sinR + center.x, tv * cosR + center.y, tw + z];
        const uv = cosP;
        const uw = -sinP;
        const up = [-uv * sinR, uv * cosR, uw];
        return { eye, target, up };
    }
    static processRotate(rotate) {
        const max = 180, min = -180;
        const d = max - min;
        const w = ((rotate - min) % d + d) % d + min;
        return (w === min) ? max : w;
    }
    static processPitch(pitch) {
        if (pitch < Camera.MIN_PITCH) {
            return Camera.MIN_PITCH;
        }
        else if (pitch < Camera.MAX_PITCH) {
            return pitch;
        }
        return Camera.MAX_PITCH;
    }
    static normalizeRotate(rotate, curRotate) {
        let result = Camera.processRotate(rotate);
        const diff = Math.abs(result - curRotate);
        if (Math.abs(result - 360 - curRotate) < diff) {
            result -= 360;
        }
        if (Math.abs(result + 360 - curRotate) < diff) {
            result += 360;
        }
        return result;
    }
    get viewMatrix() {
        return this._viewMatrix.getValue();
    }
    get projectionMatrix() {
        return this._projectionMatrix.getValue();
    }
    get projectionInvertMatrix() {
        return this._projectionInvertMatrix.getValue();
    }
    get viewInvertMatrix() {
        return this._viewInvertMatrix.getValue();
    }
    get normalMatrix() {
        return this._normalMatrix.getValue();
    }
    get centerPoint() {
        return new Point(this._width / 2, this._height / 2);
    }
    static get MIN_PITCH() {
        return 0
    }
    static get MAX_PITCH() {
        return 60
    }
}

