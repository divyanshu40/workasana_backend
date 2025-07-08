const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const { project } = require("./models/project.model");
const { task } = require("./models/task.model");
const { team } = require("./models/team.model");
const { user } = require("./models/user.model");

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
        return { projects };
    } else if (typeof(data) === "object" && !Array.isArray(data)) {
        let projectDetails = await new project(data).save();
        return { projectDetails }
    }
}

// function to get projects
async function getAllProjects() {
    let projects = await project.find();
    return { projects };
}

// POST Route to add project
app.post("/projects/new", async (req, res) => {
    let data = req.body;
    try {
        let response = await addProjects(data);
        return res.status(201).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
}); 

// GET Route to fetch all projects
app.get("/projects", async (req, res) => {
    try {
        let response = await getAllProjects();
        if (response.projects.length === 0) {
            return res.status(404).json({ message: "No projects found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});