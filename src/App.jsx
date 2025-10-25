// This App.jsx is the main controller of my app. It stores all the global state, decides which page the user sees, and connects all components.
// Brings in React (the framework) and Component (to create a class-based component).
// Imports helper UI components like Nav, Logo, FaceReg etc.
// ParticlesBg adds a moving background effect for nicer visuals.
// App.css provides custom styles.
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

// initialState in the foundation or the app's memory.
const initialState = {
  input: "", // current image URL typed in by user
  imageURL: "", // the image being displayed
  boxes: [], // positions of faces detected
  statusMessage: "", // display msgs likes "inspecting pixels..", etc.
  route: "signin", // current page (signin, register or home)
  isSignedIn: false, // tracks login status
  user: { id: "", name: "", email: "", entries: 0, joined: "" }, // stores user details and their stats
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    this.lastClarifaiData = null; // temporarily stores face detection results
  }

  loadUser = (data) => this.setState({ user: data });

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  };

  calculateFaceLocations = (data) => {
    const image = document.getElementById("inputimage");
    const width = Number(image?.width);
    const height = Number(image?.height);

    return data.faces.map((face) => {
      return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - face.right_col * width,
        bottomRow: height - face.bottom_row * height,
        width: (face.right_col - face.left_col) * width,
        height: (face.bottom_row - face.top_row) * height,
      };
    });
  };

  updateScore = (result) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    if (result.faces && result.faces.length > 0) {
      const boxes = this.calculateFaceLocations(result);
      this.displayFaceBoxes(boxes);

      const faceCount = boxes.length;
      this.setState({
        statusMessage: `${faceCount} face(s) locked and loaded!`,
        input: "",
      });

      // ✅ SEND faceCount in request body so backend increments properly
      fetch(`${baseURL}/api/image/${this.state.user.id}`, {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: faceCount }),
      })
        .then((res) => res.json())
        .then((updatedUser) =>
          this.setState({
            user: {
              ...this.state.user,
              entries: updatedUser.entries, // ✅ update score properly
            },
          })
        )
        .catch(console.log);
    } else {
      this.displayFaceBoxes([]);
      this.setState({
        statusMessage: "Oops! That link seems very shy. Try another?",
      });
    }
  };

  displayFaceBoxes = (boxes) => this.setState({ boxes });

  onInputChange = (event) => {
    this.setState({
      input: event.target.value,
      statusMessage: "",
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

    this.setState({
      imageURL: this.state.input,
      boxes: [],
      statusMessage: "Inspecting pixels…",
    });
    this.lastClarifaiData = null;

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    fetch(`${baseURL}/api/image/url`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: this.state.input,
        userId: this.state.user.id,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.data && Array.isArray(result.data)) {
          result.faces = result.data.map((region) => {
            const bbox = region.bounding_box || {};
            return {
              left_col: bbox.left_col,
              top_row: bbox.top_row,
              right_col: bbox.right_col,
              bottom_row: bbox.bottom_row,
            };
          });
        } else {
          result.faces = [];
        }

        this.lastClarifaiData = result;
        this.updateScore(result);
      })
      .catch((err) => {
        console.log("error", err);
        this.displayFaceBoxes([]);
        this.setState({
          statusMessage: "Oops! That link seems very shy. Try another?",
        });
      });
  };

  render() {
    const { isSignedIn, imageURL, route, boxes, user, statusMessage, input } =
      this.state;

    return (
      <div className="App">
        <ParticlesBg type="square" bg={true} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        <Logo />

        {route === "home" ? (
          <div>
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              inputValue={input}
            />
            <div
              className="status-message"
              style={{ marginTop: "1rem", fontWeight: "bold" }}
            >
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
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
