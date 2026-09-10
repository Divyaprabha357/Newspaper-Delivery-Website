const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// =========================================
// ROOT
// =========================================

app.get("/", (req, res) => {
    res.send("DAILY backend is running!");
});


// =========================================
// DATABASE TEST
// =========================================

app.get("/api/db-test", (req, res) => {

    db.query("SELECT 1 AS test", (err, results) => {

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                success: false,
                message: "Database connection failed"
            });
        }

        res.json({
            success: true,
            message: "Database connected successfully",
            result: results
        });
    });

});


// =========================================
// CUSTOMERS
// =========================================

app.get("/api/customers", (req, res) => {

    const sql = `
        SELECT
            c.customer_id,
            u.name,
            u.email,
            u.phone,
            c.customer_code,
            c.date_of_birth,
            c.status
        FROM customers c
        JOIN users u
            ON c.user_id = u.user_id
        ORDER BY c.customer_id;
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error fetching customers:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch customers"
            });
        }

        res.json({
            success: true,
            customers: results
        });
    });

});


// =========================================
// LOGIN
// =========================================

app.post("/api/login", (req, res) => {

    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {

        return res.status(400).json({
            success: false,
            message: "Email/phone and password are required"
        });

    }

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.phone,
            u.password_hash,
            u.role,
            u.status,
            c.customer_id,
            c.customer_code

        FROM users u

        LEFT JOIN customers c
            ON u.user_id = c.user_id

        WHERE u.email = ?
           OR u.phone = ?

        LIMIT 1;
    `;

    db.query(
        sql,
        [emailOrPhone, emailOrPhone],
        (err, results) => {

            if (err) {

                console.error("Login database error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Server error"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email/phone or password"
                });

            }

            const user = results[0];


            // Temporary password check
            if (user.password_hash !== password) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email/phone or password"
                });

            }


            // Check account status
            if (user.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message: "Your account is not active"
                });

            }


            // Login successful
            res.json({
                success: true,
                message: "Login successful",

                user: {
                    user_id: user.user_id,
                    customer_id: user.customer_id,
                    customer_code: user.customer_code,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });

        }
    );

});


// =========================================
// SUBSCRIPTIONS
// =========================================

app.get("/api/subscriptions", (req, res) => {

    const sql = `
        SELECT
            s.subscription_id,
            s.customer_id,

            s.newspaper_id,
            n.newspaper_name,
            n.language,

            s.supplier_id,
            sp.supplier_name,

            s.address_id,
            ca.address_line,
            ca.city,
            ca.pincode,

            s.start_date,
            s.end_date,
            s.status,
            s.delivery_days,
            s.scheduled_delivery_time,
            s.agreed_price

        FROM subscriptions s

        JOIN newspapers n
            ON s.newspaper_id = n.newspaper_id

        JOIN suppliers sp
            ON s.supplier_id = sp.supplier_id

        JOIN customer_addresses ca
            ON s.address_id = ca.address_id

        ORDER BY s.subscription_id;
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching subscriptions:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch subscriptions"
            });

        }

        res.json({
            success: true,
            subscriptions: results
        });

    });

});


// =========================================
// DELIVERY HISTORY
// =========================================

app.get("/api/delivery-history", (req, res) => {

    const sql = `
        SELECT
            d.delivery_id,
            d.customer_id,
            d.delivery_date,
            d.scheduled_time,
            d.actual_time,
            d.status AS delivery_status,

            di.delivery_item_id,
            di.subscription_id,
            di.status AS item_status,
            di.remarks,

            n.newspaper_id,
            n.newspaper_name,
            n.language,

            sp.supplier_id,
            sp.supplier_name,

            dp.partner_id,
            u.name AS partner_name,

            ca.address_line,
            ca.city,
            ca.pincode

        FROM deliveries d

        JOIN delivery_items di
            ON d.delivery_id = di.delivery_id

        JOIN newspapers n
            ON di.newspaper_id = n.newspaper_id

        JOIN subscriptions s
            ON di.subscription_id = s.subscription_id

        JOIN suppliers sp
            ON s.supplier_id = sp.supplier_id

        JOIN customer_assignments caa
            ON d.assignment_id = caa.assignment_id

        JOIN customer_addresses ca
            ON caa.address_id = ca.address_id

        JOIN delivery_partners dp
            ON d.partner_id = dp.partner_id

        JOIN users u
            ON dp.user_id = u.user_id

        ORDER BY
            d.delivery_date DESC,
            d.scheduled_time DESC;
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching delivery history:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch delivery history"
            });

        }

        res.json({
            success: true,
            deliveries: results
        });

    });

});


// =========================================
// PAYMENTS
// =========================================

app.get("/api/payments", (req, res) => {

    const sql = `
        SELECT
            p.payment_id,
            p.customer_id,

            p.bill_id,
            b.billing_period_start,
            b.billing_period_end,
            b.subtotal,
            b.adjustments,
            b.total_amount,
            b.status AS bill_status,

            p.amount,
            p.payment_method,
            p.transaction_reference,
            p.payment_date,
            p.status AS payment_status

        FROM payments p

        JOIN bills b
            ON p.bill_id = b.bill_id

        ORDER BY p.payment_date DESC;
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching payments:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch payments"
            });

        }

        res.json({
            success: true,
            payments: results
        });

    });

});


// =========================================
// REQUESTS
// =========================================

app.get("/api/requests", (req, res) => {

    const sql = `
        SELECT
            request_id,
            customer_id,
            request_type,
            reference_id,
            description,
            status,
            created_at,
            completed_at

        FROM customer_requests

        ORDER BY created_at DESC;
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching requests:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch requests"
            });

        }

        res.json({
            success: true,
            requests: results
        });

    });

});


// =========================================
// NOTIFICATIONS
// =========================================

app.get("/api/notifications", (req, res) => {

    const sql = `
        SELECT
            n.notification_id,
            n.user_id,
            u.name AS user_name,

            n.notification_type,
            n.title,
            n.message,

            n.reference_type,
            n.reference_id,

            n.is_read,
            n.created_at

        FROM notifications n

        JOIN users u
            ON n.user_id = u.user_id

        ORDER BY n.created_at DESC;
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching notifications:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch notifications"
            });

        }

        res.json({
            success: true,
            notifications: results
        });

    });

});


// =========================================
// START SERVER
// =========================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `DAILY server running on http://localhost:${PORT}`
    );

});