import React from 'react';
import './SideMenu.scss';

export default ({ menuList, activeMenuIdx, setActiveMenuIdx }) => {
  return <div className="sidemenu">{menuList.map((item, idx) =>
    <div className={`sidemenu-item ${activeMenuIdx === idx ? 'sidemenu-item-active' : ''}`} key={item.name} onClick={() => setActiveMenuIdx(idx)}>
      {item.name}
    </div>
  )}</div>
}