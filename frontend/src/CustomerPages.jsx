import React, { useState } from "react";
import rozLogo from "./assets/roz-logo.png";
import {
  DashboardIcon,
  SubscriptionIcon,
  HistoryIcon,
  PaymentIcon,
  NotificationIcon,
  ProfileIcon,
  LogoutIcon,
  AddIcon,
  PauseIcon,
  CheckIcon,
  ArrowRightIcon,
  NewspaperIcon,
  DeliveryVanIcon,
  HelpIcon,
} from "./Icons";
import "./CustomerDashboard.css";
import "./CustomerPages.css";

function CustomerPages({ page, user, onBack, onNavigate, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [pauseSubscription, setPauseSubscription] = useState(null);

  const fullName = user?.name || "Aarav Sharma";
  const firstName = fullName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();

  /*
  ============================================================
  SUBSCRIPTION DATA
  ============================================================
  */

  const subscriptions = [
    {
      id: 1,
      name: "The Times of India",
      language: "English",
      edition: "Mumbai Edition",
      supplier: "Mumbai Daily Distributors",
      partner: "Rahul Patil",
      deliveryTime: "7:02 AM",
      price: "₹4.50",
      monthlyPrice: "₹135",
      status: "Active",
      started: "01 September 2026",
    },
    {
      id: 2,
      name: "Hindustan Times",
      language: "English",
      edition: "Mumbai Edition",
      supplier: "Mumbai Daily Distributors",
      partner: "Rahul Patil",
      deliveryTime: "6:58 AM",
      price: "₹3.50",
      monthlyPrice: "₹105",
      status: "Active",
      started: "01 September 2026",
    },
    {
      id: 3,
      name: "Loksatta",
      language: "Marathi",
      edition: "Mumbai Edition",
      supplier: "Western News Distributors",
      partner: "Amit Kulkarni",
      deliveryTime: "7:15 AM",
      price: "₹3",
      monthlyPrice: "₹90",
      status: "Active",
      started: "01 September 2026",
    },
  ];

  /*
  ============================================================
  PAGE HEADER
  ============================================================
  */

  const PageHeader = ({ kicker, title, description }) => (
    <div className="customer-page-header">
      <span className="customer-page-kicker">{kicker}</span>

      <h1>{title}</h1>

      <p>{description}</p>
    </div>
  );

  /*
  ============================================================
  RENDER PAGE CONTENT
  ============================================================
  */

  const renderPageContent = () => {
    /* 1. MY SUBSCRIPTIONS */
    if (page === "subscriptions") {
      return (
        <div className="customer-page subscriptions-page">
          <PageHeader
            kicker="MY DAILY PAPERS"
            title="My Subscriptions"
            description="Everything you receive each morning, in one place."
          />

          <div className="subscriptions-top-bar">
            <div>
              <span className="subscription-count">{subscriptions.length}</span>
              <span className="subscription-count-label">Active subscriptions</span>
            </div>

            <button
              className="add-newspaper-button"
              onClick={() => onNavigate("add-newspaper")}
            >
              <AddIcon size={18} />
              <span>ADD NEWSPAPER</span>
            </button>
          </div>

          <div className="subscription-list">
            {subscriptions.map((subscription) => (
              <article className="subscription-card" key={subscription.id}>
                {/* NEWSPAPER COVER */}
                <div className="subscription-cover">
                  <div className="cover-top">DAILY EDITION</div>
                  <div className="cover-rule"></div>
                  <h2>{subscription.name}</h2>
                  <div className="cover-bottom">{subscription.edition}</div>
                </div>

                {/* MAIN INFORMATION */}
                <div className="subscription-main">
                  <div className="subscription-heading-row">
                    <div>
                      <span className="subscription-language">
                        {subscription.language}
                      </span>
                      <h2>{subscription.name}</h2>
                      <span className="subscription-edition">
                        {subscription.edition}
                      </span>
                    </div>

                    <span className="subscription-status">
                      <span className="status-dot"></span>
                      {subscription.status}
                    </span>
                  </div>

                  <div className="subscription-details-grid">
                    <div className="subscription-detail">
                      <span>SUPPLIER</span>
                      <strong>{subscription.supplier}</strong>
                    </div>

                    <div className="subscription-detail">
                      <span>DELIVERY PARTNER</span>
                      <strong>{subscription.partner}</strong>
                    </div>

                    <div className="subscription-detail">
                      <span>DELIVERY TIME</span>
                      <strong>{subscription.deliveryTime}</strong>
                    </div>

                    <div className="subscription-detail">
                      <span>PRICE</span>
                      <strong>
                        {subscription.price}
                        <small> / day</small>
                      </strong>
                    </div>
                  </div>

                  <div className="subscription-footer">
                    <span className="subscription-start-date">
                      Since {subscription.started}
                    </span>

                    <div className="subscription-actions">
                      <button
                        className="subscription-view-button"
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          onNavigate("subscription-details");
                        }}
                      >
                        VIEW
                        <ArrowRightIcon size={14} />
                      </button>

                      <button
                        className="subscription-pause-button"
                        onClick={() => setPauseSubscription(subscription)}
                      >
                        <PauseIcon size={15} />
                        PAUSE
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* PAUSE POPUP */}
          {pauseSubscription && (
            <div
              className="customer-modal-overlay"
              onClick={() => setPauseSubscription(null)}
            >
              <div
                className="customer-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-icon">
                  <PauseIcon size={22} />
                </div>

                <span className="modal-kicker">PAUSE SUBSCRIPTION</span>

                <h2>Pause {pauseSubscription.name}?</h2>

                <p>
                  Choose how long you would like to pause your newspaper delivery.
                </p>

                <select className="modal-select">
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                </select>

                <div className="modal-actions">
                  <button
                    className="modal-cancel-button"
                    onClick={() => setPauseSubscription(null)}
                  >
                    CANCEL
                  </button>

                  <button
                    className="modal-primary-button"
                    onClick={() => {
                      setPauseSubscription(null);
                      alert("Subscription paused successfully.");
                    }}
                  >
                    CONFIRM PAUSE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    /* 2. SUBSCRIPTION DETAILS */
    if (page === "subscription-details") {
      const subscription = selectedSubscription || subscriptions[0];

      return (
        <div className="customer-page subscription-details-page">
          <PageHeader
            kicker="SUBSCRIPTION"
            title={subscription.name}
            description="Your complete subscription information."
            customBack={() => onNavigate("subscriptions")}
          />

          <div className="details-layout">
            <div className="details-newspaper-preview">
              <div className="large-newspaper-cover">
                <span>DAILY EDITION</span>
                <h2>{subscription.name}</h2>
                <div></div>
                <strong>{subscription.edition}</strong>
              </div>

              <span className="subscription-status large-status">
                <span className="status-dot"></span>
                Active
              </span>
            </div>

            <div className="details-information">
              <div className="details-section">
                <span className="details-section-kicker">
                  DELIVERY INFORMATION
                </span>

                <div className="details-info-grid">
                  <div>
                    <span>SUPPLIER</span>
                    <strong>{subscription.supplier}</strong>
                  </div>

                  <div>
                    <span>DELIVERY PARTNER</span>
                    <strong>{subscription.partner}</strong>
                  </div>

                  <div>
                    <span>DELIVERY TIME</span>
                    <strong>{subscription.deliveryTime}</strong>
                  </div>

                  <div>
                    <span>DELIVERY FREQUENCY</span>
                    <strong>Every day</strong>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <span className="details-section-kicker">SUBSCRIPTION</span>

                <div className="details-info-grid">
                  <div>
                    <span>START DATE</span>
                    <strong>{subscription.started}</strong>
                  </div>

                  <div>
                    <span>RENEWAL DATE</span>
                    <strong>01 October 2026</strong>
                  </div>

                  <div>
                    <span>DAILY PRICE</span>
                    <strong>{subscription.price}</strong>
                  </div>

                  <div>
                    <span>MONTHLY PRICE</span>
                    <strong>{subscription.monthlyPrice}</strong>
                  </div>
                </div>
              </div>

              <div className="details-actions">
                <button
                  className="details-primary-button"
                  onClick={() => setPauseSubscription(subscription)}
                >
                  PAUSE SUBSCRIPTION
                </button>

                <button
                  className="details-secondary-button"
                  onClick={() => onNavigate("add-newspaper")}
                >
                  CHANGE NEWSPAPER
                </button>

                <button
                  className="details-danger-button"
                  onClick={() => alert("Subscription cancellation requested.")}
                >
                  CANCEL SUBSCRIPTION
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* 3. ADD NEWSPAPER */
    if (page === "add-newspaper") {
      return (
        <div className="customer-page add-newspaper-page">
          <PageHeader
            kicker="NEWSPAPER STAND"
            title="Add a Newspaper"
            description="Discover newspapers available for daily delivery."
            customBack={() => onNavigate("subscriptions")}
          />

          <div className="newspaper-search-box">
            <input type="text" placeholder="Search newspapers..." />
          </div>

          <div className="newspaper-categories">
            <button className="category-active">All</button>
            <button>National</button>
            <button>Regional</button>
            <button>Business</button>
            <button>Sports</button>
            <button>Entertainment</button>
            <button>Local</button>
          </div>

          <div className="newspaper-catalog">
            {[
              ["The Times of India", "English", "₹135 / month"],
              ["Hindustan Times", "English", "₹105 / month"],
              ["Loksatta", "Marathi", "₹90 / month"],
              ["Mumbai Chronicle", "English", "₹120 / month"],
              ["Maharashtra Today", "Marathi", "₹95 / month"],
              ["City Morning", "English", "₹110 / month"],
            ].map((paper, index) => (
              <article className="catalog-card" key={index}>
                <div className="catalog-cover">
                  <span>DAILY</span>
                  <h2>{paper[0]}</h2>
                </div>

                <div className="catalog-information">
                  <span>{paper[1]}</span>
                  <h3>{paper[0]}</h3>
                  <p>
                    Morning newspaper delivered directly to your doorstep.
                  </p>
                  <strong>{paper[2]}</strong>
                  <button
                    onClick={() =>
                      alert(`Subscribed to ${paper[0]} successfully!`)
                    }
                  >
                    SUBSCRIBE
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      );
    }

    /* 4. DELIVERY HISTORY */
    if (page === "delivery-history") {
      return (
        <div className="customer-page">
          <PageHeader
            kicker="DELIVERY LOG"
            title="Delivery History"
            description="A record of every newspaper delivered to your doorstep."
          />

          <div className="placeholder-page-content">
            <HistoryIcon size={40} />
            <h2>Your Delivery Timeline</h2>
            <p>
              Delivery history records your morning deliveries, arrival timestamps,
              delivery partners, and issue tracking.
            </p>
          </div>
        </div>
      );
    }

    /* 5. PAYMENTS */
    if (page === "payments") {
      return (
        <div className="customer-page">
          <PageHeader
            kicker="FINANCIAL STATEMENT"
            title="Payments & Invoices"
            description="Manage your newspaper bills and payment history."
          />

          <div className="placeholder-page-content">
            <PaymentIcon size={40} />
            <h2>Current Bill</h2>
            <div className="placeholder-amount">₹156</div>
            <p>September 1 – September 10, 2026</p>
            <button
              className="details-primary-button"
              onClick={() => alert("Redirecting to secure payment gateway...")}
            >
              PAY NOW
            </button>
          </div>
        </div>
      );
    }

    /* 6. HELP & REQUESTS */
    if (page === "requests") {
      return (
        <div className="customer-page">
          <PageHeader
            kicker="CUSTOMER SERVICE"
            title="Help & Requests"
            description="What do you need help with?"
          />

          <div className="request-options">
            <button
              className="request-option"
              onClick={() => onNavigate("subscriptions")}
            >
              <SubscriptionIcon size={24} />
              <span>
                <strong>Change Newspaper</strong>
                <small>Change the newspaper in your subscription.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => onNavigate("profile")}
            >
              <ProfileIcon size={24} />
              <span>
                <strong>Change Address</strong>
                <small>Update where your newspapers are delivered.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => alert("Delivery time update requested.")}
            >
              <DeliveryVanIcon size={24} />
              <span>
                <strong>Change Delivery Time</strong>
                <small>Request a different delivery time.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => alert("Missed delivery report submitted.")}
            >
              <HelpIcon size={24} />
              <span>
                <strong>Report Missed Delivery</strong>
                <small>Tell us about a newspaper that was missed.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      );
    }

    /* 7. NOTIFICATIONS */
    if (page === "notifications") {
      return (
        <div className="customer-page">
          <PageHeader
            kicker="DAILY UPDATES"
            title="Notifications"
            description="Important updates about your newspapers and account."
          />

          <div className="notification-feed">
            <div className="notification-item unread">
              <NotificationIcon size={22} />
              <div>
                <strong>Today's newspapers were delivered</strong>
                <p>Your newspapers arrived at 7:02 AM.</p>
                <span>Today • 7:05 AM</span>
              </div>
            </div>

            <div className="notification-item unread">
              <PaymentIcon size={22} />
              <div>
                <strong>September invoice generated</strong>
                <p>Your current bill of ₹156 is ready.</p>
                <span>Yesterday • 6:30 PM</span>
              </div>
            </div>

            <div className="notification-item">
              <NewspaperIcon size={22} />
              <div>
                <strong>New Sunday supplement available</strong>
                <p>Your Sunday edition includes a new magazine.</p>
                <span>September 7 • 8:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* 8. PROFILE */
    if (page === "profile") {
      return (
        <div className="customer-page profile-page">
          <PageHeader
            kicker="YOUR ACCOUNT"
            title="Profile Settings"
            description="Manage your personal information and preferences."
          />

          <div className="profile-header-card">
            <div className="profile-avatar">
              {userInitial}
            </div>

            <div>
              <h2>{fullName}</h2>
              <p>{user?.email || "aarav@example.com"}</p>
              <span>{user?.phone || "+91 98765 43210"}</span>
            </div>

            <button onClick={() => onNavigate("edit-profile")}>
              EDIT PROFILE
            </button>
          </div>

          <div className="profile-list">
            <button onClick={() => onNavigate("edit-profile")}>
              <ProfileIcon size={21} />
              <span>
                <strong>Personal Information</strong>
                <small>Name, phone and email</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => alert("Manage addresses")}>
              <DeliveryVanIcon size={21} />
              <span>
                <strong>Saved Addresses</strong>
                <small>Manage your delivery addresses</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => alert("Manage notifications")}>
              <NotificationIcon size={21} />
              <span>
                <strong>Notification Settings</strong>
                <small>Manage your alerts and updates</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => onNavigate("payments")}>
              <PaymentIcon size={21} />
              <span>
                <strong>Payment Methods</strong>
                <small>Manage your payment preferences</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => onNavigate("requests")}>
              <HelpIcon size={21} />
              <span>
                <strong>Help & Support</strong>
                <small>Get assistance from DAILY</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      );
    }

    /* 9. EDIT PROFILE */
    if (page === "edit-profile") {
      return (
        <div className="customer-page edit-profile-page">
          <PageHeader
            kicker="ACCOUNT DETAILS"
            title="Edit Profile"
            description="Keep your DAILY account information up to date."
            customBack={() => onNavigate("profile")}
          />

          <div className="profile-form">
            <div className="form-field">
              <label>FULL NAME</label>
              <input type="text" defaultValue={fullName} />
            </div>

            <div className="form-field">
              <label>PHONE NUMBER</label>
              <input
                type="text"
                defaultValue={user?.phone || "+91 98765 43210"}
              />
            </div>

            <div className="form-field">
              <label>EMAIL</label>
              <input
                type="email"
                defaultValue={user?.email || "aarav@example.com"}
              />
            </div>

            <div className="profile-form-actions">
              <button
                className="form-cancel-button"
                onClick={() => onNavigate("profile")}
              >
                CANCEL
              </button>

              <button
                className="form-save-button"
                onClick={() => {
                  alert("Profile updated successfully.");
                  onNavigate("profile");
                }}
              >
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="customer-dashboard customer-pages-container">
      {/* ==========================================
          HEADER / NAVBAR (TOP PART SHOWN ON EVERY PAGE)
      ========================================== */}
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="menu-toggle-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>

          <div
            className="dashboard-logo"
            onClick={() => onNavigate && onNavigate("dashboard")}
            style={{ cursor: "pointer" }}
            title="Return to Dashboard"
          >
            <img src={rozLogo} alt="ROZ Daily" />
          </div>
        </div>

        <div className="header-right">
          <div className="dashboard-user-chip">
            <div className="user-avatar-circle">
              {userInitial}
            </div>
            <div className="user-details-text">
              <span className="user-greeting-label">Good morning,</span>
              <strong className="user-greeting-name">{firstName}</strong>
            </div>
          </div>

          <button
            className="dashboard-logout-btn"
            onClick={() => {
              if (onMenuClick) {
                onMenuClick("Logout");
              }
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ==========================================
          MAIN SUB-PAGE CONTENT
      ========================================== */}
      <main className="customer-pages-body">
        {renderPageContent()}
      </main>

      {/* ==========================================
          NAVIGATION DRAWER / SIDEBAR
      ========================================== */}
      {menuOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setMenuOpen(false)}
          ></div>

          <aside className="navigation-drawer">
            <div className="drawer-header">
              <div
                className="drawer-brand"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate && onNavigate("dashboard");
                }}
                style={{ cursor: "pointer" }}
              >
                <img src={rozLogo} alt="ROZ" className="drawer-logo-img" />
              </div>

              <button
                className="drawer-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* USER MINI PROFILE IN DRAWER */}
            <div className="drawer-user-profile">
              <div className="drawer-avatar">
                {userInitial}
              </div>
              <div className="drawer-user-info">
                <strong>{fullName}</strong>
                <span>{user?.email || "aarav@example.com"}</span>
              </div>
            </div>

            <nav className="drawer-navigation">
              <button
                className={`drawer-nav-item ${page === "dashboard" ? "active" : ""}`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("dashboard");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <DashboardIcon size={20} />
                </span>
                <span className="drawer-nav-text">Dashboard</span>
              </button>

              <button
                className={`drawer-nav-item ${
                  page === "subscriptions" ||
                  page === "subscription-details" ||
                  page === "add-newspaper"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("subscriptions");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <SubscriptionIcon size={20} />
                </span>
                <span className="drawer-nav-text">My Subscriptions</span>
              </button>

              <button
                className={`drawer-nav-item ${
                  page === "delivery-history" ? "active" : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("delivery-history");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <HistoryIcon size={20} />
                </span>
                <span className="drawer-nav-text">Delivery History</span>
              </button>

              <button
                className={`drawer-nav-item ${
                  page === "payments" ? "active" : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("payments");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <PaymentIcon size={20} />
                </span>
                <span className="drawer-nav-text">Payments & Invoices</span>
              </button>

              <button
                className={`drawer-nav-item ${
                  page === "requests" ? "active" : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("requests");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <HelpIcon size={20} />
                </span>
                <span className="drawer-nav-text">Help & Requests</span>
              </button>

              <button
                className={`drawer-nav-item ${
                  page === "notifications" ? "active" : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("notifications");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <NotificationIcon size={20} />
                </span>
                <span className="drawer-nav-text">Notifications</span>
              </button>

              <button
                className={`drawer-nav-item ${
                  page === "profile" || page === "edit-profile" ? "active" : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate("profile");
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <ProfileIcon size={20} />
                </span>
                <span className="drawer-nav-text">Profile Settings</span>
              </button>
            </nav>

            <div className="drawer-footer">
              <button
                className="drawer-logout-btn"
                onClick={() => {
                  setMenuOpen(false);
                  if (onMenuClick) {
                    onMenuClick("Logout");
                  }
                }}
              >
                <span className="drawer-nav-icon-wrap">
                  <LogoutIcon size={20} />
                </span>
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export default CustomerPages;