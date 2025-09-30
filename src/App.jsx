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

    return data.faces.map((face) => { // loop over every face in the image and adjust the square around the face
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

      // get the count of the boxes (faces) to add them to the score
      const faceCount = boxes.length;
      // update the label under the image 
      this.setState({
        statusMessage: `${faceCount} face(s) locked and loaded!`,
        input: "" // <-- clears the ImageLinkForm input field
      });

      // update the score
      fetch(`${baseURL}/score`, {
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

    if (!this.state.input) return; // the text box is empty then do nothing
    if (this.state.input === this.state.imageURL) return;

    // Reset image, boxes, and show analyzing message
    this.setState({
      imageURL: this.state.input,
      boxes: [],
      statusMessage: "Inspecting pixels…"
    });
    this.lastClarifaiData = null;

    // call local server when running on local and production server when running in prod
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    fetch(`${baseURL}/faceDetection`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: this.state.input }),
    })
      .then((response) => response.json())
      .then((result) => {
        this.lastClarifaiData = result;
        // after a successful face detection update the score
        this.updateScore(result);
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
        {route === "home" ? ( // if we are on the home page then show the following components
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
        ) : route === "signin" ? (  // if we are on the sign is page show the following components
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        )}
      </div>
    );
  }
}

export default App;
