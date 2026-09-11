import { AppDataSource } from '../db/postgres'; 
import { User } from '../entities/User';

export class PostgresUserRepository {
    repository: any;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(userData: any) {
        const newUser = this.repository.create(userData);
        return await this.repository.save(newUser);
    }

    async findAll() {
        return await this.repository.find();
    }

    async findById(id: string) {
        return await this.repository.findOne({ where: { id: id } });
    }

    async delete(id: string) {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}