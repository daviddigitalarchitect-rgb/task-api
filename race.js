const REQUEST_COUNT = 50;

console.log(`🧨 Alert: Firing ${REQUEST_COUNT} concurrent requests to test the foundation...`);

const fireRequest = async (index) => {
  try {
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Race Condition Task #${index}`,
        priority: "high"
      })
    });
    return response.status;
  } catch (error) {
    console.error(`Request ${index} failed to connect.`);
  }
};

const promises = [];
for (let i = 1; i <= REQUEST_COUNT; i++) {
  promises.push(fireRequest(i));
}

Promise.all(promises).then(() => {
  console.log(`💥 Impact complete! We attempted to save ${REQUEST_COUNT} tasks.`);
  console.log("Check your tasks.json file. Count how many actually survived the collision!");
});