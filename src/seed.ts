import 'dotenv/config';
import { AppDataSource } from './db/postgres';
import { Task } from './entities/Task';
import { User } from './entities/User';

async function runSeed() {
  console.log("Connecting to Postgres...");
  await AppDataSource.initialize();
  
  console.log("Creating dummy user...");
  const user = await AppDataSource.getRepository(User).save({
    email: `seed_${Date.now()}@example.com`,
    password: "password123"
  });

  const totalTasks = 1000000;
  const batchSize = 10000;
  const totalBatches = totalTasks / batchSize;

  console.log(`Starting insertion of ${totalTasks} tasks...`);

  for (let i = 0; i < totalBatches; i++) {
    const batch: any[] = []; 
    for (let j = 0; j < batchSize; j++) {
      batch.push({
        title: `Seed Task ${i * batchSize + j}`,
        priority: "low",
        userId: user.id
      });
    }

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Task)
      .values(batch)
      .execute();

    console.log(`Batch ${i + 1} of ${totalBatches} done...`);
  }

  console.log("All 1 Million tasks seeded successfully!");
  process.exit(0);
}

runSeed().catch(err => console.error(err));