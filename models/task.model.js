const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        required: true
    },
    team : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
        required: true
    },
    owners: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    ],
    tags: {
        type: [String]
    },
    timeToComplete: {
        type: Number,
        required: true
    },
    status: {
        type:String,
        enum: ['To Do', 'In Progress', 'Completed', 'Blocked'],
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: ["High", "Medium", "Low"]
    }
}, {
    timestamps: true
});

const task = mongoose.model("task", taskSchema);

module.exports = { task };