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
      
      const newTask = await taskRepo.create(validationResult.data);       
      res.status(201).json(newTask);
    },

    getAllTasks: async (req, res) => {
      const filters = {
        priority: req.query.priority,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit
      };

      if (req.query.sortBy === 'newest') {
        filters.sortBy = 'createdAt';
        filters.order = 'desc';
      }

      const tasks = await taskRepo.findAll(filters);
      res.status(200).json(tasks);
    },

    getTaskById: async (req, res) => {
      const foundTask = await taskRepo.findById(req.params.id);
      if (foundTask) res.status(200).json(foundTask);
      else res.status(404).json({ error: "Task not found" });
    },

    updateTask: async (req, res) => {
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) return res.status(400).json({ error: validationResult.error.issues[0].message });

      const updatedTask = await taskRepo.update(req.params.id, validationResult.data);
      if (!updatedTask) return res.status(404).json({ error: "Task not found" });

      res.status(200).json(updatedTask);
    },

    deleteTask: async (req, res) => {
      const success = await taskRepo.delete(req.params.id);
      if (success) {
        res.status(204).send(); 
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    },

    markTaskDone: async (req, res) => {
      const updatedTask = await taskRepo.markDone(req.params.id);
      if (!updatedTask) return res.status(404).json({ error: "Task not found" });
      res.status(200).json(updatedTask);
    },

    deleteAllTasks: async (req, res) => {
      await taskRepo.deleteAll();
      res.status(200).json({ message: "Successfully deleted all tasks." });
    }
  };
};

module.exports = TaskController;