const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import all models
const User = require('./models/User');
const Firearm = require('./models/Firearm');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const WorkOrder = require('./models/WorkOrder');
const Inventory = require('./models/Inventory');
const Message = require('./models/Message');
const AILog = require('./models/AILog');

// Connect to MongoDB
async function testModels() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✔ Connected to MongoDB');

    const models = {
      User,
      Firearm,
      Service,
      Appointment,
      WorkOrder,
      Inventory,
      Message,
      AILog
    };

    console.log('\nTesting model loading...\n');

    for (const [name, model] of Object.entries(models)) {
      try {
        // Simple query to force model initialization
        await model.findOne({});
        console.log(`✔ Model loaded: ${name}`);
      } catch (err) {
        console.error(`❌ Error loading model ${name}:`, err.message);
      }
    }

    console.log('\nAll models tested.');
    process.exit(0);

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

testModels();
