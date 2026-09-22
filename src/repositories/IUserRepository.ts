export interface IUserRepository {
  findAll(): Promise<any>;
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  create(userData: any): Promise<any>;
  delete(id: string): Promise<any>;
}