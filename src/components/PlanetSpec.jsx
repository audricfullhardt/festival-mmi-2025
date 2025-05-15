import React from 'react';

const PlanetSpec = ({ title, text }) => {
  const containerStyle = {
    position: 'relative',
    width: '141px',
    height: '197px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '26px 15px 15px',
  };

  const svgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  };

  const titleStyle = {
    color: '#FF0000',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '10px',
    textAlign: 'center',
  };

  const textStyle = {
    color: '#FF0000',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.8rem',
    textAlign: 'center',
    overflowY: 'auto',
    maxHeight: '120px',
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={containerStyle}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="141" 
          height="197" 
          viewBox="0 0 141 197" 
          fill="none"
          style={svgStyle}
        >
          <path 
            d="M2 2H114.5L138.5 26V121L131 128.5V149.5L138.5 157V195H106L99.5 188.5H45.5L39 195H2V167L8.5 160.5V62.5L2 56V2Z" 
            stroke="#FF0000" 
            strokeWidth="4"
            fill="rgba(255, 0, 0, 0.15)"
          />
        </svg>
        <h3 style={titleStyle}>{title}</h3>
        <p style={textStyle}>{text}</p>
      </div>
    </>
  );
};

export default PlanetSpec; 