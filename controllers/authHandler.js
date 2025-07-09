const { user } = require("../models/user.model");
const { mongoose } = require("mongoose")
;const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const signup = async (req, res) => {
    const { username, password, name, email, phone, projects, tasks } = req.body;
    try {
         const existingUser = await user.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: "User with this username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const addedUser = await new user({ name: name, email: email, phone: phone, username: username, password: hashedPassword, projects: projects, tasks: tasks }).save();
    return res.status(201).json({ message: "Congratulations! You have signed-up successfully", addedUser });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
    
}

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        let userDetails = await user.findOne({ username });
        if (! userDetails) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        let isPasswordValid = await bcrypt.compare(password, userDetails.password );
        if (! isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        let token = jwt.sign({ id: userDetails._id, name: userDetails.name }, JWT_SECRET_KEY, { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { signup, login };