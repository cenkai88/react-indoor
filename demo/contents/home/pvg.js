import React, { useState } from 'react';

import pvgData from '../../../data/pvg3';
import pvgLines from '../../../data/pvgLines';
import pvgPoints from '../../../data/pvgPoints';
import stylePvg from '../../../data/stylePvg';
import './pvg.css';

import ReactIndoor from '../../../src/index.js';

const lineOptions = [
  { name: 'E', color: '#3f9229', distance: 4400 },
  { name: 'J2', color: '#699353', distance: 5400 },
  { name: 'N1', color: '#71fbfd', distance: 2000 },
  { name: 'N2', color: '#ed5027', distance: 1400 },
  { name: 'N3', color: '#fffe54', distance: 4900 },
  { name: 'N1-2', color: '#71fbfd', distance: 4900 },
  { name: 'S', color: '#f08533', distance: 2200 },
  { name: 'B2', color: '#001af5', distance: 2600 },
  { name: 'B1', color: '#eb3bf7', distance: 4000 },
  { name: 'J1', color: '#000000', distance: 5700 },
  { name: 'W', color: '#71fbc3', distance: 2200 },
  { name: 'N', color: '#f6c188', distance: 2500 },
  { name: 'S1/S2', color: '#67178f', distance: 2600 },
  { name: 'Z', color: '#71fa4c', distance: 2100 },
]

const markerOptions = [
  { name: '无', data: [] },
  { name: '监护岗', data: pvgPoints.map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], iconSize: 0.1 })) },
];


export default () => {
  const defaultStyle = JSON.parse(JSON.stringify(stylePvg));

  const [lineIdx, setLineIdx] = useState(0);
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);

  const [markerIdx, setMarkerIdx] = useState(0);
  const [markerDropdownOpen, setMarkerDropdownOpen] = useState(false);

  const selectedLine = lineOptions[lineIdx];
  const selectedMarker = markerOptions[markerIdx];

  return <div className="content-body">
    <div style={{ position: 'relative', border: '1px solid #ddd', width: '98vw', height: 'calc(100vh - 100px)', margin: '10px auto', background: 'white' }}>
      <ReactIndoor
        onClick={() => setLineDropdownOpen(false)}
        lineData={pvgLines[lineIdx]}
        floorData={pvgData}
        markerData={selectedMarker.data}
        floorId="pvg-outdoor"
        styleData={defaultStyle}
        options={{
          maxZoom: 20,
          minZoom: 12,
          zoom: 13.5,
          rotate: 70,
          pitch: 30,
          center: {
            x: 31865,
            y: -9946,
          },
          line: {
            lineWidth: 6,
            lineColor: selectedLine.color,
          },
        }}
      />
      <div style={{ background: 'rgba(0,0,0,0.1)', position: 'absolute', right: 20, top: 20, fontSize: 14, padding: '8px 12px' }}>
        <div
          style={{ width: 140, zIndex: 1 }}
          onMouseEnter={() => setLineDropdownOpen(true)}
          // onMouseLeave={() => setLineDropdownOpen(false)}
        >
          <div>围栏：{selectedLine.name} ({selectedLine.distance}米)</div>
          {lineDropdownOpen ? <div style={{ background: 'white', border: '1px solid #eee', color: '#666', borderRadius: 2 }}>{lineOptions.map((item, idx) => (
            <div
              className="item"
              style={{ padding: '4px 8px', cursor: 'pointer', fontWeight: lineIdx === idx ? 600 : 400 }}
              key={item.name}
              onClick={() => {
                setLineIdx(idx);
                setLineDropdownOpen(false);
              }}>
              {item.name}
            </div>
          ))}</div> : null}
        </div>
        <div
          style={{ width: 140, marginTop: 12 }}
          onMouseEnter={() => setMarkerDropdownOpen(true)}
          onMouseLeave={() => setMarkerDropdownOpen(false)}
        >
          <div>标记：{selectedMarker.name}</div>
          {markerDropdownOpen ? <div style={{ background: 'white', border: '1px solid #eee', color: '#666', borderRadius: 2 }}>
            {markerOptions.map((item, idx) => (
              <div
                className="item"
                style={{ padding: '4px 8px', cursor: 'pointer', fontWeight: markerIdx === idx ? 600 : 400 }}
                key={item.name}
                onClick={() => {
                  setMarkerIdx(idx);
                  setMarkerDropdownOpen(false);
                }}>
                {item.name}
              </div>
            ))}
          </div> : null}
        </div>
      </div>
    </div>
  </div>
}