// This component is the sign-in form.
// Sends credentials to backend for verification.
// If successful, user is logged in and redirected home. Otherwise, shows error.

import React from "react";
import Loader from "../Loader/Loader"; // 

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signInEmail: "",
      signInPassword: "",
      error: "",
      loading: false, // shows a loader when waiting for BE response
    };
  }

  onEmailChange = (event) => { // updates signInEmail whenever user types
    this.setState({ signInEmail: event.target.value });
  };

  onPasswordChange = (event) => { // updates signInPassword when user types
    this.setState({ signInPassword: event.target.value });
  };

  onSubmitSignIn = () => { // this is called when user clicks sign in
    this.setState({ loading: true, error: "" }); // show loader & clear errors
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    fetch(`${baseURL}/signin`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.signInEmail,
        password: this.state.signInPassword,
      }),
    })
      .then((res) => res.json())
      .then((user) => {
        this.setState({ loading: false });

        if (user.id) {
          this.props.loadUser(user);
          this.props.onRouteChange("home");
        } else if (user === "wrong credentials") {
          this.setState({ error: "Invalid email or password." });
        } else if (user === "unable to get user") {
          this.setState({ error: "Server error. Please try again later." });
        } else {
          this.setState({ error: "Unable to sign in. Please try again." });
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: "Something went wrong. Please try again.",
        });
      });
  };

  render() {
    const { onRouteChange } = this.props;
    const { error, loading } = this.state;

    return (
      <div className="center">
        <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
          <main className="pa4 black-80">
            <div className="measure">
              <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                <legend className="f2 fw6 ph0 mh0">Sign In</legend>
                {error && <p style={{ color: "orange" }}>{error}</p>}
                {loading && (
                  <div className="tc mv3">
                    <Loader />
                    <p className="f6 orange">Please don’t refresh, we’re logging you in...</p>
                  </div>
                )}
                {!loading && (
                  <>
                    <div className="mt3">
                      <label
                        className="db fw6 lh-copy f6"
                        htmlFor="email-address"
                      >
                        Email
                      </label>
                      <input
                        className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                        type="email"
                        name="email-address"
                        id="email-address"
                        onChange={this.onEmailChange}
                      />
                    </div>
                    <div className="mv3">
                      <label
                        className="db fw6 lh-copy f6"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <input
                        className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                        type="password"
                        name="password"
                        id="password"
                        onChange={this.onPasswordChange}
                      />
                    </div>
                  </>
                )}
              </fieldset>
              {!loading && (
                <div>
                  <input
                    onClick={this.onSubmitSignIn}
                    className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                    type="submit"
                    value="Sign in"
                  />
                </div>
              )}
              {!loading && (
                <div className="lh-copy mt3">
                  <p
                    onClick={() => onRouteChange("register")}
                    className="f6 link dim black db pointer"
                  >
                    Register
                  </p>
                </div>
              )}
            </div>
          </main>
        </article>
      </div>
    );
  }
}

export default SignIn;

