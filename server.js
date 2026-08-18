const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Task = require("./models/Task");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB error:", error);
    });


// ================= REGISTER =================

app.post("/register", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Enter username and password"
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = new User({
            username: username,
            password: hashedPassword
        });

        await user.save();

        res.json({
            message: "Registration successful"
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ================= LOGIN =================

app.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const passwordMatch =
            await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token: token
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ================= GET TASKS =================

app.get("/tasks", auth, async (req, res) => {

    try {

        const tasks = await Task.find({
            userId: req.userId
        });

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: "Cannot get tasks"
        });

    }

});


// ================= CREATE TASK =================

app.post("/tasks", auth, async (req, res) => {

    try {

        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = new Task({

            userId: req.userId,

            title: title,

            description: description,

            status: "Pending"

        });

        await task.save();

        res.json(task);

    } catch (error) {

        res.status(500).json({
            message: "Cannot create task"
        });

    }

});


// ================= UPDATE TASK =================

app.put("/tasks/:id", auth, async (req, res) => {

    try {

        const task = await Task.findOneAndUpdate(

            {
                _id: req.params.id,
                userId: req.userId
            },

            {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status
            },

            {
                new: true
            }

        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {

        res.status(500).json({
            message: "Cannot update task"
        });

    }

});


// ================= DELETE TASK =================

app.delete("/tasks/:id", auth, async (req, res) => {

    try {

        const task = await Task.findOneAndDelete({

            _id: req.params.id,

            userId: req.userId

        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Cannot delete task"
        });

    }

});


// ================= SERVER =================

app.listen(5000, () => {

    console.log(
        "Server running at http://localhost:5000"
    );

});
