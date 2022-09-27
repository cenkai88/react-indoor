import React, { useEffect, useState } from 'react';
import './header.scss'
import logo from "../../../assets/logo.jpg"

let intervalTicket;

export default () => {
    const [timeStr, setTimeStr] = useState('')

    useEffect(() => {
        if (!intervalTicket) intervalTicket = setInterval(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const day = now.getDate();
            setTimeStr(`${year}年${month + 1}月${day}日 ${hour}:${minute}:${seconds}`)
        }, 1000)
    }, [])


    return (
        <header className="header">
            <div className="header-left">
                {timeStr}
            </div>
            <nav className="header-nav">
            <iframe scrolling="no" src="https://tianqiapi.com/api.php?style=tz&skin=pitaya&color=FFFFFF&city=上海&align=right" frameborder="0" width="400" height="24" allowtransparency="true"></iframe>
                {/* <a href="#"><img style={{ width: 28 }} src={rainIcon} />小雨</a>
                <a href="#"><img style={{ width: 24, marginRight: 4 }} src={tempIcon} />20-29度</a>
                <a href="#"><img style={{ width: 18, marginRight: 10 }} src={windIcon} />东北风2级</a> */}
            </nav>
            <div className="header-title">
                <img style={{ width: 40, marginRight: 12 }} src={logo} />
                <div>浦东国际机场安检运行控制中心</div>
            </div>
        </header>
    )
}