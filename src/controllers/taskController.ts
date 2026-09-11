import { Request, Response } from "express";
import { z } from "zod";
import { findTasks } from "../services/taskService";

// --- The Bouncer  ---
const querySchema = z.object({
  include: z.string().optional(),
  status: z.enum(["pending", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().uuid("Invalid assignedTo format.").optional(),
  sortBy: z.enum(["createdAt", "priority", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive number.").optional(),
  offset: z.string().regex(/^\d+$/, "Offset must be a positive number.").optional(),
});

// --- THE SCHEMAS ---
const taskSchema = z.object({
  title: z.string().min(1, "Oops! You forgot to add a title."),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
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
const TaskController = (taskRepo: any) => {
  return {
    createTask: async (req: Request, res: Response) => {
      const validationResult = taskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error?.issues[0]?.message || "Invalid input" });
      }

      const newTask = await taskRepo.create(validationResult.data);
      res.status(201).json(newTask);
    },

    getAllTasks: async (req: Request, res: Response) => {
      const validationResult = querySchema.safeParse(req.query);

      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error?.issues[0]?.message || "Invalid input" });
      }

      const tasks = await findTasks(validationResult.data, taskRepo);
      res.status(200).json(tasks);
    },

    getTaskById: async (req: Request, res: Response) => {
      const foundTask = await taskRepo.findById(req.params.id);
      if (foundTask) res.status(200).json(foundTask);
      else res.status(404).json({ error: "Task not found" });
    },

    updateTask: async (req: Request, res: Response) => {
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error?.issues[0]?.message || "Invalid input" });
      }

      const updatedTask = await taskRepo.update(req.params.id, validationResult.data);
      if (!updatedTask) return res.status(404).json({ error: "Task not found" });

      res.status(200).json(updatedTask);
    },

    deleteTask: async (req: Request, res: Response) => {
      const success = await taskRepo.delete(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    },

    markTaskDone: async (req: Request, res: Response) => {
      const updatedTask = await taskRepo.markDone(req.params.id);
      if (!updatedTask) return res.status(404).json({ error: "Task not found" });
      res.status(200).json(updatedTask);
    },

    deleteAllTasks: async (req: Request, res: Response) => {
      await taskRepo.deleteAll();
      res.status(200).json({ message: "Successfully deleted all tasks." });
    },

    bulkAssign: async (req: Request, res: Response) => {
      const validationResult = bulkAssignSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error?.issues[0]?.message || "Invalid input" });
      }

      const { taskIds, userId } = validationResult.data;

      try {
        await taskRepo.bulkAssignTasks(taskIds, userId);
        res.status(200).json({ message: "Tasks successfully assigned!" });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  };
};

export default TaskController;