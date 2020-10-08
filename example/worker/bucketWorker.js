"use strict";
importScripts('./earcut.js');
let collision;

class Matrix4 {
  constructor(value) {
    this._value = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    if (value) {
      for (let i = 0; i < value.length; i += 1) {
        this._value[i] = value[i];
      }
    }
  }
  setIdentity() {
    const e = this._value;
    e[0] = 1;
    e[4] = 0;
    e[8] = 0;
    e[12] = 0;
    e[1] = 0;
    e[5] = 1;
    e[9] = 0;
    e[13] = 0;
    e[2] = 0;
    e[6] = 0;
    e[10] = 1;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  };
  multiply(other) {
    let i, e, a, b, ai0, ai1, ai2, ai3;
    e = this._value;
    a = this._value;
    b = other._value;
    if (e === b) {
      b = new Float32Array(16);
      for (i = 0; i < 16; ++i) {
        b[i] = e[i];
      }
    }
    for (i = 0; i < 4; i++) {
      ai0 = a[i];
      ai1 = a[i + 4];
      ai2 = a[i + 8];
      ai3 = a[i + 12];
      e[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
      e[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
      e[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
      e[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return this;
  };
  transpose() {
    let e, t;
    e = this._value;
    t = e[1];
    e[1] = e[4];
    e[4] = t;
    t = e[2];
    e[2] = e[8];
    e[8] = t;
    t = e[3];
    e[3] = e[12];
    e[12] = t;
    t = e[6];
    e[6] = e[9];
    e[9] = t;
    t = e[7];
    e[7] = e[13];
    e[13] = t;
    t = e[11];
    e[11] = e[14];
    e[14] = t;
    return this;
  };
  invert() {
    let i, s, d, inv, det;
    s = this.getValue();
    d = this._value;
    inv = new Float32Array(16);
    inv[0] = s[5] * s[10] * s[15] - s[5] * s[11] * s[14] - s[9] * s[6] * s[15]
      + s[9] * s[7] * s[14] + s[13] * s[6] * s[11] - s[13] * s[7] * s[10];
    inv[4] = -s[4] * s[10] * s[15] + s[4] * s[11] * s[14] + s[8] * s[6] * s[15]
      - s[8] * s[7] * s[14] - s[12] * s[6] * s[11] + s[12] * s[7] * s[10];
    inv[8] = s[4] * s[9] * s[15] - s[4] * s[11] * s[13] - s[8] * s[5] * s[15]
      + s[8] * s[7] * s[13] + s[12] * s[5] * s[11] - s[12] * s[7] * s[9];
    inv[12] = -s[4] * s[9] * s[14] + s[4] * s[10] * s[13] + s[8] * s[5] * s[14]
      - s[8] * s[6] * s[13] - s[12] * s[5] * s[10] + s[12] * s[6] * s[9];
    inv[1] = -s[1] * s[10] * s[15] + s[1] * s[11] * s[14] + s[9] * s[2] * s[15]
      - s[9] * s[3] * s[14] - s[13] * s[2] * s[11] + s[13] * s[3] * s[10];
    inv[5] = s[0] * s[10] * s[15] - s[0] * s[11] * s[14] - s[8] * s[2] * s[15]
      + s[8] * s[3] * s[14] + s[12] * s[2] * s[11] - s[12] * s[3] * s[10];
    inv[9] = -s[0] * s[9] * s[15] + s[0] * s[11] * s[13] + s[8] * s[1] * s[15]
      - s[8] * s[3] * s[13] - s[12] * s[1] * s[11] + s[12] * s[3] * s[9];
    inv[13] = s[0] * s[9] * s[14] - s[0] * s[10] * s[13] - s[8] * s[1] * s[14]
      + s[8] * s[2] * s[13] + s[12] * s[1] * s[10] - s[12] * s[2] * s[9];
    inv[2] = s[1] * s[6] * s[15] - s[1] * s[7] * s[14] - s[5] * s[2] * s[15]
      + s[5] * s[3] * s[14] + s[13] * s[2] * s[7] - s[13] * s[3] * s[6];
    inv[6] = -s[0] * s[6] * s[15] + s[0] * s[7] * s[14] + s[4] * s[2] * s[15]
      - s[4] * s[3] * s[14] - s[12] * s[2] * s[7] + s[12] * s[3] * s[6];
    inv[10] = s[0] * s[5] * s[15] - s[0] * s[7] * s[13] - s[4] * s[1] * s[15]
      + s[4] * s[3] * s[13] + s[12] * s[1] * s[7] - s[12] * s[3] * s[5];
    inv[14] = -s[0] * s[5] * s[14] + s[0] * s[6] * s[13] + s[4] * s[1] * s[14]
      - s[4] * s[2] * s[13] - s[12] * s[1] * s[6] + s[12] * s[2] * s[5];
    inv[3] = -s[1] * s[6] * s[11] + s[1] * s[7] * s[10] + s[5] * s[2] * s[11]
      - s[5] * s[3] * s[10] - s[9] * s[2] * s[7] + s[9] * s[3] * s[6];
    inv[7] = s[0] * s[6] * s[11] - s[0] * s[7] * s[10] - s[4] * s[2] * s[11]
      + s[4] * s[3] * s[10] + s[8] * s[2] * s[7] - s[8] * s[3] * s[6];
    inv[11] = -s[0] * s[5] * s[11] + s[0] * s[7] * s[9] + s[4] * s[1] * s[11]
      - s[4] * s[3] * s[9] - s[8] * s[1] * s[7] + s[8] * s[3] * s[5];
    inv[15] = s[0] * s[5] * s[10] - s[0] * s[6] * s[9] - s[4] * s[1] * s[10]
      + s[4] * s[2] * s[9] + s[8] * s[1] * s[6] - s[8] * s[2] * s[5];
    det = s[0] * inv[0] + s[1] * inv[4] + s[2] * inv[8] + s[3] * inv[12];
    if (det === 0) {
      return this;
    }
    det = 1 / det;
    for (i = 0; i < 16; i++) {
      d[i] = inv[i] * det;
    }
    return this;
  };
  setOrtho(left, right, bottom, top, near, far) {
    let e, rw, rh, rd;
    if (left === right || bottom === top || near === far) {
      throw 'null frustum';
    }
    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);
    e = this._value;
    e[0] = 2 * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 2 * rh;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
    e[9] = 0;
    e[10] = -2 * rd;
    e[11] = 0;
    e[12] = -(right + left) * rw;
    e[13] = -(top + bottom) * rh;
    e[14] = -(far + near) * rd;
    e[15] = 1;
    return this;
  };
  setFrustum(left, right, bottom, top, near, far) {
    let e, rw, rh, rd;
    if (left === right || top === bottom || near === far) {
      throw 'null frustum';
    }
    if (near <= 0) {
      throw 'near <= 0';
    }
    if (far <= 0) {
      throw 'far <= 0';
    }
    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);
    e = this._value;
    e[0] = 2 * near * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 2 * near * rh;
    e[6] = 0;
    e[7] = 0;
    e[8] = (right + left) * rw;
    e[9] = (top + bottom) * rh;
    e[10] = -(far + near) * rd;
    e[11] = -1;
    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;
    return this;
  };
  setPerspective(fovy, aspect, near, far) {
    let e, rd, s, ct;
    if (near === far || aspect === 0) {
      throw 'null frustum';
    }
    if (near <= 0) {
      throw 'near <= 0';
    }
    if (far <= 0) {
      throw 'far <= 0';
    }
    fovy = Math.PI * fovy / 180 / 2;
    s = Math.sin(fovy);
    if (s === 0) {
      throw 'null frustum';
    }
    rd = 1 / (far - near);
    ct = Math.cos(fovy) / s;
    e = this._value;
    e[0] = ct / aspect;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = ct;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
    e[9] = 0;
    e[10] = -(far + near) * rd;
    e[11] = -1;
    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;
    return this;
  };
  scale(x, y, z) {
    const e = this._value;
    e[0] *= x;
    e[4] *= y;
    e[8] *= z;
    e[1] *= x;
    e[5] *= y;
    e[9] *= z;
    e[2] *= x;
    e[6] *= y;
    e[10] *= z;
    e[3] *= x;
    e[7] *= y;
    e[11] *= z;
    return this;
  };
  translate(x, y, z) {
    const e = this._value;
    e[12] += e[0] * x + e[4] * y + e[8] * z;
    e[13] += e[1] * x + e[5] * y + e[9] * z;
    e[14] += e[2] * x + e[6] * y + e[10] * z;
    e[15] += e[3] * x + e[7] * y + e[11] * z;
    return this;
  };
  rotate(angle, x, y, z) {
    let len = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    if (len === 0) return this;
    const rad = angle / 180 * Math.PI;
    const a = this._value;
    let s, c, t;
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;
    let b00, b01, b02;
    let b10, b11, b12;
    let b20, b21, b22;
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;
    a[0] = a00 * b00 + a10 * b01 + a20 * b02;
    a[1] = a01 * b00 + a11 * b01 + a21 * b02;
    a[2] = a02 * b00 + a12 * b01 + a22 * b02;
    a[3] = a03 * b00 + a13 * b01 + a23 * b02;
    a[4] = a00 * b10 + a10 * b11 + a20 * b12;
    a[5] = a01 * b10 + a11 * b11 + a21 * b12;
    a[6] = a02 * b10 + a12 * b11 + a22 * b12;
    a[7] = a03 * b10 + a13 * b11 + a23 * b12;
    a[8] = a00 * b20 + a10 * b21 + a20 * b22;
    a[9] = a01 * b20 + a11 * b21 + a21 * b22;
    a[10] = a02 * b20 + a12 * b21 + a22 * b22;
    a[11] = a03 * b20 + a13 * b21 + a23 * b22;
    return this;
  };
  setLookAt(eye, center, up) {
    if (eye.length !== 3 || center.length !== 3 || up.length !== 3) {
      console.error('数据格式错误');
      return this;
    }
    const [eyeX, eyeY, eyeZ] = eye;
    const [centerX, centerY, centerZ] = center;
    const [upX, upY, upZ] = up;
    let e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;
    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;
    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;
    e = this._value;
    e[0] = sx;
    e[1] = ux;
    e[2] = -fx;
    e[3] = 0;
    e[4] = sy;
    e[5] = uy;
    e[6] = -fy;
    e[7] = 0;
    e[8] = sz;
    e[9] = uz;
    e[10] = -fz;
    e[11] = 0;
    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
    this.translate(-eyeX, -eyeY, -eyeZ);
    return this;
  };
  dropShadow(plane, light) {
    const mat = new Matrix4();
    const e = mat.getValue();
    const dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];
    e[0] = dot - light[0] * plane[0];
    e[1] = -light[1] * plane[0];
    e[2] = -light[2] * plane[0];
    e[3] = -light[3] * plane[0];
    e[4] = -light[0] * plane[1];
    e[5] = dot - light[1] * plane[1];
    e[6] = -light[2] * plane[1];
    e[7] = -light[3] * plane[1];
    e[8] = -light[0] * plane[2];
    e[9] = -light[1] * plane[2];
    e[10] = dot - light[2] * plane[2];
    e[11] = -light[3] * plane[2];
    e[12] = -light[0] * plane[3];
    e[13] = -light[1] * plane[3];
    e[14] = -light[2] * plane[3];
    e[15] = dot - light[3] * plane[3];
    return this.multiply(mat);
  };
  getValue() {
    return this._value;
  };
  clone() {
    return new Matrix4(this._value);
  };
}

class Vector4 {
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

class Vector2 {
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

const createScreenBounds = (point, width, height, anchor = 'center') => {
  const AnchorMap = {
    center: [0.5, 0.5],
    top: [0.5, 0],
    bottom: [0.5, 1],
    left: [0, 0.5],
    right: [1, 0.5],
    'top-left': [0, 0],
    'top-right': [1, 0],
    'bottom-left': [0, 1],
    'bottom-right': [1, 1],
  };
  const anchorArr = AnchorMap[anchor] || [0.5, 0.5];
  return {
    leftBottom: [
      point[0] - anchorArr[0] * width, point[1] - anchorArr[1] * height,
    ],
    rightTop: [
      point[0] + (1 - anchorArr[0]) * width, point[1] + (1 - anchorArr[1]) * height,
    ],
  };
}

const createRect = (point, width, height, anchor = 'center') => {
  const AnchorMap = {
    center: [0.5, 0.5],
    top: [0.5, 1],
    bottom: [0.5, 0],
    left: [0, 0.5],
    right: [1, 0.5],
    'top-left': [0, 1],
    'top-right': [1, 1],
    'bottom-left': [0, 0],
    'bottom-right': [1, 0],
  };
  const anchorArr = AnchorMap[anchor] || [0.5, 0.5];
  return [
    point[0] - anchorArr[0] * width, point[1] + (1 - anchorArr[1]) * height,
    point[0] - anchorArr[0] * width, point[1] - anchorArr[1] * height,
    point[0] + (1 - anchorArr[0]) * width, point[1] + (1 - anchorArr[1]) * height,
    point[0] + (1 - anchorArr[0]) * width, point[1] - anchorArr[1] * height,
  ];
}
const createPointGeometry = (point, width, height, anchor) => {
  const vertices = createRect(point, width, height, anchor);
  const texCoords = [0, 1, 0, 0, 1, 1, 1, 0];
  return { vertices: vertices, texCoords: texCoords };
}
const filter = (arr, filterArr) => {
  const set = new Set(filterArr);
  const result = [];
  const filterResult = [];
  for (let i = 0; i < arr.length; i += 1) {
    set.has(arr[i]) ? filterResult.push(arr[i]) : result.push(arr[i]);
  }
  return { result, filterResult };
}

function containedInContour(contour, pointList) {
  for (let i = 0; i < contour.length; i += 1)
    for (let j = 0; j < pointList.length; j += 1) {
      const {
        leftBottom: [x1, y1],
        rightTop: [x2, y2],
      } = contour[i];
      const {
        leftBottom: [x3, y3],
        rightTop: [x4, y4],
      } = pointList[j];
      const deltaX1 = Math.abs(x1 + x2 - x3 - x4);
      const deltaX2 = Math.abs(x1 - x2) + Math.abs(x3 - x4);
      const deltaY1 = Math.abs(y1 + y2 - y3 - y4);
      const deltaY2 = Math.abs(y1 - y2) + Math.abs(y3 - y4);
      if (deltaX1 <= deltaX2 && deltaY1 <= deltaY2)
        return true;
    }
  return false;
}


class Collision {
  constructor(data) {
    this._lastResult = new Map();
    this._view = data.view;
    this._viewMatrix = new Matrix4(data.viewMatrix);
    this._projectionMatrix = new Matrix4(data.projectionMatrix);
    this._zoom = data.zoom;
    this._z = data.z;
    this._center = data.center;
    this._onePixelToWorld = data.onePixelToWorld;
    const { viewWidth, viewHeight } = this._view;
    this._max = Math.sqrt(Math.pow(viewWidth, 2) + Math.pow(viewHeight, 2)) / 2;
  }
  updateOptions(t) {
    this._view = t.view;
    this._viewMatrix = new Matrix4(t.viewMatrix);
    this._projectionMatrix = new Matrix4(t.projectionMatrix);
    this._zoom = t.zoom;
    this._z = t.z;
    this._center = t.center;
    this._onePixelToWorld = t.onePixelToWorld;
    const { viewWidth, viewHeight } = this._view;
    this._max = Math.sqrt(Math.pow(viewWidth, 2) + Math.pow(viewHeight, 2)) / 2 / this._viewMatrix.getValue()[10];
  }
  _checkCenter(t) {
    return Math.sqrt(Math.pow(t[0] - this._center.x, 2) + Math.pow(t[1] - this._center.y, 2)) / this._onePixelToWorld * this._viewMatrix.getValue()[10] <= this._max;
  }
  calculate(data) {
    const idDataMapping = new Map();
    for (let i = 0; i < data.length; i += 1) {
      const floor = data[i];
      for (let j = 0; j < floor.data.length; j += 1) {
        const { zoomRange, point } = floor.data[j];
        if (this._checkZoomRange(zoomRange) && this._checkCenter(point)) {
          const floorData = idDataMapping.get(floor.floorId);
          const newData = {
            id: floor.id,
            index: j,
            ...floor.data[j],
          };
          if (floorData) {
            floorData.push(newData)
          } else {
            idDataMapping.set(floor.floorId, [newData])
          }
        }
      }
    }
    const idIndexMapping = new Map();
    idDataMapping.forEach(floorData => {
      this._calculateFloor(floorData).forEach((value, id) => {
        idIndexMapping.set(id, value);
      });
    })
    return this._generateResult(idIndexMapping);
  }
  _generateResult(idIndexMapping) {
    const showResult = {};
    const hideResult = {};
    const normalResult = {};
    idIndexMapping.forEach((value, id) => {
      const lastValue = this._lastResult.get(id);
      if (lastValue) {
        const { result, filterResult } = filter(value, lastValue);
        showResult[id] = result;
        normalResult[id] = filterResult;
      } else
        showResult[id] = value;
    });
    this._lastResult.forEach((lastValue, id) => {
      const value = idIndexMapping.get(id);
      if (value) {
        hideResult[id] = filter(lastValue, value).result;
      } else
        hideResult[id] = lastValue;
    });
    this._lastResult = idIndexMapping;
    return {
      hideResult,
      showResult,
      normalResult,
    }
  }
  _checkZoomRange(t) {
    return !t || (null === t[0] || t[0] <= this._zoom) && (null === t[1] || this._zoom < t[1]);
  }
  _calculateFloor(data) {
    const sortedFloorData = data.sort((a, b) => a.weight - b.weight);
    const pointIdIndexMapping = new Map();
    const contourTotal = [];
    for (let i = 0; i < sortedFloorData.length; i += 1) {
      const { point, id, data, margin, index } = sortedFloorData[i];
      const pointList = [];
      const pointInScreenCoordinate = this._worldToScreenCoordinate(point);
      for (let j = 0; j < data.length; j += 1) {
        const { offset, width, height, anchor } = data[j];
        const { x, y } = pointInScreenCoordinate;
        const bounds = createScreenBounds([
          x - offset[0],
          y - offset[1],
        ], width, height, anchor);
        const leftBottom = [
          bounds.leftBottom[0] - margin,
          bounds.leftBottom[1] - margin,
        ];
        const rightTop = [
          bounds.rightTop[0] + margin,
          bounds.rightTop[1] + margin,
        ];
        pointList.push({
          leftBottom,
          rightTop,
        });
      }
      if (this._isInView(pointInScreenCoordinate) && !containedInContour(contourTotal, pointList)) {
        contourTotal.push.apply(contourTotal, pointList);
        pointIdIndexMapping.get(id) ? pointIdIndexMapping.get(id).push(index) : pointIdIndexMapping.set(id, [index]);
      }
    }
    return pointIdIndexMapping;
  }
  _worldToScreenCoordinate(point) {
    const [oriX, oriY] = point;
    const vector = new Vector4([
      oriX,
      oriY,
      this._z,
      1,
    ]);
    const matrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
    const convertedVector = vector.multiplyMat4(matrix);
    const { x, y, w } = convertedVector;
    return {
      x: (x + w) / (2 * w) * this._view.viewWidth,
      y: (1 - (y + w) / (2 * w)) * this._view.viewHeight,
    }
  }
  _isInView({ x, y }) {
    return 0 <= x && x < this._view.viewWidth && 0 <= y && y < this._view.viewHeight;
  }
}

class IdGenerator {
  static getId() {
    IdGenerator.id += 1;
    return "yx-" + IdGenerator.id;
  }
}

IdGenerator.id = 0;

const StyleUtils = {
  parseColor(color) {
    if (!color) return [0, 0, 0, 1];
    const arr = [];
    if (color.substr(0, 1) === '#') {
      const str = color.slice(1);
      for (let i = 0; i < 5; i += 2) {
        const num = parseInt(str.substr(i, 2), 16) / 255;
        arr.push(num || 0);
      }
      arr.push(1);
    }
    else if (color.substr(0, 4) === 'rgba') {
      const str = color.slice(5, -1);
      const splitArr = str.split(',');
      for (let i = 0; i < 3; i += 1) {
        const num = Number(splitArr[i]) / 255;
        arr.push(num || 0);
      }
      arr.push(Number(splitArr[3]) || 1);
    }
    else if (color.substr(0, 3) === 'rgb') {
      const str = color.slice(4, -1);
      const splitArr = str.split(',');
      for (let i = 0; i < 3; i += 1) {
        const num = Number(splitArr[i]) / 255;
        arr.push(num || 0);
      }
      arr.push(1);
    }
    if (arr.length !== 4) {
      return [0, 0, 0, 1];
    }
    else {
      return arr;
    }
  },
  getStyle(layout, name, properties) {
    const keys = layout.keys, values = layout.values;
    let style = layout[name];
    if (keys && values && properties) {
      for (let i = 0; i < keys.length; i += 1) {
        const otherLayout = values[properties[keys[i]]];
        if (otherLayout && otherLayout[name] !== undefined) {
          style = otherLayout[name];
          return style;
        }
      }
    }
    return style;
  },
};

class Indices {
  constructor(indices = []) {
    this._value = indices;
  }
  add(indices, offset) {
    if (offset === 0) {
      this._value = this._value.concat(indices);
    }
    else {
      for (let i = 0; i < indices.length; i += 1) {
        this._value.push(offset + indices[i]);
      }
    }
  };
  clear() {
    this._value = [];
  };
  getValue() {
    return this._value;
  };
}

class AbstractBucket {
  constructor(data) {
    this._geometryInfo = [];
    this._features = data.features;
    this._id = data.id;
    this._offset = data.offset;
    this._layout = data.layout;
    this._type = data.type;
    this._taskId = data.taskId;
  }
  getDrawInfo() {
    return {
      id: this._id,
      info: this._geometryInfo,
      type: this._type,
      taskId: this._taskId,
    };
  }
}

class FillBucket extends AbstractBucket {
  constructor(data) {
    super(data);
    this._geometryMap = {};
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
      if (visible) {
        if (geometry.type === 'Polygon') {
          this._calcPolygon(geometry.coordinates, properties);
        }
        else if (geometry.type === 'MultiPolygon') {
          for (let j = 0; j < geometry.coordinates.length; j += 1) {
            this._calcPolygon(geometry.coordinates[j], properties);
          }
        }
      }
    }
    for (const key in this._geometryMap) {
      const item = this._geometryMap[key];
      this._geometryInfo.push({
        vertices: item.vertices,
        fillIndices: item.fillIndices.getValue(),
        outlineIndices: item.outlineIndices.getValue(),
        fillColor: item.fillColor,
        outlineColor: item.outlineColor,
        base: item.base,
        opacity: item.opacity,
      });
    }
  }
  _calcPolygon(polygon, properties) {
    if (polygon.length === 0) return;
    const offset = this._offset;
    const vertices = [];
    const holes = [];
    const outlineIndices = [];
    const enableOutline = StyleUtils.getStyle(this._layout, 'enableOutline', properties);
    for (let i = 0; i < polygon.length; i += 1) {
      const face = polygon[i];
      for (let j = 0; j < face.length; j += 1) {
        if (enableOutline) {
          const verticesCount = vertices.length / 2;
          if (j < face.length - 1) {
            outlineIndices.push(verticesCount, verticesCount + 1);
          }
        }
        vertices.push(face[j][0] + offset[0], face[j][1] + offset[1]);
      }
      if (i < polygon.length - 1) {
        holes.push(vertices.length / 2);
      }
    }
    const fillIndices = earcut(vertices, holes.length === 0 ? undefined : holes, 2);
    const fillColor = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'fillColor', properties));
    const outlineColor = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'outlineColor', properties));
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    const key = this._getGeometryKey(properties);
    if (this._geometryMap[key] &&
      this._geometryMap[key].vertices.length / 2 + vertices.length / 2 < 65536) {
      const geometry = this._geometryMap[key];
      const oldVerticesCount = geometry.vertices.length / 2;
      geometry.fillIndices.add(fillIndices, oldVerticesCount);
      geometry.outlineIndices.add(outlineIndices, oldVerticesCount);
      geometry.vertices = geometry.vertices.concat(vertices);
    }
    else {
      if (this._geometryMap[key]) {
        this._geometryMap[IdGenerator.getId()] = this._geometryMap[key];
      }
      this._geometryMap[key] = {
        vertices,
        outlineColor,
        fillColor,
        fillIndices: new Indices(fillIndices),
        outlineIndices: new Indices(outlineIndices),
        base,
        opacity,
      };
    }
  }
  _getGeometryKey(properties) {
    const arr = [];
    for (let i = 0; i < FillBucket.GEOMETRY_KEYS.length; i += 1) {
      const style = StyleUtils.getStyle(this._layout, FillBucket.GEOMETRY_KEYS[i], properties);
      style !== undefined && arr.push(style);
    }
    return arr.join('-');
  }
  static get GEOMETRY_KEYS() {
    return ['fillColor', 'outlineColor', 'base', 'opacity']
  }
}

