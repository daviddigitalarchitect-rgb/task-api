const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
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
  // --- WE JUST ADDED THIS PART ---
  relations: {
    user: {
      target: 'User', 
      type: 'many-to-one', 
      joinColumn: { name: 'userId' },
      createForeignKeyConstraints: false, 
    },
  },
});