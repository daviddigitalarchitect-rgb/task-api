const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');

// --- THE SCHEMA ---
const userSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Invalid email format")
});

const UserController = (userRepo, taskRepo) => {
  return {

    createUser: (req, res) => {
      const validationResult = userSchema.safeParse(req.body);
      if (!validationResult.success) return res.status(400).json({ error: validationResult.error.issues[0].message });
      
      const currentUsers = userRepo.getUsers();
      if (currentUsers.some(user => user.email === validationResult.data.email)) {
        return res.status(409).json({ error: "A user with this email already exists." });
      }
      
      const newUser = {
        id: uuidv4(),
        name: validationResult.data.name,
        email: validationResult.data.email,
        createdAt: new Date().toISOString()
      };
      
      currentUsers.push(newUser);
      userRepo.saveUsers(currentUsers);
      res.status(201).json(newUser);
    },

    getAllUsers: (req, res) => {
      res.status(200).json(userRepo.getUsers());
    },

    getUserTasks: (req, res) => {
      const targetUserId = req.params.id;
      
      const allUsers = userRepo.getUsers();
      const allTasks = taskRepo.getTasks();
      
      const targetUser = allUsers.find(user => user.id === targetUserId);
      if (!targetUser) return res.status(404).json({ error: "User not found" });
      
      const userTasks = allTasks.filter(task => task.assignedTo === targetUserId);
      res.status(200).json({
        user: { id: targetUser.id, name: targetUser.name },
        tasks: userTasks,
        taskCount: userTasks.length
      });
    },
    getUserTasks: (req, res) => {
    }, 
    
    getUserById: (req, res) => {
      const currentUsers = userRepo.getUsers();
      const foundUser = currentUsers.find(user => user.id === req.params.id);
      
      if (foundUser) {
        res.status(200).json(foundUser);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    },

    // --- NEW FEATURE: Delete a user ---
    deleteUser: (req, res) => {
      const currentUsers = userRepo.getUsers();
      const userIndex = currentUsers.findIndex(user => user.id === req.params.id);

      if (userIndex !== -1) {
        currentUsers.splice(userIndex, 1);
        userRepo.saveUsers(currentUsers);
        res.status(204).send(); // 204 means "Success, but no content to return"
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  };
};

module.exports = UserController;