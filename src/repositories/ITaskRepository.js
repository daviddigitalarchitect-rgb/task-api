class ITaskRepository {
  async findAll(filters) { throw new Error("Method not implemented"); }
  async findById(id) { throw new Error("Method not implemented"); }
  async findByUserId(userId) { throw new Error("Method not implemented"); }
  async create(taskData) { throw new Error("Method not implemented"); }
  async update(id, updateData) { throw new Error("Method not implemented"); }
  async markDone(id) { throw new Error("Method not implemented"); }
  async delete(id) { throw new Error("Method not implemented"); }
  async deleteAll() { throw new Error("Method not implemented"); }
}

module.exports = ITaskRepository;