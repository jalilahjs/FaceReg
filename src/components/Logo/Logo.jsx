import React, { useState } from 'react';
import Tilt from 'react-parallax-tilt';
import brain from './brain.png';
import './Logo.css';

const Logo = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="ma4 mt0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Tilt
        tiltMaxAngleX={isHovered ? 20 : 0}
        tiltMaxAngleY={isHovered ? 20 : 0}
        perspective={1000}
        scale={isHovered ? 1.05 : 1}
        transitionSpeed={250}
        gyroscope={true}
        style={{ height: '100px', width: '100px' }}
      >
        <img
          src={brain}
          alt="logo"
          style={{ height: '100%', width: '100%' }}
        />
      </Tilt>
    </div>
  );
};

export default Logo;
