const { AppDataSource } = require('../db/postgres'); 
const User = require('../entities/User');



class PostgresUserRepository {
    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(userData) {
        const newUser = this.repository.create(userData);
        return await this.repository.save(newUser);
    }

    async findAll() {
        return await this.repository.find();
    }

    async findById(id) {
        return await this.repository.findOne({ where: { id: id } });
    }

    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
}

module.exports = PostgresUserRepository;