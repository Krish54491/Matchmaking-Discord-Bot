//fully ai I didn't know sql  
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');

// THIS is what creates the real db connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

module.exports = db;