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
  statusMessage: "",
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

  onInputChange = (event) => {
    this.setState({ 
      input: event.target.value,
      statusMessage: "" // reset status when typing a new URL
    });
  };

  onImageLoad = () => {
    if (this.lastClarifaiData && this.lastClarifaiData.faces) {
      const boxes = this.calculateFaceLocations(this.lastClarifaiData);
      this.displayFaceBoxes(boxes);
    } else {
      this.displayFaceBoxes([]);
    }
  };

  onButtonSubmit = () => {
    if (!this.state.input) return;
    if (this.state.input === this.state.imageURL) return;

    // Reset image, boxes, and show analyzing message
    this.setState({ 
      imageURL: this.state.input, 
      boxes: [], 
      statusMessage: "Inspecting pixels…" 
    });
    this.lastClarifaiData = null;

    fetch(`https://smart-brain-api-spvs.onrender.com/imageurl`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: this.state.input }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Clarifai result:", result);
        this.lastClarifaiData = result;

        if (result.faces && result.faces.length > 0) {
          const boxes = this.calculateFaceLocations(result);
          this.displayFaceBoxes(boxes);

          const faceCount = boxes.length;
          this.setState({ 
            statusMessage: `${faceCount} face(s) locked and loaded!`,
            input: "" // <-- clears the ImageLinkForm input field
          });

          fetch(`https://smart-brain-api-spvs.onrender.com/image`, {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: this.state.user.id, faces: faceCount }),
          })
            .then((res) => res.json())
            .then((entries) =>
              this.setState(Object.assign(this.state.user, { entries }))
            )
            .catch(console.log);
        } else {
          this.displayFaceBoxes([]);
          this.setState({ statusMessage: "Oops! That link seems very shy. Try another?" });
        }
      })
      .catch((err) => {
        console.log("error", err);
        this.displayFaceBoxes([]);
        this.setState({ statusMessage: "Oops! That link seems very shy. Try another?" });
      });
  };

  onRouteChange = (route) => {
    if (route === "signout") this.setState(initialState);
    else if (route === "home") this.setState({ isSignedIn: true });
    this.setState({ route });
  };

  render() {
    const { isSignedIn, imageURL, route, boxes, user, statusMessage, input } = this.state;

    return (
      <div className="App">
        <ParticlesBg type="square" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        <Logo />
        {route === "home" ? (
          <div>
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              inputValue={input} // pass the input value to the form
            />

            {/* Status message */}
            <div className="status-message" style={{ marginTop: "1rem", fontWeight: "bold" }}>
              {statusMessage}
            </div>

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
