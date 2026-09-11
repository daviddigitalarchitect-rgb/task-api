import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Task } from '../entities/Task';

// 1. Configure the connection
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL || "", 
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  synchronize: false,
  migrations: ["src/migrations/*.ts"], 
  logging: true,
  entities: [User, Task],
});

// 2. Create the function to start the connection
export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    
    await AppDataSource.runMigrations(); 
    
    console.log("🔥 Database Connection Successfully Established!");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  }
};