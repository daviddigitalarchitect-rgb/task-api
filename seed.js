// --- SEED CONFIGURATION ---
const USER_ID = "fb592b4a-f69d-4423-bfbc-a817a2ea52d7"; 
const SEED_COUNT = 100; 

console.log(`Preparing to plant ${SEED_COUNT} tasks into the cloud...`);

const seedDatabase = async () => {
    const promises = [];
    const priorities = ["low", "medium", "high"];

    for (let i = 1; i <= SEED_COUNT; i++) {
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
        const isDone = i % 2 === 0;

        const request = fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Seeded Survey Task #${i}`,
                description: `Generated test data for filtering.`,
                priority: randomPriority,
                done: isDone,
                userId: USER_ID
            })
        });
        promises.push(request);
    }

    try {
        await Promise.all(promises);
        console.log(`Success! ${SEED_COUNT} tasks successfully planted in Neon Postgres.`);
        console.log(`Next Step: Open Postman and test your filters!`);
    } catch (error) {
        console.error("Seeding failed:", error);
    }
};

seedDatabase();