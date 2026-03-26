const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');

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

let tasks = [];

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
  status: z.enum(["pending", "done"]).optional()
});

// Create Task (POST)
app.post('/tasks', (req, res) => {
  const validationResult = taskSchema.safeParse(req.body);

  if (!validationResult.success) {
    let errorMessage = validationResult.error.issues[0].message;
    
    if (errorMessage.includes("expected string") || errorMessage.includes("Required")) {
      errorMessage = "Oops! You forgot to add a title.";
    }

    return res.status(400).json({ error: errorMessage });
  }

  const customerOrder = validationResult.data;

  const newTask = {
    id: uuidv4(),
    title: customerOrder.title,
    priority: customerOrder.priority || "medium",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Read All Tasks (GET)
app.get('/tasks', (req, res) => {
  const statusFilter = req.query.status;

  if (statusFilter) {
    const filteredTasks = tasks.filter(task => task.status === statusFilter);
    return res.status(200).json(filteredTasks);
  }

  res.status(200).json(tasks);
});


// Read One Task (GET)
app.get('/tasks/:id', (req, res) => {
  const requestedId = req.params.id;
  const foundTask = tasks.find(task => task.id === requestedId);

  if (foundTask) {
    res.status(200).json(foundTask);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Update Task (PUT) 
app.put('/tasks/:id', (req, res) => {
  const requestedId = req.params.id;
  const foundTask = tasks.find(task => task.id === requestedId);

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
  
  foundTask.updatedAt = new Date().toISOString();

  res.status(200).json(foundTask);
});


// Delete Task (DELETE) 
app.delete('/tasks/:id', (req, res) => {
  const requestedId = req.params.id;
  const taskIndex = tasks.findIndex(task => task.id === requestedId);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.status(204).send(); 
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});



// Fast "Done" Button (PATCH)
app.patch('/tasks/:id/done', (req, res) => {
  const requestedId = req.params.id;
  const foundTask = tasks.find(task => task.id === requestedId);

  if (!foundTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  foundTask.status = "done";
  foundTask.updatedAt = new Date().toISOString();

  res.status(200).json(foundTask);
});


//  Delete All Tasks
app.delete('/tasks', (req, res) => {
  const amountDeleted = tasks.length;
  
  tasks = []; // This completely empties the list
  
  res.status(200).json({ message: `Successfully deleted ${amountDeleted} tasks.` });
});


app.listen(3000, () => {
  console.log('Server is awake and listening on http://localhost:3000');
});