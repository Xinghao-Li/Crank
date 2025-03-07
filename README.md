
# Enabling user-friendly access to an ML disease prediction tool

This project is a full-stack application consisting of a **frontend**, **backend**, **MySQL database**, and **Redis**. The application is containerized using Docker and managed with `docker-compose`.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system.
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually comes with Docker Desktop).

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. set .env 
Please check the zip file which we also provide you the env setting to run this code.
To ensure the application works as expected, you need to create a .env file in the project-directory with the following configuration:
```bash
MYSQL_ROOT_PASSWORD=<password>
MYSQL_PASSWORD=<password>
OPENAI_API_KEY=<key>
```

### 3. Start the Application
Run the following command to build and start all services:
```bash
docker-compose up --build
```

This will:
- Build and run the **MySQL** and **Redis** containers.
- Build and run the **backend** and **frontend** services.
- Automatically initialize the MySQL database with the provided `init_db.sql` file.

### 4. Access the Application
- **Frontend**: Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
- **Backend**: Access the API at [http://localhost:5000](http://localhost:5000).


---

## Stopping the Application
To stop all running containers:
```bash
docker-compose down
```

---

## Project Structure
```
├── docker-compose.yml       # Docker Compose configuration
├── server/                  # Backend files and Dockerfile
├── frontend/                # Frontend files and Dockerfile
├── server/init_db.sql       # SQL script to initialize MySQL
```

---
