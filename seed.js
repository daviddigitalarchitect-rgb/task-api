const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const tasksFilePath = path.join(__dirname, 'tasks.json');

const davidUserId = "29e2da35-c868-4784-b3bd-1d6d2cf88e4f";

const possibleUsers = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), davidUserId];
const statuses = ["pending", "done"];
const priorities = ["low", "medium", "high"];

let massiveTaskArray = [];

console.log("Starting construction: Generating 10,000 tasks...");

for (let i = 0; i < 10000; i++) {
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
  const randomUser = possibleUsers[Math.floor(Math.random() * possibleUsers.length)];

  massiveTaskArray.push({
    id: uuidv4(),
    title: `Stress Test Task #${i + 1}`,
    priority: randomPriority,
    status: randomStatus,
    assignedTo: randomUser,
    createdAt: new Date().toISOString()
  });
}

fs.writeFileSync(tasksFilePath, JSON.stringify(massiveTaskArray, null, 2), 'utf8');

console.log("Successfully seeded 10,000 tasks into tasks.json! Prepare for lag.");