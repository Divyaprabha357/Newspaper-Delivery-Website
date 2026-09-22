import { useState, useEffect } from "react";
import rozLogo from "./assets/roz-logo.png";
import newspaperIcon from "./icons/newspaper.svg";
import subscribeIcon from "./icons/subscribe.svg";
import deliveryIcon from "./icons/delivery.svg";
import CustomerDashboard from "./CustomerDashboard";
import CustomerPages from "./CustomerPages";
import { customerApi } from "./api";
import "./App.css";

function App() {
  const [authModal, setAuthModal] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [customerPage, setCustomerPage] = useState("dashboard");

  // --------------------------------------------------
  // CLOSE MODAL WITH ESCAPE
  // --------------------------------------------------

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAuthModal(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // --------------------------------------------------
  // PREVENT BACKGROUND SCROLL WHEN MODAL IS OPEN
  // --------------------------------------------------

  useEffect(() => {
    if (authModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [authModal]);

  // --------------------------------------------------
  // OPEN LOGIN
  // --------------------------------------------------

  const openLogin = () => {
    setAuthModal("login");
  };

  // --------------------------------------------------
  // OPEN SIGNUP
  // --------------------------------------------------

  const openSignup = () => {
    setAuthModal("signup");
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    setAuthModal(null);
  };

  // --------------------------------------------------
  // HANDLE LOGIN / SIGNUP
  // --------------------------------------------------

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // ----------------------------------------------
    // LOGIN
    // ----------------------------------------------

    if (authModal === "login") {
      const emailOrPhone =
        event.currentTarget.elements.emailOrPhone.value;

      const password =
        event.currentTarget.elements.password.value;

      try {
        const data = await customerApi.login({ emailOrPhone, password });

        console.log("Logged in user:", data.user);

        // Save logged-in user
        localStorage.setItem(
          "rozUser",
          JSON.stringify(data.user)
        );

        // Close login modal
        setAuthModal(null);

        // Open customer dashboard
        setShowDashboard(true);

      } catch (error) {
        console.error("Login error:", error);

        alert(
          "Unable to connect to the DAILY server."
        );
      }

      return;
    }

    // ----------------------------------------------
    // SIGNUP
    // ----------------------------------------------

    // Signup remains mock for now
    setAuthModal(null);

    alert("Account created successfully!");
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("rozUser");
    setShowDashboard(false);
  };

  // --------------------------------------------------
  // CUSTOMER DASHBOARD
  // --------------------------------------------------

if (showDashboard) {
  const storedUser =
    JSON.parse(localStorage.getItem("rozUser")) || {};

  if (customerPage !== "dashboard") {
    return (
      <CustomerPages
        page={customerPage}
        user={storedUser}
        onBack={() => setCustomerPage("dashboard")}
        onNavigate={(page) => setCustomerPage(page)}
        onMenuClick={(item) => {
          if (item === "Logout") {
            handleLogout();
          }
        }}
      />
    );
  }

  return (
    <CustomerDashboard
      user={storedUser}
      onMenuClick={(item) => {
        if (item === "Logout") {
          handleLogout();
        }
      }}
      onNavigate={(page) => {
        setCustomerPage(page);
      }}
    />
  );
}

  // --------------------------------------------------
  // LANDING PAGE
  // --------------------------------------------------

  return (
    <div className="landing-page">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="navbar">

        <div className="nav-logo">
          <img
            src={rozLogo}
            alt="ROZ"
          />
        </div>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>

        </div>

        <button
          className="nav-login"
          onClick={openLogin}
        >
          Login
        </button>

      </nav>


      {/* ==========================================
          HERO
      ========================================== */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <div className="hero-badge">
            EASY DELIVERY
          </div>

          <h1>
            Your news.
            <br />
            Every morning.
          </h1>

          <p>
            Get your favourite newspapers delivered to your
            doorstep, every morning. Simple, reliable and made
            for your daily routine.
          </p>

        </div>


        {/* NEWSPAPER VISUAL */}

        <div className="newspaper-scene">

          <div className="paper paper-back">

            <div className="paper-top">
              <span>THE</span>
              <span>MORNING</span>
            </div>

            <div className="paper-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>

          </div>


          <div className="paper paper-middle">

            <div className="paper-header">
              <span>GOOD MORNING</span>
              <span>2026</span>
            </div>

            <div className="paper-main-title">
              STAY
              <br />
              INFORMED.
            </div>

            <div className="paper-content-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

          </div>


          <div className="paper paper-front">

            <div className="paper-front-header">
              <img
                src={rozLogo}
                alt="ROZ"
              />
            </div>

            <div className="paper-front-title">
              GOOD MORNING.
              <br />
              STAY INFORMED.
            </div>

            <div className="city-graphic">
              <div className="building building-one"></div>
              <div className="building building-two"></div>
              <div className="building building-three"></div>
              <div className="building building-four"></div>
              <div className="building building-five"></div>
            </div>

            <div className="delivery-circle">
              <span>DELIVERED</span>
              <strong>DAILY</strong>
            </div>

          </div>

        </div>

      </section>


      {/* ==========================================
          HOW IT WORKS
      ========================================== */}

      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-top">

          <h2>
            How Daily Works?
          </h2>

          <p>
            Getting your newspaper every morning is simple.
          </p>

        </div>


        <div className="steps-container">

          {/* STEP 1 */}

          <div className="step">

            <div className="step-icon">

              <img
                src={newspaperIcon}
                alt="Choose newspaper"
              />

            </div>

            <h3>
              Choose Your Newspaper
            </h3>

            <p>
              Pick from newspapers that are available in
              your area.
            </p>

          </div>


          {/* STEP 2 */}

          <div className="step">

            <div className="step-icon">

              <img
                src={subscribeIcon}
                alt="Subscribe"
              />

            </div>

            <h3>
              Subscribe
            </h3>

            <p>
              Select your subscription and preferred
              delivery details.
            </p>

          </div>


          {/* STEP 3 */}

          <div className="step">

            <div className="step-icon">

              <img
                src={deliveryIcon}
                alt="Delivery"
              />

            </div>

            <h3>
              Get It Delivered
            </h3>

            <p>
              Your newspaper arrives at your doorstep
              every morning.
            </p>

          </div>

        </div>

      </section>


      {/* ==========================================
          FINAL CTA
      ========================================== */}

      <section
        className="cta-section"
        id="about"
      >

        <div className="cta-paper">

          <h2>
            Start your morning
            <br />
            with ROZ.
          </h2>

          <button
            className="cta-button"
            onClick={openSignup}
          >
            Get Started
          </button>

        </div>

      </section>


      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="footer">

        <div className="footer-brand">

          <img
            src={rozLogo}
            alt="ROZ"
          />

          <p>
            Your news. Every morning.
          </p>

        </div>


        <div className="footer-links">

          <a href="#privacy">
            Privacy
          </a>

          <a href="#terms">
            Terms
          </a>

          <a href="#contact">
            Contact
          </a>

        </div>

      </footer>


      {/* ==========================================
          AUTH MODAL
      ========================================== */}

      {authModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="auth-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE BUTTON */}

            <button
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>


            {/* LOGO */}

            <div className="modal-logo">

              <img
                src={rozLogo}
                alt="ROZ"
              />

            </div>


            {/* ======================================
                LOGIN
            ====================================== */}

            {authModal === "login" ? (

              <>

                <div className="modal-heading">

                  <h2>
                    Welcome back
                  </h2>

                  <p>
                    Login to manage your newspaper
                    deliveries.
                  </p>

                </div>


                <form
                  onSubmit={handleFormSubmit}
                >

                  <div className="form-group">

                    <label>
                      Email / Phone Number
                    </label>

                    <input
                      type="text"
                      name="emailOrPhone"
                      placeholder="Enter email or phone number"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      required
                    />

                  </div>


                  <div className="form-options">

                    <label className="remember-me">

                      <input
                        type="checkbox"
                      />

                      <span>
                        Remember me
                      </span>

                    </label>


                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() => {}}
                    >
                      Forgot Password?
                    </button>

                  </div>


                  <button
                    type="submit"
                    className="auth-button"
                  >
                    Login
                  </button>

                </form>


                <div className="modal-divider">
                  <span>
                    OR
                  </span>
                </div>


                <div className="switch-auth">

                  <span>
                    Don't have an account?
                  </span>

                  <button
                    onClick={openSignup}
                  >
                    Create Account
                  </button>

                </div>

              </>

            ) : (

              /* ====================================
                 SIGNUP
              ==================================== */

              <>

                <div className="modal-heading">

                  <h2>
                    Create your account
                  </h2>

                  <p>
                    Start your mornings with ROZ.
                  </p>

                </div>


                <form
                  onSubmit={handleFormSubmit}
                >

                  <div className="form-group">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="Enter email address"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Create a password"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      placeholder="Confirm your password"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Delivery Address
                    </label>

                    <input
                      type="text"
                      placeholder="Enter delivery address"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Preferred Delivery Time
                    </label>

                    <input
                      type="time"
                      required
                    />

                  </div>


                  <label className="terms-checkbox">

                    <input
                      type="checkbox"
                      required
                    />

                    <span>
                      I agree to the Terms &
                      Conditions
                    </span>

                  </label>


                  <button
                    type="submit"
                    className="auth-button"
                  >
                    Create Account
                  </button>

                </form>


                <div className="switch-auth">

                  <span>
                    Already have an account?
                  </span>

                  <button
                    onClick={openLogin}
                  >
                    Login
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
