import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import uuid from 'uuid';
import ReactPlayer from 'react-player'

import { fetchApronDetail, fetchEventList, fetchCaseList, fetchPropertyList, fetchEmergenceList, fetchVideoUrl, stopVideoPlay } from '../../apis/pvg';

import pvgData from '../../../data/pvg6';
import pvgLines from '../../../data/pvgLines';
import stylePvg from '../../../data/stylePvg';
import eventPng from '../../assets/icons/event.png';
import casePng from '../../assets/icons/case.png';
import carPng from '../../assets/icons/car.png';
import carRedPng from '../../assets/icons/car-red.png';
import staffPng from '../../assets/icons/staff.png'
import tickSvg from '../../assets/icons/tick.svg'
import './pvg.css';

import demoVideo from '../../assets/videos/demo.mp4'

import ReactIndoor from '../../../src/index.js';

import Header from './components/header';
import Panel from './components/panel';
import { useDictData, useFloorData } from './hooks';
import { formatArponDetail, formatArponTooltip, formatCaseDetail, formatCaseTooltip, formatEventDetail, formatEventTooltip, formatIndividualDetail, formatIndividualTooltip, formatVehicleDetail, formatVehicleTooltip } from './detailFormatter';
import { convertPercentToWorld, convertWorldToPercent } from '../../../src/utils/common';

const bbox = [[31099.661621093754, -13321.040588378906], [35210.447021484375, -8313.3369140625]];
const deltaX = bbox[1][0] - bbox[0][0];
const deltaY = bbox[1][1] - bbox[0][1];

// const items = [
//   [30319.17644173383, -7483.986579481384],
//   [30303.816535588503, -7436.726273361093],
//   [30338.77787626419, -7400.3423682180755],
//   [30303.5180963191, -7435.70930713672],
//   [30323.447941256185, -7353.553211045136],
//   [30307.309481764096, -7304.011132989264],
//   [30292.38419173277, -7258.614451430149]
// ];

// const demoPoints = items.map(item => {
//   const [x, y] = convertWorldToPercent({ x: item[0], y: item[1] }, bbox, deltaX, deltaY);
//   return {
//     typeIdx: 0,
//     iconUrl: eventPng,
//     iconSize: 0.1,
//     data: {},
//     properties: {},
//     x,
//     y
//   }
// });

const getCorrectedTooltipY = (e, tooltipRef) => {
  if (!tooltipRef?.current) return e.point.y
  const offsetY = Number(getComputedStyle(tooltipRef?.current).height.split('px')[0]) + e.point.y - window.innerHeight + 160;
  return offsetY > 0 ? e.point.y - offsetY : e.point.y
}

const prefix = '000001';

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
  { name: 'Z', color: '#71fa4c', distance: 2100 },
  { name: 'Z-2', color: '#71fa4c', distance: 2100 },
  { name: 'B2-2', color: '#67178f', distance: 2600 },
  { name: 'S1/S2', color: '#67178f', distance: 2600 },
]

const markerOptions = [
  // { name: '无', data: [] },
  // { name: '监护岗', data: pvgPoints[0].map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], iconSize: 0.1 })) },
  // { name: '红外广域点位', data: pvgPoints[1].map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], iconSize: 0.1 })) },
  // { name: '断头路', data: pvgPoints[2].map(item => ({ ...item, iconUrl: 'https://static.yingxuys.com/icons/A.png', textOffset: [0, -16], iconSize: 0.1 })) },
  { name: '事件' },
  { name: '工单' },
  { name: '载具' },
  { name: '单兵' },
];

const layerOptions = [
  { name: '事件' },
  { name: '工单' },
  { name: '载具' },
  { name: '单兵' },
  { name: '摄像头' },
  { name: '围界' },
];

