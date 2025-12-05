const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");

app.use(cors());

// ==========================================
// CONFIGURATION - YOUR SPECIFIC SERVER DETAILS
// ==========================================
// These variables are pulled from your FS22 dedicated server links
const SERVER_IP = "144.126.128.152";
const SERVER_PORT = "8170";
const SECRET_CODE = "DIaoyx8jutkGtlDr"; 

// ==========================================
// ROUTE 1: VEHICLES (Coordinates)
// ==========================================
app.get("/vehicles", async (req, res) => {
  try {
    const url = `http://${SERVER_IP}:${SERVER_PORT}/feed/dedicated-server-savegame.html?code=${SECRET_CODE}&file=vehicles`;
    
    console.log("Fetching vehicle data..."); 
    
    const response = await axios.get(url);
    res.set("Content-Type", "text/xml");
    res.send(response.data);
    
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    res.status(500).send("Error fetching vehicle data");
  }
});

// ==========================================
// ROUTE 2: STATUS (Online/Offline)
// ==========================================
app.get("/status", async (req, res) => {
  try {
    const url = `http://${SERVER_IP}:${SERVER_PORT}/feed/dedicated-server-stats.xml?code=${SECRET_CODE}`;
    
    const response = await axios.get(url);
    res.set("Content-Type", "text/xml");
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching status");
  }
});

// ==========================================
// ROUTE 3: CAREER (Game Date/Time/Money)
// ==========================================
app.get("/career", async (req, res) => {
  try {
    const url = `http://${SERVER_IP}:${SERVER_PORT}/feed/dedicated-server-savegame.html?code=${SECRET_CODE}&file=careerSavegame`;
    
    const response = await axios.get(url);
    res.set("Content-Type", "text/xml");
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching career data");
  }
});

// ==========================================
// ROUTE 4: ECONOMY (Sell Prices)
// ==========================================
app.get("/economy", async (req, res) => {
  try {
    const url = `http://${SERVER_IP}:${SERVER_PORT}/feed/dedicated-server-savegame.html?code=${SECRET_CODE}&file=economy`;
    
    const response = await axios.get(url);
    res.set("Content-Type", "text/xml");
    res.send(response.data);
  } catch (error) { res.status(500).send("Error fetching economy data"); }
});

// ==========================================
// ROUTE 5: MAP IMAGE (The JPG/PNG Background)
// ==========================================
app.get("/mapimage", async (req, res) => {
  try {
    // This fetches the actual JPG map image from the server feed
    const url = `http://${SERVER_IP}:${SERVER_PORT}/feed/dedicated-server-stats-map.jpg?code=${SECRET_CODE}&quality=100&size=2048`;
    
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    // Set content type to JPEG and send the raw image data
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(response.data));
    
  } catch (error) {
    console.error("Error fetching map image:", error.message);
    res.status(500).send("Error fetching map image");
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
