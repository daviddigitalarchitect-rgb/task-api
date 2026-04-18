const express = require('express');

const TaskRouter = (taskController) => {
  const router = express.Router();

  router.post('/', taskController.createTask);
  router.get('/', taskController.getAllTasks);
  router.delete('/', taskController.deleteAllTasks);
  
  router.get('/:id', taskController.getTaskById);
  router.put('/:id', taskController.updateTask);
  router.delete('/:id', taskController.deleteTask);
  router.patch('/:id/done', taskController.markTaskDone);

  return router;
};

module.exports = TaskRouter;