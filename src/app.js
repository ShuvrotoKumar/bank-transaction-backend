const express = require('express');
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: 'Invalid JSON payload. Send valid JSON without comments, for example: {} or {"currency":"USD","status":"active"}'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            errors: Object.values(err.errors).map((error) => error.message)
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            message: 'An active account already exists for this user'
        });
    }

    return res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

module.exports = app;
