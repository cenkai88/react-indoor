import { getStyle } from "../../utils/style";
import AbstractBucket from "../AbstractBucket";

export default class HeatmapBucket extends AbstractBucket {
    constructor(data) {
        super(data);
    }
    init() {
        for (let i = 0; i < this._features.length; i += 1) {
            const { geometry, properties } = this._features[i];
            const visible = getStyle(this._layout, 'visible', properties);
            if (visible) {
                if (geometry.type === 'Point') {
                    this._calcPoint(geometry.coordinates, properties);
                }
                else if (geometry.type === 'MultiPoint') {
                    for (let j = 0; j < geometry.coordinates.length; j += 1) {
                        this._calcPoint(geometry.coordinates[j], properties);
                    }
                }
            }
        }
    }
    _calcPoint(point, properties) {
        const offset = this._offset;
        const p = [point[0] + offset[0], point[1] + offset[1]];
        const radius = getStyle(this._layout, 'radius', properties);
        this._geometryInfo.push({
            point: p,
            radius,
        });
    }
}
