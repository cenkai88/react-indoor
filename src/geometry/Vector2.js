/* 

Vector2 二维向量

*/

export default class Vector2 {
    constructor(start, end) {
        if (end) {
            this.x = end[0] - start[0];
            this.y = end[1] - start[1];
        }
        else {
            this.x = start[0];
            this.y = start[1];
        }
    }
    unit() {
        const length = this.getLength();
        if (length === 0) {
            return new Vector2([0, 0]);
        }
        const x = this.x / length;
        const y = this.y / length;
        return new Vector2([0, 0], [x, y]);
    };
    normal() {
        return new Vector2([0, 0], [-this.y, this.x]);
    };
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    };
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = cos * this.x - sin * this.y;
        const y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    };
    multiply(num) {
        this.x *= num;
        this.y *= num;
        return this;
    };
    dot(other) {
        return this.x * other.x + this.y * other.y;
    };
    angleTo(other) {
        const m1 = this.getLength();
        const m2 = other.getLength();
        const m = m1 * m2;
        if (m === 0)
            return 0;
        let num = (this.x * other.x + this.y * other.y) / m;
        if (num > 1) {
            num = 1;
        }
        else if (num < -1) {
            num = -1;
        }
        const angle = Math.acos(num) / Math.PI * 180;
        const cross = this.cross(other) < 0 ? 1 : -1;
        return cross * angle;
    };
    cross(other) {
        return this.x * other.y - other.x * this.y;
    };
    clone() {
        return new Vector2([0, 0], [this.x, this.y]);
    };
    multiplyMat4(matrix) {
        const m = matrix.getValue();
        const x = m[0] * this.x + m[4] * this.y + m[12];
        const y = m[1] * this.x + m[5] * this.y + m[13];
        return new Vector2([x, y]);
    };
    getLength() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
}
