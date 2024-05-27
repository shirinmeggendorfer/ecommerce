#admin frontend dockerfile
FROM node:alpine

WORKDIR /app/e-commerce-admin2

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm install react-router-dom
RUN npm install axios
RUN npm install --save-dev jest @testing-library/react @testing-library/jest-dom


COPY . .

# Setzen der Umgebungsvariablen PORT
ENV PORT 3005

EXPOSE 3005

CMD ["npm", "run", "start"]
