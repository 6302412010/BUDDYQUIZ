// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/quizApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Schemas
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String // 'admin' or 'user'
});
const ParticipationSchema = new mongoose.Schema({
    username: String,
    answers: Array
});

const User = mongoose.model("User", UserSchema);
const Participation = mongoose.model("Participation", ParticipationSchema);

// Seed default admin
User.findOne({ username: "admin" }).then(user => {
    if (!user) {
        User.create({ username: "admin", password: "admin123", role: "admin" });
    }
});

// Login API
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// Save participation
app.post("/participate", async (req, res) => {
    const { username, answers } = req.body;
    await Participation.create({ username, answers });
    res.json({ success: true });
});

// Get participation list (admin)
app.get("/participations", async (req, res) => {
    const list = await Participation.find();
    res.json(list);
});

// Clear participation list (admin)
app.delete("/participations", async (req, res) => {
    await Participation.deleteMany({});
    res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
