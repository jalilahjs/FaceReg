import React, { Component } from "react";
import ParticlesBg from "particles-bg";
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.jsx";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import "./App.css";

const returnClarifaiRequestOptions = (imageURL) => {
  const PAT = import.meta.env.VITE_API_PAT;
  const USER_ID = import.meta.env.VITE_API_USER_ID;
  const APP_ID = import.meta.env.VITE_API_APP_ID;

  const raw = JSON.stringify({
    user_app_id: { user_id: USER_ID, app_id: APP_ID },
    inputs: [{ data: { image: { url: imageURL } } }],
  });

  return {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };
};

const initialState = {
  input: "",
  imageURL: "",
  boxes: [],
  route: "signin",
  isSignedIn: false,
  user: { id: "", name: "", email: "", entries: 0, joined: "" },
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    this.lastClarifaiData = null;
  }

  loadUser = (data) => this.setState({ user: data });

  calculateFaceLocations = (data) => {
    if (!data.outputs || !data.outputs[0].data.regions) return [];
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    return data.outputs[0].data.regions.map((region) => {
      const box = region.region_info.bounding_box;
      return {
        leftCol: box.left_col * width,
        topRow: box.top_row * height,
        width: (box.right_col - box.left_col) * width,
        height: (box.bottom_row - box.top_row) * height,
      };
    });
  };

  displayFaceBoxes = (boxes) => this.setState({ boxes });

  onInputChange = (event) => this.setState({ input: event.target.value });

  onImageLoad = () => {
  if (this.lastClarifaiData && this.lastClarifaiData.outputs[0].data.regions) {
    const boxes = this.calculateFaceLocations(this.lastClarifaiData);
    this.displayFaceBoxes(boxes);
  } else {
    this.displayFaceBoxes([]); // no faces → clear boxes
  }
};

  onButtonSubmit = () => {
  // Only proceed if the input URL is different from the currently displayed image
  if (this.state.input === this.state.imageURL) return;

  // Reset image and boxes
  this.setState({ imageURL: this.state.input, boxes: [] });
  this.lastClarifaiData = null;

  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";

  fetch(
    `/api/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
    returnClarifaiRequestOptions(this.state.input)
  )
    .then((response) => response.json())
    .then((result) => {
      console.log("Clarifai result:", result);
      this.lastClarifaiData = result;

      // If faces detected, calculate boxes
      if (result.outputs[0].data.regions) {
        const boxes = this.calculateFaceLocations(result);
        this.displayFaceBoxes(boxes);

        const faceCount = boxes.length;

        // update entries by number of faces
        fetch(`https://smart-brain-api-spvs.onrender.com/image`, {
          method: "put",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: this.state.user.id,
            faces: faceCount,
          }),
        })
          .then((res) => res.json())
          .then((entries) =>
            this.setState(Object.assign(this.state.user, { entries }))
          )
          .catch(console.log);
      } else {
        // No faces detected → clear boxes
        this.displayFaceBoxes([]);
      }
    })
    .catch((err) => {
      console.log("error", err);
      // In case of error, clear boxes
      this.displayFaceBoxes([]);
    });
};

  onRouteChange = (route) => {
    if (route === "signout") this.setState(initialState);
    else if (route === "home") this.setState({ isSignedIn: true });
    this.setState({ route });
  };

  render() {
    const { isSignedIn, imageURL, route, boxes, user } = this.state;

    return (
      <div className="App">
        <ParticlesBg type="square" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        <Logo /> {/* Always shows */}
        {route === "home" ? (
          <div>
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition
              imageURL={imageURL}
              boxes={boxes}
              onImageLoad={this.onImageLoad}
            />
          </div>
        ) : route === "signin" ? (
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        )}
      </div>
    );
  }
}

export default App;
