Part 5: Performance — EXPLAIN ANALYZE

Before Adding Indexes:

- Query 1: Seq Scan | Execution time: 6.96ms
- Query 2: Seq Scan | Execution time: 17.7ms
- Query 3: Seq Scan (on tasks) | Execution time: 2.72ms

Adding the Indexes:
CREATE INDEX idx_tasks_done ON tasks(done);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks("createdAt");
CREATE INDEX idx_tasks_userid ON tasks("userId");

After Adding Indexes:

- Query 1: Index Scan | Execution time: 0.147ms (Scan changed and time dropped massively)
- Query 2: Index Only Scan | Execution time: 8.53ms (Scan changed and time halved)
- Query 3: Seq Scan | Execution time: 3.19ms (Database kept Seq Scan because table is small)
