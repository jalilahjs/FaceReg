import React from "react";
import "./FaceRecognition.css";

const FaceRecognition = ({ imageURL, box, onImageLoad }) => {
  return (
    <div className="center ma">
      <div className="relative mt2">
        {imageURL && (
          <img
            id="inputimage"
            alt=""
            src={imageURL}
            width="500px"
            height="auto"
            onLoad={onImageLoad}
          />
        )}
        <div
          className="bounding-box"
          style={{
            top: box.topRow,
            right: box.rightCol,
            bottom: box.bottomRow,
            left: box.leftCol,
          }}
        ></div>
      </div>
    </div>
  );
};

export default FaceRecognition;
