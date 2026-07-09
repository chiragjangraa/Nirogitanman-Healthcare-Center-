const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { connectDB, dbState } = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow image base64 uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect Database
connectDB().then(() => {
  // Seed default admin and initial data
  seedAdmin();
});

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');
const messageRoutes = require('./routes/messages');
const blogRoutes = require('./routes/blogs');
const galleryRoutes = require('./routes/gallery');
const settingsRoutes = require('./routes/settings');
const medicalRecordRoutes = require('./routes/medicalRecords');
const notificationRoutes = require('./routes/notifications');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/notifications', notificationRoutes);

// Test API Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Nirogitanman API is running...', isMockMode: dbState.isMock });
});

// Function to seed default admin
async function seedAdmin() {
  const adminEmail = 'admin@nirogitanman.com';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  if (dbState.isMock) {
    const mockDb = require('./config/mockDb');
    const existingAdmin = mockDb.findOne('admins', { email: adminEmail });
    if (!existingAdmin) {
      mockDb.create('admins', {
        name: 'Nirogitanman Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Seeded default admin in Mock DB.');
    }
  } else {
    try {
      const Admin = require('./models/Admin');
      const existingAdmin = await Admin.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const newAdmin = new Admin({
          name: 'Nirogitanman Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
        await newAdmin.save();
        console.log('Seeded default admin in MongoDB.');
      }
    } catch (err) {
      console.error('Error seeding admin in MongoDB:', err.message);
    }
  }
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
