/**
 * @file FrameLayer
 * Shared methods and properties among different layer Class(mainly event related)

*/

import AbstractLayer from '../AbstractLayer';
import FrameBuffer from './FrameBuffer';
import { polygonsContain } from '../../utils/common';

export default class FrameLayer extends AbstractLayer {
    constructor(layout) {
        super('Frame', { ...FrameLayer.DEFAULT_LAYOUT, ...layout });
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
        const bucketMng = this._renderer.getBucketMng();
        bucketMng.update({
            type: 'frame',
            id: this.id,
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
    static get GEOMETRY_KEYS() {
        return ['fillColor', 'outlineColor', 'base']
    }
    static get DEFAULT_LAYOUT() {
        return {
            visible: true,
            fillColor: '#666666',
            outlineColor: '#333333',
            enableOutline: true,
            base: 0,
            opacity: 1,
        }
    }
}
