import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { get } from 'dot-prop';

import floorData from '../../../data/floor';
import styleData from '../../../data/styleHover';

import ReactIndoor from '../../../src/index.js';

const newStyleJson = `
{
  "frame": {
    "visible": true,
    "height": 0,
    "fillColor": "#eeeeee",
    "outlineColor": "#000",
    "opacity": 1
  },
  "room": {
    "visible": true,
    "height": 1,
    "fillColor": "#ffffff",
    "outlineColor": "#111111",
    "styleKey": "iconId",
    "styleMap": {
      "HOVERED": {
        "height": 1,
        "fillColor": "#ffffff",
        "outlineColor": "#111111"
      },
      "d8d8e0": {
        "height": 1,
        "fillColor": "#ffbf80"
      },
      "d8d8e1": {
        "height": 1,
        "fillColor": "#ffbf80"
      }
    }
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
      18.4,
      null
    ],
    "iconOffset": [
      0,
      20
    ],
    "iconSize": 0.13,
    "styleKey": "iconId",
    "styleMap": {
      "d8d8e0": {
        "weight": 15,
        "zoomRange": [
          17,
          22
        ],
        "iconUrl": "https://static.yingxuys.com/icons/office.png"
      },
      "d8d8e1": {
        "weight": 15,
        "zoomRange": [
          17,
          22
        ],
        "iconUrl": "https://static.yingxuys.com/icons/door.png"
      }
    }
  },
  "facility": {
    "visible": false,
    "styleKey": "",
    "styleValue": {}
  }
}`

const codeStr = `<ReactIndoor
  floorData={floorFrame}
  floorId="RJ00201010001"
  options={{
    enableRoomHover: true,
    maxZoom: 23,
    minZoom: 16,
    zoom: 17,
    rotate: 0,
    pitch: 60,
    center: {
      x: 1250.8271713616455,
      y: 117.50345301174428,
    },
  }}
/>`;

const codeDotStr = `<ReactIndoor
  floorData={floorFrame}
  floorId="RJ00201010001"
  options={{
    enableRoomHover: true,
    styleData={styleData}
    maxZoom: 23,
    minZoom: 16,
    zoom: 17,
    rotate: 0,
    pitch: 60,
    center: {
      x: 1250.8271713616455,
      y: 117.50345301174428,
    },
  }}
/>`;

export default () => {

  return <div className="content-body">
    <div className="content-body-title" >
      Enable room hover event
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Default hover event
      </div>
      <div className="content-item-description">
        Try to move mouse into a room in the map
      </div>
      <div className="content-item-map">
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              options={{
                enableRoomHover: true,
                maxZoom: 23,
                minZoom: 16,
                zoom: 17,
                rotate: 0,
                pitch: 60,
                center: {
                  x: 1250.8271713616455,
                  y: 117.50345301174428,
                },
              }}
            />
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeStr}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>

    <div className="content-item">
      <div className="content-item-title">
        Custom hover style
      </div>
      <div className="content-item-description">
        Try to move mouse into a room in the map
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            {newStyleJson}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              styleData={styleData}
              options={{
                enableRoomHover: true,
                maxZoom: 23,
                minZoom: 16,
                zoom: 17,
                rotate: 0,
                pitch: 60,
                center: {
                  x: 1250.8271713616455,
                  y: 117.50345301174428,
                },
              }}
            />
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeDotStr}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  </div>
}