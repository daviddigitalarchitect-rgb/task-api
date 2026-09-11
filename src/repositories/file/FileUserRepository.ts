import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const usersFilePath = path.join(__dirname, '../../../users.json');

export class FileUserRepository {
  async _readUsers() {
    try {
      const data = await fsPromises.readFile(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeUsers(users: any[]) {
    const stringifiedData = JSON.stringify(users, null, 2);
    await fsPromises.writeFile(usersFilePath, stringifiedData, 'utf8');
  }

  async findAll() {
    return await this._readUsers();
  }

  async findById(id: string) {
    const users = await this._readUsers();
    return users.find((u: any) => u.id === id) || null;
  }

  async findByEmail(email: string) {
    const users = await this._readUsers();
    return users.find((u: any) => u.email === email) || null;
  }

  async create(userData: any) {
    const users = await this._readUsers();

    if (users.some((u: any) => u.email === userData.email)) {
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

  async delete(id: string) {
    const users = await this._readUsers();
    const filteredUsers = users.filter((u: any) => u.id !== id);
    
    if (users.length === filteredUsers.length) return false; 
    
    await this._writeUsers(filteredUsers);
    return true;
  }
}