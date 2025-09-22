import React from 'react'
import Tilt from 'react-parallax-tilt';
import brain from './brain.png';
import './Logo.css';

const Logo = () => {
    return (
        <div className='ma4 mt0'>
            <Tilt>
                <div className="Tilt br2 shadow-2" options={{ max: 55 }} style={{ height: '100px', width: '100px' }}>
                    <div className="Tilt-inner pa3">
                        <img style={{ paddingTop: '5px' }} alt="logo" src={brain}></img>
                    </div>
                </div>
            </Tilt>
        </div>
    );
}

export default Logo;
