const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');

// --- THE SCHEMAS ---
const taskSchema = z.object({
  title: z.string({
    required_error: "Oops! You forgot to add a title.",
    invalid_type_error: "The title must be plain text."
  }).min(1, "The title cannot be blank."),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priority must be exactly 'low', 'medium', or 'high'." })
  }).optional()
});

const updateSchema = z.object({
  title: z.string().min(1, "The title cannot be blank.").optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "done"]).optional(),
  assignedTo: z.string().uuid().optional()
});

// --- THE MANAGER ---
const TaskController = (taskRepo) => {
  return {
    
    createTask: async (req, res) => {
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
      
      const currentTasks = await taskRepo.getTasksAsync(); 
      currentTasks.push(newTask);      
      await taskRepo.saveTasksAsync(currentTasks);         
      res.status(201).json(newTask);
    },

    getAllTasks: async (req, res) => {
      let tasks = await taskRepo.getTasksAsync(); 
      const { priority, status, sortBy, limit = 10, page = 1 } = req.query;
      if (priority) tasks = tasks.filter(t => t.priority === priority);
      if (status) tasks = tasks.filter(t => t.status === status);
      if (sortBy === 'newest') {
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const totalTasks = tasks.length;
      const paginatedTasks = tasks.slice(startIndex, endIndex);
      res.status(200).json({
        totalFound: totalTasks,
        page: parseInt(page),
        limit: parseInt(limit),
        tasks: paginatedTasks
      });
    },

    getTaskById: (req, res) => {
      const currentTasks = taskRepo.getTasks();
      const foundTask = currentTasks.find(task => task.id === req.params.id);
      if (foundTask) res.status(200).json(foundTask);
      else res.status(404).json({ error: "Task not found" });
    },

    updateTask: (req, res) => {
      const currentTasks = taskRepo.getTasks();
      const foundTask = currentTasks.find(task => task.id === req.params.id);
      if (!foundTask) return res.status(404).json({ error: "Task not found" });

      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) return res.status(400).json({ error: validationResult.error.issues[0].message });

      const updatedData = validationResult.data;
      if (updatedData.title) foundTask.title = updatedData.title;
      if (updatedData.priority) foundTask.priority = updatedData.priority;
      if (updatedData.status) foundTask.status = updatedData.status;
      if (updatedData.assignedTo) foundTask.assignedTo = updatedData.assignedTo;
      foundTask.updatedAt = new Date().toISOString();

      taskRepo.saveTasks(currentTasks);
      res.status(200).json(foundTask);
    },

    deleteTask: (req, res) => {
      const currentTasks = taskRepo.getTasks(); 
      const taskIndex = currentTasks.findIndex(task => task.id === req.params.id);
      if (taskIndex !== -1) {
        currentTasks.splice(taskIndex, 1); 
        taskRepo.saveTasks(currentTasks);           
        res.status(204).send(); 
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    },

    markTaskDone: (req, res) => {
      const currentTasks = taskRepo.getTasks(); 
      const foundTask = currentTasks.find(task => task.id === req.params.id);
      if (!foundTask) return res.status(404).json({ error: "Task not found" });
      foundTask.status = "done";
      foundTask.updatedAt = new Date().toISOString();
      taskRepo.saveTasks(currentTasks);
      res.status(200).json(foundTask);
    },

    deleteAllTasks: (req, res) => {
      const currentTasks = taskRepo.getTasks(); 
      const amountDeleted = currentTasks.length;
      taskRepo.saveTasks([]); 
      res.status(200).json({ message: `Successfully deleted ${amountDeleted} tasks.` });
    }
  };
};

module.exports = TaskController;