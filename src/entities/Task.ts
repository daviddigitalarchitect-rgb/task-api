import { EntitySchema } from 'typeorm';

export interface ITask {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  done: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: any; 
}

export const Task = new EntitySchema<ITask>({
  name: 'Task',
  tableName: 'tasks',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    title: {
      type: 'varchar',
    },
    description: {
      type: 'text',
      nullable: true,
    },
    priority: {
      type: 'varchar',
      nullable: true,
    },
    done: {
      type: 'boolean',
      default: false,
    },
    userId: {
      type: 'uuid',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    }
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'userId' },
      createForeignKeyConstraints: false,
    },
  },
});