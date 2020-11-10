import React from 'react';
import './Header.scss'

import githubIcon from '../assets/github.svg';
import Logo from '../assets/react-indoor-text.svg';

export default ({ app, onSetApp }) => {

  const onTapApp = (value) => {
    if (typeof onSetApp === 'function') onSetApp(value);
  }
  return <div className="header">
    <div className="header-inner">
      <img alt="Logo" src={Logo} className="header-logo" />
      <div className="header-info">
        <div className={`header-info-item ${app === 'HOME' ? 'header-info-item-selected' : ''}`} onClick={() => onTapApp('HOME')}>Home</div>
        <div className={`header-info-item ${app === 'EXAMPLE' ? 'header-info-item-selected' : ''}`} onClick={() => onTapApp('EXAMPLE')}>Examples</div>
        <div className={`header-info-item ${app === 'DOC' ? 'header-info-item-selected' : ''}`} onClick={() => onTapApp('DOC')}>Documents</div>
        <div className="header-info-github header-info-item">
          <img className="header-info-icon" src={githubIcon} />
          <span>Github</span>
        </div>
      </div>
    </div>
  </div>
}