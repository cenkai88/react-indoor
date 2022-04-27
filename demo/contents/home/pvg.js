import React, { useState } from 'react';

import pvgData from '../../../data/pvg5';
// import pvgLinesTemp from '../../../data/pvgLinesTemp';
import pvgLines from '../../../data/pvgLines';
import pvgPoints from '../../../data/pvgPoints';
import stylePvg from '../../../data/stylePvg';
import './pvg.css';

import ReactIndoor from '../../../src/index.js';


const layerOptions = [
  { name: '室外全景', value: 'pvg-outdoor' },
  { name: 'T1航站楼', value: 'T1' },
  { name: 'T2航站楼', value: 'T2' },
  { name: 'S1航站楼', value: 'T3' },
];

const floorOptions = [
  [],
  ['F1', 'F2', 'F3', 'F4'],
  ['F1', 'F2', 'F3', 'F4', 'MF'],
  ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
];

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
  { name: '监护岗', data: pvgPoints[0].map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], iconSize: 0.1 })) },
  { name: '红外广域点位', data: pvgPoints[1].map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], iconSize: 0.1 })) },
  { name: '断头路', data: pvgPoints[2].map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/A.png', textOffset: [0, -16], iconSize: 0.1 })) },
  { name: '普通事件', data: pvgPoints[2].map(item => ({ ...item, properties: {}, iconUrl: 'https://static.yingxuys.com/icons/C.png', iconSize: 0.1 })) },
  { name: '紧急事件', data: pvgPoints[2].map(item => ({ ...item,  properties: {}, iconUrl: 'https://static.yingxuys.com/icons/A.png', iconSize: 0.1 })) },
];


export default () => {
  const defaultStyle = JSON.parse(JSON.stringify(stylePvg));

  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [layerIdx, setLayerIdx] = useState(0);
  const [floor, setFloor] = useState('');

  const [lineIdx, setLineIdx] = useState(0);
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [markerIdx, setMarkerIdx] = useState(0);
  const [markerDropdownOpen, setMarkerDropdownOpen] = useState(false);

  const selectedLayer = layerOptions[layerIdx];
  const selectedLine = lineOptions[lineIdx];
  const selectedMarker = markerOptions[markerIdx];

  const currentFloor = `${selectedLayer.value}${floor ? '-' + floor : ''}`;

  const [hoveredMarkerId, setHoveredMarkerId] = useState();
  const [tooltipPos, setTooltipPos] = useState({});
  // console.log(currentFloor)

  return <div className="content-body">
    <div style={{ position: 'relative', border: '1px solid #ddd', width: '98vw', height: 'calc(100vh - 100px)', margin: '10px auto', background: 'white' }}>
      <ReactIndoor
        onClick={() => setLineDropdownOpen(false)}
        lineData={pvgLines[lineIdx]}
        floorData={pvgData}
        markerData={selectedMarker.data}
        floorId={currentFloor}
        styleData={defaultStyle}
        onEnterMarker={e => { setHoveredMarkerId(e.id); setTooltipPos(e.point) }}
        onLeaveMarker={e => { setHoveredMarkerId() }}
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
            lineWidth: 10,
            lineColor: selectedLine.color,
            // lineImage: 'https://static.yingxuys.com/indoor_sdk/facility/ic_line.png',
          },
        }}
      />

      {hoveredMarkerId ? <div
        style={{ fontSize: 13, whiteSpace: 'pre-line', position: 'absolute', borderRadius: 4, background: 'white', zIndex: 1, padding: '16px 24px', left: tooltipPos.x, top: tooltipPos.y, boxShadow: '0 8px 10px -4px rgba(67,90,111,0.47), 0 0 1px 0 rgba(67,90,111,0.30)' }}
      >
        {markerIdx===4?'名称: 测试普通事件\n触发时间: 2022-04-11 13:04:55\n类型: 普通测试事件\n 规则: 测试规则1':'名称: 测试重要事件\n触发时间: 2022-04-11 13:04:55\n类型: 重要测试事件\n 规则: 测试规则2'}
        </div> : null}

      <div style={{ background: 'rgba(0,0,0,0.1)', position: 'absolute', left: 20, top: 20, fontSize: 14, padding: '8px 12px' }}>
        <div
          style={{ width: 140, zIndex: 1 }}
          onMouseEnter={() => setLayerDropdownOpen(true)}
          onMouseLeave={() => setLayerDropdownOpen(false)}
        >
          <div>{selectedLayer.name}</div>
          {layerDropdownOpen ? <div style={{ background: 'white', border: '1px solid #eee', color: '#666', borderRadius: 2 }}>{layerOptions.map((item, idx) => (
            <div
              className="item"
              style={{ padding: '4px 8px', cursor: 'pointer', fontWeight: layerIdx === idx ? 600 : 400 }}
              key={item.name}
              onClick={() => {
                setLineIdx(0);
                setMarkerIdx(0);
                setLayerIdx(idx);
                setFloor(floorOptions[idx][0]);
                setLineDropdownOpen(false);
                setMarkerDropdownOpen(false);
                setLayerDropdownOpen(false);
              }}>
              {item.name}
            </div>
          ))}</div> : null}
        </div>
      </div>

      {floorOptions[layerIdx].length !== 0 ? <div style={{ position: 'absolute', left: 20, bottom: 20, fontSize: 14 }}>
        <div
          style={{ zIndex: 1 }}
        >
          <div>
            {floorOptions[layerIdx].map((item) => (
              <div
                className="item"
                style={{ padding: '4px 8px', margin: '8px 0', cursor: 'pointer', fontWeight: floor === item ? 600 : 400, background: floor === item ? '#e9f3fe':'rgba(0,0,0,0.1)', borderRadius: 4 }}
                key={item}
                onClick={() => {
                  setFloor(item);
                  setLineDropdownOpen(false);
                  setMarkerDropdownOpen(false);
                  setLayerDropdownOpen(false);
                }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div> : null}

      {layerIdx === 0 ? <div style={{ background: 'rgba(0,0,0,0.1)', position: 'absolute', right: 20, top: 20, fontSize: 14, padding: '8px 12px' }}>
        <div
          style={{ width: 140, zIndex: 1 }}
          onMouseEnter={() => setLineDropdownOpen(true)}
          onMouseLeave={() => setLineDropdownOpen(false)}
        >
          <div>围界：{selectedLine.name} ({selectedLine.distance}米)</div>
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
      </div> : null}
    </div>
  </div>
}