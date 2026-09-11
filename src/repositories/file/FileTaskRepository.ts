import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const tasksFilePath = path.join(__dirname, '../../../tasks.json');

export class FileTaskRepository {
  async _readTasks() {
    try {
      const data = await fsPromises.readFile(tasksFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeTasks(tasks: any[]) {
    const stringifiedData = JSON.stringify(tasks, null, 2);
    await fsPromises.writeFile(tasksFilePath, stringifiedData, 'utf8');
  }

  async findAll(filters: any = {}) {
    let tasks = await this._readTasks();

    if (filters.status) {
      tasks = tasks.filter((t: any) => t.status === filters.status);
    }

    if (filters.sortBy) {
      const order = filters.order === 'desc' ? -1 : 1;
      tasks.sort((a: any, b: any) => {
        if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
        if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
        return 0;
      });
    }

    if (filters.page && filters.limit) {
      const page = parseInt(filters.page, 10);
      const limit = parseInt(filters.limit, 10);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      tasks = tasks.slice(startIndex, endIndex);
    }

    return tasks;
  }

  async findAndCount(queryOptions: any = {}) {
    const tasks = await this.findAll(queryOptions);
    return [tasks, tasks.length];
  }

  async findById(id: string) {
    const tasks = await this._readTasks();
    return tasks.find((t: any) => t.id === id) || null;
  }

  async findByUserId(userId: string) {
    const tasks = await this._readTasks();
    return tasks.filter((t: any) => t.userId === userId);
  }

  async create(taskData: any) {
    const tasks = await this._readTasks();
    const newTask = {
      id: uuidv4(),
      ...taskData,
      priority: taskData.priority || null,
      status: taskData.done || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    await this._writeTasks(tasks);
    return newTask;
  }

  async update(id: string, updateData: any) {
    const tasks = await this._readTasks();
    const index = tasks.findIndex((t: any) => t.id === id);
    
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await this._writeTasks(tasks);
    return tasks[index];
  }

  async markDone(id: string) {
    const tasks = await this._readTasks();
    const taskIndex = tasks.findIndex((t: any) => t.id === id);

    if (taskIndex === -1) return null;

    tasks[taskIndex].done = true; 
    tasks[taskIndex].updatedAt = new Date().toISOString();
    await this._writeTasks(tasks);
    
    return tasks[taskIndex];
  }

  async delete(id: string) {
    const tasks = await this._readTasks();
    const filteredTasks = tasks.filter((t: any) => t.id !== id);
    
    if (tasks.length === filteredTasks.length) return false; 
    
    await this._writeTasks(filteredTasks);
    return true;
  }

  async deleteAll() {
    await this._writeTasks([]);
  }
}