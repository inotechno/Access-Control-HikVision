import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import logger from "./logger.js";
import connection from "./db.js"; // Pastikan ini benar
import crypto from "crypto";
import bcrypt from "bcrypt";
import EventEmitter from "events";

// Inisialisasi aplikasi Express
const app = express();
const eventEmitter = new EventEmitter(); // Inisialisasi EventEmitter

const upload = multer();

app.use(bodyParser.json()); // Untuk menangani JSON jika diperlukan

// Fungsi untuk menghasilkan password acak
function generateRandomPassword(length = 12) {
    return crypto.randomBytes(length).toString("hex");
}

// Fungsi untuk menjalankan query database secara asynchronous
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Listener untuk event 'receivedLog'
eventEmitter.on("receivedLog", async (parsedEventLog) => {
    console.log("Received log:", parsedEventLog);
    try {
        const ipAddress = parsedEventLog.ipAddress;
        const eventData = parsedEventLog.AccessControllerEvent;
        const dateTime = new Date(parsedEventLog.dateTime);

        // Format the date as 'YYYY-MM-DDTHH:mm:ss' in the original timezone
        const offset = dateTime.getTimezoneOffset() * 60000; // Get the timezone offset in milliseconds
        const localISOTime = new Date(dateTime.getTime() - offset)
            .toISOString()
            .slice(0, 19);

        const timestamp = localISOTime.replace("T", " ");

        const siteId = 1;
        const siteLongitude = "106.798818";
        const siteLatitude = "-6.263122";

        const machineResults = await queryAsync(
            "SELECT * FROM machines WHERE ip_address = ?",
            [ipAddress]
        );
        const machine = machineResults[0];
        if (!machine) {
            logger.error("Machine with IP address " + ipAddress + " not found");
            return;
        }

        const employeeNoString = eventData.employeeNoString;
        if (!employeeNoString) {
            logger.error(
                "Invalid employeeNoString, timestamp: " +
                    timestamp +
                    " IP address: " +
                    ipAddress
            );

            return;
        }

        let userResults = await queryAsync(
            "SELECT * FROM users WHERE username = ?",
            [employeeNoString]
        );

        let user = userResults[0];
        let employeeId = null; // Variable to hold employee_id

        if (!user) {
            const password = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await queryAsync(
                "INSERT INTO users (username, name, email, password, password_string, status) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    employeeNoString,
                    eventData.name || null,
                    employeeNoString + "@example.com",
                    hashedPassword,
                    password,
                    1,
                ]
            );

            const userId = result.insertId; // Get the inserted user ID
            // Assign role (assuming a role assignment table exists)
            await queryAsync(
                "INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (?, ?, ?)",
                [5, "App\\Models\\User", userId] // Assuming role ID 2 corresponds to 'Employee'
            );

            // Create employee record
            await queryAsync(
                "INSERT INTO employees (id, user_id, created_at) VALUES (?, ?, ?)",
                [employeeNoString, userId, new Date()]
            );

            // Retrieve the employee record just created
            const employeeResults = await queryAsync(
                "SELECT * FROM employees WHERE user_id = ?",
                [userId]
            );

            const employee = employeeResults[0];
            employeeId = employee.id;

            userResults = await queryAsync(
                "SELECT * FROM users WHERE username = ?",
                [employeeNoString]
            );

            user = userResults[0];
            logger.info("User created:", { username: user.username });
        } else {
            // Fetch the existing employee record associated with this user
            const employeeResults = await queryAsync(
                "SELECT * FROM employees WHERE user_id = ?",
                [user.id]
            );
            const employee = employeeResults[0];
            employeeId = employee.id;
        }

        const attendanceResults = await queryAsync(
            "SELECT * FROM attendances WHERE uid = ? AND machine_id = ?",
            [eventData.serialNo, machine.id]
        );
        const attendance = attendanceResults[0];
        if (!attendance) {
            const result = await queryAsync(
                "INSERT INTO attendances (uid, employee_id, machine_id, attendance_method_id, site_id, timestamp, longitude, latitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    eventData.serialNo,
                    employeeId,
                    machine.id,
                    1,
                    siteId,
                    timestamp,
                    siteLongitude,
                    siteLatitude,
                ]
            );
            logger.info("Attendance created: Attendance ID " + result.insertId);
        } else {
            logger.info(
                "Attendance already exists for UID " + eventData.serialNo
            );
        }
    } catch (error) {
        // Log error with detailed information
        logger.error("Error in event processing:", {
            error: error.message,
            stack: error.stack,
        });
    }
});

// Endpoint untuk menangani multipart/form-data
app.post("/access-control", upload.any(), async (req, res) => {
    try {
        let eventLog = req.body.event_log;
        console.log("Received event log:", eventLog);

        if (!eventLog) {
            logger.error("Event log is undefined");
            return res.status(400).json({ error: "Event log is missing" });
        }

        // Parse the JSON string into an object
        let parsedEventLog;
        try {
            parsedEventLog = JSON.parse(eventLog);
        } catch (parseError) {
            logger.error("Error parsing JSON:", { error: parseError });
            return res.status(400).json({ error: "Invalid JSON format" });
        }

        // Emit the event for processing
        eventEmitter.emit("receivedLog", parsedEventLog);

        res.json({ status: "Event received and processing started" });
    } catch (error) {
        // Log error with detailed information
        logger.error("Error occurred:", {
            error: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Internal server error" });
    }
});

// Mulai server
app.listen(7560, "192.168.20.165", () => {
    console.log("Server started at 192.168.20.165:7560");
});
