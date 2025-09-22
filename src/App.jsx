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
      route: "signin",   // new!
      isSignedIn: false, // new!
    };
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

    fetch(
        `/api/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
        returnClarifaiRequestOptions(this.state.input)
      )
      .then((response) => response.json())
      .then((result) => {
        console.log("Clarifai result:", result);
      })
      .catch((error) => console.log("error", error));
  };

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
            <FaceRecognition imageURL={this.state.imageURL} />
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
