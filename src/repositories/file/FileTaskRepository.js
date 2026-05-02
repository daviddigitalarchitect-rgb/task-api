const ITaskRepository = require('../ITaskRepository');
const fsPromises = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const tasksFilePath = path.join(__dirname, '../../../tasks.json');

class FileTaskRepository extends ITaskRepository {
  
  async _readTasks() {
    try {
      const data = await fsPromises.readFile(tasksFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeTasks(tasks) {
    const stringifiedData = JSON.stringify(tasks, null, 2);
    await fsPromises.writeFile(tasksFilePath, stringifiedData, 'utf8');
  }

  async findAll(filters = {}) {
    let tasks = await this._readTasks();

    // 1. Filtering
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    // 2. Sorting
    if (filters.sortBy) {
      const order = filters.order === 'desc' ? -1 : 1;
      tasks.sort((a, b) => {
        if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
        if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
        return 0;
      });
    }

    // 3. Pagination
    if (filters.page && filters.limit) {
      const page = parseInt(filters.page, 10);
      const limit = parseInt(filters.limit, 10);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      tasks = tasks.slice(startIndex, endIndex);
    }

    return tasks;
  }

  async findById(id) {
    const tasks = await this._readTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async findByUserId(userId) {
    const tasks = await this._readTasks();
    return tasks.filter(t => t.userId === userId);
  }

  async create(taskData) {
    const tasks = await this._readTasks();
    const newTask = {
      id: uuidv4(),
      ...taskData,
      status: taskData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    await this._writeTasks(tasks);
    return newTask;
  }

  async update(id, updateData) {
    const tasks = await this._readTasks();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await this._writeTasks(tasks);
    return tasks[index];
  }

  async markDone(id) {
    return this.update(id, { status: 'completed' });
  }

  async delete(id) {
    const tasks = await this._readTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (tasks.length === filteredTasks.length) return false; 
    
    await this._writeTasks(filteredTasks);
    return true;
  }

  async deleteAll() {
    await this._writeTasks([]);
  }
}

module.exports = FileTaskRepository;