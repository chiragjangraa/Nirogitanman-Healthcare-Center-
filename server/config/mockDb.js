const fs = require('fs');
const path = require('path');

const mockFilePath = path.join(__dirname, 'mock-db-data.json');

// Default initial state
const defaultData = {
  admins: [],
  doctors: [
    {
      _id: "doc1",
      name: "Dr. Alok Sharma",
      specialization: "Cardiology",
      qualification: "MD, DM (Cardiology) - 15+ Yrs Exp",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
      description: "Expert in interventional cardiology, heart failure management, and preventive cardiac care."
    },
    {
      _id: "doc2",
      name: "Dr. Priya Patel",
      specialization: "Pediatrics",
      qualification: "MBBS, MD (Pediatrics) - 12+ Yrs Exp",
      image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
      description: "Dedicated to providing compassionate care for infants, children, and adolescents."
    },
    {
      _id: "doc3",
      name: "Dr. Rajesh Verma",
      specialization: "Orthopedics",
      qualification: "MS (Ortho), MCh (Ortho) - 18+ Yrs Exp",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
      description: "Specialist in joint replacements, sports injuries, and advanced arthroscopic surgeries."
    }
  ],
  services: [
    {
      _id: "srv1",
      title: "General Checkup",
      description: "Comprehensive health evaluations, routine checkups, and preventive screening for all age groups.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400"
    },
    {
      _id: "srv2",
      title: "Cardiac Care",
      description: "Advanced diagnostic testing, ECG, Echo, and expert consultation for various cardiovascular conditions.",
      image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=400"
    },
    {
      _id: "srv3",
      title: "Pediatric Consultation",
      description: "Immunization, developmental tracking, and complete healthcare solutions for children.",
      image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=400"
    }
  ],
  appointments: [],
  messages: [],
  blogs: [
    {
      _id: "blog1",
      title: "5 Tips to Keep Your Heart Healthy",
      content: "A healthy lifestyle is the key to preventing heart disease. Start by eating a balanced diet rich in fiber, exercising at least 30 minutes daily, avoiding smoking, managing stress levels, and getting regular health checkups.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
      author: "Dr. Alok Sharma",
      date: new Date().toISOString()
    }
  ],
  gallery: [
    {
      _id: "gal1",
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400",
      title: "Our Diagnostic Center"
    },
    {
      _id: "gal2",
      imageUrl: "https://images.unsplash.com/photo-1584515901387-a7f18e26524b?auto=format&fit=crop&q=80&w=400",
      title: "Modern ICU Unit"
    }
  ],
  settings: {
    siteName: "Nirogitanman Healthcare",
    email: "contact@nirogitanman.com",
    phone: "+91 98765 43210",
    address: "123, Wellness Enclave, Health City, Sector 5, New Delhi - 110001",
    workingHours: "Mon - Sat: 8:00 AM - 8:00 PM, Sun: Emergency Only",
    socialLinks: {
      facebook: "https://facebook.com/nirogitanman",
      twitter: "https://twitter.com/nirogitanman",
      instagram: "https://instagram.com/nirogitanman"
    }
  }
};

// Ensure database file exists
const initDbFile = () => {
  if (!fs.existsSync(mockFilePath)) {
    fs.writeFileSync(mockFilePath, JSON.stringify(defaultData, null, 2));
  }
};

const readData = () => {
  initDbFile();
  try {
    const raw = fs.readFileSync(mockFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading mock DB file:', err);
    return defaultData;
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(mockFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing mock DB file:', err);
  }
};

const mockDb = {
  find: (collectionName, query = {}) => {
    const data = readData();
    const items = data[collectionName] || [];
    // Basic query matching
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collectionName, query = {}) => {
    const items = mockDb.find(collectionName, query);
    return items[0] || null;
  },

  findById: (collectionName, id) => {
    return mockDb.findOne(collectionName, { _id: id });
  },

  create: (collectionName, newItem) => {
    const data = readData();
    if (!data[collectionName]) data[collectionName] = [];
    const createdItem = {
      _id: Math.random().toString(36).substring(2, 9),
      ...newItem,
      createdAt: new Date().toISOString()
    };
    data[collectionName].push(createdItem);
    writeData(data);
    return createdItem;
  },

  findByIdAndUpdate: (collectionName, id, updates) => {
    const data = readData();
    const items = data[collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    writeData(data);
    return items[index];
  },

  findByIdAndDelete: (collectionName, id) => {
    const data = readData();
    const items = data[collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    writeData(data);
    return deleted;
  },

  // Specialized settings getter/updater
  getSettings: () => {
    const data = readData();
    return data.settings || defaultData.settings;
  },

  updateSettings: (newSettings) => {
    const data = readData();
    data.settings = { ...data.settings, ...newSettings };
    writeData(data);
    return data.settings;
  }
};

module.exports = mockDb;
