const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');this 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from public directory

// Data file paths
const APPOINTMENTS_FILE = path.join(__dirname, 'data', 'appointments.json');
const SUBSCRIBERS_FILE = path.join(__dirname, 'data', 'subscribers.json');

// Ensure data directory and files exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize empty JSON files if they don't exist
[APPOINTMENTS_FILE, SUBSCRIBERS_FILE].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]');
  }
});

// Helper function to read data from JSON files
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Helper function to write data to JSON files
function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

// API Routes

// Get all appointments
app.get('/api/appointments', (req, res) => {
  const appointments = readData(APPOINTMENTS_FILE);
  res.json(appointments);
});

// Create a new appointment
app.post('/api/appointments', (req, res) => {
  const appointments = readData(APPOINTMENTS_FILE);
  const newAppointment = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body
  };
  
  appointments.push(newAppointment);
  if (writeData(APPOINTMENTS_FILE, appointments)) {
    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } else {
    res.status(500).json({ message: 'Error saving appointment' });
  }
});

// Get all subscribers
app.get('/api/subscribers', (req, res) => {
  const subscribers = readData(SUBSCRIBERS_FILE);
  res.json(subscribers);
});

// Add a new subscriber
app.post('/api/subscribers', (req, res) => {
  const subscribers = readData(SUBSCRIBERS_FILE);
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  if (subscribers.includes(email)) {
    return res.status(409).json({ message: 'Email already subscribed' });
  }
  
  subscribers.push(email);
  if (writeData(SUBSCRIBERS_FILE, subscribers)) {
    res.status(201).json({ message: 'Subscribed successfully' });
  } else {
    res.status(500).json({ message: 'Error saving subscriber' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Vet Guard Solutions server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to test`);
});