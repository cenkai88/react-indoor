import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorData from '../../../data/floor';

import ReactIndoor from '../../../src/index.js';

const heatmapData = [
  { x: 0, y: 0 },
  { x: 0.1, y: 0.1 },
  { x: 0.2, y: 0.2 },
  { x: 0.3, y: 0.3 },
  { x: 0.4, y: 0.4 },
  { x: 0.5, y: 0.5 },
  { x: 0.6, y: 0.6 },
  { x: 0.7, y: 0.7 },
  { x: 0.8, y: 0.8 },
  { x: 0.9, y: 0.9 },
  { x: 1, y: 1 },
]

const dataStr = `const heatmapData = [
  { x: 0, y: 0 },
  { x: 0.1, y: 0.1 },
  { x: 0.2, y: 0.2 },
  { x: 0.3, y: 0.3 },
  { x: 0.4, y: 0.4 },
  { x: 0.5, y: 0.5 },
  { x: 0.6, y: 0.6 },
  { x: 0.7, y: 0.7 },
  { x: 0.8, y: 0.8 },
  { x: 0.9, y: 0.9 },
  { x: 1, y: 1 },
]`;

const codeStr = `<ReactIndoor
  floorData={floorData}
  floorId="RJ00201010001"
  heatmapData={heatmapData}
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
floorId="RJ00201010001"
heatmapData={heatmapData}
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
      Map with Heatmap
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Indoor map with heatmap layer
      </div>
      <div className="content-item-description">
        Heatmap can be used to demonstrate the distribution of people / devices / resources on some floor.
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
              floorId="RJ00201010001"
              heatmapData={heatmapData}
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
    <div className="content-item">
      <div className="content-item-title">
        Heatmap radius
      </div>
      <div className="content-item-description">
        Set radius heatmap in options
      </div>
      <div className="content-item-map-row">
        <div className="content-item-map-component">
          <ReactIndoor
            floorData={floorData}
            floorId="RJ00201010001"
            heatmapData={heatmapData}
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
          />
        </div>
        <div className="content-item-map-code">
          <SyntaxHighlighter language="jsx" showLineNumbers>
            {codeStrRadius}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  </div>
}