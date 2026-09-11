export class ITaskRepository {
  async findAll(filters?: any) { throw new Error("Method not implemented"); }
  async findById(id: string) { throw new Error("Method not implemented"); }
  async findByUserId(userId: string) { throw new Error("Method not implemented"); }
  async create(taskData: any) { throw new Error("Method not implemented"); }
  async update(id: string, updateData: any) { throw new Error("Method not implemented"); }
  async markDone(id: string) { throw new Error("Method not implemented"); }
  async delete(id: string) { throw new Error("Method not implemented"); }
  async deleteAll() { throw new Error("Method not implemented"); }
}