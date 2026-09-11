import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
});