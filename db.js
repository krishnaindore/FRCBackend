// config/db.js
const mysql = require('mysql2/promise');

// Configure MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',         // Replace with your MySQL username
  password: 'password', // Replace with your MySQL password
  database: 'test_db',  // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
