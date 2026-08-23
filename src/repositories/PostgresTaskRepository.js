const { AppDataSource } = require("../db/postgres");
const Task = require("../entities/Task");

class PostgresTaskRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(Task);
  }

  async create(taskData) {
    const newTask = this.repository.create(taskData);
    return await this.repository.save(newTask);
  }

  async findAndCount(queryOptions = {}) {
    return await this.repository.findAndCount(queryOptions);
  }

  async findById(id) {
    return await this.repository.findOne({
      where: { id: id },
    });
  }

  async findByUserId(userId) {
    return await this.repository.find({
      where: { userId: userId },
    });
  }

  async update(id, updateData) {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id) {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async markDone(id) {
    await this.repository.update(id, { done: true });
    return await this.findById(id);
  }

  async bulkAssignTasks(taskIds, userId) {
    await AppDataSource.transaction(async (transactionManager) => {
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];

        const task = await transactionManager.findOne(Task, {
          where: { id: taskId },
        });

        if (!task) {
          throw new Error(`Task ${taskId} not found. Rollback successful.`);
        }

        task.userId = userId;
        await transactionManager.save(Task, task);
      }
    });
  }

  async deleteAll() {
    await this.repository.clear();
  }
}

module.exports = PostgresTaskRepository;