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

/* Preparing the API request from Clarifai */
const returnClarifaiRequestOptions = (imageURL) => {
  const PAT = import.meta.env.VITE_API_PAT;
  const USER_ID = import.meta.env.VITE_API_USER_ID;
  const APP_ID = import.meta.env.VITE_API_APP_ID;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: imageURL,
          },
        },
      },
    ],
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

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageURL: "",
      box: {},
      route: "signin",
      isSignedIn: false,
    };

    this.lastClarifaiData = null; // NEW
    /*---lastClarifaiData---
    Purpose: Stores the latest response from the Clarifai API.
    Reason: The face detection API returns the coordinates of detected faces, but you can't calculate the box until the image is fully loaded in the DOM.
    It acts as a temporary cache so that the face box can be calculated once the image is ready.
    */

    this.imageLoaded = false; // NEW flag
    /*---imageLoaded---
    Purpose: A flag to track whether the image has finished loading in the browser.
    Reason: You can't calculate face coordinates relative to the image size until the image is loaded, because the width and height of the <img> element aren't known yet.
    When true, it's safe to calculate the face box.
    */
  }

  // calculate the position of the face box
  calculateFaceLocation = (data) => {
    try {
      const clarifaiFace =
        data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById("inputimage");
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - clarifaiFace.right_col * width,
        bottomRow: height - clarifaiFace.bottom_row * height,
      };
    } catch (err) {
      return {};
    }
  };

  displayFaceBox = (box) => {
    this.setState({ box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input, box: {} });

    const MODEL_ID = "face-detection";
    const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";

    fetch(
  `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
  returnClarifaiRequestOptions(this.state.input)
)
      .then((response) => response.json())
      .then((result) => {
        this.lastClarifaiData = result; // ✅ store response

        if (this.imageLoaded) {
          const box = this.calculateFaceLocation(this.lastClarifaiData);
          this.displayFaceBox(box);
        }
      })
      .catch((error) => console.log("error", error));
  };

  /* Why are calculateFaceLocation() and this.displayFaceBox(box) called twice (first inside the .then() after fetching Clarifai API and then again inside onImageLoad?
   Answer: Because we don't know which will happen first: the image loading or the API response arriving.
   
   const box = this.calculateFaceLocation(this.lastClarifaiData);
   this.displayFaceBox(box); 
 
   Reason:
   The API response and the image load can happen in any order.
   The code handles both scenarios:
   Image loads first → wait for API to calculate box.
   API responds first → wait for image to load to calculate box.
   This avoids the problem where the bounding box might be calculated when the image size is unknown, which would break the display.
   */

  // NEW: called when image is loaded
  onImageLoad = () => {
    this.imageLoaded = true; // mark image as ready
    if (this.lastClarifaiData) {
      const box = this.calculateFaceLocation(this.lastClarifaiData);
      this.displayFaceBox(box);
    }
  };

  /* --onImageLoad()--
  This function is passed to the <FaceRecognition> component and is called when the image finishes loading (onLoad event of <img>).
  Checks if we already have face data (lastClarifaiData) from the API:
  If yes, calculates the face box immediately.
  Otherwise, it just sets imageLoaded = true and waits for the API response.
  */

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageURL, route } = this.state;

    return (
      <div className="App">
        <ParticlesBg type="circle" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition
              imageURL={this.state.imageURL}
              box={this.state.box}
              onInmageLoad={this.onImageLoad}
            />
          </div>
        ) : route === "signin" ? (
          <SignIn onRouteChange={this.onRouteChange} />
        ) : (
          <Register onRouteChange={this.onRouteChange} />
        )}
      </div>
    );
  }
}

export default App;
