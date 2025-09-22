import React from "react";
import "./FaceRecognition.css";

const FaceRecognition = ({ imageURL, box }) => {
  return (
    <div className="center ma">
      <div className="relative mt2">
        {imageURL && (
          <img
            id="inputimage"
            alt=""
            src={imageURL}
            className="face-image"
          />
        )}
        {box && box.topRow !== undefined && (
          <div
            className="bounding-box"
            style={{
              top: `${box.topRow}px`,
              left: `${box.leftCol}px`,
              width: `${box.rightCol - box.leftCol}px`,
              height: `${box.bottomRow - box.topRow}px`,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default FaceRecognition;
