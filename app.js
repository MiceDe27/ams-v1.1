const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tenantResolver = require('./middleware/tenantResolver');
const accountRoutes = require('./routes/accountRoutes');
const contactRoutes = require('./routes/contactRoutes');

const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 'capacitor://localhost', 'http://localhost'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api/admin', adminRoutes);
app.use('/api/users', tenantResolver, userRoutes);
app.use('/api/accounts', tenantResolver, accountRoutes);
app.use('/api/contacts', tenantResolver, contactRoutes);

app.get('/', (req, res) => {
    res.send('AMS API is running...');
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

startServer();

module.exports = app;
