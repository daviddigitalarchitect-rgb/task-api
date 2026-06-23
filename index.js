require('dotenv').config();

// 1. Import the Building
const app = require('./src/app');

// 2. Import the Factory
const { getRepositories } = require('./src/factory');

const { connectDB } = require('./src/db/postgres');


// 3. Import the Managers (Controllers)
const TaskController = require('./src/controllers/taskController');
const UserController = require('./src/controllers/userController');

// 4. Import the Greeters (Routers)
const TaskRouter = require('./src/routes/taskRoutes');
const UserRouter = require('./src/routes/userRoutes');



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

module.exports = app;