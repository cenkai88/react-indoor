import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorData from '../../../data/floor';

import ReactIndoor from '../../../src/index.js';

const codeStr = `<ReactIndoor
  floorData={floorData}
  floorId="{currentFloor}"
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

const jsStr = `const [currentFloor, setCurrentFloor] = useState("RJ00201010001");
useEffect(() => {
  setTimeout(() => {
    setCurrentFloor("RJ00201020001");
  }, 5e3)
}, [])`

export default () => {
  const [currentFloor, setCurrentFloor] = useState("RJ00201010001");

  useEffect(() => {
    return setTimeout(() => {
      setCurrentFloor("RJ00201020001");
    }, 5e3);
  }, [])
  return <div className="content-body">
    <div className="content-body-title" >
      Change Floor
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Change floor by passing parameter to the component
      </div>
      <div className="content-item-description">
        Change current floor from <strong>RJ00201010001</strong> to <strong>RJ00201020001</strong> after 5 seconds.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="jsx" showLineNumbers>
            {jsStr}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId={currentFloor}
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