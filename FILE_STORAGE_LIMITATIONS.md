# File Storage Limitations Report

Here are my notes from the Project 2 file storage experiment. Honestly, building this made me realize exactly why real databases exist. Relying on `fs` and JSON files was completely fine for a handful of tasks, but the second I tried to stress-test the system, the architecture started falling apart. 

Here are the four major structural failures I observed during testing, and the database concepts required to fix them:

### 1. The Race Condition (Missing Atomic Locks)
I tested the API's ability to handle concurrent traffic by firing 50 POST requests at the exact same millisecond. The result was a massive data collision. Because my code has to read the file into memory, push the new task to the array, and then overwrite the file, it creates a dangerous time gap. All 50 requests loaded the *old* data simultaneously, and whichever request finished saving last simply overwrote and deleted the previous 49. 
* **The Solution:** I need a database that uses **Atomic Locks**, ensuring that if one user is writing to a record, the database locks the door and forces other requests to wait in a secure queue.

### 2. The Massive Lag (Full Table Scans)
This was the craziest part to watch. I wrote a seed script to dump 10,000 fake tasks into the JSON file. When I tried to fetch the tasks assigned to just one specific user, the response time spiked heavily. To find a relationship, the server was forced to load massive text files into RAM and run a `.filter()` loop through all 10,000 items just to find two matches. 
* **The Solution:** This manual loop is called a **Full Table Scan**, and it wastes terrible amounts of CPU and Memory. A real database uses **Indexes** (like the back of a textbook) to instantly jump straight to the correct row without scanning the entire file cabinet.

### 3. Orphaned Ghost Tasks (Lack of Referential Integrity)
I deleted a user from `users.json`, but when I checked `tasks.json`, all of their tasks were still there, assigned to an ID that belonged to a ghost. Because the two text files are completely blind to each other, there is no built-in rule enforcing data integrity. To fix it with files, I would have to write massive blocks of JavaScript to hunt down and clean up those tasks manually every single time a user is deleted.
* **The Solution:** A relational database handles this at the hardware level using **Foreign Key Constraints**. If I set a rule for **Cascading Deletes**, deleting a user will automatically trigger the database to wipe out their associated tasks instantly.

### 4. Silent Data Loss & File Corruption
I realized that if the server loses power exactly in the middle of a `fs.writeFile` operation, the file is cut in half and permanently destroyed. To simulate this, I manually deleted the final `]` bracket in `tasks.json`. Because of my `try...catch` block, the server didn't crash; instead, it returned a `200 OK` status and an empty array `[]`. It lied to the client, pretending there were zero tasks while the real data was trapped inside a corrupted file. 
* **The Solution:** This **Silent Data Loss** is terrifying for a production app. A proper database uses **Transactions**. A save operation is strictly "all or nothing"—it either completes 100% safely, or it detects a failure and rolls back to the last healthy state, ensuring the file is never left corrupted.