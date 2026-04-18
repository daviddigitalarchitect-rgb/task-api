const FileTaskRepository = require('./repositories/file/FileTaskRepository');
const FileUserRepository = require('./repositories/file/FileUserRepository');

const getRepositories = () => {

  const dataSource = process.env.DATA_SOURCE || 'file';

  if (dataSource === 'file') {
    return {
      taskRepo: new FileTaskRepository(),
      userRepo: new FileUserRepository()
    };
  }

  throw new Error(`Unknown DATA_SOURCE: ${dataSource}`);
};

module.exports = { getRepositories };