import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import buildingData from '../../../data/building';
import floorData from '../../../data/floor';

import ReactIndoor from '../../../src/index.js';

const lineData = [
  { x: 0.1, y: 0.1 },
  { x: 0.5, y: 0.2 },
  { x: 0.3, y: 0.5 },
  { x: 0.4, y: 0.9 },
];

const dataStr = `const lineData = [
  { x: 0.1, y: 0.1 },
  { x: 0.5, y: 0.2 },
  { x: 0.3, y: 0.5 },
  { x: 0.4, y: 0.9 },
]`;

const codeStr = `<ReactIndoor
  floorData={floorData}
  buildingData={buildingData}
  buildingId="RJ00201010001"
  lineData={lineData}
  options={{
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

const codeStrRadius = `<ReactIndoor
floorData={floorData}
buildingData={buildingData}
buildingId="RJ00201010001"
lineData={lineData}
options={{
  maxZoom: 23,
  minZoom: 16,
  zoom: 17,
  rotate: 0,
  pitch: 60,
  heatmapRadius: 50,
  center: {
    x: 1250.8271713616455,
    y: 117.50345301174428,
  },
}}
/>`

export default () => {
  return <div className="content-body">
    <div className="content-body-title" >
      Map with Line
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Indoor map with line layer
      </div>
      <div className="content-item-description">
        You can draw a line to indicate a path in a floor.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            {dataStr}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              buildingData={buildingData}
              buildingId="RJ00201010001"
              lineData={lineData}
              options={{
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
  </div>
}