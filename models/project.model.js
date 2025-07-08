const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed', 'Blocked'],
        default: 'To Do'
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "task"
        }
    ]
}, {
    timestamps: true
});

const project = mongoose.model("project", projectSchema);

module.exports = { project };