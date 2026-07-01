const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Yeh line is task ko us user se jorray gi jis ne ise banaya hai
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false // Shuru mein task hamesha uncompleted (false) hoga
    }
}, {
    timestamps: true // Banne aur update hone ka time khud save hoga
});

module.exports = mongoose.model('Task', TaskSchema);