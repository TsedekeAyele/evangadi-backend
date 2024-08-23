// Import the mysql2 library into your Node.js to interact with your database.
const mysql2 = require("mysql2");

// Create a multiple connection to the database
const dbConnection = mysql2.createPool({
  user: process.env.USER,
  database: process.env.DATABASE,
  host: process.env.HOST, //address of the database server
  password: process.env.PASSWORD,
  connectionLimit: 10, // The maximum number of connections that the pool can create
});

// Export the connection pool
module.exports = dbConnection.promise();
