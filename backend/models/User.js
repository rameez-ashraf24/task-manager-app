const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ek email se do account nahi ban sakte
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Yeh khud hi account banne ka time (createdAt) save kar lega
});

module.exports = mongoose.model('User', UserSchema);