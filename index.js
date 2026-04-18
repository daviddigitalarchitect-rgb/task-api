// 1. Import the Building
const app = require('./src/app');

// 2. Import the Factory
const { getRepositories } = require('./src/factory');

// 3. Import the Managers (Controllers)
const TaskController = require('./src/controllers/taskController');
const UserController = require('./src/controllers/userController');

// 4. Import the Greeters (Routers)
const TaskRouter = require('./src/routes/taskRoutes');
const UserRouter = require('./src/routes/userRoutes');


// --- THE WIRING ---

const { taskRepo, userRepo } = getRepositories();

const taskController = TaskController(taskRepo);
const userController = UserController(userRepo, taskRepo);

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

// Export the app so your automated tests can still run
module.exports = app;