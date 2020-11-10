import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import buildingData from '../../../data/building';
import floorFrame from '../../../data/floorFrame';

import ReactIndoor from '../../../src/index.js';

const codeStr = `<ReactIndoor
  floorData={floorFrame}
  buildingData={buildingData}
  buildingId="RJ00201010001"
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

export default () => {
  return <div className="content-body">
    <div className="content-body-title" >
      Basic Map with Frame
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Indoor map with just frame layer
      </div>
      <div className="content-item-description">
        Load the building data and floor frame data, and set the initial zoom, zotate, pitch value.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorFrame}
              buildingData={buildingData}
              buildingId="RJ00201010001"
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