export default {
  "frame": {
    "visible": true,
    "height": 0,
    "fillColor": "#eeeeee",
    "outlineColor": "#000",
    "opacity": 0.9,
    "label": {
      "visible": true,
      "alwaysShow": true,
      "textField": "name",
      "textSize": 12,
      "textColor": "#000000",
      "textAnchor": "center",
      "weight": 5,
      "margin": 0,
      "collision": true,
      "textZHeight": 10,
      "zoomRange": [
        10,
        null
      ],
      "iconSize": 0,
    },
  },
  "room": {
    "visible": true,
    "height": 0,
    "fillColor": "#ffffff",
    "outlineColor": "#111111",
    "styleKey": "colorid",
    "styleMap": {
      "HOVERED": {
        "height": 1,
        "fillColor": "#ffde8a",
      },
      // 航站楼
      "000000": {
        "height": 70,
        "fillColor": "#0548A0",
        "opacity": 0.8,
      },
      // 停机坪
      "000001": {
        "height": 0.2,
        "fillColor": "#E9F3FE",
      },
      "000001-CX": {
        "height": 0.2,
        "fillColor": "#60ccff",
      },
      "000001-DV": {
        "height": 0.2,
        "fillColor": "#ecff6d",
      },
      "000001-NI": {
        "height": 0.2,
        "fillColor": "#ffa48c",
      },
      "000001-RS": {
        "height": 0.2,
        "fillColor": "#f4ceff",
      },
      "000001-XF": {
        "height": 0.2,
        "fillColor": "#f4ceff",
      },
      // 跑道
      "000002": {
        "fillColor": "#b9c1ce",
        "base": 1,
      },
      // 货物堆放区
      "000003": {
        "fillColor": "#FFB81C",
        "opacity": 0.5,
        "base": 0.4,
      },
      // 廊桥
      "000004": {
        "height": 20,
        "opacity": 0.7,
        "fillColor": "#2BB56F",
      },
      // 道口
      "000005": {
        "height": 10,
        "fillColor": "#F64F2E",
      },
      // 车行道
      "000006": {
        "base": 0.15,
      },
      // 标志建筑物
      "000007": {
        opacity: 1,
        height: 20,
        "fillColor": "#FFB81C",
      },
      // 塔台
      "000007-1": {
        opacity: 1,
        height: 200,
        "fillColor": "#FFB81C",
      },
      // 滑行道
      "000008": {
        base: -10,
        opacity: 0.8,
        "fillColor": "#b9c1ce",
      },
      // 围界
      "000009": {
        base: 0.05,
        height: 10,
        "fillColor": "#b9c1ce",
      },
    },
  },
  "roomIcon": {
    "visible": true,
    "textField": "name",
    "textSize": 12,
    "textColor": "#666666",
    "textAnchor": "center",
    "weight": 5,
    "margin": 0,
    "collision": true,
    "textZHeight": 1,
    "zoomRange": [
      8,
      null,
    ],
    "iconOffset": [
      0,
      20,
    ],
    "iconSize": 0.13,
    "styleKey": "colorid",
    "styleMap": {
      "000000": {
        "textColor": "#FFB81C",
        "collision": false,
        "weight": 10,
        "alwaysShow": true,
      },
      "000001": {
        "textColor": "#000000",
      },
      "000001-CX": {
        "textColor": "#ffffff",
      },
      "000001-DV": {
        "textColor": "#ffffff",
      },
      "000001-NI": {
        "textColor": "#ffffff",
      },
      "000001-RS": {
        "textColor": "#ffffff",
      },
      "000001-XF": {
        "textColor": "#ffffff",
      },
      "000003": {
        "visible": false,
        // "fillColor": "#FFB81C",
        // "opacity": 0.5,
        "iconUrl": `https://static.yingxuys.com/icons/lift.png`
      },
    },
  },
  "facility": {
    "visible": false,
    "styleKey": "",
    "styleValue": {}
  }
}
