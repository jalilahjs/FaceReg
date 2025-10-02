// This component shows the uploaded image. Once image loads, it overlays blue rectangles around any detected faces.
// Rectangle's position and size are calculated in App.jsx to ensure it fits exactly around each face.
import React from "react"; // uses React for building the UI
import "./FaceRecognition.css"; // loads CSS file for styling (keep visuals consistent)

// this is a stateless functional component, receiving 3 props from App.jsx.
// ImageURL: image to display, BoxesL array of face box positions, onImageLoad: callback to trigger once image is fully loaded.
const FaceRecognition = ({ imageURL, boxes, onImageLoad }) => {
  return (
    //wraps everything in centered container.
    //image contained has position relative, which is required so face boxes can be placed on top of the image.
    <div className="center"> 
      <div className="image-container" style={{ position: "relative" }}> 
        <img
          id="inputimage" 
          src={imageURL}
          alt=""
          width="500px" // fixed width for consistency
          height="auto"
          onLoad={onImageLoad} // lets App.jsx calculate and draw bounding box once image dimensions are known
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
