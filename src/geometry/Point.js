/* 

Point 点

*/

export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    add(point) {
        this.x += point.x;
        this.y += point.y;
        return this;
    }
    subtract(point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }
    divide(num) {
        this.x /= num;
        this.y /= num;
        return this;
    }
    equal(point) {
        return this.x === point.x && this.y === point.y;
    }
    clone() {
        return new Point(this.x, this.y);
    }
    distanceTo(point) {
        return Math.sqrt(Math.pow((this.x - point.x), 2) + Math.pow((this.y - point.y), 2));
    }
    rotate (angle) {		
        const cos = Math.cos(angle);		
        const sin = Math.sin(angle);		
        const x = cos * this.x - sin * this.y;		
        const y = sin * this.x + cos * this.y;		
        this.x = x;		
        this.y = y;
        return this;		
    }
    multiply(num) {
        this.x *= num;
        this.y *= num;
        return this;
    }
    getLength() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}
