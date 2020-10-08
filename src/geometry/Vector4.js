/* 

Vector4 四维向量，主要是Camera用

*/

export default class Vector4 {
    constructor(start, end) {
        if (end) {
            this.x = end[0] - start[0];
            this.y = end[1] - start[1];
            this.z = end[2] - start[2];
            this.w = end[3] - start[3];
        }
        else {
            this.x = start[0];
            this.y = start[1];
            this.z = start[2];
            this.w = start[3];
        }
    }
    unit() {
        const len = this.getLength();
        return new Vector4([this.x / len, this.y / len, this.z / len, this.w / len]);
    }
    divide(num) {
        this.x /= num;
        this.y /= num;
        this.z /= num;
        this.w /= num;
        return this;
    }
    getLength() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2) + Math.pow(this.w, 2));
    }
    multiplyMat4(matrix) {
        const m = matrix.getValue();
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        const resultX = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        const resultY = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        const resultZ = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        const resultW = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
        return new Vector4([resultX, resultY, resultZ, resultW]);
    }
    clone() {
        return new Vector4([this.x, this.y, this.z, this.w]);
    }
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        this.w -= other.w;
    }
}