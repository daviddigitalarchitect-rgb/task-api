const request = require('supertest');

const app = require('./index');

describe('Tasks API Kitchen Inspection', () => {

  // --- TEST 1: The Health Check ---
  test('Should return 200 OK for the Health Check', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  // --- TEST 2: The Bouncer ---
  test('Should create a new task and return 201 Created', async () => {
    const response = await request(app)
        .post('/tasks')
        .send({ title: "Learn Automated Testing", priority: "high" });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Learn Automated Testing");
  });

  // --- TEST 3: Read the Menu (GET /tasks) ---
  test('Should return a list of all tasks', async () => {
    const response = await request(app).get('/tasks');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // --- TEST 4: Change an Order (PUT /tasks/:id) ---
  test('Should update an existing task', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Old Order" });
    const orderId = newTask.body.id; 
    const response = await request(app)
      .put(`/tasks/${orderId}`)
      .send({ title: "New Order" });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("New Order");
  });

  // --- TEST 5: Throw away the trash (DELETE /tasks) ---
  test('Should delete all tasks', async () => {
    const response = await request(app).delete('/tasks');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain("Successfully deleted");
  });

  // --- TEST 6: Find One Order (GET /tasks/:id) ---
  test('Should find one specific task by its ID', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Find Me" });
    const orderId = newTask.body.id;
    const response = await request(app).get(`/tasks/${orderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Find Me");
  });

  // --- TEST 7: The Fast "Done" Button (PATCH /tasks/:id/done) ---
  test('Should mark a task as done', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Finish This" });
    const orderId = newTask.body.id;
    const response = await request(app).patch(`/tasks/${orderId}/done`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("done");
  });

  // --- TEST 8: Throw away ONE Order (DELETE /tasks/:id) ---
  test('Should delete one specific task', async () => {
    const newTask = await request(app).post('/tasks').send({ title: "Delete Me" });
    const orderId = newTask.body.id;
    const response = await request(app).delete(`/tasks/${orderId}`);
    expect(response.statusCode).toBe(204); 
  });

});