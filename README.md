# 📝 Tasks API - Phase 1

This is a **REST API** built to manage tasks. It uses a "Bouncer" (Zod) to make sure all data is clean and valid before it enters our database.

## 🚀 How to Run
1. Open your terminal in the `tasks-api` folder.
2. Run `npm install` to get the tools.
3. Run **`npm start`** to wake up the server.
4. The server will listen at: `http://localhost:3000`

---

## 🛤 API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Check if the server is alive. Returns `{ "status": "ok" }`. |
| **POST** | `/tasks` | **Create** a task. Requires a `title`. Priority defaults to "medium". |
| **GET** | `/tasks` | **Read** all tasks. Use `?status=pending` to filter the list. |
| **GET** | `/tasks/:id` | **Read** one specific task using its unique ID. |
| **PUT** | `/tasks/:id` | **Update** a task's title, priority, or status. Adds an `updatedAt` stamp. |
| **PATCH** | `/tasks/:id/done` | **Fast Update**: Instantly marks a specific task as "done". |
| **DELETE** | `/tasks/:id` | **Delete** one task. Returns a `204` (No Content) success code. |
| **DELETE** | `/tasks` | **Clear All**: Wipes the entire database clean. |

---

## 🛡 Features
* **Validation:** Uses **Zod** to block empty titles or invalid priority levels.
* **IDs:** Every task gets a unique **UUID** barcode.
* **Timestamps:** Automatically records when a task is created and when it is last updated.
* **Logging:** Every request made is printed in the terminal.

---

### 🛠 Tools Used
* **Node.js & Express**
* **Zod** (The Bouncer/Auditor)
* **UUID** (The ID Maker)
* **Postman** (The Testing Lab)