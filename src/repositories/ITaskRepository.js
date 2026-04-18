
class ITaskRepository {
  async getTasksAsync() { throw new Error("Method not implemented"); }
  async saveTasksAsync(tasksArray) { throw new Error("Method not implemented"); }
  
  getTasks() { throw new Error("Method not implemented"); }
  saveTasks(tasksArray) { throw new Error("Method not implemented"); }
}

module.exports = ITaskRepository;