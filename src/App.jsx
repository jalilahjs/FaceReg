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
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    // Clarifai returns regions array → each region has region_info.bounding_box
    return data.faces.map((region) => {
      return {
        leftCol: region.left_col * width,
        topRow: region.top_row * height,
        rightCol: width - region.right_col * width,
        bottomRow: height - region.bottom_row * height,
        width: (region.right_col - region.left_col) * width,
        height: (region.bottom_row - region.top_row) * height,
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

    fetch(
      `https://smart-brain-api-spvs.onrender.com/imageurl`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
      }),
    }).then((response) => response.json())
      .then((result) => {
        console.log("Clarifai result:", result);
        this.lastClarifaiData = result;

        // If faces detected, calculate boxes
        if (result.faces) {
          const boxes = this.calculateFaceLocations(result);
          this.displayFaceBoxes(boxes);

          const faceCount = boxes.length;
          console.log('faceCount', faceCount)
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
