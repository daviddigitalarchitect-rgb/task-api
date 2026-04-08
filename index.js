const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');

const fsPromises = require('fs').promises;

// NEW ASYNC HELPERS
const getTasksAsync = async () => {
  try {
    const data = await fsPromises.readFile(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveTasksAsync = async (tasksArray) => {
  const stringifiedData = JSON.stringify(tasksArray, null, 2);
  await fsPromises.writeFile(tasksFilePath, stringifiedData, 'utf8');
};

const app = express();
app.use(express.json());

// Health Check 
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

// The Announcer (Logging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


const tasksFilePath = path.join(__dirname, 'tasks.json');

const getTasks = () => {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveTasks = (tasksArray) => {
  const stringifiedData = JSON.stringify(tasksArray, null, 2);
  fs.writeFileSync(tasksFilePath, stringifiedData, 'utf8');
};

// The Bouncer's Rulebook
const taskSchema = z.object({
  title: z.string({
    required_error: "Oops! You forgot to add a title.",
    invalid_type_error: "The title must be plain text."
  }).min(1, "The title cannot be blank."),
  
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priority must be exactly 'low', 'medium', or 'high'." })
  }).optional()
});

// The Bouncer's Rulebook for UPDATES 
const updateSchema = z.object({
  title: z.string().min(1, "The title cannot be blank.").optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "done"]).optional(),
  assignedTo: z.string().uuid().optional()
});


// --- USER CONFIGURATION ---
const usersFilePath = path.join(__dirname, 'users.json');

const userSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Invalid email format")
});

const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveUsers = (usersArray) => {
  const stringifiedData = JSON.stringify(usersArray, null, 2);
  fs.writeFileSync(usersFilePath, stringifiedData, 'utf8');
};


// --- Create Task (POST) - ASYNC VERSION ---
app.post('/tasks', async (req, res) => {
  const validationResult = taskSchema.safeParse(req.body);

  if (!validationResult.success) {
    let errorMessage = validationResult.error.issues[0].message;
    if (errorMessage.includes("expected string") || errorMessage.includes("Required")) {
      errorMessage = "Oops! You forgot to add a title.";
    }
    return res.status(400).json({ error: errorMessage });
  }

  const taskData = validationResult.data;

  const newTask = {
    id: uuidv4(),
    title: taskData.title,
    priority: taskData.priority || "medium",
    status: "pending",
    assignedTo: null, 
    createdAt: new Date().toISOString()
  };

  const currentTasks = await getTasksAsync(); 
  currentTasks.push(newTask);      
  await saveTasksAsync(currentTasks);         

  res.status(201).json(newTask);
});

// --- Read All Tasks (GET)29e2da35-c868-4784-b3bd-1d6d2cf88e4f - The Manual Query Engine ---
app.get('/tasks', async (req, res) => {
  let tasks = await getTasksAsync(); 

  const { priority, status, sortBy, limit = 10, page = 1 } = req.query;

  if (priority) {
    tasks = tasks.filter(t => t.priority === priority);
  }
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }

  // 3. Manual Sorting (Query Param: ?sortBy=newest)
  if (sortBy === 'newest') {
    // This is expensive! The CPU has to compare every single timestamp
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // 4. Manual Pagination (Query Params: ?limit=10&page=1)
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalTasks = tasks.length;
  
  // Cut the giant array down to just the 10 tasks requested
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  res.status(200).json({
    totalFound: totalTasks,
    page: parseInt(page),
    limit: parseInt(limit),
    tasks: paginatedTasks
  });
});


// --- Read One Task (GET) ---
app.get('/tasks/:id', (req, res) => {
  const currentTasks = getTasks();
  const requestedId = req.params.id;
  const foundTask = currentTasks.find(task => task.id === requestedId);

  if (foundTask) {
    res.status(200).json(foundTask);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// --- Update Task (PUT) ---
app.put('/tasks/:id', (req, res) => {
  const currentTasks = getTasks();
  const requestedId = req.params.id;
  const foundTask = currentTasks.find(task => task.id === requestedId);

  if (!foundTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  const validationResult = updateSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.issues[0].message });
  }

  const updatedData = validationResult.data;

  if (updatedData.title) foundTask.title = updatedData.title;
  if (updatedData.priority) foundTask.priority = updatedData.priority;
  if (updatedData.status) foundTask.status = updatedData.status;
  if (updatedData.assignedTo) foundTask.assignedTo = updatedData.assignedTo;

  foundTask.updatedAt = new Date().toISOString();

  saveTasks(currentTasks);

  res.status(200).json(foundTask);
});


// --- Delete Task (DELETE) ---
app.delete('/tasks/:id', (req, res) => {
  const currentTasks = getTasks(); 
  const requestedId = req.params.id;
  const taskIndex = currentTasks.findIndex(task => task.id === requestedId);

  if (taskIndex !== -1) {
    currentTasks.splice(taskIndex, 1); 
    saveTasks(currentTasks);           
    res.status(204).send(); 
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});


// --- Fast "Done" Button (PATCH) ---
app.patch('/tasks/:id/done', (req, res) => {
  const currentTasks = getTasks(); 
  const requestedId = req.params.id;
  const foundTask = currentTasks.find(task => task.id === requestedId);

  if (!foundTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  foundTask.status = "done";
  foundTask.updatedAt = new Date().toISOString();

  saveTasks(currentTasks);

  res.status(200).json(foundTask);
});


// --- Delete All Tasks ---
app.delete('/tasks', (req, res) => {
  const currentTasks = getTasks(); 
  const amountDeleted = currentTasks.length;
  
  saveTasks([]); 
  
  res.status(200).json({ message: `Successfully deleted ${amountDeleted} tasks.` });
});




// --- Create User (POST) ---
app.post('/users', (req, res) => {
  const validationResult = userSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.issues[0].message });
  }

  const currentUsers = getUsers();

  const emailExists = currentUsers.some(user => user.email === validationResult.data.email);
  if (emailExists) {
    return res.status(409).json({ error: "A user with this email already exists." });
  }

  const newUser = {
    id: uuidv4(),
    name: validationResult.data.name,
    email: validationResult.data.email,
    createdAt: new Date().toISOString()
  };

  currentUsers.push(newUser);
  saveUsers(currentUsers);

  res.status(201).json(newUser);
});

// --- Read All Users (GET) ---
app.get('/users', (req, res) => {
  const currentUsers = getUsers();
  res.status(200).json(currentUsers);
});

// --- Get Tasks by User (GET) ---
app.get('/users/:id/tasks', (req, res) => {
  const targetUserId = req.params.id;

  const allUsers = getUsers();
  const allTasks = getTasks();

  const targetUser = allUsers.find(user => user.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const userTasks = allTasks.filter(task => task.assignedTo === targetUserId);

  const responsePayload = {
    user: {
      id: targetUser.id,
      name: targetUser.name
    },
    tasks: userTasks,
    taskCount: userTasks.length
  };

  res.status(200).json(responsePayload);
});






if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log('Server is awake and listening on http://localhost:3000');
  });
}

module.exports = app;