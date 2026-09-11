import { z } from 'zod';
import { Request, Response } from 'express';

// --- THE SCHEMA ---
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const UserController = (userRepo: any, taskRepo: any) => {
  return {
    createUser: async (req: Request, res: Response) => {
      const validationResult = userSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error?.issues[0]?.message });
      }

      try {
        const newUser = await userRepo.create(validationResult.data);
        res.status(201).json(newUser);
      } catch (error: any) { 
        if (error?.message?.includes('already exists') || error?.code === '23505') {
          return res.status(409).json({ error: "A user with this email already exists." });
        }
        console.error("DATABASE ERROR:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    getAllUsers: async (req: Request, res: Response) => {
      const users = await userRepo.findAll();
      res.status(200).json(users);
    },

    getUserTasks: async (req: Request, res: Response) => {
      const targetUserId = req.params.id;
      
      const targetUser = await userRepo.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ error: "User not found" });
      
      const userTasks = await taskRepo.findByUserId(targetUserId);
      res.status(200).json({
        user: { id: targetUser.id, email: targetUser.email },
        tasks: userTasks,
        taskCount: userTasks.length
      });
    },
    
    getUserById: async (req: Request, res: Response) => {
      const foundUser = await userRepo.findById(req.params.id);
      
      if (foundUser) {
        res.status(200).json(foundUser);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    },

    deleteUser: async (req: Request, res: Response) => {
      const success = await userRepo.delete(req.params.id);
      if (success) {
        res.status(204).send(); 
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  };
};

export default UserController;