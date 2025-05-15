import React from 'react';

const Bouton = ({ text, onClick }) => {
  const buttonStyle = {
    position: 'relative',
    width: '250px',
    height: '78px',
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    border: '2px solid #FF0000',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s ease',
    clipPath: 'path("M2 59V2H220.5L246.5 28L247 75.5H18.5L2 59Z")',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      transform: 'scale(1.05)',
      backgroundColor: 'rgba(255, 0, 0, 0.25)'
    }
  };

  const textStyle = {
    color: '#FF0000',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    margin: 0,
    padding: '0 20px',
    transition: 'all 0.3s ease'
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <button 
        style={buttonStyle} 
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.25)';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = '#FF3333';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = '#FF0000';
        }}
      >
        <span style={textStyle}>{text}</span>
      </button>
    </>
  );
};

export default Bouton; 