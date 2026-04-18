const express = require('express');

const UserRouter = (userController) => {
  const router = express.Router();

  router.post('/', userController.createUser);
  router.get('/', userController.getAllUsers);
  router.get('/:id/tasks', userController.getUserTasks);
  router.get('/:id', userController.getUserById);
  router.delete('/:id', userController.deleteUser);
  
  return router;
};

module.exports = UserRouter;