class FillExtrusionBucket extends AbstractBucket {
  constructor(data) {
    super(data);
    this._geometryMap = {};
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      this._update(this._features[i]);
    }
    this._fireMessage();
  }
  _fireMessage() {
    this._geometryInfo.length = 0;
    for (const key in this._geometryMap) {
      const item = this._geometryMap[key];
      this._geometryInfo.push({
        vertices: item.vertices,
        fillIndices: item.fillIndices.getValue(),
        outlineIndices: item.outlineIndices.getValue(),
        fillColor: item.fillColor,
        outlineColor: item.outlineColor,
        base: item.base,
        opacity: item.opacity,
        normals: item.normals,
        height: item.height,
        zoomRange: item.zoomRange,
      });
    }
  }
  _update(feature) {
    const geometry = feature.geometry, properties = feature.properties;
    const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
    if (visible) {
      if (geometry.type === 'Polygon') {
        this._calcPolygon(geometry.coordinates, properties);
      }
      else if (geometry.type === 'MultiPolygon') {
        for (let i = 0; i < geometry.coordinates.length; i += 1) {
          this._calcPolygon(geometry.coordinates[i], properties);
        }
      }
    }
  }
  _calcPolygon(polygon, properties) {
    const offset = this._offset;
    const vertices = [];
    const sideVertices = [];
    const sideIndices = [];
    const holes = [];
    const outlineIndices = [];
    const normals = [];
    const topNormals = [];
    const enableOutline = StyleUtils.getStyle(this._layout, 'enableOutline', properties);
    const height = StyleUtils.getStyle(this._layout, 'height', properties);
    for (let i = 0; i < polygon.length; i += 1) {
      const face = polygon[i];
      for (let j = 0; j < face.length; j += 1) {
        const curX = face[j][0] + offset[0];
        const curY = face[j][1] + offset[1];
        const sideCount = sideVertices.length / 2;
        if (j < face.length - 1) {
          if (enableOutline) {
            const verticesCount = vertices.length / 2;
            outlineIndices.push(verticesCount, verticesCount + 1);
          }
          const normalVector = new Vector2(face[j], face[j + 1]).normal();
          normals.push(normalVector.x, normalVector.y, 0);
          normals.push(normalVector.x, normalVector.y, 1);
          normals.push(normalVector.x, normalVector.y, 0);
          normals.push(normalVector.x, normalVector.y, 1);
          sideIndices.push(sideCount + 0, sideCount + 1, sideCount + 2);
          sideIndices.push(sideCount + 1, sideCount + 2, sideCount + 3);
          sideVertices.push(curX, curY);
          sideVertices.push(curX, curY);
          const nextX = face[j + 1][0] + offset[0];
          const nextY = face[j + 1][1] + offset[1];
          sideVertices.push(nextX, nextY);
          sideVertices.push(nextX, nextY);
        }
        topNormals.push(0, 0, FillExtrusionBucket.FACTOR + 1);
        vertices.push(curX, curY);
      }
      if (i < polygon.length - 1) {
        holes.push(vertices.length / 2);
      }
    }
    const indices = earcut(vertices, holes.length === 0 ? undefined : holes, 2);
    const topFaceCount = vertices.length / 2;
    for (let i = 0; i < sideIndices.length; i += 1) {
      indices.push(sideIndices[i] + topFaceCount);
    }
    const totalCount = topFaceCount + sideVertices.length / 2;
    const fillColor = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'fillColor', properties));
    const outlineColor = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'outlineColor', properties));
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    const zoomRange = StyleUtils.getStyle(this._layout, 'zoomRange', properties);
    const key = this._getGeometryKey(properties);
    if (this._geometryMap[key] &&
      this._geometryMap[key].vertices.length / 2 + totalCount < 65536) {
      const geometry = this._geometryMap[key];
      const oldVerticesCount = geometry.vertices.length / 2;
      geometry.fillIndices.add(indices, oldVerticesCount);
      geometry.outlineIndices.add(outlineIndices, oldVerticesCount);
      geometry.vertices = geometry.vertices.concat(vertices).concat(sideVertices);
      geometry.normals = geometry.normals.concat(topNormals).concat(normals);
    }
    else {
      if (this._geometryMap[key]) {
        this._geometryMap[IdGenerator.getId()] = this._geometryMap[key];
      }
      this._geometryMap[key] = {
        vertices: vertices.concat(sideVertices),
        normals: topNormals.concat(normals),
        fillIndices: new Indices(indices),
        outlineIndices: new Indices(outlineIndices),
        fillColor,
        outlineColor,
        height,
        base,
        opacity,
        zoomRange,
      };
    }
  }
  _getGeometryKey(properties) {
    const arr = [];
    for (let i = 0; i < FillExtrusionBucket.GEOMETRY_KEYS.length; i += 1) {
      const style = StyleUtils.getStyle(this._layout, FillExtrusionBucket.GEOMETRY_KEYS[i], properties);
      style !== undefined && arr.push(style);
    }
    return arr.join('-');
  }
  static get GEOMETRY_KEYS() {
    return ['fillColor', 'outlineColor', 'height', 'base', 'opacity', 'zoomRange']
  }
  static get FACTOR() {
    return Math.pow(2, 13);
  }
}

