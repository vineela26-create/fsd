const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors()); // Enable CORS for frontend requests
app.use(express.static("public")); // Serve static files

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// 📌 Serve HTML files
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "home.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));

// 📌 Signup: Store User Data in Firestore (Using GET request)
app.get("/register", async (req, res) => {
    const { name, email, password } = req.query;
    if (!name || !email || !password) {
        return res.send("All fields are required.");
    }

    const userRef = db.collection("users").doc(email);
    const user = await userRef.get();

    if (user.exists) {
        return res.send("User already exists. Try logging in.");
    }

    await userRef.set({ name, email, password });
    res.send("User registered successfully.");
});

// 📌 Login: Retrieve & Verify User Data
app.get("/loginUser", async (req, res) => {
    const { email, password } = req.query;
    if (!email || !password) {
        return res.send("Email and password are required.");
    }

    const userRef = db.collection("users").doc(email);
    const user = await userRef.get();

    if (!user.exists || user.data().password !== password) {
        return res.send("Invalid credentials.");
    }

    res.send(`Welcome, ${user.data().name}!`);
});

// Start the Server
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
