import React, { useEffect, useState } from 'react';
import './panel.scss'

let intervalTicket;
let brightnessIdx = 0;

export default ({ width, height, children }) => {
    const [dots, setDots] = useState([]);

    useEffect(() => {
        if (!intervalTicket) intervalTicket = setInterval(() => {
            setDots([0, 1, 2, 3, 4, 5, 6, 7].map(item => {
                const brightness = item + brightnessIdx;
                return (<i key={item} style={{ backgroundColor: 'rgb(224, 87, 8)', filter: `brightness(${1 + (brightness > 7 ? brightness - 8 : brightness) * 0.3})` }} />)
            }));
            brightnessIdx += 1;
            if (brightnessIdx > 7) brightnessIdx = 0;
        }, 200)
    }, [])

    return (
        <div className="panel" style={{ width, height, padding: '0.8vw' }}>
            {children}
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1" className="svg_bg">
                <defs>
                    <linearGradient id="lg1" x1="0%" y1="0%" x2="0%" y2="100%" spreadMethod="pad">
                        <stop offset="0%" stopColor="white" stopOpacity="0"></stop>
                        <stop offset="50%" stopColor="white" stopOpacity="0.4"></stop>
                        <stop offset="100%" stopColor="white" stopOpacity="0"></stop>
                    </linearGradient>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'rgb(255, 255, 255)', stopOpacity: 0.6 }}></stop>
                        <stop offset="100%" style={{ stopColor: 'rgb(255, 255, 255)', stopOpacity: 0 }}></stop>
                    </radialGradient>
                    <filter id="f3" x="-110%" y="-110%" width="220%" height="220%">
                        <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0"></feOffset>
                        <feGaussianBlur result="blurOut" in="offOut" stdDeviation="0"></feGaussianBlur>
                        <feBlend in="SourceGraphic" in2="blurOut" mode="multiply"></feBlend>
                    </filter>
                </defs>
                {/* <mask id="path108mask1">
                    <path id="path108_2" d="
            M 0 10
            L 10 0
            L 368.6 0
            L 378.6 10

            v 320.05500000000006    
            L 368.6 340.05500000000006
            h -140
            L 218.60000000000002 350.05500000000006

            L 10 350.05500000000006
            L 0 340.05500000000006
            L 0 10" fill="transparent" stroke="white" stroke-width="2" class="path1"></path>
                </mask> */}
                <path id="path108" d={`
            M 0 10
            L 10 0
            L ${width - 14} 0
            L ${width - 4} 10

            v ${height - 40}    
            L ${width - 14} ${height - 20}
            h ${-150}
            L ${width - 170} ${height - 10}

            L 10 ${height - 10}
            L 0 ${height - 20}
            L 0 10`} fill="transparent" stroke="rgba(19, 139, 249)" filter="url(#f3)" strokeLinecap="round" strokeWidth="2" className="path1">
                </path>
                {/* <g mask="url(#path108mask1)">
                    <circle id="cr340" cx="0" cy="0" r="80" fill="url(#grad1)" data-svg-origin="0 0"
                        style={{ transformOrigin: '0px 0px 0px', transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 289.045, 0, 0, 1)' }}>
                    </circle>
                </g> */}
            </svg>
            <div className="dots" style={{ right: 30 }}>
                {dots}
            </div>
        </div>
    )
}