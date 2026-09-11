import dotenv from 'dotenv';
dotenv.config();

// 1. Import the Building
import app from './app';

// 2. Import the Factory
import { getRepositories } from './factory';
import { connectDB } from './db/postgres';

// 3. Import the Managers (Controllers)
import TaskController from './controllers/taskController';
import UserController from './controllers/userController';

// 4. Import the Greeters (Routers)
import TaskRouter from './routes/taskRoutes';
import UserRouter from './routes/userRoutes';

// --- THE WIRING ---
if (process.env.DATA_SOURCE === 'postgres') {
    connectDB();
}

const { taskRepository, userRepository } = getRepositories(process.env.DATA_SOURCE);

const taskController = TaskController(taskRepository);
const userController = UserController(userRepository, taskRepository);

const taskRouter = TaskRouter(taskController);
const userRouter = UserRouter(userController);

app.use('/tasks', taskRouter);
app.use('/users', userRouter);

// --- SERVER START ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log('Server is awake and listening on http://localhost:3000');
  });
}

export default app;