# eCommerce

## How to Run the Project

1. **Install Docker**: Ensure Docker is installed on your machine.
2. **Open Terminal**: Access your terminal or command prompt.
3. **Navigate to Project Directory**: Change to the directory where your project is located.
    ```sh
    cd <path-to-project-folder>
    ```
4. **Start Docker Containers**: Use Docker Compose to start the containers.
    ```sh
    docker-compose up
    ```
5. **Terminate Containers**: When you need to stop the containers, run:
    ```sh
    docker-compose down
    ```
6. **Rebuild Containers**: If you need to rebuild the containers, run:
    ```sh
    docker-compose up --build
    ```

## How to Test

1. **Open Terminal**: Access your terminal or command prompt.

### Frontend

Run the following command to execute the frontend tests:
```sh
docker exec -it ecommerce-frontend-1 npm test


### Admin
Run the following command to execute the admin tests:

sh
Copy code
docker exec -it ecommerce-admin-1 npm test
Backend
Run the following command to execute the backend tests with coverage:


### Backend
sh
Copy code
docker exec -it ecommerce-backend-1 npx jest --coverage
Database Setup

The database is included in the project as a dump, and the dump is updated every minute.

Start Docker Containers
To start the Docker containers with the database setup, run:

sh
Copy code
docker-compose up --build
vbnet
Copy code

Replace `<path-to-project-folder>` with the actual path to your project directory 