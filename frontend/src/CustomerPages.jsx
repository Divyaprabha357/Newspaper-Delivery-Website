import React, { useEffect, useState } from "react";
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
  ArrowRightIcon,
  NewspaperIcon,
  DeliveryVanIcon,
  HelpIcon,
  ExclamationIcon,
  CheckIcon,
} from "./Icons";
import "./CustomerDashboard.css";
import "./CustomerPages.css";
import { customerApi } from "./api";

function CustomerPages({ page, user, onNavigate, onMenuClick }) {
  // Navigation & Drawer
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile / User State
  const [currentUser, setCurrentUser] = useState(() => {
    return user || JSON.parse(localStorage.getItem("rozUser")) || {};
  });

  const fullName = currentUser.name || "Customer";
  const firstName = fullName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();
  const customerId = currentUser.customer_id;

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [pauseSubscription, setPauseSubscription] = useState(null);
  const [pauseDuration, setPauseDuration] = useState("7 days");

  // Delivery History State
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("ALL");

  // Payments State
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  // Add Newspaper State
  const [newspaperSearch, setNewspaperSearch] = useState("");
  const [newspaperCategory, setNewspaperCategory] = useState("All");
  const [catalogNewspapers, setCatalogNewspapers] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Requests Modal State
  const [activeRequestModal, setActiveRequestModal] = useState(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const refreshSubscriptions = async () => {
    if (!customerId) return;
    setLoadingSubscriptions(true);
    setSubscriptionError("");
    try {
      const data = await customerApi.subscriptions(customerId);
      setSubscriptions((data.subscriptions || []).map((s) => ({
        id: s.subscription_id, customerId: s.customer_id, newspaperId: s.newspaper_id,
        name: s.newspaper_name, language: s.language || "—", edition: "Daily edition",
        supplier: s.supplier_name || "—", deliveryTime: formatTime(s.scheduled_delivery_time),
        price: formatMoney(s.agreed_price), monthlyPrice: calculateMonthlyPrice(s),
        status: formatStatus(s.status), started: formatDate(s.start_date), endDate: s.end_date,
        address: [s.address_line, s.city, s.pincode].filter(Boolean).join(", "),
        deliveryDays: s.delivery_days || "Every day",
      })));
    } catch (error) {
      setSubscriptions([]);
      setSubscriptionError(error.message || "Unable to load subscriptions.");
    } finally { setLoadingSubscriptions(false); }
  };

  const updateSubscriptionStatus = async (subscription, status) => {
    setActionError(""); setActionLoading(true);
    try {
      await customerApi.updateSubscription(customerId, subscription.id, status);
      setPauseSubscription(null);
      await refreshSubscriptions();
      if (selectedSubscription?.id === subscription.id) setSelectedSubscription({ ...selectedSubscription, status: formatStatus(status) });
    } catch (error) { setActionError(error.message || "Unable to update the subscription."); }
    finally { setActionLoading(false); }
  };

  // Fetch Customer Requests
  useEffect(() => {
    if (page !== "requests") return;

    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        setRequestsError("");

        const response = await fetch(
          `http://localhost:5000/api/requests?customer_id=${customerId}`
        );
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.requests)) {
          const customerRequests = data.requests.filter(
            (request) => Number(request.customer_id) === Number(customerId)
          );
          setRequests(customerRequests);
        } else {
          setRequests([]);
          setRequestsError(data.message || "Unable to load your requests.");
        }
      } catch (error) {
        console.error("Requests fetch error:", error);
        setRequestsError("Unable to connect to the DAILY request service.");
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, [page, customerId]);

  useEffect(() => {
    if (page !== "add-newspaper") return;
    setCatalogLoading(true); setCatalogError("");
    customerApi.newspapers(customerId)
      .then((data) => setCatalogNewspapers(data.newspapers || []))
      .catch((error) => { setCatalogNewspapers([]); setCatalogError(error.message || "Unable to load newspapers."); })
      .finally(() => setCatalogLoading(false));
  }, [page, customerId]);

  useEffect(() => {
    if (page !== "notifications") return;
    setNotificationsLoading(true); setNotificationsError("");
    customerApi.notifications(customerId)
      .then((data) => setNotifications(data.notifications || []))
      .catch((error) => { setNotifications([]); setNotificationsError(error.message || "Unable to load notifications."); })
      .finally(() => setNotificationsLoading(false));
  }, [page, customerId]);

  useEffect(() => {
    if (!customerId) return;
    customerApi.profile(customerId).then((data) => {
      const updated = { ...currentUser, ...data.user };
      setCurrentUser(updated);
      localStorage.setItem("rozUser", JSON.stringify(updated));
    }).catch(() => {});
  }, [customerId]);

  // Edit Profile Form State
  const [editName, setEditName] = useState(fullName);
  const [editPhone, setEditPhone] = useState(currentUser.phone || "+91 98765 43210");
  const [editEmail, setEditEmail] = useState(currentUser.email || "aarav@example.com");

  // Format Helpers
  const formatTime = (time) => {
    if (!time) return "—";
    const parts = String(time).split(":");
    if (parts.length < 2) return time;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return { day: "", date: "" };
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "long" }),
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  };

  const formatStatus = (status) => {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const calculateMonthlyPrice = (sub) => {
    const dailyPrice = Number(sub.agreed_price);
    if (isNaN(dailyPrice)) return "₹120";
    const days = sub.delivery_days
      ? String(sub.delivery_days).split(",").filter(Boolean).length
      : 7;
    const monthly = dailyPrice * (days > 0 ? days : 7) * 4;
    return `₹${monthly.toFixed(0)}`;
  };

  // Fetch Subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoadingSubscriptions(true);
        setSubscriptionError("");
        const response = await fetch(
          `http://localhost:5000/api/subscriptions?customer_id=${customerId}`
        );
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.subscriptions)) {
          const formatted = data.subscriptions.map((s) => ({
            id: s.subscription_id,
            customerId: s.customer_id,
            newspaperId: s.newspaper_id,
            name: s.newspaper_name,
            language: s.language || "English",
            edition: "Mumbai Edition",
            supplier: s.supplier_name || "Mumbai Daily Distributors",
            partner: "Rahul Patil",
            deliveryTime: formatTime(s.scheduled_delivery_time || "07:00:00"),
            price: `₹${Number(s.agreed_price || 4.5).toFixed(2)}`,
            monthlyPrice: calculateMonthlyPrice(s),
            status: formatStatus(s.status),
            started: formatDate(s.start_date || "2026-09-01"),
            endDate: s.end_date,
            address: s.address_line ? `${s.address_line}, ${s.city} - ${s.pincode}` : "Sector 4, Central Mumbai",
            deliveryDays: s.delivery_days || "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
          }));
          setSubscriptions(formatted);
        } else {
          // Fallback demo data
          setSubscriptions([
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
              address: "Flat 402, Sea Green Apts, Worli, Mumbai - 400018",
              deliveryDays: "Every day",
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
              address: "Flat 402, Sea Green Apts, Worli, Mumbai - 400018",
              deliveryDays: "Every day",
            },
            {
              id: 3,
              name: "Loksatta",
              language: "Marathi",
              edition: "Mumbai Edition",
              supplier: "Western News Distributors",
              partner: "Amit Kulkarni",
              deliveryTime: "7:15 AM",
              price: "₹3.00",
              monthlyPrice: "₹90",
              status: "Active",
              started: "01 September 2026",
              address: "Flat 402, Sea Green Apts, Worli, Mumbai - 400018",
              deliveryDays: "Every day",
            },
          ]);
        }
      } catch (error) {
        console.error("Subscription fetch error:", error);
        setSubscriptions([]);
        setSubscriptionError("Unable to load your subscriptions.");
        return;
        // Legacy visual sample retained below but unreachable when the live API is unavailable.
        setSubscriptions([
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
        ]);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    fetchSubscriptions();
  }, [customerId]);

  // Fetch Delivery History
  useEffect(() => {
    if (page !== "delivery-history") return;

    const fetchDeliveryHistory = async () => {
      try {
        setDeliveryLoading(true);
        setDeliveryError("");
        const response = await fetch(
          `http://localhost:5000/api/delivery-history?customer_id=${customerId}`
        );
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.deliveries)) {
          setDeliveries(data.deliveries);
        } else {
          // Fallback mock history
          setDeliveries([
            {
              delivery_item_id: 101,
              newspaper_name: "The Times of India",
              language: "English",
              delivery_date: "2026-09-16",
              scheduled_time: "07:00:00",
              actual_time: "07:02:00",
              item_status: "DELIVERED",
              delivery_status: "DELIVERED",
              partner_name: "Rahul Patil",
              supplier_name: "Mumbai Daily Distributors",
              remarks: "Delivered to door hook",
            },
            {
              delivery_item_id: 102,
              newspaper_name: "Hindustan Times",
              language: "English",
              delivery_date: "2026-09-16",
              scheduled_time: "07:00:00",
              actual_time: "06:58:00",
              item_status: "DELIVERED",
              delivery_status: "DELIVERED",
              partner_name: "Rahul Patil",
              supplier_name: "Mumbai Daily Distributors",
            },
            {
              delivery_item_id: 103,
              newspaper_name: "Loksatta",
              language: "Marathi",
              delivery_date: "2026-09-16",
              scheduled_time: "07:15:00",
              actual_time: "07:15:00",
              item_status: "DELIVERED",
              delivery_status: "DELIVERED",
              partner_name: "Amit Kulkarni",
              supplier_name: "Western News Distributors",
            },
            {
              delivery_item_id: 104,
              newspaper_name: "The Times of India",
              language: "English",
              delivery_date: "2026-09-15",
              scheduled_time: "07:00:00",
              actual_time: "07:05:00",
              item_status: "DELIVERED",
              delivery_status: "DELIVERED",
              partner_name: "Rahul Patil",
              supplier_name: "Mumbai Daily Distributors",
            },
            {
              delivery_item_id: 105,
              newspaper_name: "Hindustan Times",
              language: "English",
              delivery_date: "2026-09-14",
              scheduled_time: "07:00:00",
              actual_time: null,
              item_status: "NOT_DELIVERED",
              delivery_status: "NOT_DELIVERED",
              partner_name: "Rahul Patil",
              supplier_name: "Mumbai Daily Distributors",
              remarks: "Rain delay - credited back",
            },
          ]);
        }
      } catch (error) {
        console.error("Delivery history fetch error:", error);
        setDeliveryError("Unable to load live delivery history.");
        setDeliveries([]);
      } finally {
        setDeliveryLoading(false);
      }
    };

    fetchDeliveryHistory();
  }, [page, customerId]);

  // Fetch Payments
  useEffect(() => {
    if (page !== "payments") return;

    const fetchPayments = async () => {
      try {
        setPaymentsLoading(true);
        setPaymentsError("");

        const response = await fetch(
          `http://localhost:5000/api/payments?customer_id=${customerId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch payments");
        }

        // The current backend returns all payment rows, so filter them
        // here until the API itself applies the customer_id condition.
        const customerPayments = (data.payments || []).filter(
          (payment) => Number(payment.customer_id) === Number(customerId)
        );

        setPayments(customerPayments);
      } catch (error) {
        console.error("Payment fetch error:", error);
        setPaymentsError("Unable to load payment history from DAILY.");
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [page, customerId]);

  const formatMoney = (amount) => {
    const value = Number(amount);
    if (Number.isNaN(value)) return "₹0.00";
    return `₹${value.toFixed(2)}`;
  };

  const getPaymentStatus = (payment) => {
    const paymentStatus = String(payment.payment_status || "").toUpperCase();
    const billStatus = String(payment.bill_status || "").toUpperCase();

    if (paymentStatus === "SUCCESS" || billStatus === "PAID") return "PAID";
    if (paymentStatus === "FAILED") return "FAILED";
    if (billStatus === "PENDING") return "PENDING";
    return paymentStatus || billStatus || "PENDING";
  };

  const latestPayment = payments[0] || null;
  const pendingPayment = payments.find(
    (payment) => getPaymentStatus(payment) === "PENDING"
  );

  const currentBillAmount = pendingPayment
    ? Number(pendingPayment.total_amount || pendingPayment.amount || 0)
    : 0;

  // Delivery Status & Symbols
  const getDeliveryStatus = (delivery) => {
    const itemStatus = delivery.item_status?.toUpperCase();
    const deliveryStatus = delivery.delivery_status?.toUpperCase();
    if (itemStatus === "DELIVERED") return "DELIVERED";
    if (itemStatus === "NOT_SUPPLIED" || deliveryStatus === "PARTIALLY_DELIVERED") return "NOT-SUPPLIED";
    if (itemStatus === "NOT_DELIVERED" || deliveryStatus === "NOT_DELIVERED") return "MISSED";
    if (itemStatus === "RESCHEDULED") return "RESCHEDULED";
    return "PENDING";
  };

  const getStatusSymbol = (status) => {
    switch (status) {
      case "DELIVERED":
        return "✓";
      case "MISSED":
        return "×";
      case "NOT-SUPPLIED":
        return "!";
      case "RESCHEDULED":
        return "↻";
      default:
        return "•";
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (deliveryFilter === "ALL") return true;
    return getDeliveryStatus(d) === deliveryFilter;
  });

  const deliveredCount = deliveries.filter((d) => getDeliveryStatus(d) === "DELIVERED").length;
  const missedCount = deliveries.filter((d) => getDeliveryStatus(d) === "MISSED").length;
  const notSuppliedCount = deliveries.filter((d) => getDeliveryStatus(d) === "NOT-SUPPLIED").length;
  const totalDeliveries = deliveries.length;

  const filteredCatalog = catalogNewspapers.filter((paper) => {
    const matchesCategory = newspaperCategory === "All" || paper.publication_type === newspaperCategory;
    const matchesSearch =
      paper.newspaper_name.toLowerCase().includes(newspaperSearch.toLowerCase()) ||
      String(paper.language || "").toLowerCase().includes(newspaperSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Common Page Header Component
  const PageHeader = ({ kicker, title, description }) => (
    <div className="customer-page-header">
      <span className="customer-page-kicker">{kicker}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );

  // Render Sub-Pages
  const renderPageContent = () => {
    // 1. MY SUBSCRIPTIONS
    if (page === "subscriptions") {
      return (
        <div className="customer-page subscriptions-page">
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

          {loadingSubscriptions && (
            <div className="delivery-history-state">
              <HistoryIcon size={40} />
              <h2>Loading subscriptions</h2>
              <p>Fetching your active newspaper subscriptions.</p>
            </div>
          )}

          {!loadingSubscriptions && subscriptionError && (
            <div className="delivery-history-state">
              <HelpIcon size={40} />
              <h2>Unable to load subscriptions</h2>
              <p>{subscriptionError}</p>
            </div>
          )}

          {!loadingSubscriptions && !subscriptionError && subscriptions.length === 0 && (
            <div className="delivery-history-state">
              <NewspaperIcon size={40} />
              <h2>No subscriptions yet</h2>
              <p>Add your first newspaper to start your DAILY morning delivery.</p>
              <button
                className="details-primary-button"
                onClick={() => onNavigate("add-newspaper")}
              >
                ADD NEWSPAPER
              </button>
            </div>
          )}

          {!loadingSubscriptions && !subscriptionError && subscriptions.length > 0 && (
            <div className="subscription-list">
              {subscriptions.map((sub) => (
                <article className="subscription-card" key={sub.id}>
                  <div className="subscription-cover">
                    <div className="cover-top">DAILY EDITION</div>
                    <div className="cover-rule"></div>
                    <h2>{sub.name}</h2>
                    <div className="cover-bottom">{sub.edition}</div>
                  </div>

                  <div className="subscription-main">
                    <div className="subscription-heading-row">
                      <div>
                        <span className="subscription-language">{sub.language}</span>
                        <h2>{sub.name}</h2>
                        <span className="subscription-edition">{sub.edition}</span>
                      </div>
                      <span className="subscription-status">
                        <span className="status-dot"></span>
                        {sub.status}
                      </span>
                    </div>

                    <div className="subscription-details-grid">
                      <div className="subscription-detail">
                        <span>SUPPLIER</span>
                        <strong>{sub.supplier}</strong>
                      </div>
                      <div className="subscription-detail">
                        <span>DELIVERY PARTNER</span>
                        <strong>{sub.partner}</strong>
                      </div>
                      <div className="subscription-detail">
                        <span>DELIVERY TIME</span>
                        <strong>{sub.deliveryTime}</strong>
                      </div>
                      <div className="subscription-detail">
                        <span>PRICE</span>
                        <strong>
                          {sub.price}
                          <small> / day</small>
                        </strong>
                      </div>
                    </div>

                    <div className="subscription-footer">
                      <span className="subscription-start-date">Since {sub.started}</span>
                      <div className="subscription-actions">
                        <button
                          className="subscription-view-button"
                          onClick={() => {
                            setSelectedSubscription(sub);
                            onNavigate("subscription-details");
                          }}
                        >
                          VIEW
                          <ArrowRightIcon size={14} />
                        </button>
                        <button
                          className="subscription-pause-button"
                          onClick={() => sub.status === "Paused" ? updateSubscriptionStatus(sub, "ACTIVE") : setPauseSubscription(sub)}
                          disabled={actionLoading || sub.status === "Cancelled"}
                        >
                          <PauseIcon size={15} />
                          {sub.status === "Paused" ? "RESUME" : "PAUSE"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pause Modal */}
          {pauseSubscription && (
            <div
              className="customer-modal-overlay"
              onClick={() => setPauseSubscription(null)}
            >
              <div
                className="customer-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-icon">
                  <PauseIcon size={22} />
                </div>
                <span className="modal-kicker">PAUSE SUBSCRIPTION</span>
                <h2>Pause {pauseSubscription.name}?</h2>
                <p>Choose how long you would like to pause your newspaper delivery.</p>
                <select
                  className="modal-select"
                  value={pauseDuration}
                  onChange={(e) => setPauseDuration(e.target.value)}
                >
                  <option value="3 days">3 days (Weekend Pause)</option>
                  <option value="7 days">7 days (1 Week)</option>
                  <option value="14 days">14 days (2 Weeks)</option>
                  <option value="30 days">30 days (1 Month)</option>
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
                      updateSubscriptionStatus(pauseSubscription, "PAUSED");
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "PAUSING..." : "CONFIRM PAUSE"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 2. SUBSCRIPTION DETAILS
    if (page === "subscription-details") {
      const sub = selectedSubscription || subscriptions[0];

      if (!sub) {
        return (
          <div className="customer-page subscription-details-page">
            <button
              className="page-back-button"
              onClick={() => onNavigate("subscriptions")}
            >
              ← BACK TO SUBSCRIPTIONS
            </button>
            <div className="delivery-history-state">
              <NewspaperIcon size={40} />
              <h2>No subscription selected</h2>
              <p>Please select a subscription from your list.</p>
            </div>
          </div>
        );
      }

      return (
        <div className="customer-page subscription-details-page">
          <PageHeader
            kicker="SUBSCRIPTION"
            title={sub.name}
            description="Your complete subscription information and delivery schedule."
          />

          <button
            className="page-back-button"
            onClick={() => onNavigate("subscriptions")}
          >
            ← BACK TO SUBSCRIPTIONS
          </button>

          <div className="details-layout">
            <div className="details-newspaper-preview">
              <div className="large-newspaper-cover">
                <span>DAILY EDITION</span>
                <h2>{sub.name}</h2>
                <div></div>
                <strong>{sub.edition}</strong>
              </div>
              <span className="subscription-status large-status">
                <span className="status-dot"></span>
                {sub.status}
              </span>
            </div>

            <div className="details-information">
              <div className="details-section">
                <span className="details-section-kicker">DELIVERY INFORMATION</span>
                <div className="details-info-grid">
                  <div>
                    <span>SUPPLIER</span>
                    <strong>{sub.supplier}</strong>
                  </div>
                  <div>
                    <span>DELIVERY PARTNER</span>
                    <strong>{sub.partner}</strong>
                  </div>
                  <div>
                    <span>DELIVERY TIME</span>
                    <strong>{sub.deliveryTime}</strong>
                  </div>
                  <div>
                    <span>DELIVERY FREQUENCY</span>
                    <strong>{sub.deliveryDays || "Every day"}</strong>
                  </div>
                  <div>
                    <span>DELIVERY ADDRESS</span>
                    <strong>{sub.address || "Sector 4, Worli, Mumbai"}</strong>
                  </div>
                  <div>
                    <span>LANGUAGE</span>
                    <strong>{sub.language}</strong>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <span className="details-section-kicker">BILLING & DURATION</span>
                <div className="details-info-grid">
                  <div>
                    <span>START DATE</span>
                    <strong>{sub.started}</strong>
                  </div>
                  <div>
                    <span>RENEWAL DATE</span>
                    <strong>01 October 2026</strong>
                  </div>
                  <div>
                    <span>DAILY PRICE</span>
                    <strong>{sub.price}</strong>
                  </div>
                  <div>
                    <span>ESTIMATED MONTHLY</span>
                    <strong>{sub.monthlyPrice}</strong>
                  </div>
                </div>
              </div>

              <div className="details-actions">
                <button
                  className="details-primary-button"
                  onClick={() => sub.status === "Paused" ? updateSubscriptionStatus(sub, "ACTIVE") : setPauseSubscription(sub)}
                  disabled={actionLoading || sub.status === "Cancelled"}
                >
                  {sub.status === "Paused" ? "RESUME SUBSCRIPTION" : "PAUSE SUBSCRIPTION"}
                </button>
                <button
                  className="details-secondary-button"
                  onClick={() => onNavigate("add-newspaper")}
                >
                  CHANGE NEWSPAPER
                </button>
                <button
                  className="details-danger-button"
                  onClick={() => updateSubscriptionStatus(sub, "CANCELLED")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "UPDATING..." : "CANCEL SUBSCRIPTION"}
                </button>
              </div>
            </div>
          </div>

          {/* Modal */}
          {pauseSubscription && (
            <div
              className="customer-modal-overlay"
              onClick={() => setPauseSubscription(null)}
            >
              <div
                className="customer-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-icon">
                  <PauseIcon size={22} />
                </div>
                <span className="modal-kicker">PAUSE SUBSCRIPTION</span>
                <h2>Pause {pauseSubscription.name}?</h2>
                <p>Choose how long you would like to pause your newspaper delivery.</p>
                <select
                  className="modal-select"
                  value={pauseDuration}
                  onChange={(e) => setPauseDuration(e.target.value)}
                >
                  <option value="3 days">3 days (Weekend)</option>
                  <option value="7 days">7 days (1 Week)</option>
                  <option value="14 days">14 days (2 Weeks)</option>
                  <option value="30 days">30 days (1 Month)</option>
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
                      updateSubscriptionStatus(pauseSubscription, "PAUSED");
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "PAUSING..." : "CONFIRM PAUSE"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 3. ADD NEWSPAPER / STAND
    if (page === "add-newspaper") {
      return (
        <div className="customer-page add-newspaper-page">
          <PageHeader
            kicker="NEWSPAPER STAND"
            title="Add a Newspaper"
            description="Discover newspapers available for daily morning delivery in your area."
          />

          <button
            className="page-back-button"
            onClick={() => onNavigate("subscriptions")}
          >
            ← BACK TO SUBSCRIPTIONS
          </button>

          <div className="newspaper-search-box">
            <input
              type="text"
              placeholder="Search by title or language (e.g., Hindu, Marathi, Times)..."
              value={newspaperSearch}
              onChange={(e) => setNewspaperSearch(e.target.value)}
            />
          </div>

          <div className="newspaper-categories">
            {["All", "National", "Regional", "Business", "Sports", "Entertainment", "Local"].map(
              (cat) => (
                <button
                  key={cat}
                  className={newspaperCategory === cat ? "category-active" : ""}
                  onClick={() => setNewspaperCategory(cat)}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {catalogLoading ? (
            <div className="delivery-history-state"><NewspaperIcon size={40} /><h2>Loading newspapers</h2><p>Finding papers available from your suppliers.</p></div>
          ) : catalogError ? (
            <div className="delivery-history-state"><HelpIcon size={40} /><h2>Unable to load newspapers</h2><p>{catalogError}</p></div>
          ) : filteredCatalog.length === 0 ? (
            <div className="delivery-history-state">
              <NewspaperIcon size={40} />
              <h2>No newspapers found</h2>
              <p>No newspapers match "{newspaperSearch}" in category "{newspaperCategory}".</p>
            </div>
          ) : (
            <div className="newspaper-catalog">
              {filteredCatalog.map((paper) => (
                <article className="catalog-card" key={`${paper.newspaper_id}-${paper.supplier_id}`}>
                  <div className="catalog-cover">
                    <span>DAILY STAND</span>
                    <h2>{paper.newspaper_name}</h2>
                  </div>

                  <div className="catalog-information">
                    <span>{paper.language} • {paper.publication_type}</span>
                    <h3>{paper.newspaper_name}</h3>
                    <p>Morning edition delivered directly to your doorstep before 7:00 AM.</p>
                    <strong>{formatMoney(paper.price_per_delivery)} / day</strong>
                    <button
                      disabled={actionLoading}
                      onClick={async () => {
                        setActionLoading(true); setActionError("");
                        try {
                          await customerApi.subscribe({ customer_id: customerId, newspaper_id: paper.newspaper_id, supplier_id: paper.supplier_id });
                          await refreshSubscriptions();
                          onNavigate("subscriptions");
                        } catch (error) { setActionError(error.message || "Unable to add this newspaper."); }
                        finally { setActionLoading(false); }
                      }}
                    >
                      {actionLoading ? "ADDING..." : "SUBSCRIBE"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 4. DELIVERY HISTORY
    if (page === "delivery-history") {
      return (
        <div className="customer-page delivery-history-page">
          <PageHeader
            kicker="DELIVERY LOG"
            title="Delivery History"
            description="A record of every newspaper delivered to your doorstep."
          />

          {deliveryLoading && (
            <div className="delivery-history-state">
              <HistoryIcon size={40} />
              <h2>Loading delivery history</h2>
              <p>We are retrieving your recent newspaper deliveries.</p>
            </div>
          )}

          {!deliveryLoading && deliveryError && (
            <div className="delivery-history-state">
              <HelpIcon size={40} />
              <h2>Unable to load history</h2>
              <p>{deliveryError}</p>
              <button
                className="details-primary-button"
                onClick={() => window.location.reload()}
              >
                TRY AGAIN
              </button>
            </div>
          )}

          {!deliveryLoading && !deliveryError && (
            <>
              <div className="delivery-history-toolbar">
                <div className="delivery-filter-label">
                  <span>SHOWING</span>
                  <strong>{filteredDeliveries.length} deliveries</strong>
                </div>

                <div className="delivery-filters">
                  {[
                    ["ALL", "All"],
                    ["DELIVERED", "Delivered"],
                    ["MISSED", "Missed"],
                    ["NOT-SUPPLIED", "Not Supplied"],
                    ["RESCHEDULED", "Rescheduled"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={`delivery-filter ${deliveryFilter === value ? "active" : ""}`}
                      onClick={() => setDeliveryFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="delivery-history-content">
                <section className="delivery-timeline">
                  <div className="timeline-heading">
                    <div>
                      <span>YOUR MORNING PAPERS</span>
                      <h2>Delivery Timeline</h2>
                    </div>
                    <HistoryIcon size={26} />
                  </div>

                  {filteredDeliveries.length === 0 && (
                    <div className="delivery-history-state">
                      <HistoryIcon size={40} />
                      <h2>No deliveries found</h2>
                      <p>There are no delivery records matching this filter.</p>
                    </div>
                  )}

                  <div className="timeline-list">
                    {filteredDeliveries.map((delivery) => {
                      const status = getDeliveryStatus(delivery);
                      const formattedDate = formatDeliveryDate(delivery.delivery_date);
                      const statusClass = status.toLowerCase().replace(/[\s_]+/g, "-");

                      return (
                        <article
                          className="delivery-timeline-item"
                          key={delivery.delivery_item_id || delivery.delivery_id}
                        >
                          <div className="timeline-date">
                            <span>{formattedDate.day}</span>
                            <strong>{formattedDate.date}</strong>
                          </div>

                          <div className="timeline-line">
                            <div className={`timeline-status-dot ${statusClass}`}>
                              {getStatusSymbol(status)}
                            </div>
                          </div>

                          <div className="timeline-delivery">
                            <div className="timeline-delivery-header">
                              <div>
                                <span className="delivery-language">{delivery.language}</span>
                                <h3>{delivery.newspaper_name}</h3>
                              </div>
                              <span className={`delivery-status ${statusClass}`}>
                                {status}
                              </span>
                            </div>

                            <div className="timeline-delivery-details">
                              <div>
                                <span>SCHEDULED</span>
                                <strong>{formatTime(delivery.scheduled_time)}</strong>
                              </div>
                              <div>
                                <span>DELIVERED AT</span>
                                <strong>{formatTime(delivery.actual_time)}</strong>
                              </div>
                              <div>
                                <span>DELIVERY PARTNER</span>
                                <strong>{delivery.partner_name || "Rahul Patil"}</strong>
                              </div>
                              <div>
                                <span>SUPPLIER</span>
                                <strong>{delivery.supplier_name || "Mumbai Daily"}</strong>
                              </div>
                            </div>

                            {delivery.remarks && (
                              <div className="delivery-remark">
                                <span>DELIVERY NOTE</span>
                                <p>{delivery.remarks}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <aside className="delivery-history-summary">
                  <span className="summary-kicker">DELIVERY SUMMARY</span>
                  <h2>Your Record</h2>

                  <div className="delivery-summary-stat">
                    <span>TOTAL RECORDS</span>
                    <strong>{totalDeliveries}</strong>
                  </div>
                  <div className="delivery-summary-stat">
                    <span>DELIVERED</span>
                    <strong>{deliveredCount}</strong>
                  </div>
                  <div className="delivery-summary-stat">
                    <span>MISSED</span>
                    <strong>{missedCount}</strong>
                  </div>
                  <div className="delivery-summary-stat">
                    <span>NOT SUPPLIED</span>
                    <strong>{notSuppliedCount}</strong>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      );
    }

    // 5. PAYMENTS & INVOICES
    if (page === "payments") {
      return (
        <div className="customer-page payments-page">
          <PageHeader
            kicker="FINANCIAL STATEMENT"
            title="Payments & Invoices"
            description="Manage your newspaper bills, invoices, and payment history."
          />

          {paymentsLoading && (
            <div className="delivery-history-state">
              <PaymentIcon size={40} />
              <h2>Loading payment history</h2>
              <p>We are retrieving your DAILY bills and transactions.</p>
            </div>
          )}

          {!paymentsLoading && paymentsError && (
            <div className="delivery-history-state">
              <HelpIcon size={40} />
              <h2>Unable to load payments</h2>
              <p>{paymentsError}</p>
              <button
                className="details-primary-button"
                onClick={() => window.location.reload()}
              >
                TRY AGAIN
              </button>
            </div>
          )}

          {!paymentsLoading && !paymentsError && (
            <>
              <div className="payment-current-bill">
                <div>
                  <span>{pendingPayment ? "CURRENT BILL DUE" : "LATEST BILL"}</span>
                  <h2>
                    {pendingPayment
                      ? formatMoney(currentBillAmount)
                      : latestPayment
                        ? formatMoney(latestPayment.total_amount || latestPayment.amount)
                        : "₹0.00"}
                  </h2>
                  <p>
                    {pendingPayment
                      ? `Billing period: ${formatDate(pendingPayment.billing_period_start)} – ${formatDate(pendingPayment.billing_period_end)}`
                      : latestPayment
                        ? `Billing period: ${formatDate(latestPayment.billing_period_start)} – ${formatDate(latestPayment.billing_period_end)} • ${getPaymentStatus(latestPayment)}`
                        : "No payment records are available for your account."}
                  </p>
                </div>

                {pendingPayment && (
                  <button
                    className="details-primary-button"
                    onClick={() => setPayModalOpen(true)}
                  >
                    PAY NOW
                  </button>
                )}
              </div>

              <div className="payment-history-section">
                <span className="details-section-kicker">PAYMENT HISTORY</span>

                {payments.length === 0 ? (
                  <div className="delivery-history-state">
                    <PaymentIcon size={40} />
                    <h2>No payment records</h2>
                    <p>Your completed and pending payment transactions will appear here.</p>
                  </div>
                ) : (
                  <div className="subscription-list" style={{ marginTop: "20px" }}>
                    {payments.map((payment) => {
                      const status = getPaymentStatus(payment);
                      const statusClass = status.toLowerCase();

                      return (
                        <article
                          className="timeline-delivery payment-history-card"
                          key={payment.payment_id}
                          style={{ margin: "0 0 15px 0" }}
                        >
                          <div className="timeline-delivery-header">
                            <div>
                              <span className="delivery-language">
                                TRANSACTION #{payment.transaction_reference || payment.payment_id}
                              </span>
                              <h3>
                                {formatDate(payment.billing_period_start)} – {formatDate(payment.billing_period_end)}
                              </h3>
                            </div>
                            <span className={`delivery-status ${statusClass}`}>
                              {status}
                            </span>
                          </div>

                          <div className="timeline-delivery-details">
                            <div>
                              <span>BILL AMOUNT</span>
                              <strong>{formatMoney(payment.total_amount)}</strong>
                            </div>
                            <div>
                              <span>PAYMENT AMOUNT</span>
                              <strong>{formatMoney(payment.amount)}</strong>
                            </div>
                            <div>
                              <span>PAYMENT METHOD</span>
                              <strong>{payment.payment_method || "—"}</strong>
                            </div>
                            <div>
                              <span>PAYMENT DATE</span>
                              <strong>{formatDate(payment.payment_date)}</strong>
                            </div>
                          </div>

                          <div className="payment-card-footer">
                            <span>
                              Bill status: {String(payment.bill_status || "—").toUpperCase()}
                            </span>
                            {payment.transaction_reference && (
                              <strong>{payment.transaction_reference}</strong>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {payModalOpen && pendingPayment && (
            <div
              className="customer-modal-overlay"
              onClick={() => setPayModalOpen(false)}
            >
              <div
                className="customer-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-icon">
                  <PaymentIcon size={22} />
                </div>
                <span className="modal-kicker">SECURE PAYMENT</span>
                <h2>Pay {formatMoney(currentBillAmount)}</h2>
                <p>Select a payment method to continue with your DAILY bill.</p>

                <select className="modal-select" defaultValue="UPI">
                  <option value="UPI">UPI</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NETBANKING">Net Banking</option>
                </select>

                <div className="modal-actions">
                  <button
                    className="modal-cancel-button"
                    onClick={() => setPayModalOpen(false)}
                  >
                    CANCEL
                  </button>
                  <button
                    className="modal-primary-button"
                    onClick={() => {
                      setPayModalOpen(false);
                      alert("Payment initiated successfully. Connect your payment gateway here for live transactions.");
                    }}
                  >
                    CONTINUE PAYMENT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 6. HELP & REQUESTS
    if (page === "requests") {
      const getRequestLabel = (type) => {
        if (!type) return "Service Request";
        return String(type)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
      };

      const getRequestStatus = (status) => {
        if (!status) return "SUBMITTED";
        return String(status).toUpperCase().replace(/\s+/g, "_");
      };

      const isStatusComplete = (status) => {
        const normalized = getRequestStatus(status);
        return normalized === "COMPLETED" || normalized === "RESOLVED" || normalized === "CLOSED";
      };

      return (
        <div className="customer-page requests-page">
          <PageHeader
            kicker="CUSTOMER SERVICE"
            title="Help & Requests"
            description="Manage your doorstep delivery preferences and request adjustments."
          />

          <div className="request-options">
            <button
              className="request-option"
              onClick={() => onNavigate("subscriptions")}
            >
              <SubscriptionIcon size={24} />
              <span>
                <strong>Change Newspaper</strong>
                <small>Switch or add editions to your daily morning delivery.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => setActiveRequestModal("address")}
            >
              <DeliveryVanIcon size={24} />
              <span>
                <strong>Change Delivery Address</strong>
                <small>Update your doorstep delivery address or gate instructions.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => setActiveRequestModal("time")}
            >
              <HistoryIcon size={24} />
              <span>
                <strong>Change Delivery Time</strong>
                <small>Request earlier or custom morning delivery timing.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => setActiveRequestModal("missed")}
            >
              <ExclamationIcon size={24} />
              <span>
                <strong>Report Missed Delivery</strong>
                <small>Report a missing paper for immediate replacement or billing credit.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button
              className="request-option"
              onClick={() => setActiveRequestModal("track")}
            >
              <CheckIcon size={24} />
              <span>
                <strong>Track Request Status</strong>
                <small>View submitted requests and follow their current progress.</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>
          </div>

          {/* Request Modal */}
          {activeRequestModal && (
            <div
              className="customer-modal-overlay"
              onClick={() => setActiveRequestModal(null)}
            >
              <div
                className="customer-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-icon">
                  {activeRequestModal === "track" ? (
                    <CheckIcon size={22} />
                  ) : (
                    <HelpIcon size={22} />
                  )}
                </div>

                <span className="modal-kicker">
                  {activeRequestModal === "track"
                    ? "REQUEST TRACKER"
                    : "CUSTOMER SERVICE REQUEST"}
                </span>

                {activeRequestModal === "track" ? (
                  <>
                    <h2>Your Request Status</h2>
                    <p>Track the requests submitted for your DAILY account.</p>

                    {requestsLoading && (
                      <div className="request-tracker-state">
                        <HistoryIcon size={30} />
                        <strong>Loading your requests...</strong>
                      </div>
                    )}

                    {!requestsLoading && requestsError && (
                      <div className="request-tracker-state">
                        <HelpIcon size={30} />
                        <strong>{requestsError}</strong>
                      </div>
                    )}

                    {!requestsLoading && !requestsError && requests.length === 0 && (
                      <div className="request-tracker-state">
                        <CheckIcon size={30} />
                        <strong>No requests found</strong>
                        <span>Your submitted service requests will appear here.</span>
                      </div>
                    )}

                    {!requestsLoading && !requestsError && requests.length > 0 && (
                      <div className="request-tracker-list">
                        {requests.map((request) => {
                          const status = getRequestStatus(request.status);
                          const completed = isStatusComplete(request.status);

                          return (
                            <article
                              className="request-tracker-card"
                              key={request.request_id}
                            >
                              <div className="request-tracker-card-header">
                                <div>
                                  <span>REQUEST #{request.request_id}</span>
                                  <h3>{getRequestLabel(request.request_type)}</h3>
                                </div>
                                <strong className={completed ? "completed" : ""}>
                                  {status.replace(/_/g, " " )}
                                </strong>
                              </div>

                              <div className="request-progress">
                                <div className="request-progress-step active">
                                  <span>1</span>
                                  <small>Submitted</small>
                                </div>
                                <div className={`request-progress-line ${status !== "SUBMITTED" ? "active" : ""}`}></div>
                                <div className={`request-progress-step ${status !== "SUBMITTED" ? "active" : ""}`}>
                                  <span>2</span>
                                  <small>Under Review</small>
                                </div>
                                <div className={`request-progress-line ${status === "IN_PROGRESS" || completed ? "active" : ""}`}></div>
                                <div className={`request-progress-step ${status === "IN_PROGRESS" || completed ? "active" : ""}`}>
                                  <span>3</span>
                                  <small>In Progress</small>
                                </div>
                                <div className={`request-progress-line ${completed ? "active" : ""}`}></div>
                                <div className={`request-progress-step ${completed ? "active" : ""}`}>
                                  <span>4</span>
                                  <small>Completed</small>
                                </div>
                              </div>

                              <div className="request-tracker-details">
                                <div>
                                  <span>TYPE</span>
                                  <strong>{getRequestLabel(request.request_type)}</strong>
                                </div>
                                <div>
                                  <span>SUBMITTED</span>
                                  <strong>{formatDate(request.created_at)}</strong>
                                </div>
                                <div>
                                  <span>REFERENCE</span>
                                  <strong>{request.reference_id || "—"}</strong>
                                </div>
                                <div>
                                  <span>LAST STATUS</span>
                                  <strong>{status.replace(/_/g, " ")}</strong>
                                </div>
                              </div>

                              {request.description && (
                                <p className="request-tracker-description">
                                  {request.description}
                                </p>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}

                    <div className="modal-actions">
                      <button
                        className="modal-primary-button"
                        onClick={() => setActiveRequestModal(null)}
                      >
                        CLOSE
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2>
                      {activeRequestModal === "address" && "Update Delivery Address"}
                      {activeRequestModal === "time" && "Request Delivery Time Change"}
                      {activeRequestModal === "missed" && "Report Missed Paper"}
                    </h2>
                    <p>
                      {activeRequestModal === "address" && "Enter your new delivery address and wing/flat number:"}
                      {activeRequestModal === "time" && "Select your preferred delivery time window:"}
                      {activeRequestModal === "missed" && "Which newspaper was missed today?"}
                    </p>

                    {activeRequestModal === "time" && (
                      <select className="modal-select">
                        <option>Before 6:30 AM</option>
                        <option>6:30 AM - 7:00 AM (Recommended)</option>
                        <option>7:00 AM - 7:30 AM</option>
                      </select>
                    )}

                    {activeRequestModal === "missed" && (
                      <select className="modal-select">
                        <option>The Times of India (Today)</option>
                        <option>Hindustan Times (Today)</option>
                        <option>Loksatta (Today)</option>
                      </select>
                    )}

                    {activeRequestModal === "address" && (
                      <input
                        type="text"
                        className="modal-select"
                        placeholder="e.g., Flat 501, Tower B, Sea Green Apts, Worli"
                        defaultValue={currentUser.address || ""}
                      />
                    )}

                    <div style={{ marginTop: "14px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--gray)", display: "block", marginBottom: "6px" }}>
                        ADDITIONAL NOTES (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        className="modal-select"
                        placeholder="Leave notes for the delivery partner..."
                        value={requestNotes}
                        onChange={(e) => setRequestNotes(e.target.value)}
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="modal-cancel-button"
                        onClick={() => setActiveRequestModal(null)}
                      >
                        CANCEL
                      </button>
                      <button
                        className="modal-primary-button"
                        onClick={async () => {
                          const requestType = { address: "ADDRESS_CHANGE", time: "DELIVERY_TIME_CHANGE", missed: "MISSED_DELIVERY" }[activeRequestModal];
                          setActionLoading(true); setActionError("");
                          try {
                            await customerApi.createRequest({ customer_id: customerId, request_type: requestType, description: requestNotes || "Submitted from the customer portal" });
                            const data = await customerApi.requests(customerId);
                            setRequests(data.requests || []);
                            setActiveRequestModal(null); setRequestNotes("");
                          } catch (error) { setActionError(error.message || "Unable to submit your request."); }
                          finally { setActionLoading(false); }
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "SUBMITTING..." : "SUBMIT REQUEST"}
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

    // 7. NOTIFICATIONS
    if (page === "notifications") {
      return (
        <div className="customer-page notifications-page">
          <PageHeader
            kicker="DAILY UPDATES"
            title="Notifications"
            description="Important updates about your newspaper delivery and account."
          />

          <div className="notification-feed">
            {notificationsLoading && <div className="delivery-history-state"><NotificationIcon size={40} /><h2>Loading notifications</h2></div>}
            {!notificationsLoading && notificationsError && <div className="delivery-history-state"><HelpIcon size={40} /><h2>Unable to load notifications</h2><p>{notificationsError}</p></div>}
            {!notificationsLoading && !notificationsError && notifications.length === 0 && <div className="delivery-history-state"><NotificationIcon size={40} /><h2>No notifications yet</h2><p>Account and delivery updates will appear here.</p></div>}
            {!notificationsLoading && !notificationsError && notifications.map((notification) => (
              <button
                type="button"
                className={`notification-item ${Number(notification.is_read) ? "" : "unread"}`}
                key={notification.notification_id}
                onClick={async () => {
                  if (Number(notification.is_read)) return;
                  try {
                    await customerApi.markNotificationRead(customerId, notification.notification_id);
                    setNotifications((items) => items.map((item) => item.notification_id === notification.notification_id ? { ...item, is_read: 1 } : item));
                  } catch (error) { setNotificationsError(error.message || "Unable to update notification."); }
                }}
              >
                <NotificationIcon size={22} />
                <div><strong>{notification.title}</strong><p>{notification.message}</p><span>{formatDate(notification.created_at)}</span></div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 8. PROFILE
    if (page === "profile") {
      return (
        <div className="customer-page profile-page">
          <PageHeader
            kicker="YOUR ACCOUNT"
            title="Profile Settings"
            description="Manage your personal information, address, and account preferences."
          />

          <div className="profile-header-card">
            <div className="profile-avatar">{userInitial}</div>
            <div>
              <h2>{fullName}</h2>
              <p>{currentUser.email || "aarav@example.com"}</p>
              <span>{currentUser.phone || "+91 98765 43210"}</span>
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
                <small>Name, contact phone number and primary email</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => setActiveRequestModal("address")}>
              <DeliveryVanIcon size={21} />
              <span>
                <strong>Delivery Addresses</strong>
                <small>Flat 402, Sea Green Apts, Worli, Mumbai - 400018</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => onNavigate("notifications")}>
              <NotificationIcon size={21} />
              <span>
                <strong>Notification Settings</strong>
                <small>SMS alerts, WhatsApp delivery receipts, invoice reminders</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => onNavigate("payments")}>
              <PaymentIcon size={21} />
              <span>
                <strong>Payment Methods & Invoices</strong>
                <small>UPI, credit cards, auto-debit and past bills</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>

            <button onClick={() => onNavigate("requests")}>
              <HelpIcon size={21} />
              <span>
                <strong>Help & Support</strong>
                <small>Contact your local delivery hub or submit reports</small>
              </span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      );
    }

    // 9. EDIT PROFILE
    if (page === "edit-profile") {
      return (
        <div className="customer-page edit-profile-page">
          <PageHeader
            kicker="ACCOUNT DETAILS"
            title="Edit Profile"
            description="Keep your DAILY customer information up to date."
          />

          <button
            className="page-back-button"
            onClick={() => onNavigate("profile")}
          >
            ← BACK TO PROFILE
          </button>

          <div className="profile-form">
            <div className="form-field">
              <label>FULL NAME</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>PHONE NUMBER</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>EMAIL</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
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
                onClick={async () => {
                  setActionLoading(true);
                  setActionError("");
                  try {
                    await customerApi.updateProfile(customerId, { name: editName, phone: editPhone, email: editEmail });
                  const updated = {
                    ...currentUser,
                    name: editName,
                    phone: editPhone,
                    email: editEmail,
                  };
                  setCurrentUser(updated);
                  localStorage.setItem("rozUser", JSON.stringify(updated));
                  onNavigate("profile");
                  } catch (error) { setActionError(error.message || "Unable to update your profile."); }
                  finally { setActionLoading(false); }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Main Return
  return (
    <div className="customer-dashboard customer-pages-container">
      {/* HEADER */}
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
            <div className="user-avatar-circle">{userInitial}</div>
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

      {/* PAGE CONTENT */}
      <main className="customer-pages-body">
        {actionError && <div className="delivery-history-state"><HelpIcon size={24} /><p>{actionError}</p></div>}
        {renderPageContent()}
      </main>

      {/* NAVIGATION DRAWER */}
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

            {/* DRAWER USER */}
            <div className="drawer-user-profile">
              <div className="drawer-avatar">{userInitial}</div>
              <div className="drawer-user-info">
                <strong>{fullName}</strong>
                <span>{currentUser.email || "aarav@example.com"}</span>
              </div>
            </div>

            {/* NAVIGATION */}
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
                className={`drawer-nav-item ${page === "delivery-history" ? "active" : ""}`}
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
                className={`drawer-nav-item ${page === "payments" ? "active" : ""}`}
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
                className={`drawer-nav-item ${page === "requests" ? "active" : ""}`}
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
                className={`drawer-nav-item ${page === "notifications" ? "active" : ""}`}
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
                <span className="drawer-nav-text">Profile</span>
              </button>
            </nav>

            {/* LOGOUT */}
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
