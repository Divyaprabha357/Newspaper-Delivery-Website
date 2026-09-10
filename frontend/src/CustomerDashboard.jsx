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
    ExclamationIcon,
    PauseIcon,
    HelpIcon,
    CheckIcon,
    ArrowRightIcon,
    NewspaperIcon,
    DeliveryVanIcon,
} from "./Icons";
import "./CustomerDashboard.css";

function CustomerDashboard({ user, onMenuClick, onNavigate }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const fullName = user?.name || "Aarav Sharma";
    const firstName = fullName.split(" ")[0];
    const userInitial = firstName.charAt(0).toUpperCase();

    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="customer-dashboard">
            {/* ==========================================
          HEADER / NAVBAR
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

                    <div className="dashboard-logo">
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
          MAIN CONTENT
      ========================================== */}
            <main className="dashboard-main">
                {/* HERO INTRO */}
                <section className="dashboard-intro">
                    <div className="dashboard-badge">
                        CUSTOMER DASHBOARD
                    </div>

                    <h1 className="dashboard-greeting-title">
                        Good morning, {firstName}.
                    </h1>

                    <p className="dashboard-date">
                        {formattedDate}
                    </p>
                </section>

                <div className="editorial-divider"></div>

                {/* TODAY'S DELIVERY FEATURE */}
                <section className="today-delivery-section">
                    <div className="section-heading-row">
                        <div className="section-heading-badge-wrap">
                            <span className="section-heading-kicker">
                                TODAY'S DELIVERY
                            </span>
                        </div>
                        <span className="delivery-status-timestamp">
                            Delivered • 07:02 AM
                        </span>
                    </div>

                    <div className="delivery-feature-card">
                        {/* FRONT-PAGE NEWSPAPER PREVIEW */}
                        <div className="newspaper-feature-panel">
                            <div className="newspaper-masthead-meta">
                                <span className="newspaper-meta-item">THE MORNING EDITION</span>
                                <span className="newspaper-meta-item">VOL. CXXVI</span>
                            </div>

                            <div className="newspaper-title-wrap">
                                <h2 className="newspaper-headline">
                                    THE TIMES OF INDIA
                                </h2>
                            </div>

                            <div className="delivered-badge-container">
                                <div className="delivered-status-pill">
                                    <span className="check-icon-wrap">
                                        <CheckIcon size={14} />
                                    </span>
                                    <span>DELIVERED AT DOORSTEP</span>
                                </div>
                                <span className="delivered-exact-time">7:02 AM IST</span>
                            </div>

                            {/* Signature decorative newspaper lines from App.jsx */}
                            <div className="paper-decor-lines">
                                <span className="decor-line"></span>
                                <span className="decor-line decor-line-short"></span>
                                <span className="decor-line decor-line-medium"></span>
                            </div>
                        </div>

                        {/* DELIVERY PARTNER DETAILS */}
                        <div className="delivery-partner-panel">
                            <div className="partner-card-icon">
                                <DeliveryVanIcon size={24} />
                            </div>

                            <span className="partner-section-label">
                                ASSIGNED DELIVERY PARTNER
                            </span>

                            <h3 className="partner-name">
                                Rahul Patil
                            </h3>

                            <div className="partner-meta-tag">
                                Morning Route • Sector 4
                            </div>

                            <div className="partner-card-divider"></div>

                            <span className="partner-section-label">
                                LOCAL SUPPLIER
                            </span>

                            <p className="supplier-details">
                                <strong>Mumbai Daily Distributors</strong>
                                <br />
                                Hub #14, Central Circle
                            </p>
                        </div>
                    </div>
                </section>

                <div className="editorial-divider"></div>

                {/* DAILY EDITION 3-COLUMN CARDS */}
                <section className="daily-edition-section">
                    <div className="edition-section-top">
                        <h2 className="edition-main-title">
                            Your Daily Edition
                        </h2>
                        <p className="edition-subtitle">
                            Overview of your active subscriptions, billing, and real-time updates.
                        </p>
                    </div>

                    <div className="edition-cards-grid">
                        {/* CARD 1: ACTIVE SUBSCRIPTIONS */}
                        <div className="edition-card">
                            <div className="card-icon-bubble">
                                <NewspaperIcon size={24} />
                            </div>

                            <span className="card-kicker">ACTIVE SUBSCRIPTIONS</span>

                            <h3 className="card-heading">3 Daily Papers</h3>

                            <div className="subscription-items-list">
                                <div className="subscription-row">
                                    <span className="newspaper-name">The Times of India</span>
                                    <span className="status-tag active">Active</span>
                                </div>

                                <div className="subscription-row">
                                    <span className="newspaper-name">Hindustan Times</span>
                                    <span className="status-tag active">Active</span>
                                </div>

                                <div className="subscription-row">
                                    <span className="newspaper-name">Loksatta</span>
                                    <span className="status-tag active">Active</span>
                                </div>
                            </div>

                            <button
                                className="card-action-link"
                                onClick={() => onNavigate ? onNavigate("subscriptions") : setMenuOpen(true)}
                            >
                                <span>Manage Subscriptions</span>
                                <ArrowRightIcon size={14} />
                            </button>
                        </div>

                        {/* CARD 2: CURRENT BILL */}
                        <div className="edition-card highlight-card">
                            <div className="card-icon-bubble">
                                <PaymentIcon size={24} />
                            </div>

                            <span className="card-kicker">CURRENT BILL</span>

                            <div className="bill-amount-display">
                                <span className="currency-symbol">₹</span>
                                <span className="amount-number">156</span>
                            </div>

                            <p className="bill-cycle-info">
                                Cycle: Sep 1 – Sep 10 • <strong>Due Today</strong>
                            </p>

                            <button
                                className="card-primary-cta"
                                onClick={() => onNavigate ? onNavigate("payments") : alert("Redirecting to secure payment...")}
                            >
                                PAY NOW
                            </button>
                        </div>

                        {/* CARD 3: NOTIFICATIONS */}
                        <div className="edition-card">
                            <div className="card-icon-bubble">
                                <NotificationIcon size={24} />
                            </div>

                            <span className="card-kicker">NOTIFICATIONS</span>

                            <h3 className="card-heading">3 New Updates</h3>

                            <ul className="notification-items-list">
                                <li>
                                    <span className="bullet-dot"></span>
                                    <span>Today's papers delivered on time at 7:02 AM.</span>
                                </li>
                                <li>
                                    <span className="bullet-dot"></span>
                                    <span>New Sunday Magazine supplement available.</span>
                                </li>
                                <li>
                                    <span className="bullet-dot"></span>
                                    <span>September invoice statement generated.</span>
                                </li>
                            </ul>

                            <button
                                className="card-action-link"
                                onClick={() => onNavigate ? onNavigate("notifications") : setMenuOpen(true)}
                            >
                                <span>View All Notifications</span>
                                <ArrowRightIcon size={14} />
                            </button>
                        </div>
                    </div>
                </section>

                <div className="editorial-divider"></div>

                {/* QUICK ACTIONS SECTION */}
                <section className="quick-actions-section">
                    <div className="section-heading-badge-wrap">
                        <span className="section-heading-kicker">
                            QUICK ACTIONS
                        </span>
                    </div>

                    <div className="quick-actions-grid">
                        <button
                            className="quick-action-button"
                            onClick={() => onNavigate ? onNavigate("add-newspaper") : null}
                        >
                            <span className="action-icon-wrap">
                                <AddIcon size={18} />
                            </span>
                            <span className="action-label">Add Newspaper</span>
                        </button>

                        <button
                            className="quick-action-button"
                            onClick={() => onNavigate ? onNavigate("requests") : null}
                        >
                            <span className="action-icon-wrap">
                                <ExclamationIcon size={18} />
                            </span>
                            <span className="action-label">Report Missed Delivery</span>
                        </button>

                        <button
                            className="quick-action-button"
                            onClick={() => onNavigate ? onNavigate("subscriptions") : null}
                        >
                            <span className="action-icon-wrap">
                                <PauseIcon size={18} />
                            </span>
                            <span className="action-label">Pause Delivery</span>
                        </button>

                        <button
                            className="quick-action-button"
                            onClick={() => onNavigate ? onNavigate("subscriptions") : setMenuOpen(true)}
                        >
                            <span className="action-icon-wrap">
                                <SubscriptionIcon size={18} />
                            </span>
                            <span className="action-label">Manage Subscriptions</span>
                        </button>
                    </div>
                </section>
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
                            <div className="drawer-brand">
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
                                className="drawer-nav-item active"
                                onClick={() => setMenuOpen(false)}

                            >
                                <span className="drawer-nav-icon-wrap">
                                    <DashboardIcon size={20} />
                                </span>
                                <span className="drawer-nav-text">Dashboard</span>
                            </button>

                            <button
                                className="drawer-nav-item"
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
                                className="drawer-nav-item"
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
                                className="drawer-nav-item"
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
                                className="drawer-nav-item"
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
                                className="drawer-nav-item"
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
                                className="drawer-nav-item"
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

export default CustomerDashboard;