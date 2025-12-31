// Input form where user pastes an image link.
// Text field is fully connected to app's state, so it resets/clears correctly.
// Detect button kicks off AI face detection process.
import React from 'react';
import './ImageLinkForm.css';

// A stateless function component receiving props (functions & values) from App.jsx.
const ImageLinkForm = ({ onInputChange, onButtonSubmit, inputValue }) => {
  return (
    <>
      <div className="image-link-form">
        <p className="f3">
          {'This Magic Brain will detect faces in your pictures. Give it a try.'}
        </p>
        <div className="center">
          <div className="form center pa4 br3 shadow-5">
            <input
              className="f4 pa2 w-70 center"
              type="text"
              value={inputValue}
              onChange={onInputChange}
            />
            <button
              className="w-30 grow f4 link ph3 pv2 dib white bg-gold"
              onClick={onButtonSubmit}
            >
              Detect
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageLinkForm;
