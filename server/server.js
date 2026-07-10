const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import DB
const { connectDB, dbState } = require('./config/db');

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
const faqRoutes = require('./routes/faqs');

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
app.use('/api/faqs', faqRoutes);

// Test/Health API Route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Nirogitanman API is running...',
    mode: dbState.isMock ? 'Mock JSON DB' : 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Function to seed default admin
async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nirogitanman.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  try {
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
        console.log('✓ Default admin created in Mock DB');
        console.log('  Email:', adminEmail, '| Password:', adminPassword);
      } else {
        // Always sync password to ensure it matches .env
        mockDb.findByIdAndUpdate('admins', existingAdmin._id, { password: hashedPassword });
        console.log('✓ Admin password synchronized in Mock DB');
      }
    } else {
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
        console.log('✓ Default admin created in MongoDB');
        console.log('  Email:', adminEmail, '| Password:', adminPassword);
      } else {
        // Always sync password on server start to avoid stale hash issues
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('✓ Admin password synchronized in MongoDB');
      }
    }
  } catch (err) {
    console.error('✗ Error seeding admin:', err.message);
  }
}

// Connect Database then seed admin
connectDB().then(() => {
  seedAdmin();
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🏥 Nirogitanman Healthcare Server`);
  console.log('='.repeat(50));
  console.log(`  Port    : ${PORT}`);
  console.log(`  Mode    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  API     : http://localhost:${PORT}/api`);
  console.log(`  Health  : http://localhost:${PORT}/api/test`);
  console.log('='.repeat(50) + '\n');
});