export default () => {
  const defaultStyle = JSON.parse(JSON.stringify(stylePvg));
  const videoRef = useRef(null);

  const storedKey = localStorage.getItem('AUTH_LOCAL_KEY');
  const accessToken = storedKey ? JSON.parse(storedKey)?.accessToken : '';

  const [center, setCenter] = useState({ x: 31865, y: -9946, });
  const [zoom, setZoom] = useState(13.5);

  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [layerList, setLayerList] = useState([true, true, true, true, false, false]);
  const [floor, setFloor] = useState('');

  const [lineIdx, setLineIdx] = useState(0);
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [markerIdx, setMarkerIdx] = useState(0);
  const [markerDropdownOpen, setMarkerDropdownOpen] = useState(false);

  const [selectedRes, setSelectedRes] = useState({});
  const [selectedApronName, setSelectedApronName] = useState('');
  const [detailStr, setDetailStr] = useState('');
  const [hoveredApronId, setHoveredApronId] = useState();
  const [hoveredApronData, setHoveredApronData] = useState({});

  const [cameraName, setCameraName] = useState();
  const [cameraUuid, setCameraUuid] = useState();

  const selectedLine = lineOptions[lineIdx];
  const selectedMarker = markerOptions[markerIdx];

  const currentFloor = `pvg-outdoor${floor ? '-' + floor : ''}`;

  const [hoveredMarkerIdx, setHoveredMarkerIdx] = useState();
  const [tooltipType, setTooltipType] = useState('');
  const [tooltipPos, setTooltipPos] = useState({});

  const tooltipRef = useRef(null);

  const { data: pvgDataWithApron, lastUpdateTs, apronRoomIdList = [] } = useFloorData(pvgData, accessToken, selectedLine);
  const { eventCategoryMapping, caseCategoryMapping, sourceCategoryMapping } = useDictData(accessToken);
  const { data: apronDetailData = {} } = useSWR([`/map/apron/v1/${selectedApronName}`, selectedApronName, accessToken], fetchApronDetail, { refreshInterval: 60 * 1e3 });
  const { data: eventData = [] } = useSWR(['/operation/event/v1?status=PENDING&isTeam=true&count=99999', accessToken], fetchEventList, { refreshInterval: 60 * 1e3 });
  const { data: caseData = [] } = useSWR(['/operation/case/v1?status=OPEN&isTeam=true&count=99999', accessToken], fetchCaseList, { refreshInterval: 60 * 1e3 });
  const { data: individualData = [] } = useSWR(['/property/property/v1', 'INDIVIDUAL', accessToken], fetchPropertyList, { refreshInterval: 10 * 1e3 });
  const { data: vehicleData = [] } = useSWR(['/property/property/v1', 'VEHICLE', accessToken], fetchPropertyList, { refreshInterval: 10 * 1e3 });
  const { data: emergenceData = [] } = useSWR(['/emergency/record/v1', accessToken], fetchEmergenceList, { refreshInterval: 60 * 1e3 });
  const { data: videoUrl = '' } = useSWR(['/video/playVideo', cameraName, cameraUuid], fetchVideoUrl, { refreshInterval: 9e9 });

  const panelWidth = 0.15 * window.innerWidth;
  const panel1Height = window.innerHeight - 136 - 72;
  const panel2Height = panel1Height - panelWidth - 60 - 72;
  const panel3Height = panelWidth + 40;

  const resetTooltip = () => {
    setHoveredApronId();
    setTooltipType('');
    setTooltipPos({});
  }

  const moveToPoint = ({ x, y } = {}) => {
    if (!x || !y) return
    const [centerX, centerY] = convertPercentToWorld({ x, y }, bbox);
    setCenter({ x: centerX, y: centerY });
    setZoom(16);
    setTimeout(() => {
      setZoom();
      setCenter();
    }, 1000);
  }

  const formatEventData = item => {
    const priorityColor = { HIGH: '#f66464', MEDIUM: 'orange', LOW: 'forestgreen' }[item.priority];
    return (
      <div key={item.id} onClick={() => {
        moveToPoint(item.position);
        resetTooltip();
        setDetailStr(formatEventDetail(item, eventCategoryMapping, sourceCategoryMapping));
        setSelectedRes(item)
      }} className="event" style={{ boxSizing: 'border-box', padding: '4px 12px 4px 12px', cursor: 'pointer' }}>
        <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <div>{item.insertTime}</div>
          <div style={{ fontSize: 12, borderRadius: 4, height: 16, width: 16, textAlign: 'center', lineHeight: '18px', border: `1px solid ${priorityColor}`, color: priorityColor }}>{{ HIGH: '高', LOW: '低', MEDIUM: '中' }[item.priority]}</div>
        </div>
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>{item.description}</div>
      </div>
    )
  };

  const formatCaseData = item => {
    const priorityColor = { HIGH: '#f66464', MEDIUM: 'orange', LOW: 'forestgreen' }[item.priority];
    return (
      <div key={item.id} onClick={() => {
        moveToPoint(item?.position);
        resetTooltip();
        setDetailStr(formatCaseDetail(item, caseCategoryMapping, sourceCategoryMapping))
        setSelectedRes(item)
      }} className="event" style={{ boxSizing: 'border-box', padding: '4px 12px 4px 12px', cursor: 'pointer' }}>
        <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <div>{item.insertTime}</div>
          <div style={{ fontSize: 12, borderRadius: 4, height: 16, width: 16, textAlign: 'center', lineHeight: '18px', border: `1px solid ${priorityColor}`, color: priorityColor }}>{{ HIGH: '高', LOW: '低', MEDIUM: '中' }[item.priority]}</div>
        </div>
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>{item.description}</div>
      </div>
    )
  };

  const formatVehicleData = item => {
    return (
      <div key={item.id} onClick={() => {
        moveToPoint(item.lastDetectedPosition);
        resetTooltip();
        setDetailStr(formatVehicleDetail(item))
        setSelectedRes(item)
      }} className="event" style={{ boxSizing: 'border-box', padding: '4px 12px 4px 12px', cursor: 'pointer' }}>
        <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <div>{item?.name}</div>
        </div>
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>载具负责人：{item?.owner?.name}</div>
      </div>
    )
  };

  const formatIndividualData = item => {
    return (
      <div key={item.id} onClick={() => {
        moveToPoint(item.lastDetectedPosition);
        resetTooltip();
        setDetailStr(formatIndividualDetail(item))
        setSelectedRes(item)
      }} className="event" style={{ boxSizing: 'border-box', padding: '4px 12px 4px 12px', cursor: 'pointer' }}>
        <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <div>{item?.name}</div>
        </div>
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>对应人员：{item?.owner?.name}</div>
      </div>
    )
  };

  const emergenceList = emergenceData.map(item => {
    return (
      <div key={item.id} onClick={moveToPoint} className="emer" style={{ boxSizing: 'border-box', padding: '0 11px 0 13px', cursor: 'pointer', width: 'fit-content' }}>
        {item.description}
      </div>
    )
  });

  const leftPanelList = [eventData, caseData, vehicleData, individualData][markerIdx].map([formatEventData, formatCaseData, formatVehicleData, formatIndividualData][markerIdx]);

  const markerList = [
    ...(layerList[0] ? eventData.map(item => ({ ...item?.position, typeIdx: 0, data: item, properties: {}, iconUrl: eventPng, iconSize: 0.1 })) : []),
    // ...demoPoints,
    ...(layerList[1] ? caseData.map(item => ({ ...item?.position, typeIdx: 1, data: item, properties: {}, iconUrl: casePng, iconSize: 0.1 })) : []),
    ...(layerList[2] ? vehicleData.map(item => ({ ...item?.lastDetectedPosition, typeIdx: 2, data: item, properties: {}, iconUrl: item.workStatus === 'ALERT' ? carRedPng : carPng, iconSize: 0.15 })) : []),
    ...(layerList[3] ? individualData.map(item => ({ ...item?.lastDetectedPosition, typeIdx: 3, data: item, properties: {}, iconUrl: staffPng, iconSize: 0.15 })) : []),
  ];

  const selectedLineData = layerList[5] ? pvgLines[lineIdx] : [];

  const formatterIdx = markerList[hoveredMarkerIdx]?.typeIdx;
  const tooltipFormatter = [formatEventTooltip, formatCaseTooltip, formatVehicleTooltip, formatIndividualTooltip][formatterIdx] || (() => '');
  const tooltipCategoryMapping = [eventCategoryMapping, caseCategoryMapping, undefined, undefined][formatterIdx];
  const tooltipStrForUI = tooltipType === 'APRON' ? formatArponTooltip(apronDetailData) : tooltipFormatter(markerList[hoveredMarkerIdx]?.data, tooltipCategoryMapping);
  useEffect(() => {
    if (!hoveredApronId || !apronRoomIdList.includes(hoveredApronId)) {
      setTooltipType('');
      setSelectedApronName('');
    } else {
      const apron = pvgData[0]?.room?.features.find(item => item?.properties?.id === hoveredApronId);
      setTooltipType('APRON');
      setTooltipPos(hoveredApronData?.point ? { x: hoveredApronData.point.x, y: getCorrectedTooltipY(hoveredApronData, tooltipRef) } : {});
      setSelectedApronName(apron?.properties?.name);
    }
  }, [hoveredApronId]);

  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video) return
  //   console.log(video);
  //   //
  //   // First check for native browser HLS support
  //   //
  //   if (video.canPlayType('application/vnd.apple.mpegurl')) {
  //     video.src = videoSrc;
  //     //
  //     // If no native HLS support, check if HLS.js is supported
  //     //
  //   } else if (window.Hls?.isSupported()) {
  //     console.log('window.Hls', window.Hls);
  //     var hls = new window.Hls();
  //     hls.loadSource(videoSrc);
  //     hls.attachMedia(video);
  //   }
  // }, [videoUrl]);

  return (
    <div className="bg">
      <Header />
      <div style={{ background: 'rgba(0,0,0,0.3)', position: 'relative', width: 'calc(100vw - 1.6vw)', height: 44, border: '2px solid #003dce', boxSizing: 'border-box', borderRadius: 8, margin: '0px 0.8vw', padding: 12, color: 'white', alignItems: 'center', fontSize: 13, lineHeight: '20px', overflow: 'hidden' }}>
        <div className='emer-list'>
          <div style={{ minWidth: 'calc(100vw - 1.6vw)', display: 'flex' }}>{emergenceList}</div>
          <div style={{ minWidth: 'calc(100vw - 1.6vw)', display: 'flex' }}>{emergenceList}</div>
        </div>
      </div>
      <div className="content-body" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', zIndex: 1 }}>
          <Panel width={panelWidth} height={panel1Height}>
            <div style={{ position: 'absolute', zIndex: 2, top: 20, fontSize: 13, padding: '8px 16px' }}>
              <div
                style={{ width: 140, color: 'white' }}
                onMouseEnter={() => setMarkerDropdownOpen(true)}
                onMouseLeave={() => setMarkerDropdownOpen(false)}
              >
                <div>{selectedMarker.name}</div>
                {markerDropdownOpen ? <div style={{ background: 'white', border: '1px solid #eee', color: '#666', borderRadius: 2 }}>
                  {markerOptions.map((item, idx) => (
                    <div
                      className="item"
                      style={{ padding: '4px 8px', cursor: 'pointer', fontWeight: markerIdx === idx ? 600 : 400 }}
                      key={item.name}
                      onClick={() => {
                        setDetailStr();
                        setMarkerIdx(idx);
                        setMarkerDropdownOpen(false);
                      }}>
                      {item.name}
                    </div>
                  ))}
                </div> : null}
              </div>
            </div>
            <div className="event-list-container" style={{ color: 'white', position: 'absolute', padding: 2, marginTop: 32, width: panelWidth, boxSizing: 'border-box', overflow: 'scroll' }}>
              <div style={{ padding: '0.6vw 0' }} className="event-list">
                <div style={{ color: 'white', fontSize: 13, maxHeight: panel1Height - 90 }}>
                  {leftPanelList}
                </div>
              </div>
            </div>
          </Panel>
        </div>
        <div style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 160px)' }}>
          <ReactIndoor
            onClick={(e) => {
              if (e?._room?.properties?.colorid.slice(0, 6) === prefix) {
                setHoveredApronId(e._room.properties.id);
                setHoveredApronData({ ...e, point: { x: e._screen.x, y: e._screen.y - 44 - 0.05 * window.innerWidth } });
              }
              setLineDropdownOpen(false)
            }}
            onMouseDown={e => {
              // right click
              if (e._originEvent.button === 2) {
                setTooltipType('');
                setHoveredMarkerIdx();
                setHoveredApronId();
                setHoveredApronData({});
                setTooltipPos({});
                setDetailStr('');
                stopVideoPlay(cameraName, cameraUuid);
                setCameraName();
                setCameraUuid();
              }
            }}
            lastUpdateTs={lastUpdateTs}
            floorData={pvgDataWithApron}
            lineData={selectedLineData}
            markerData={markerList}
            floorId={currentFloor}
            styleData={defaultStyle}
            onEnterMarker={e => {
              setHoveredMarkerIdx(e.index);
              setTooltipType('');
              setTimeout(() => {
                setTooltipPos({ x: e.point.x, y: getCorrectedTooltipY(e, tooltipRef) });
              });
            }}
            onLeaveMarker={e => {
              setTooltipType('');
              setHoveredMarkerIdx();
              setSelectedApronName();
              setTooltipPos({});
            }}
            options={{
              maxZoom: 20,
              minZoom: 12,
              zoom,
              rotate: 70,
              pitch: 30,
              center,
              line: {
                base: 1,
                lineWidth: 8,
                lineColor: selectedLine.color,
                // lineImage: 'https://static.yingxuys.com/indoor_sdk/facility/ic_line.png',
              },
            }}
          />

          {tooltipStrForUI ? <div
            ref={tooltipRef}
            style={{
              fontSize: 13,
              whiteSpace: 'pre-line',
              position: 'absolute',
              borderRadius: 4,
              background: 'white',
              zIndex: 1,
              padding: '16px 24px',
              opacity: tooltipPos.y === undefined ? 0 : 1,
              left: tooltipPos.x || 0,
              top: tooltipPos.y || 0,
              boxShadow: '0 8px 10px -4px rgba(67,90,111,0.47), 0 0 1px 0 rgba(67,90,111,0.30)',
              pointerEvents: tooltipType === 'APRON' ? 'none' : ''
            }}
          >
            {tooltipStrForUI}
            {tooltipType !== 'APRON' ? <div onClick={e => {
              moveToPoint(markerList[hoveredMarkerIdx]);
              setHoveredMarkerIdx();
              setHoveredApronId();
              setSelectedRes(markerList[hoveredMarkerIdx]?.data);
              const { relatedResources = [] } = markerList[hoveredMarkerIdx]?.data || {};
              if (relatedResources[0]?.resourceCategory?.id === 'CAMERA' && cameraName !== relatedResources[0]?.resourceName) {
                stopVideoPlay(cameraName, cameraUuid);
                setCameraName(relatedResources[0]?.resourceName);
                setCameraUuid(uuid());
              } else if (cameraName !== relatedResources[0]?.resourceName) {
                stopVideoPlay(cameraName, cameraUuid);
                setCameraName();
                setCameraUuid();
              }
              setDetailStr([formatEventDetail, formatCaseDetail, formatVehicleDetail, formatIndividualDetail][formatterIdx](markerList[hoveredMarkerIdx]?.data, tooltipCategoryMapping, sourceCategoryMapping));
            }} style={{ fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>查看</div> : null}
          </div> : null}

          <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, position: 'absolute', right: `calc(${panelWidth}px + 1.6vw)`, top: 20, fontSize: 14, padding: '8px 12px', zIndex: 2 }}>
            <div
              style={{ width: 200, color: 'white' }}
              onMouseEnter={() => setLayerDropdownOpen(true)}
              onMouseLeave={() => setLayerDropdownOpen(false)}
            >
              <div>选择图层</div>
              {layerDropdownOpen ? <div style={{ background: 'white', border: '1px solid #eee', color: '#666', borderRadius: 2 }}>
                {layerOptions.map((item, idx) => (
                  <div
                    className="item"
                    style={{ padding: '4px 8px', cursor: 'pointer', fontWeight: 600 }}
                    key={item.name}
                    onClick={() => {
                      setLayerList(raw => {
                        const data = [...raw];
                        data[idx] = !data[idx];
                        return data
                      });
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {item.name}
                      {layerList[idx] ? <img style={{ width: 12, height: 12 }} src={tickSvg} /> : null}
                    </div>
                  </div>
                ))}
              </div> : null}
            </div>
          </div>
          {layerList[5] ? <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, position: 'absolute', right: `calc(${panelWidth}px + 1.6vw)`, top: 64, fontSize: 14, padding: '8px 12px', zIndex: 1 }}>
            <div
              style={{ width: 200, color: 'white' }}
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
          </div> : null}
        </div>
        <div style={{ position: 'absolute', zIndex: 1, right: 0, top: 0 }}>
          <Panel width={panelWidth} height={panel2Height}>
            <div style={{ color: 'white', position: 'absolute', padding: 2, overflow: 'hidden', height: 'calc(100% - 50px)', width: panelWidth, boxSizing: 'border-box' }}>
              <div style={{ fontSize: 14, fontWeight: 500, padding: 12 }}>
                <div>详细信息</div>
              </div>
              <div className='detail-container' style={{ fontSize: 13, padding: '0 12px', whiteSpace: 'pre-line', overflow: 'scroll', height: 'calc(100% - 50px)' }}>{hoveredApronId ? formatArponDetail(apronDetailData) : detailStr}</div>
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', zIndex: 1, right: 0, top: panel2Height + 20 }}>
          <Panel width={panelWidth} height={panel3Height}>
            <div style={{ color: 'white', position: 'absolute', padding: 2, overflow: 'hidden', height: 'calc(100% - 50px)', width: panelWidth, boxSizing: 'border-box' }}>
              <div style={{ fontSize: 14, fontWeight: 500, padding: 12 }}>
                <div>实时监控</div>
                <div style={{ color: '#9a9a9a', fontSize: 13 }}>{cameraName}</div>
              </div>
              <div ref={videoRef} style={{ width: '100%', height: 'calc(100% - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {videoUrl ? <ReactPlayer playing muted controls url={videoUrl} />
                  : null}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
