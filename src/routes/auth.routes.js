const express = require('express');



const router = express.Router();


// POST /api/auth/register
router.post('/register', (req, res) => {
    res.send('Register');
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    res.send('Login');
});






module.exports = router;
