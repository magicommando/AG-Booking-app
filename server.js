// imports
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// load environment variables from .env files in both the root and backend directories
const envPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, 'backend', '.env')
];

envPaths.forEach((envPath) => {
  dotenv.config({ path: envPath });
});

// DB connection
const connectToMongo = require('./backend/config/db');

// create express app
const app = express();

const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// global middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./backend/routes/authRoutes');
const firearmRoutes = require('./backend/routes/firearmRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const serviceRoutes = require('./backend/routes/serviceRoutes');
const aiRoutes = require('./backend/routes/aiRoutes');
const appointmentRoutes = require('./backend/routes/appointmentRoutes');
const workOrderRoutes = require('./backend/routes/workOrderRoutes');
const inventoryRoutes = require('./backend/routes/inventoryRoutes');
const messageRoutes = require('./backend/routes/messageRoutes');
const scheduleRoutes = require('./backend/routes/scheduleRoutes');
const errorHandler = require('./backend/middleware/errorHandler');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/firearms', firearmRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use(errorHandler);

// Root test route to check if the server is running and MongoDB connection status
app.get('/', (req, res) => {
  res.json({
    message: 'Awsiwi Gunsmithing API is running',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not connected'
  });
});
// Debug: show whether MONGO_URI was loaded (don't print the secret)
if (process.env.MONGO_URI) {
  console.log('MONGO_URI loaded:', process.env.MONGO_URI.startsWith('mongodb') ? 'yes' : 'no');
} else {
  console.warn('MONGO_URI not found in environment');
}

// Log mongoose connection events for debugging
mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err && err.message));
mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected'));

//  start the server only if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectToMongo()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server due to MongoDB connection error:', err.message || err);
      process.exit(1);
    });
}

module.exports = app;
