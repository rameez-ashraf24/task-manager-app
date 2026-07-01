const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware'); // Kal wala chowkidar (middleware)

// 1. CREATE A NEW TASK
// Route: POST http://localhost:5000/api/tasks
// Note: Isme humne 'auth' middleware lagaya hai taakeh sirf logged-in user hi task bana sake
router.post('/', auth, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Task ka title likhna zaroori hai!' });
        }

        // Naya task banana aur usme user ki ID (jo token se mili) daalna
        const newTask = new Task({
            title,
            description,
            user: req.user.userId // Yeh req.user kal wale authMiddleware se aa raha hai
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server mein koi masla aa gaya hai.' });
    }
});

// 2. GET ALL TASKS OF LOGGED-IN USER
// Route: GET http://localhost:5000/api/tasks
// Note: Isme bhi 'auth' middleware lagega taakeh sirf user ko uske apne tasks milein
router.get('/', auth, async (req, res) => {
    try {
        // Database mein dhoondna jahan user ki ID match karti ho
        const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 }); // sort se naya task sab se upar aayega
        
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server mein koi masla aa gaya hai.' });
    }
});

// 3. UPDATE A TASK (Edit Title/Description or Mark Completed)
// Route: PUT http://localhost:5000/api/tasks/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        // 1. Pehle check karna ke kya yeh task database mein maujood hai?
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task nahi mila!' });
        }

        // 2. Security Check: Kya yeh task usi user ka hai jo ise edit kar raha hai?
        if (task.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Access denied! Aap kisi aur ka task edit nahi kar sakte.' });
        }

        // 3. Jo jo cheez user ne bheji hai, use update karna
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (completed !== undefined) task.completed = completed;

        // 4. Badla hua task database mein save karna
        const updatedTask = await task.save();
        res.status(200).json(updatedTask);

    } catch (error) {
        console.error(error);
        // Agar id ghalat format mein ho to error handle karna
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task nahi mila!' });
        }
        res.status(500).json({ message: 'Server mein koi masla aa gaya hai.' });
    }
});

// 4. DELETE A TASK
// Route: DELETE http://localhost:5000/api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        // 1. Task ko dhoondna
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task nahi mila!' });
        }

        // 2. Security Check: Kya yeh usi user ka task hai?
        if (task.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Access denied! Aap kisi aur ka task delete nahi kar sakte.' });
        }

        // 3. Task ko database se remove karna
        await task.deleteOne();
        
        res.status(200).json({ message: 'Task kamyabi se delete ho gaya hai! 🗑️' });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task nahi mila!' });
        }
        res.status(500).json({ message: 'Server mein koi masla aa gaya hai.' });
    }
});

module.exports = router;