-- 1. All high-priority tasks that are still pending, sorted by creation date, limited to 20 results
SELECT *
FROM tasks 
WHERE priority = 'high' AND done = FALSE
ORDER BY "createdAt" DESC
LIMIT 20;

-- 2. The total count of tasks grouped by status
SELECT done, COUNT(*) AS total_count 
FROM tasks 
GROUP BY done;

-- 3. All tasks assigned to a specific user, with the user's name and email included (requires a JOIN)
SELECT t.id, t.title, t.priority, t.done, u.name, u.email 
FROM tasks t
JOIN users u ON t."userId" = u.id
WHERE u.id = '5cc9f8a4-4d9f-4c8f-8e9e-84de05157a52';

-- 4. The top 5 users by number of assigned tasks (requires JOIN, GROUP BY, ORDER BY, LIMIT)
SELECT u.id, u.name, u.email, COUNT(t.id) AS task_count
FROM users u
LEFT JOIN tasks t ON u.id = t."userId"
GROUP BY u.id, u.name, u.email
ORDER BY task_count DESC
LIMIT 5;

-- 5. All tasks created in the last 7 days that have no user assigned
SELECT * 
FROM tasks 
WHERE userId IS NULL 
  AND "createdAt" >= NOW() - INTERVAL '7 days';















/*
Part 6: Fix the N+1 Problem

Before the Fix (The N+1 Bug):
* The code used a loop, resulting in 101 queries (1 query to get 100 tasks + 100 separate queries to get the user for each task).

After the Fix (Eager Loading / JOIN):
* Added queryOptions.relations = ["user"] to use TypeORM eager loading.
* The database now uses a SQL LEFT JOIN.
* Query count: 1 main optimized query that fetches both tasks and users at the same time.
*/