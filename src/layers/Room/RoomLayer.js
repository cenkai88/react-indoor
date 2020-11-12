import AbstractLayer from "../AbstractLayer";
import RoomBuffer from "./RoomBuffer";
import { polygonsContain } from "../../utils/common";

export default class RoomLayer extends AbstractLayer {
    constructor(style) {
        super('Room', {
            ...style,
            default: {
                ...RoomLayer.DEFAULT_STYLE,
                ...style.default,
            },
        });
        this._geometryRenderList = [];
    }
    clear() {
        this._features.length = 0;
        this._geometryRenderList.length = 0;
    }
    setLayout(layout) {
        this._layout = { ...this._layout, ...layout };
        if (this._features.length !== 0) this._update();
    }
    _updateRenderList(data) {
        if (!this._renderer) return;
        this._geometryRenderList.length = 0;
        const { info } = data;
        for (let i = 0; i < info.length; i += 1) {
            const buffer = new RoomBuffer(this._renderer.getGl());
            buffer.update({
                vertices: info[i].vertices,
                normals: info[i].normals,
                fillIndices: info[i].fillIndices,
                outlineIndices: info[i].outlineIndices,
            });
            this._geometryRenderList.push({
                buffer: buffer,
                height: info[i].height,
                base: info[i].base,
                opacity: info[i].opacity,
                fillColor: info[i].fillColor,
                outlineColor: info[i].outlineColor,
                zoomRange: info[i].zoomRange,
            });
        }
    }
    queryFeaturesByWorld(x, y) {
        return polygonsContain(this._layout, this._features, { x, y });
    }
    _update() {
        if (!this._renderer) return;
        const workerPool = this._renderer.getWorkerPool();
        workerPool.addTask({
            type: 'room',
            layout: this._layout,
            offset: this._renderer.getOffset(),
            features: this._features,
            id: this.id,
            taskId: this._getTaskId(),
            sync: this.getSync(),
        });
    }
    getGeometryRenderList() {
        return this._geometryRenderList;
    }
    static get GEOMETRY_KEYS() {
        return [
            'fillColor', 'outlineColor', 'height', 'base',
        ]
    }
    static get DEFAULT_STYLE() {
        return {
            visible: true,
            fillColor: '#666666',
            outlineColor: '#333333',
            base: 0,
            opacity: 1,
            height: 0,
        }
    }
}