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
});