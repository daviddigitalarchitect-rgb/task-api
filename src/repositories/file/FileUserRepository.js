const IUserRepository = require('../IUserRepository');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../../../users.json');

class FileUserRepository extends IUserRepository {
  
  getUsers() {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  saveUsers(usersArray) {
    const stringifiedData = JSON.stringify(usersArray, null, 2);
    fs.writeFileSync(usersFilePath, stringifiedData, 'utf8');
  }
}

module.exports = FileUserRepository;