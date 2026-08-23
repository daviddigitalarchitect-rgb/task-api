const { z } = require("zod");
const { findTasks } = require("../services/taskService");

// --- The Bouncer  ---
const querySchema = z.object({
  include: z.string()
    .optional(),
  status: z
    .enum(["pending", "done"], {
      message: "Invalid status. Use 'pending' or 'done'.",
    })
    .optional(),
  priority: z
    .enum(["low", "medium", "high"], {
      message: "Invalid priority. Use 'low', 'medium', or 'high'.",
    })
    .optional(),
  assignedTo: z.string().uuid("Invalid assignedTo format.").optional(),

  sortBy: z
    .enum(["createdAt", "priority", "title"], {
      message: "Invalid sortBy column.",
    })
    .optional(),
  sortOrder: z
    .enum(["asc", "desc"], { message: "Order must be 'asc' or 'desc'." })
    .optional(),

  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number.")
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/, "Offset must be a positive number.")
    .optional(),
});

// --- THE SCHEMAS ---
const taskSchema = z.object({
  title: z
    .string({
      required_error: "Oops! You forgot to add a title.",
      invalid_type_error: "The title must be plain text.",
    })
    .min(1, "The title cannot be blank."),
  description: z.string().optional(),
  priority: z
    .enum(["low", "medium", "high"], {
      errorMap: () => ({
        message: "Priority must be exactly 'low', 'medium', or 'high'.",
      }),
    })
    .optional(),
  done: z.boolean().optional(),
  userId: z.string().uuid("Invalid User ID format"),
});

const updateSchema = z.object({
  title: z.string().min(1, "The title cannot be blank.").optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "done"]).optional(),
  assignedTo: z.string().uuid().optional(),
  done: z.boolean().optional(),
});

const bulkAssignSchema = z.object({
  taskIds: z.array(z.string().uuid("Invalid Task ID format.")).min(1, "Provide at least one task ID."),
  userId: z.string().uuid("Invalid User ID format."),
});

// --- THE MANAGER ---
const TaskController = (taskRepo) => {
  return {
    createTask: async (req, res) => {
      const validationResult = taskSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues[0].message;
        return res.status(400).json({ error: errorMessage });
      }

      const newTask = await taskRepo.create(validationResult.data);
      res.status(201).json(newTask);
    },

    getAllTasks: async (req, res) => {
      const validationResult = querySchema.safeParse(req.query);

      if (!validationResult.success) {
        return res
          .status(400)
          .json({ error: validationResult.error.issues[0].message });
      }

      const safeFilters = validationResult.data;

      const tasks = await findTasks(safeFilters, taskRepo);

      res.status(200).json(tasks);
    },

    getTaskById: async (req, res) => {
      const foundTask = await taskRepo.findById(req.params.id);
      if (foundTask) res.status(200).json(foundTask);
      else res.status(404).json({ error: "Task not found" });
    },

    updateTask: async (req, res) => {
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success)
        return res
          .status(400)
          .json({ error: validationResult.error.issues[0].message });

      const updatedTask = await taskRepo.update(
        req.params.id,
        validationResult.data,
      );
      if (!updatedTask)
        return res.status(404).json({ error: "Task not found" });

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
      if (!updatedTask)
        return res.status(404).json({ error: "Task not found" });
      res.status(200).json(updatedTask);
    },

    deleteAllTasks: async (req, res) => {
      await taskRepo.deleteAll();
      res.status(200).json({ message: "Successfully deleted all tasks." });
    },

    bulkAssign: async (req, res) => {
      // 1. Check the request body against our new Bouncer rule
      const validationResult = bulkAssignSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues[0].message;
        return res.status(400).json({ error: errorMessage });
      }

      const { taskIds, userId } = validationResult.data;

      try {
        // 2. Send the clean data to the database to do the "All or Nothing" transaction
        await taskRepo.bulkAssignTasks(taskIds, userId);
        
        // 3. If it succeeds, send a success message
        res.status(200).json({ message: "Tasks successfully assigned!" });
      } catch (error) {
        // 4. If the transaction fails (e.g., a task ID was fake), catch the error
        res.status(400).json({ error: error.message });
      }
    },
  };
};

module.exports = TaskController;
