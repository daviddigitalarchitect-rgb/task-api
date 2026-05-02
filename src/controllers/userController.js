const { z } = require('zod');

// --- THE SCHEMA ---
const userSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Invalid email format")
});

const UserController = (userRepo, taskRepo) => {
  return {

    createUser: async (req, res) => {
      const validationResult = userSchema.safeParse(req.body);
      if (!validationResult.success) return res.status(400).json({ error: validationResult.error.issues[0].message });
      
      try {
        const newUser = await userRepo.create(validationResult.data);
        res.status(201).json(newUser);
      } catch (error) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    getAllUsers: async (req, res) => {
      const users = await userRepo.findAll();
      res.status(200).json(users);
    },

    getUserTasks: async (req, res) => {
      const targetUserId = req.params.id;
      
      const targetUser = await userRepo.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ error: "User not found" });
      
      const userTasks = await taskRepo.findByUserId(targetUserId);
      res.status(200).json({
        user: { id: targetUser.id, name: targetUser.name },
        tasks: userTasks,
        taskCount: userTasks.length
      });
    },
    
    getUserById: async (req, res) => {
      const foundUser = await userRepo.findById(req.params.id);
      
      if (foundUser) {
        res.status(200).json(foundUser);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  };
};

module.exports = UserController;