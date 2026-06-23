require('dotenv').config();

const request = require('supertest');
const app = require('./index');
const { AppDataSource } = require('./src/db/postgres'); 

const TEST_USER_ID = "fad96c61-0d2f-484b-b435-0f133973b20f";

const isPostgresMode = process.env.DATA_SOURCE === 'postgres';

describe('Tasks API Inspection', () => {

  beforeAll(async () => {
    if (isPostgresMode) {
      while (!AppDataSource.isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  });

  afterAll(async () => {
    if (isPostgresMode && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  // --- TEST 1: The Health Check ---
  test('Should return 200 OK for the Health Check', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
  });

  // --- TEST 2: The Bouncer ---
  test('Should create a new task and return 201 Created', async () => {
    const response = await request(app)
        .post('/tasks')
        .send({ title: "Learn Automated Testing", priority: "high", userId: TEST_USER_ID });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Learn Automated Testing");
  });

  // --- TEST 3: Read (GET /tasks) ---
  test('Should return a list of all tasks', async () => {
    const response = await request(app).get('/tasks');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // --- TEST 4: Update  (PUT /tasks/:id) ---
  test('Should update an existing task', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Old Order", userId: TEST_USER_ID });
    const orderId = newTask.body.id; 
    const response = await request(app)
      .put(`/tasks/${orderId}`)
      .send({ title: "New Order" });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("New Order");
  });

  // --- TEST 5: Delete all (DELETE /tasks) ---
  test('Should delete all tasks', async () => {
    const response = await request(app).delete('/tasks');
    expect(response.statusCode).toBe(200);
  });

  // --- TEST 6: Read Single (GET /tasks/:id) ---
  test('Should find one specific task by its ID', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Find Me", userId: TEST_USER_ID });
    const orderId = newTask.body.id;
    const response = await request(app).get(`/tasks/${orderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Find Me");
  });

  // --- TEST 7: Done (PATCH /tasks/:id/done) ---
  test('Should mark a task as done', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Finish This", userId: TEST_USER_ID });
    const orderId = newTask.body.id;
    const response = await request(app).patch(`/tasks/${orderId}/done`);
    expect(response.statusCode).toBe(200);
    expect(response.body.done).toBe(true); 
  });

  // --- TEST 8: Delete ONE (DELETE /tasks/:id) ---
  test('Should delete one specific task', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Delete Me", userId: TEST_USER_ID });
    const orderId = newTask.body.id;
    const response = await request(app).delete(`/tasks/${orderId}`);
    expect(response.statusCode).toBe(204);
  });

});
