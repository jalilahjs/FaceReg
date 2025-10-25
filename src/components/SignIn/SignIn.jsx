// This component is the sign-in form.
// Sends credentials to backend for verification.
// If successful, user is logged in and redirected home. Otherwise, shows error.

import React from "react";
import Loader from "../Loader/Loader"; // 

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = { // Holds email + PW typed by the user.
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

  onSubmitSignIn = () => {
    this.setState({ loading: true, error: "" });
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    fetch(`${baseURL}/api/auth/login`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.signInEmail,
        password: this.state.signInPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("LOGIN RESPONSE:", data);  // <--- DEBUG
        this.setState({ loading: false });

        // ✅ FIRST check if backend returned error (so user sees wrong password, etc.)
        if (data.error) {
          this.setState({ error: data.error });
          return;
        }

        // ✅ Then unwrap user if success
        if (data.user && data.user.id) {
          this.props.loadUser(data.user);  // ✅ PASS THE USER OBJECT
          this.props.onRouteChange("home");
        } else {
          // fallback when user is not found but no .error key present (rare)
          this.setState({ error: "Invalid login response" });
        }
      })
      .catch((err) => {
        console.log("LOGIN ERROR:", err);
        this.setState({
          error: "Unable to sign in. Please try again later.",
          loading: false,
        });
      });
  };

  render() { // renders email and PW input fields
    const { onRouteChange } = this.props;
    const { error, loading } = this.state;

    return ( // HTML code that builds the components - uses Tachyons classes for layout, spacing and styling. 
      <div className="center">
        <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
          <main className="pa4 black-80">
            <div className="measure">
              <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                <legend className="f2 fw6 ph0 mh0">Sign In</legend>
                {/* ✅ This now shows backend-generated login errors correctly */}
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
