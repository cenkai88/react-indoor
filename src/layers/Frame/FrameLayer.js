/**
 * @file FrameLayer
 * Shared methods and properties among different layer Class(mainly event related)

*/

import AbstractLayer from '../AbstractLayer';
import FrameBuffer from './FrameBuffer';
import { polygonsContain } from '../../utils/common';

export default class FrameLayer extends AbstractLayer {
    constructor(style) {
        super('Frame', {
            ...FrameLayer.DEFAULT_STYLE,
            ...style,
        });
        this._geometryRenderList = [];
    }
    clear() {
        this._features.length = 0;
        this._geometryRenderList.length = 0;
    }
    _updateRenderList(data) {
        if (!this._renderer) return;
        this._geometryRenderList.length = 0;
        const { info } = data;
        for (let i = 0; i < info.length; i += 1) {
            const buffer = new FrameBuffer(this._renderer.getGl());
            buffer.update({
                fillIndices: info[i].fillIndices,
                outlineIndices: info[i].outlineIndices,
                vertices: info[i].vertices,
            });
            this._geometryRenderList.push({
                buffer,
                outlineColor: info[i].outlineColor,
                opacity: info[i].opacity,
                base: info[i].base,
                fillColor: info[i].fillColor,
            });
        }
    }
    setLayout(layout) {
        this._layout = { ...this._layout, ...layout };
        if (this._features.length !== 0) this._update();
    }
    queryFeaturesByWorld(x, y) {
        return polygonsContain(this._layout, this._features, { x, y });
    }
    _update() {
        if (!this._renderer) return;
        const workerPool = this._renderer.getWorkerPool();
        workerPool.addTask({
            type: 'frame',
            id: this.id,
            mapInsId: this._renderer.getMapId(),
            layout: this._layout,
            features: this._features,
            offset: this._renderer.getOffset(),
            taskId: this._getTaskId(),
            sync: this.getSync(),
        });
    }
    getGeometryRenderList() {
        return this._geometryRenderList;
    }
    getLabelsProperties() {
        try {
            return this._features.map(item => {
                const floorId = item?.properties?.id;
                if (!item.remark || !floorId) return []
                const data = JSON.parse(item.remark);
                return data.map(label => ({
                    type: "Feature",
                    properties: {
                        floorId,
                        name: label.name,
                        center: label.point,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: label.point
                    }
                }))
            }).flat();
        } catch (err) {
            console.warn('Frame remark not in JSON', err)
            return []
        }
    }
    static get GEOMETRY_KEYS() {
        return ['fillColor', 'outlineColor', 'base']
    }
    static get DEFAULT_STYLE() {
        return {
            visible: true,
            fillColor: '#666666',
            outlineColor: '#333333',
            base: 0,
            opacity: 1,
        }
    }
}