class CircleBucket extends AbstractBucket {
  constructor(data) {
    super(data);
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
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
    const color = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'color', properties));
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const radius = StyleUtils.getStyle(this._layout, 'radius', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    this._geometryInfo.push({
      color,
      base,
      point: p,
      radius,
      opacity,
    });
  }
}

class SymbolBucket extends AbstractBucket {
  constructor(data) {
    super(data);
    this._baseTextSize = data.baseTextSize;
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
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
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', item.properties);
    let base = StyleUtils.getStyle(this._layout, 'base', item.properties);
    const iconZHeight = StyleUtils.getStyle(this._layout, 'iconZHeight', item.properties);
    const textZHeight = StyleUtils.getStyle(this._layout, 'textZHeight', item.properties);
    if (iconZHeight && textZHeight) {
      base += (iconZHeight + textZHeight) / 2;
    }
    else if (iconZHeight) {
      base += iconZHeight;
    }
    else if (textZHeight) {
      base += textZHeight;
    }
    const imgSymbol = this._calcImage(resultPoint, item, base, opacity);
    const textSymbol = this._calcText(resultPoint, item, base, opacity);
    const isCollision = StyleUtils.getStyle(this._layout, 'collision', item.properties);
    const weight = StyleUtils.getStyle(this._layout, 'weight', item.properties);
    const margin = StyleUtils.getStyle(this._layout, 'margin', item.properties);
    const zoomRange = StyleUtils.getStyle(this._layout, 'zoomRange', item.properties);
    const collision = {
      point: resultPoint,
      data: [],
      weight,
      margin,
      zoomRange,
    };
    const arr = [];
    if (imgSymbol && textSymbol) {
      collision.data.push(imgSymbol.collision, textSymbol.collision);
      arr.push(imgSymbol.geometry, textSymbol.geometry);
    }
    else if (imgSymbol) {
      collision.data.push(imgSymbol.collision);
      arr.push(imgSymbol.geometry);
    }
    else if (textSymbol) {
      collision.data.push(textSymbol.collision);
      arr.push(textSymbol.geometry);
    }
    this._geometryInfo.push({ data: arr, isCollision: isCollision, collision: collision });
  }
  _calcImage(point, item, base, opacity) {
    if (!item.iconSize) return;
    const iconUrl = StyleUtils.getStyle(this._layout, 'iconImage', item.properties);
    const anchor = StyleUtils.getStyle(this._layout, 'iconAnchor', item.properties);
    const offset = StyleUtils.getStyle(this._layout, 'iconOffset', item.properties);
    const iconSize = StyleUtils.getStyle(this._layout, 'iconSize', item.properties);
    const width = item.iconSize[0] * iconSize;
    const height = item.iconSize[1] * iconSize;
    const { vertices, texCoords } = createPointGeometry(point, width, height, anchor);
    const geometry = { point, vertices, texCoords, offset, base, opacity, iconUrl };
    const collision = { width, height, anchor, offset };
    return { geometry, collision };
  };
  _calcText(point, item, base, opacity) {
    if (!item.textSize || !item.textArr) return;
    const textSize = StyleUtils.getStyle(this._layout, 'textSize', item.properties);
    const anchor = StyleUtils.getStyle(this._layout, 'textAnchor', item.properties);
    const offset = StyleUtils.getStyle(this._layout, 'textOffset', item.properties);
    const width = item.textSize[0] * textSize / this._baseTextSize;
    const height = item.textSize[1] * textSize / this._baseTextSize;
    const textColor = StyleUtils.getStyle(this._layout, 'textColor', item.properties);
    const strokeColor = StyleUtils.getStyle(this._layout, 'textStrokeColor', item.properties);
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

class ConnectionBucket extends AbstractBucket {
  constructor(data) {
    super(data);
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
      if (visible) {
        if (geometry.type === 'LineString') {
          this._calcPolyline(geometry.coordinates, properties);
        }
        else if (geometry.type === 'MultiLineString') {
          for (let j = 0; j < geometry.coordinates.length; j += 1) {
            this._calcPolyline(geometry.coordinates[j], properties);
          }
        }
      }
    }
  }
  _calcPolyline(line, properties) {
    const offset = this._offset;
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    const color = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'color', properties));
    const width = StyleUtils.getStyle(this._layout, 'width', properties);
    const iconUrl = StyleUtils.getStyle(this._layout, 'icon', properties);
    const vertices = [];
    const normals = [];
    const texCoords = [];
    for (let i = 0; i < line.length; i += 1) {
      const point = [line[i][0] + offset[0], line[i][1] + offset[1], line[i][2]];
      if (i === 0) {
        const start = [line[i][0] + offset[0], line[i][2]];
        const end = [line[i + 1][0] + offset[0], line[i + 1][2]];
        const normal = new Vector2(start, end).normal().unit();
        normals.push(normal.x, normal.y, -normal.x, -normal.y);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, 1, 0, 0);
      }
      else if (i < line.length - 1) {
        const last = [line[i - 1][0] + offset[0], line[i - 1][2]];
        const cur = [line[i][0] + offset[0], line[i][2]];
        const next = [line[i + 1][0] + offset[0], line[i + 1][2]];
        const dir1 = new Vector2(last, cur);
        const normal1 = dir1.normal().unit();
        normals.push(normal1.x, normal1.y, -normal1.x, -normal1.y);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(1 * dir1.getLength(), 1, 1 * dir1.getLength(), 0);
        const normal2 = new Vector2(cur, next).normal().unit();
        normals.push(normal2.x, normal2.y, -normal2.x, -normal2.y);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, 1, 0, 0);
      }
      else {
        const start = [line[i - 1][0] + offset[0], line[i - 1][2]];
        const end = [line[i][0] + offset[0], line[i][2]];
        const dir = new Vector2(start, end);
        const normal = dir.normal().unit();
        normals.push(normal.x, normal.y, -normal.x, -normal.y);
        vertices.push.apply(vertices, point.concat(point));
        texCoords.push(1 * dir.getLength(), 1, 1 * dir.getLength(), 0);
      }
    }
    this._geometryInfo.push({
      vertices,
      normals,
      base,
      opacity,
      width,
      color,
      iconUrl,
      texCoords,
    });
  }
}

