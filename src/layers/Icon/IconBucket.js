import AbstractBucket from "../AbstractBucket";
import { getStyle } from "../../utils/style";
import { createPointGeometry } from "../../utils/common";

export default class IconBucket extends AbstractBucket {
    constructor(data) {
        super(data);
        this._baseTextSize = data.baseTextSize;
    }
    init() {
        for (let i = 0; i < this._features.length; i += 1) {
            const { geometry, properties } = this._features[i];
            const visible = getStyle(this._layout, 'visible', properties);
            if (visible) {
                if (geometry.type === 'Point') {
                    this._calcPoint(geometry.coordinates, this._features[i]);
                }
                else if (geometry.type === 'MultiPoint') {
                    for (let j = 0; j < geometry.coordinates.length; j += 1) {
                        this._calcPoint(geometry.coordinates[j], this._features[i]);
                    }
                }
            }
        }
    }
    _calcPoint(point, item) {
        const offset = this._offset;
        const resultPoint = [point[0] + offset[0], point[1] + offset[1]];
        const opacity = getStyle(this._layout, 'opacity', item.properties);
        let base = getStyle(this._layout, 'base', item.properties);
        const iconZHeight = getStyle(this._layout, 'iconZHeight', item.properties);
        const textZHeight = getStyle(this._layout, 'textZHeight', item.properties);
        if (iconZHeight && textZHeight) {
            base += (iconZHeight + textZHeight) / 2;
        }
        else if (iconZHeight) {
            base += iconZHeight;
        }
        else if (textZHeight) {
            base += textZHeight;
        }
        const icon = this._calcImage(resultPoint, item, base, opacity);
        const iconText = this._calcText(resultPoint, item, base, opacity);
        const isCollision = getStyle(this._layout, 'collision', item.properties);
        const weight = getStyle(this._layout, 'weight', item.properties);
        const margin = getStyle(this._layout, 'margin', item.properties);
        const zoomRange = getStyle(this._layout, 'zoomRange', item.properties);
        const collision = {
            point: resultPoint,
            data: [],
            weight,
            margin,
            zoomRange,
        };
        const arr = [];
        if (icon && iconText) {
            collision.data.push(icon.collision, iconText.collision);
            arr.push(icon.geometry, iconText.geometry);
        }
        else if (icon) {
            collision.data.push(icon.collision);
            arr.push(icon.geometry);
        }
        else if (iconText) {
            collision.data.push(iconText.collision);
            arr.push(iconText.geometry);
        }
        this._geometryInfo.push({ data: arr, isCollision: isCollision, collision: collision });
    }
    _calcImage(point, item, base, opacity) {
        if (!item.iconSize) return;
        const iconUrl = getStyle(this._layout, 'iconUrl', item.properties);
        const anchor = getStyle(this._layout, 'iconAnchor', item.properties);
        const offset = getStyle(this._layout, 'iconOffset', item.properties);
        const iconSize = getStyle(this._layout, 'iconSize', item.properties);
        const width = item.iconSize[0] * iconSize;
        const height = item.iconSize[1] * iconSize;
        const { vertices, texCoords } = createPointGeometry(point, width, height, anchor);
        const geometry = { point, vertices, texCoords, offset, base, opacity, iconUrl };
        const collision = { width, height, anchor, offset };
        return { geometry, collision };
    };
    _calcText(point, item, base, opacity) {
        if (!item.textSize || !item.textArr) return;
        const textSize = getStyle(this._layout, 'textSize', item.properties);
        const anchor = getStyle(this._layout, 'textAnchor', item.properties);
        const offset = getStyle(this._layout, 'textOffset', item.properties);
        const width = item.textSize[0] * textSize / this._baseTextSize;
        const height = item.textSize[1] * textSize / this._baseTextSize;
        const textColor = getStyle(this._layout, 'textColor', item.properties);
        const strokeColor = getStyle(this._layout, 'textStrokeColor', item.properties);
        const { vertices, texCoords } = createPointGeometry(point, width, height, anchor);
        const textOptions = {
            textArr: item.textArr,
            width: item.textSize[0],
            height: item.textSize[1],
            fillColor: textColor,
            strokeColor,
        };
        const geometry = {
            point,
            vertices,
            texCoords,
            offset,
            base,
            opacity,
            textOptions,
        };
        const collision = { width, height, anchor, offset };
        return { geometry, collision };
    }
}
