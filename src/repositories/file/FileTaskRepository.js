const ITaskRepository = require('../ITaskRepository');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const tasksFilePath = path.join(__dirname, '../../../tasks.json');

class FileTaskRepository extends ITaskRepository {
  
  async getTasksAsync() {
    try {
      const data = await fsPromises.readFile(tasksFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveTasksAsync(tasksArray) {
    const stringifiedData = JSON.stringify(tasksArray, null, 2);
    await fsPromises.writeFile(tasksFilePath, stringifiedData, 'utf8');
  }

  getTasks() {
    try {
      const data = fs.readFileSync(tasksFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  saveTasks(tasksArray) {
    const stringifiedData = JSON.stringify(tasksArray, null, 2);
    fs.writeFileSync(tasksFilePath, stringifiedData, 'utf8');
  }
}

module.exports = FileTaskRepository;