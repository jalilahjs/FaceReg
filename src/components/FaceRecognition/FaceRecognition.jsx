import React from "react";
import "./FaceRecognition.css";

const FaceRecognition = ({ imageURL, boxes, onImageLoad }) => {
  return (
    <div className="center">
      <div className="image-container" style={{ position: "relative" }}>
        <img
          id="inputimage"
          src={imageURL}
          alt=""
          width="500px"
          height="auto"
          onLoad={onImageLoad}
        />
        {boxes &&
          boxes.map((box, i) => (
            <div
              key={i}
              className="bounding-box"
              style={{
                top: box.topRow,
                left: box.leftCol,
                width: box.width,
                height: box.height,
                position: "absolute",
                border: "3px solid #149df2",
                boxShadow: "0 0 0 3px #149df2 inset",
              }}
            ></div>
          ))}
      </div>
    </div>
  );
};

export default FaceRecognition;
