const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");

// Apply CORS middleware to allow requests from any origin
app.use(cors());

// ==========================================
// CONFIGURATION - ENVIRONMENT VARIABLES
// ==========================================
// IMPORTANT: Server details are now loaded from Render's Environment Variables (process.env)
const SERVER_IP = process.env.FS22_SERVER_IP;
const SERVER_PORT = process.env.FS22_PORT;
const SECRET_CODE = process.env.FS22_SECRET_CODE;

// Check if critical variables are set
if (!SERVER_IP || !SERVER_PORT || !SECRET_CODE) {
    console.error("CRITICAL ERROR: FS22 server IP, PORT, or SECRET_CODE environment variables are missing.");
    // Exit the process immediately if configuration is incomplete
    process.exit(1); 
}

// Base URL for the FS22 server feed
const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/feed`;

// ==========================================
// ROOT ROUTE (Health Check)
// ==========================================
// This route confirms the proxy is running and responsive.
app.get("/", (req, res) => {
    res.status(200).json({
        message: "FS22 Data Proxy is running successfully!",
        endpoints: [
            "/status",
            "/vehicles",
            "/career",
            "/economy",
            "/mapimage"
        ],
        // Note: Do not expose the SECRET_CODE in a real app, 
        // but we'll include the IP for debugging connectivity.
        server_ip_check: SERVER_IP 
    });
});

// ==========================================
// ROUTE 1: VEHICLES (Coordinates)
// ==========================================
app.get("/vehicles", async (req, res) => {
    try {
        const url = `${BASE_URL}/dedicated-server-savegame.html?code=${SECRET_CODE}&file=vehicles`;
        
        console.log("Fetching vehicle data...");
        
        const response = await axios.get(url, { responseType: 'text' });
        res.set("Content-Type", "text/xml");
        res.send(response.data);
        
    } catch (error) {
        console.error("Error fetching vehicles:", error.message);
        res.status(500).json({ 
            error: "Error fetching vehicle data",
            detail: error.message 
        });
    }
});

// ==========================================
// ROUTE 2: STATUS (Online/Offline)
// ==========================================
app.get("/status", async (req, res) => {
    try {
        const url = `${BASE_URL}/dedicated-server-stats.xml?code=${SECRET_CODE}`;
        
        const response = await axios.get(url, { responseType: 'text' });
        res.set("Content-Type", "text/xml");
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: "Error fetching status",
            detail: error.message 
        });
    }
});

// ==========================================
// ROUTE 3: CAREER (Game Date/Time/Money)
// ==========================================
app.get("/career", async (req, res) => {
    try {
        const url = `${BASE_URL}/dedicated-server-savegame.html?code=${SECRET_CODE}&file=careerSavegame`;
        
        const response = await axios.get(url, { responseType: 'text' });
        res.set("Content-Type", "text/xml");
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: "Error fetching career data",
            detail: error.message 
        });
    }
});

// ==========================================
// ROUTE 4: ECONOMY (Sell Prices)
// ==========================================
app.get("/economy", async (req, res) => {
    try {
        const url = `${BASE_URL}/dedicated-server-savegame.html?code=${SECRET_CODE}&file=economy`;
        
        const response = await axios.get(url, { responseType: 'text' });
        res.set("Content-Type", "text/xml");
        res.send(response.data);
    } catch (error) { 
        res.status(500).json({ 
            error: "Error fetching economy data",
            detail: error.message 
        }); 
    }
});

// ==========================================
// ROUTE 5: MAP IMAGE (The JPG/PNG Background)
// ==========================================
app.get("/mapimage", async (req, res) => {
    try {
        // This fetches the actual JPG map image from the server feed
        const url = `${BASE_URL}/dedicated-server-stats-map.jpg?code=${SECRET_CODE}&quality=100&size=2048`;
        
        // responseType 'arraybuffer' is crucial for handling binary data (like images)
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        // Set content type to JPEG and send the raw image data
        res.set('Content-Type', 'image/jpeg');
        // Sending binary data directly using Buffer
        res.send(Buffer.from(response.data));
        
    } catch (error) {
        console.error("Error fetching map image:", error.message);
        res.status(500).json({ 
            error: "Error fetching map image",
            detail: error.message 
        });
    }
});


// ==========================================
// START SERVER
// ==========================================
// Render sets the port automatically using process.env.PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy listening on port ${port}`);
});
