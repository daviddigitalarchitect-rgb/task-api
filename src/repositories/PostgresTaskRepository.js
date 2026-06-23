const { AppDataSource } = require('../db/postgres');
const Task = require('../entities/Task');

class PostgresTaskRepository {
    constructor() {
        this.repository = AppDataSource.getRepository(Task);
    }

    async create(taskData) {
        const newTask = this.repository.create(taskData);
        return await this.repository.save(newTask);
    }

    async findAll(filters = {}) {
        const queryOptions = {
            where: {}, 
        };

        if (filters.status) {
            queryOptions.where.done = filters.status === 'done';
        }
        if (filters.priority) {
            queryOptions.where.priority = filters.priority;
        }

        if (filters.sortBy) {
            const sortOrder = filters.order && filters.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            queryOptions.order = {
                [filters.sortBy]: sortOrder
            };
        } else {
            queryOptions.order = { createdAt: 'DESC' };
        }

        if (filters.limit) {
            const limit = parseInt(filters.limit, 10);
            const page = parseInt(filters.page, 10) || 1;

            queryOptions.take = limit;
            queryOptions.skip = (page - 1) * limit;
        }

        return await this.repository.find(queryOptions);
    }

    async findById(id) {
        return await this.repository.findOne({ 
            where: { id: id } 
        });
    }

    async findByUserId(userId) {
        return await this.repository.find({ 
            where: { userId: userId } 
        });
    }

    async update(id, updateData) {
        await this.repository.update(id, updateData);
        return await this.findById(id);
    }

    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }

    async markDone(id) {
        await this.repository.update(id, { done: true });
        return await this.findById(id);
    }

    async deleteAll() {
        await this.repository.clear();
    }
}

module.exports = PostgresTaskRepository;