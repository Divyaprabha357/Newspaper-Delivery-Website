const db = require("./db");

db.query("SELECT 1 AS test", (err, results) => {
    if (err) {
        console.error("Database test failed:", err);
        return;
    }

    console.log("Database test successful!");
    console.log(results);
    
    db.end();
});