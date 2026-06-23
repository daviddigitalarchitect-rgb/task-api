const FileUserRepository = require('./repositories/file/FileUserRepository');
const FileTaskRepository = require('./repositories/file/FileTaskRepository');

const PostgresUserRepository = require('./repositories/PostgresUserRepository');
const PostgresTaskRepository = require('./repositories/PostgresTaskRepository');

const getRepositories = (dataSource) => {
  if (dataSource === 'file') {
    return {
      userRepository: new FileUserRepository(),
      taskRepository: new FileTaskRepository()
    };
  }
  
  if (dataSource === 'postgres') {
    return {
      userRepository: new PostgresUserRepository(),
      taskRepository: new PostgresTaskRepository()
    };
  }

  throw new Error(`Unknown DATA_SOURCE: ${dataSource}`);
};

module.exports = { getRepositories };