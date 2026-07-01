const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Jo model humne part 1 mein banaya tha

// REGISTER / SIGNUP API
// Route: POST http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check karna ke user ne saari cheezan bheji hain ya nahi
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Meherbani kar ke saari fields fill karein.' });
        }

        // 2. Check karna ke kya yeh email pehle se database mein hai?
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Yeh email pehle se registered hai.' });
        }

        // 3. Password ko hash (encrypt) karna
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Naya User database mein save karna
        const newUser = new User({
            name,
            email,
            password: hashedPassword // Hash kiya hua password save hoga
        });

        await newUser.save();

        res.status(201).json({ message: 'User register ho gaya hai! ✅' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server mein koi masla aa gaya hai.' });
    }
});

const jwt = require('jsonwebtoken'); // Upar import karne ke liye (ya file ke shuru mein bhi rakh sakte hain)

// LOGIN API
// Route: POST http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check karna ke user ne email aur password dono likhe hain
        if (!email || !password) {
            return res.status(400).json({ message: 'Meherbani kar ke email aur password dono likhein.' });
        }

        // 2. Check karna ke kya yeh email database mein exist karti hai?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Ghalat credentials (Email ya Password ghalat hai).' });
        }

        // 3. Password check karna (jo password user ne likha kya woh database wale hashed password se match karta hai?)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Ghalat credentials (Email ya Password ghalat hai).' });
        }

        // 4. JWT Token generate karna
        const token = jwt.sign(
            { userId: user._index || user._id }, // Token ke andar user ki ID chhupa di
            process.env.JWT_SECRET,             // Khufia chabi (Secret Key)
            { expiresIn: '1d' }                  // Token 1 din baad expire ho jayega
        );

        // 5. Response mein token aur user ka data bhejna
        res.status(200).json({
            message: 'Login kamyab raha! ✅',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server mein koi masla aa gaya hai.' });
    }
});

module.exports = router;