class HeatmapBucket extends AbstractBucket {
  constructor(data) {
    super(data);
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
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
    const radius = StyleUtils.getStyle(this._layout, 'radius', properties);
    this._geometryInfo.push({
      point: p,
      radius,
    });
  }
}

class LineBucket extends AbstractBucket {
  constructor(data) {
    super(data);
    this._geometryMap = {};
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { properties, geometry } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
      if (visible) {
        if (geometry.type === 'LineString') {
          this._calcPolyline(geometry.coordinates, properties);
        }
        else if (geometry.type === 'MultiLineString') {
          for (let j = 0; j < geometry.coordinates.length; j += 1) {
            this._calcPolyline(geometry.coordinates[j], properties);
          }
        }
      }
    }
    for (const key in this._geometryMap) {
      this._geometryInfo.push({
        ...this._geometryMap[key],
        indices: this._geometryMap[key].indices.getValue()
      });
    }
  };
  _calcPolyline(polyline, properties) {
    const offset = this._offset;
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    const width = StyleUtils.getStyle(this._layout, 'lineWidth', properties);
    const color = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'lineColor', properties));
    const iconUrl = StyleUtils.getStyle(this._layout, 'lineImage', properties);
    const vertices = [];
    const normals = [];
    const deviation = [];
    const texCoords = [];
    const indices = [];
    for (let i = 0; i < polyline.length; i += 1) {
      const point = [polyline[i][0] + offset[0], polyline[i][1] + offset[1]];
      let startNum = vertices.length / 2;
      if (i === 0) {
        const dir = new Vector2(polyline[i], polyline[i + 1]);
        const normal = dir.normal().unit();
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, 1, 0, 0);
        deviation.push(0, 0, 0, 0, 0, 0);
        normals.push(normal.x, normal.y, -normal.x, -normal.y);
        indices.push(startNum + 0, startNum + 1);
      }
      else if (i < polyline.length - 1) {
        const lastPoint = [polyline[i - 1][0] + offset[0], polyline[i - 1][1] + offset[1]];
        const nextPoint = [polyline[i + 1][0] + offset[0], polyline[i + 1][1] + offset[1]];
        const dir1 = new Vector2(lastPoint, point);
        const length1 = dir1.getLength();
        const unitDir1 = dir1.unit();
        const normal1 = unitDir1.normal();
        const dir2 = new Vector2(point, nextPoint);
        const length2 = dir2.getLength();
        const unitDir2 = dir2.unit();
        const normal2 = unitDir2.normal();
        let angle = Math.abs(normal1.angleTo(normal2));
        angle = angle === 180 ? 0 : angle;
        angle = angle / 180 * Math.PI;
        const offsetNum = Math.tan(angle / 2);
        unitDir1.multiply(-offsetNum);
        unitDir2.multiply(offsetNum);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(1 * length1, 1, 1 * length1, 0);
        deviation.push(unitDir1.x, unitDir1.y, length1, unitDir1.x, unitDir1.y, length1);
        indices.push(startNum, startNum - 1, startNum, startNum + 1);
        normals.push(normal1.x, normal1.y, -normal1.x, -normal1.y);
        const flat = normal1.cross(normal2) <= 0 ? -1 : 1;
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, flat === -1 ? 1 : 0, 0, flat === -1 ? 0 : 0.93);
        deviation.push(unitDir1.x, unitDir1.y, length1, unitDir1.x, unitDir1.y, length1);
        normals.push(normal1.x, normal1.y, -normal1.x, -normal1.y);
        startNum += 2;
        const { indices: subIndices, vertices: subVertices, normals: subNormals, texCoords: subTexCoords, deviation: subDeviation } = LineBucket.getLineJoin(point, normal1, normal2, vertices.length / 2);
        vertices.push.apply(vertices, subVertices);
        indices.push.apply(indices, subIndices);
        normals.push.apply(normals, subNormals);
        deviation.push.apply(deviation, subDeviation);
        texCoords.push.apply(texCoords, subTexCoords);
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, flat === -1 ? 1 : 0, 0, flat === -1 ? 0 : 0.93);
        deviation.push(unitDir2.x, unitDir2.y, length2, unitDir2.x, unitDir2.y, length2);
        normals.push(normal2.x, normal2.y, -normal2.x, -normal2.y);
        startNum += 2;
        const subNum = subVertices.length / 2;
        vertices.push.apply(vertices, [...point, ...point]);
        texCoords.push(0, 1, 0, 0);
        deviation.push(unitDir2.x, unitDir2.y, length2, unitDir2.x, unitDir2.y, length2);
        indices.push(startNum + 2 + subNum, startNum + 3 + subNum);
        normals.push(normal2.x, normal2.y, -normal2.x, -normal2.y);
      }
      else {
        const lastPoint = [polyline[i - 1][0] + offset[0], polyline[i - 1][1] + offset[1]];
        const dir = new Vector2(lastPoint, point);
        const length = dir.getLength();
        const normal = dir.normal().unit();
        vertices.push.apply(vertices, [...point, ...point]);
        deviation.push(0, 0, 0, 0, 0, 0);
        texCoords.push(1 * length, 1, 1 * length, 0);
        indices.push(startNum, startNum - 1, startNum, startNum + 1);
        normals.push(normal.x, normal.y, -normal.x, -normal.y);
      }
    }
    const key = this._getGeometryKey(properties);
    if (this._geometryMap[key] &&
      this._geometryMap[key].vertices.length / 2 + vertices.length / 2 < 65536) {
      const geometry = this._geometryMap[key];
      const oldVerticesCount = geometry.vertices.length / 2;
      geometry.indices.add(indices, oldVerticesCount);
      geometry.vertices = geometry.vertices.concat(vertices);
      geometry.texCoords = geometry.texCoords.concat(texCoords);
      geometry.normals = geometry.normals.concat(normals);
      geometry.deviation = geometry.deviation.concat(deviation);
    }
    else {
      this._geometryMap[key] = {
        vertices,
        normals,
        base,
        opacity,
        width,
        color,
        deviation,
        iconUrl,
        texCoords,
        indices: new Indices(indices),
      };
    }
  }
  _getGeometryKey(properties) {
    const arr = [];
    for (let i = 0; i < LineBucket.GEOMETRY_KEYS.length; i += 1) {
      const style = StyleUtils.getStyle(this._layout, LineBucket.GEOMETRY_KEYS[i], properties);
      style !== undefined && arr.push(style);
    }
    return arr.join('-');
  }
  static getLineJoin(point, v0, v1, indexOffset) {
    const vertices = [];
    const texCoords = [];
    const deviation = [];
    const normals = [];
    const indices = [];
    const step = Math.PI / 16;
    const maxAngle = Math.abs(v0.angleTo(v1)) / 180 * Math.PI + step;
    const dir = v0.clone().add(v1).unit();
    const normal = dir.normal();
    const dir1Normal = v0.unit().normal();
    const num = 1 / normal.dot(dir1Normal);
    const flat = v0.cross(v1) <= 0 ? -1 : 1;
    dir.multiply(num * flat);
    vertices.push.apply(vertices, point);
    texCoords.push(0, 0.7);
    deviation.push(0, 0, 0);
    normals.push(0, 0);
    if (maxAngle > step) {
      indices.push(indexOffset - 1, indexOffset, indexOffset + 1, indexOffset - 2, indexOffset - 1, flat === -1 ? indexOffset + 1 : indexOffset);
    }
    const v0_scale = v0.clone().multiply(-1 * flat);
    let index = indexOffset;
    for (let angle = 0; angle < maxAngle; angle += step) {
      const rotateVector = v0_scale.clone().rotate(angle * flat);
      vertices.push.apply(vertices, point);
      texCoords.push(0, 0.93);
      deviation.push(0, 0, 0);
      normals.push(rotateVector.x, rotateVector.y);
      if (angle + step < maxAngle) {
        indices.push(indexOffset + 0);
        indices.push(index + 1);
        indices.push(index + 2);
      } else {
        indices.push(indexOffset, index + 1, index + 3, flat === -1 ? index + 1 : indexOffset, index + 2, index + 3);
      }
      index += 1;
    }
    return { vertices, indices, normals, texCoords, deviation };
  }
  static get GEOMETRY_KEYS() {
    return ['lineColor', 'lineWidth', 'base', 'opacity', 'lineImage'];
  }
}

