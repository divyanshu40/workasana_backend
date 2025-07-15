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

// function to get projects by token details
async function getAllProjects(userId) {
    let userDetails = await user.findById(userId).populate("projects").populate("tasks").populate("teams");
    let projects = await project.find({ _id: { $in: userDetails.projects.map(ele => ele._id)}}).populate("tasks");
    return projects;
}

// function to get user details by token details
async function getUserDetails(userId) {
    let userData = await user.findById(userId).populate("projects").populate("tasks").populate("teams");
    if (! userData) {
        return null;
    }
    return userData ;
}

// function to fetch tasks by token details
async function getAllTasks(userId) {
    let tasks = await task.find({ owners: userId }).populate("project").populate("team").populate("owners");
    return tasks;
}

// function to add teams
async function addNewTeam(teamData) {
    let teamMembers = await user.find({ email: { $in: teamData.members }});
    let teamMemberIds = teamMembers.map(obj => obj._id);
    let addedTeam = await new team({...teamData, members: teamMemberIds }).save();
    return addedTeam;
}
// function to update user details by id
async function updateUserDetails(userId, updatedData) {
    let updatedUserDetails = await user.findByIdAndUpdate(userId, updatedData, { new: true }).populate("tasks").populate("projects").populate("teams");
    if (! updatedUserDetails) {
        return null;
    }
    return updatedUserDetails;
}

// function to get users on the basis of some data
async function getUsersByData(data) {
    let users = await user.find(data).populate("projects").populate("tasks").populate("teams");
    return users;
}

// function to get team details by id
async function getTeamDetailsById(teamId) {
    let teamDetails = await team.findById(teamId).populate("members");
    if (! teamDetails) {
        return null;
    }
    return teamDetails;
}

// function to get project details by id
async function getProjectDetailsById(projectId) {
    let projectDetails = await project.findById(projectId).populate("tasks");
    if (! projectId) {
        return null;
    }
    return projectDetails;
}

// function to get task details by id
async function getTaskDetailsById(taskId) {
    let taskDetails = await task.findById(taskId).populate("project").populate("team").populate("owners");
    if (! taskDetails) {
        return null;
    }
    return taskDetails;
}

// function to update project details by id
async function updateProjectDetails(projectId, updatedData) {
    let updatedProject = await project.findByIdAndUpdate(projectId, updatedData, { new: true }).populate("tasks");
    if (! updatedProject) {
        return null;
    }
    return updatedProject
}

// function to updated team details by id
async function updateTeamDetails(teamId, updatedData) {
    let updatedTeam = await team.findByIdAndUpdate(teamId, updatedData, { new: true }).populate("members");
    if ( ! updatedTeam) {
        return null;
    }
    return updatedTeam;
}

// function to update task details by id
async function updateTaskDetails(taskId, updatedData) {
    let updatedTask = await task.findByIdAndUpdate(taskId, updatedData, { new: true }).populate("project").populate("team").populate("owners");
    if (! updatedTask) {
        return null;
    }
    return updatedTask;
}

// function to add task
async function addNewTask(taskData) {
    let addedTask = await new task(taskData).save();
    return addedTask;
}

// function to update user details by some user data
async function updatedUserDetailsByData(userData, updatedData) {
    let updatedUser = await user.findOneAndUpdate(userData, updatedData, { new: true }).populate("projects").populate("tasks").populate("teams");
    if (! updatedUser) {
        return null
    }
    return updatedUser;
}

// function to get user details by id
async function getUserDetailsById(userId) {
    let userDetails = await user.findById(userId);
    if (! userDetails) {
        return null;
    }
    return userDetails;
}

// function to update user details by id
async function updateUserDetailsById(userId, userData) {
    let updatedUser = await user.findByIdAndUpdate(userId, userData, { new: true }).populate("projects").populate("tasks").populate("teams");
    if (! updatedUser) {
        return null;
    }
    return updatedUser;
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

// POST Route to update user details (find user by token)
app.post("/user/update", authenticateToken, async (req, res) => {
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

// POST route update project details by id
app.post("/project/update/:id", authenticateToken, async (req, res) => {
    let projectId = req.params.id;
    let updatedData = req.body;
    try {
        let response = await updateProjectDetails(projectId, updatedData);
        if (response === null) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// POST route update team details by id
app.post("/team/update/:id", authenticateToken, async (req, res) => {
    let teamId = req.params.id;
    let updatedData = req.body;
    try {
        let response = await updateTeamDetails(teamId, updatedData);
        if (response === null) {
            return res.status(404).json({ message: "Team not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// POST route to update task details by id
app.post("/task/update/:id", authenticateToken, async (req, res) => {
    let taskId = req.params.id;
    let updatedData = req.body;
    try {
        let response = await updateTaskDetails(taskId, updatedData);
        if (response === null) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// POST route add new task
app.post("/task/new", authenticateToken, async (req, res) => {
    let taskData = req.body;
    try {
        let response = await addNewTask(taskData);
        return res.status(201).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// POST route to  update user details on the basis of some data
app.post("/user/update/details",authenticateToken, async (req, res) => {
    let userData = req.body.userData;
    let updatedData = req.body.updatedData;
    try {
        let response = await updatedUserDetailsByData(userData, updatedData);
        if (response === null) {
            res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// POST route to update user details by user id
app.post("/user/updated/:id", authenticateToken, async (req, res) => {
    let userId = req.params.id;
    let updatedData = req.body;
    try {
        let response = await getUserDetailsById(userId, updatedData);
        if (response === null) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
})

// GET Route to fetch all projects of user by token details
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

// GET route to get user details by token details
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

// GET route to get all tasks of a user by token details
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

// GET route to get users on the basis of some data
app.get("/users/details", authenticateToken, async (req, res) => {
    let data = req.body;
    try {
        let response = await getUsersByData(data);
        if (response.length === 0) {
           return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET route to get team details by id
app.get("/team/details/:id", authenticateToken, async (req, res) => {
    let teamId = req.params.id;
    try {
        let response = await getTeamDetailsById(teamId);
        if (response === null) {
            return res.status(404).json({ message: "Team not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET route to get project details by id
app.get("/project/details/:id", authenticateToken, async (req, res) => {
    let projectId = req.params.id;
    try {
        let response = await getProjectDetailsById(projectId);
        if (response === null) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Route to task details by id
app.get("/task/details/:id", authenticateToken, async (req, res) => {
    let taskId = req.params.id;
    try {
        let response = await getTaskDetailsById(taskId);
        if (response === null) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// GET route to get user details by id
app.get("/user/details/:id", authenticateToken, async (req, res) => {
    let userId = req.params.id;
    try {
        let response = await getUserDetailsById(userId);
        if (response === null) {
            return res.status(404).json({ message: "User not found"});
        }
        return res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});