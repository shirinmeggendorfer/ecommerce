# eCommerce

How to run project :

- install docker 
- open terminal
- cd <path-to-project-folder>
- run docker-compose up --build

x
How to test 
- open terminal 

Frontend:
- run "docker exec -it ecommerce-frontend-1 npm test"

Admin:
- run " docker exec -it   ecommerce-admin-1  npm test "

Backend:
- run " docker exec -it ecommerce-backend-1 npx jest --coverage --detectOpenHandles "