class ModelBucket extends AbstractBucket {
  constructor(data) {
    super(data);
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
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
    const url = StyleUtils.getStyle(this._layout, 'url', properties);
    if (!url) return;
    const offset = this._offset;
    const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
    if (!visible) return;
    const matrix = new Matrix4();
    const p = [point[0] + offset[0], point[1] + offset[1]];
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const size = StyleUtils.getStyle(this._layout, 'size', properties);
    const rotateX = StyleUtils.getStyle(this._layout, 'rotateX', properties);
    const rotateY = StyleUtils.getStyle(this._layout, 'rotateY', properties);
    const rotateZ = StyleUtils.getStyle(this._layout, 'rotateZ', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    matrix.scale(size, size, size);
    matrix.rotate(rotateX, 1, 0, 0);
    matrix.rotate(rotateY, 0, 1, 0);
    matrix.rotate(rotateZ, 0, 0, 1);
    this._geometryInfo.push({
      matrix: matrix.getValue(),
      opacity,
      point: p,
      base,
      url,
    });
  }
}

class TrackBucket extends AbstractBucket {
  constructor(data) {
    super(data);
    this._geometryMap = {};
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
      if (visible) {
        if (geometry.type === 'LineString') {
          this._calcPolyline(geometry.coordinates, properties);
        }
        else if (geometry.type === 'MultiLineString') {
          for (let j = 0; j < geometry.coordinates.length; j += 1) {
            this._calcPolyline(geometry.coordinates[j], properties);
          }
        }
      }
    }
    for (const key in this._geometryMap) {
      this._geometryInfo.push({ ...this._geometryMap[key], indices: this._geometryMap[key].indices.getValue() });
    }
  }
  _calcPolyline(polyline, properties) {
    if (polyline.length < 2)
      return;
    const vertices = [];
    const offset = this._offset;
    const indices = [];
    for (let i = 0; i < polyline.length; i += 1) {
      const [x, y] = polyline[i];
      vertices.push(x + offset[0], y + offset[1]);
      if (i + 1 < polyline.length) {
        indices.push(i, i + 1);
      }
    }
    const color = StyleUtils.parseColor(StyleUtils.getStyle(this._layout, 'color', properties));
    const base = StyleUtils.getStyle(this._layout, 'base', properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', properties);
    const key = this._getGeometryKey(properties);
    if (this._geometryMap[key] &&
      this._geometryMap[key].vertices.length / 2 + vertices.length / 2 < 65536) {
      const geometry = this._geometryMap[key];
      const oldVerticesCount = geometry.vertices.length / 2;
      geometry.indices.add(indices, oldVerticesCount);
      geometry.vertices = geometry.vertices.concat(vertices);
    }
    else {
      if (this._geometryMap[key]) {
        this._geometryMap[IdGenerator.getId()] = this._geometryMap[key];
      }
      this._geometryMap[key] = {
        vertices,
        color,
        base,
        indices: new Indices(indices),
        opacity,
      };
    }
  }
  _getGeometryKey(properties) {
    const arr = [];
    for (let i = 0; i < TrackBucket.GEOMETRY_KEYS.length; i += 1) {
      const style = StyleUtils.getStyle(this._layout, TrackBucket.GEOMETRY_KEYS[i], properties);
      style !== undefined && arr.push(style);
    }
    return arr.join('-');
  }
  static get GEOMETRY_KEYS() {
    return ['color', 'base', 'opacity']
  }
}

class PictureBucket extends AbstractBucket {
  constructor(data) {
    super(data);
  }
  init() {
    for (let i = 0; i < this._features.length; i += 1) {
      const { geometry, properties } = this._features[i];
      const visible = StyleUtils.getStyle(this._layout, 'visible', properties);
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
    const iconUrl = StyleUtils.getStyle(this._layout, 'iconImage', item.properties);
    if (!iconUrl) return;
    const p = [point[0] + offset[0], point[1] + offset[1]];
    const base = StyleUtils.getStyle(this._layout, 'base', item.properties);
    const size = StyleUtils.getStyle(this._layout, 'size', item.properties);
    const rotate = StyleUtils.getStyle(this._layout, 'rotate', item.properties);
    const opacity = StyleUtils.getStyle(this._layout, 'opacity', item.properties);
    const width = item.imgSize[0] * size;
    const height = item.imgSize[1] * size;
    const geometry = createPointGeometry(p, width, height, 'center');
    this._geometryInfo.push({
      opacity,
      base,
      rotate,
      point: p,
      vertices: geometry.vertices,
      iconUrl,
      texCoords: geometry.texCoords,
      index: item.index,
    });
  };
}

class BucketFactor {
  calculate(data) {
    let bucket;
    if (data.type === 'fill') {
      bucket = new FillBucket(data);
    }
    else if (data.type === 'fillExtrusion') {
      bucket = new FillExtrusionBucket(data);
    }
    else if (data.type === 'circle') {
      bucket = new CircleBucket(data);
    }
    else if (data.type === 'symbol') {
      bucket = new SymbolBucket(data);
    }
    else if (data.type === 'connection') {
      bucket = new ConnectionBucket(data);
    }
    else if (data.type === 'heatmap') {
      bucket = new HeatmapBucket(data);
    }
    else if (data.type === 'line') {
      bucket = new LineBucket(data);
    }
    else if (data.type === 'model') {
      bucket = new ModelBucket(data);
    }
    else if (data.type === 'track') {
      bucket = new TrackBucket(data);
    }
    else if (data.type === 'picture') {
      bucket = new PictureBucket(data);
    }
    if (bucket) {
      bucket.init();
      return bucket.getDrawInfo();
    }
  }
}
onmessage = function (t) {
  const { data } = t;
  const { type, view, viewMatrix, projectionMatrix, zoom, z, center, onePixelToWorld, isForce, list } = data;
  if (type === 'collision') {
    const params = {
      view,
      viewMatrix,
      projectionMatrix,
      zoom,
      z,
      center,
      onePixelToWorld,
    };
    if (collision) {
      collision.updateOptions(params);
    } else {
      collision = new Collision(params);
    }
    const i = { type: "collisionResult", ...collision.calculate(list), isForce };
    postMessage(i);
  } else {
    const result = (new BucketFactor).calculate(data);
    if (result) postMessage(result)
  }
}