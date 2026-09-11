import { AppDataSource } from '../db/postgres'; 
import { Task } from '../entities/Task';

export class PostgresTaskRepository {
    repository: any;

    constructor() {
        this.repository = AppDataSource.getRepository(Task);
    }

    async create(taskData: any) {
        const newTask = this.repository.create(taskData);
        return await this.repository.save(newTask);
    }

    async findAll() {
        return await this.repository.find();
    }

    async findById(id: string) {
        return await this.repository.findOne({ where: { id: id } });
    }

    async findByUserId(userId: string) {
        return await this.repository.find({ where: { userId: userId } });
    }

    async findAndCount(options: any) {
        return await this.repository.findAndCount(options);
    }

    async update(id: string, updateData: any) {
        await this.repository.update(id, updateData);
        return await this.findById(id);
    }

    async markDone(id: string) {
        await this.repository.update(id, { done: true });
        return await this.findById(id);
    }

    async delete(id: string) {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}