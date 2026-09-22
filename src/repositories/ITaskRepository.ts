export interface ITaskRepository {
  findAll(filters?: any): Promise<any>;
  findById(id: string): Promise<any>;
  findByUserId(userId: string): Promise<any>;
  create(taskData: any): Promise<any>;
  update(id: string, updateData: any): Promise<any>;
  markDone(id: string): Promise<any>;
  delete(id: string): Promise<any>;
  deleteAll(): Promise<any>;
}