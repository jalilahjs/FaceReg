// This component is the registration form, which lets users enter their name, email and PW.
// Sends data to BE to create new account.
// If successful, user is automatically signed in and redirected home. If not, error is displayed immediately.
import React from "react";
import "../Loader/Loader.css";

// This is a class-based component, which handles registration form state and submits data to BE.
class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
      error: "", // error stores messages if registration fails
      loading: false, // tracks loading state
    };
  }

  // updates state as user types in each field, ensures form fields are controlled inputs.
  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  onEmailChange = (event) => {
    this.setState({ email: event.target.value });
  };

  onPasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  // sends a POST request to BE. 
  onSubmitRegister = () => {
    this.setState({ loading: true, error: "" }); // show loader + clear errors
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    fetch(`${baseURL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ ensure session cookie is accepted
      body: JSON.stringify({
        name: this.state.name,
        email: this.state.email,
        password: this.state.password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ loading: false });

        // FIRST check if the backend returned an error
        if (data.error) {
          this.setState({ error: data.error }); // show backend validation error (e.g., weak password)
          return;
        }

        // Only unwrap user AFTER confirming no error
        const user = data.user;
        if (user && user.id) {
          this.props.loadUser(user);
          this.props.onRouteChange("home");
        } else {
          // fallback (unlikely, but safe guard)
          this.setState({ error: "Unexpected server response. Please try again." });
        }
      })
      .catch(() =>
        this.setState({
          loading: false,
          error: "Server error. Please try again later.", // descriptive fallback
        })
      );
  };

  render() {
    const { onRouteChange } = this.props;
    const { error, loading } = this.state; // include loading for spinner

    return (
      <div className="center">
        <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
          <main className="pa4 black-80">
            <div className="measure">
              <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                <legend className="f2 fw6 ph0 mh0">Register</legend>

                {/* This now shows backend validation (password strength) messages correctly */}
                {error && <p style={{ color: "orange" }}>{error}</p>}

                {/* Spinner while loading */}
                {loading && (
                  <div className="center">
                    <div className="spinner"></div>
                    <p style={{ color: "orange", textAlign: "center" }}>
                      Please don’t refresh, we’re working hard to let you in…
                    </p>
                  </div>
                )}

                {/* Inputs are disabled while loading */}
                <div className="mt3">
                  <label className="db fw6 lh-copy f6" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                    type="text"
                    name="name"
                    id="name"
                    onChange={this.onNameChange}
                    disabled={loading}
                  />
                </div>
                <div className="mt3">
                  <label className="db fw6 lh-copy f6" htmlFor="email-address">
                    Email
                  </label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                    type="email"
                    name="email-address"
                    id="email-address"
                    onChange={this.onEmailChange}
                    disabled={loading}
                  />
                </div>
                <div className="mv3">
                  <label className="db fw6 lh-copy f6" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                    type="password"
                    name="password"
                    id="password"
                    onChange={this.onPasswordChange}
                    disabled={loading}
                  />
                </div>
              </fieldset>
              <div>
                <input
                  onClick={this.onSubmitRegister}
                  className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                  type="submit"
                  value={loading ? "Registering…" : "Register"}
                  disabled={loading}
                />
              </div>
              <div className="lh-copy mt3">
                <p
                  onClick={() => onRouteChange("signin")}
                  className="f6 link dim black db pointer"
                >
                  Sign In
                </p>
              </div>
            </div>
          </main>
        </article>
      </div>
    );
  }
}

export default Register;
