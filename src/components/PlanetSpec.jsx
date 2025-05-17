import React from 'react';

const PlanetSpec = ({ title, text }) => {
  // Nouveau path adapté à 170x210px (divisé par 2)
  const svgPath = "M2.5 2.5H138L166 30.5V130L159 137V159.5L166 166.5V207.5H127L119 199.5H54.5L46.5 207.5H2.5V178L9.5 171V66.5L2.5 59.5V2.5Z";
  const containerStyle = {
    position: 'relative',
    width: '170px',
    height: '210px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '24px 16px 16px 16px',
    background: 'rgba(30, 255, 255, 0.10)',
    border: '1.25px solid #00fff7',
    boxShadow: '0 0 16px 4px #00fff7, 0 0 40px 0px #00bfff44',
    overflow: 'hidden',
    backdropFilter: 'blur(6px)',
    zIndex: 10000,
    animation: 'holo-float 2.5s ease-in-out infinite alternate',
    clipPath: `path('${svgPath}')`,
    WebkitClipPath: `path('${svgPath}')`,
    boxSizing: 'border-box',
  };

  const svgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 0 16px #00fff7) drop-shadow(0 0 32px #00bfff88)',
    opacity: 0.7,
  };

  const titleStyle = {
    color: '#00fff7',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.68rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '12px',
    textAlign: 'center',
    letterSpacing: '2px',
    zIndex: 2,
    maxWidth: '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
  };

  const textStyle = {
    color: '#b2ffff',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.72rem',
    textAlign: 'center',
    overflowY: 'auto',
    maxHeight: '170px',
    lineHeight: 1.5,
    textShadow: '0 0 6px #00fff7, 0 0 12px #00bfff',
    zIndex: 2,
    letterSpacing: '1px',
    background: 'linear-gradient(90deg, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0.18) 100%)',
    borderRadius: '8px',
    padding: '8px 10px',
    boxShadow: '0 0 12px #00fff733',
    maxWidth: '95%',
    alignSelf: 'center',
    margin: 0,
  };

  // Scanlines et reflets
  const scanlineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 3,
    background: 'repeating-linear-gradient(to bottom, rgba(0,255,255,0.08) 0px, rgba(0,255,255,0.08) 2px, transparent 2px, transparent 6px)',
    mixBlendMode: 'screen',
    opacity: 0.5,
    animation: 'scanline-move 2.5s linear infinite',
  };

  const reflectionStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 4,
    background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(0,255,255,0.08) 60%, transparent 100%)',
    opacity: 0.35,
    mixBlendMode: 'screen',
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes holo-float {
          0% { transform: translateY(0) scale(1); box-shadow: 0 0 32px 8px #00fff7, 0 0 80px 0px #00bfff44; }
          100% { transform: translateY(-12px) scale(1.025); box-shadow: 0 0 48px 16px #00fff7, 0 0 120px 0px #00bfff66; }
        }
        @keyframes scanline-move {
          0% { background-position-y: 0; }
          100% { background-position-y: 12px; }
        }
      `}</style>
      <div style={containerStyle}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="170" 
          height="210" 
          viewBox="0 0 170 210" 
          fill="none"
          style={svgStyle}
        >
          <path 
            d={svgPath}
            stroke="#00fff7" 
            strokeWidth="2"
            fill="rgba(0,255,255,0.10)"
          />
        </svg>
        <div style={scanlineStyle}></div>
        <div style={reflectionStyle}></div>
        <h3 style={titleStyle}>{title}</h3>
        <p style={textStyle}>{text}</p>
      </div>
    </>
  );
};

export default PlanetSpec; 