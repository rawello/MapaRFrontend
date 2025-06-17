import React, { useState } from 'react';
import './BuildingName.css';
import { FaChartBar, FaChartLine } from 'react-icons/fa';

const BuildingName = ({ buildingName, onOpenStatistic }) => {
    return (
        <div id="buildingName" className="building-name" style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1100 }}>
            <span>{buildingName || 'Select a Building'}</span>
            <button
                className="statistic-btn"
                onClick={onOpenStatistic}
                title="Статистика скачиваний"
                style={{
                    background: 'rgba(59,130,246,0.12)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                    transition: 'background 0.18s',
                    marginLeft: 6,
                    zIndex: 1200,
                    position: 'relative',
                    padding: 0
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.22)'}
                onFocus={e => e.currentTarget.style.background = 'rgba(59,130,246,0.22)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(59,130,246,0.12)'}
                onBlur={e => e.currentTarget.style.background = 'rgba(59,130,246,0.12)'}
            >
                <FaChartLine color="#1d4ed8" size={22} style={{ zIndex: 1300, position: 'relative', pointerEvents: 'none' }} />
            </button>
        </div>
    );
};

export default BuildingName;