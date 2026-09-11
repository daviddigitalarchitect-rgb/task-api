import { PostgresUserRepository } from './repositories/PostgresUserRepository';
import { PostgresTaskRepository } from './repositories/PostgresTaskRepository';
import { FileUserRepository } from './repositories/file/FileUserRepository';
import { FileTaskRepository } from './repositories/file/FileTaskRepository';

export const getRepositories = (dataSourceType: string = 'postgres') => {
  if (dataSourceType === 'postgres') {
    return {
      userRepository: new PostgresUserRepository(),
      taskRepository: new PostgresTaskRepository(),
    };
  } else {
    return {
      userRepository: new FileUserRepository(),
      taskRepository: new FileTaskRepository(),
    };
  }
};