const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Request ke header se token nikalna
    const token = req.header('Authorization');

    // 2. Check karna ke kya token maujood hai?
    if (!token) {
        return res.status(401).json({ message: 'No token provided, access denied! ❌' });
    }

    try {
        // 3. Token agar 'Bearer <token>' ki shakl mein hai to split karna, warna seedha verify karna
        let actualToken = token;
        if (token.startsWith('Bearer ')) {
            actualToken = token.split(' ')[1];
        }

        // 4. Token ko verify karna (khufia chabi se check karna)
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        
        // 5. Request ke andar user ki ID save kar dena taakeh aage kaam aaye
        req.user = decoded;
        
        // 6. Agle function (yaani actual API logic) par bhej dena
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token sahi nahi hai, authorization failed! ❌' });
    }
};