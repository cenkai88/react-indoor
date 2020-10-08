/* 

Line 线

*/

import Point from "./Point";
import Vector2 from "./Vector2";
import { EPSILON } from "../utils/constants";

export default class Line {
    constructor(start, end) {
        this._start = new Point(start[0], start[1]);
        this._end = new Point(end[0], end[1]);
    }
    getVector2() {
        const x = this._end.x - this._start.x;
        const y = this._end.y - this._start.y;
        return new Vector2([x, y]);
    }
    getLength() {
        return this._start.distanceTo(this._end);
    }
    getClosest(coordinate) {
        const x0 = coordinate.x, y0 = coordinate.y;
        const point = new Point(x0, y0);
        const vector = this.getVector2();
        const m = vector.x, n = vector.y;
        const { x: x1, y: y1 } = this._start;
        const { x: x2, y: y2 } = this._end;
        if (this.getLength() === 0) {
            const distance = point.distanceTo(this._start);
            return { distance, coordinate: { x: x1, y: y1 } };
        }
        const y = (m * n * x0 - m * n * x1 + n * n * y0 + m * m * y1) / (n * n + m * m);
        let x;
        if (m === 0) {
            x = (n * x1 + m * y - m * y1) / n;
        }
        else {
            x = (m * x0 - n * y + n * y0) / m;
        }
        if (this._checkIsInSegment(x, y)) {
            const resultPoint = new Point(x, y);
            const distance = resultPoint.distanceTo(point);
            return { distance, coordinate: { x: x, y: y } };
        } else {
            const distance1 = point.distanceTo(this._start);
            const distance2 = point.distanceTo(this._end);
            if (distance1 < distance2) {
                return { dis: distance1, coordinate: { x: x1, y: y1 } };
            }
            else {
                return { dis: distance2, coordinate: { x: x2, y: y2 } };
            }
        }
    }
    _checkIsInSegment(x, y) {
        return (x - this._start.x) * (x - this._end.x) <= EPSILON &&
            (y - this._start.y) * (y - this._end.y) <= EPSILON;
    }
    getStart() {
        return this._start;
    }
    getEnd() {
        return this._end;
    }
}

