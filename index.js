const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const { project } = require("./models/project.model");
const { task } = require("./models/task.model");
const { team } = require("./models/team.model");
const { user } = require("./models/user.model");
const { signup, login } = require("./controllers/authHandler");
const { authenticateToken } = require("./middleware/auth");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on PORT 3000");
    })
});

// function to add  projects
async function addProjects(data) {
    if (typeof(data) === "object" && Array.isArray(data)) {
        let projects = await project.insertMany(data);
        return projects ;
    } else if (typeof(data) === "object" && !Array.isArray(data)) {
        let projectDetails = await new project(data).save();
        return projectDetails 
    }
}

// function to get projects
async function getAllProjects(userId) {
    let userDetails = await user.findById(userId).populate("projects").populate("tasks").populate("teams");
    let projects = await project.find({ _id: { $in: userDetails.projects.map(ele => ele._id)}}).populate("tasks");
    return projects;
}

// function to get user details
async function getUserDetails(userId) {
    let userData = await user.findById(userId).populate("projects").populate("tasks");
    if (! userData) {
        return null;
    }
    return userData ;
}

// function to fetch tasks
async function getAllTasks(userId) {
    let tasks = await task.find({ owners: userId });
    return tasks;
}

// function to add teams
async function addNewTeam(teamData) {
    let teamMembers = await user.find({ email: { $in: teamData.members }});
    let teamMemberIds = teamMembers.map(obj => obj._id);
    let addedTeam = await new team({...teamData, members: teamMemberIds }).save();
    return addedTeam;
}
// function to update user details
async function updateUserDetails(userId, updatedData) {
    let updatedUserDetails = await user.findByIdAndUpdate(userId, updatedData, { new: true }).populate("tasks").populate("projects").populate("teams");
    if (! updatedUserDetails) {
        return null;
    }
    return updatedUserDetails;
}

// Routes for authentication
app.post("/signup", signup);
app.post("/login", login);

// POST Route to add project
app.post("/projects/new", authenticateToken, async (req, res) => {
    let data = req.body;
    try {
        let response = await addProjects(data);
        return res.status(201).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

// POST Route to add new team
app.post("/team/new", authenticateToken, async (req, res) => {
    let teamData = req.body;
    try {
        let response = await addNewTeam(teamData);
        return res.status(201).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Route to update user details
app.post("/user/details/update", authenticateToken, async (req, res) => {
    let userId = req.user.id;
    let updatedData = req.body;
    try {
        let response = await updateUserDetails(userId, updatedData);
        if (response === null) {
            return res.status(404).json({ message: "User not found"});
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Route to fetch all projects
app.get("/projects", authenticateToken, async (req, res) => {
    let userId = req.user.id;
    try {
        let response = await getAllProjects(userId);
        if (response.length === 0) {
            return res.status(404).json({ message: "No projects found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET route to get user details
app.get("/user/details", authenticateToken, async (req, res) => {
    let userId = req.user.id;
    try {
        let response = await getUserDetails(userId);
        if (response === null) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET route to get all tasks of a user
app.get("/tasks", authenticateToken, async (req, res) => {
    let userId = req.user.id;
    try {
        let response = await getAllTasks(userId);
        if (response.length === 0) {
            res.status(404).json({ message: "No tasks found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

