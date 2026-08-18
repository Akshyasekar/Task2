const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    status: {
        type: String,
        default: "Pending"
    }

});

module.exports = mongoose.model("Task", taskSchema);
