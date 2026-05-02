const IUserRepository = require('../IUserRepository');
const fsPromises = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const usersFilePath = path.join(__dirname, '../../../users.json');

class FileUserRepository extends IUserRepository {
  
  async _readUsers() {
    try {
      const data = await fsPromises.readFile(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeUsers(users) {
    const stringifiedData = JSON.stringify(users, null, 2);
    await fsPromises.writeFile(usersFilePath, stringifiedData, 'utf8');
  }

  async findAll() {
    return await this._readUsers();
  }

  async findById(id) {
    const users = await this._readUsers();
    return users.find(u => u.id === id) || null;
  }

  async findByEmail(email) {
    const users = await this._readUsers();
    return users.find(u => u.email === email) || null;
  }

  async create(userData) {
    const users = await this._readUsers();

    if (users.some(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this._writeUsers(users);
    return newUser;
  }

  async delete(id) {
    const users = await this._readUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (users.length === filteredUsers.length) return false; 
    
    await this._writeUsers(filteredUsers);
    return true;
  }
}

module.exports = FileUserRepository;