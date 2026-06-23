require('dotenv').config();
require('reflect-metadata'); 
const { DataSource } = require('typeorm');

// 1. Configure the connection
const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  synchronize: true, 
  logging: false,
  entities: [
    require('../entities/User'),
    require('../entities/Task')
  ],
});

// 2. Create the function to start the connection
const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("🔥 Database Connection Successfully Established!");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = { AppDataSource, connectDB };