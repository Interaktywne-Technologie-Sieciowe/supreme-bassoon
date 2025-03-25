## Set up the Project  

1. Clone the repository by either downloading a ZIP file or running the following command:  
    ```bash
    git clone <repo_url>
    ```  
2. Install dependencies in each folder if not already installed:  
    ```bash
    npm install
    ```  
3. Run the backend with:  
    ```bash
    node server.js
    ```  
4. Run the frontend:  
   Navigate to the frontend folder first, then start the development server:  
    ```bash
    cd frontend
    npm run dev
    ```  

---

## How to Create a New Project  

To create a Vue 3 project using Vite, follow the official guide [here](https://vite.dev/guide/#scaffolding-your-first-vite-project).  

Example command:  
```bash
npm create vite@latest
```

---

## How to Create a Simple Server  

We are using **Express.js** ([Link](https://expressjs.com/)).  

### Install Express  
```bash
npm install express --save
touch server.js  # or any other filename
```

### Create a Simple Server  
```javascript
// server.js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

---

## How to Deploy on AWS ECS  

### 1. Prerequisites  
Make sure you have the following installed and configured:  
- **AWS account**  
- **AWS CLI** (`aws configure`)  
- **Docker**  

---

### 2. Create Dockerfiles for Frontend & Backend  

#### Backend (`Dockerfile`)  
Create a `Dockerfile` inside the backend folder:  
```dockerfile
# Use an official Node.js runtime as a base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
```

#### Frontend (`Dockerfile`)  
Create a `Dockerfile` inside the frontend folder:  
```dockerfile
# Use Node.js for building
FROM node:lst-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies and build the app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Use Nginx to serve the built frontend
FROM nginx:alpine

# Copy build files to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (for production) and 5173 (for local development)
EXPOSE 80 5173

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

### 3. Build and Push to AWS Elastic Container Registry (ECR)  

AWS ECR is a private container registry for storing Docker images.  

1. **Create an ECR repository**  
   ```bash
   aws ecr create-repository --repository-name supreme-bassoon-backend
   aws ecr create-repository --repository-name supreme-bassoon-frontend
   ```  
2. **Authenticate Docker with ECR**  
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com
   ```  
3. **Build and push images**  
   ```bash
   docker build -t supreme-bassoon-backend ./backend
   docker tag supreme-bassoon-backend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/supreme-bassoon-backend
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/supreme-bassoon-backend

   docker build -t supreme-bassoon-frontend ./frontend
   docker tag supreme-bassoon-frontend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/supreme-bassoon-frontend
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/supreme-bassoon-frontend
   ```  

If you're unsure about the repository URLs, you can retrieve them from the AWS Console or by running:  
```bash
aws ecr describe-repositories --query "repositories[*].repositoryUri" --output table
```

---

### 4. Create ECS Cluster & Services  

You can create an **ECS cluster** manually via the AWS Console or automate it using **Terraform**.  

#### (A) Using AWS Console  

1. **Create an ECS Cluster** (choose **Fargate**)  
2. **Create Task Definitions** for `backend` and `frontend`:  
   - Choose **Fargate**  
   - Add container definitions:  
     - Backend → Image URI = **ECR backend URL**  
     - Frontend → Image URI = **ECR frontend URL**  
   - Set **port mappings** (Backend: `3000`, Frontend: `80`)  
3. **Create ECS Services**  
   - **Backend Service** (Assign Task Definition)  
   - **Frontend Service** (Assign Task Definition)  
4. **Attach Load Balancer (Optional)**  
   - Create an **Application Load Balancer (ALB)**  
   - Route traffic to **Frontend** and **Backend** tasks  

---

### 5. Update ECS Services on New Code Changes  

Whenever you update your code:  

1. **Rebuild & Push New Images**  
   ```bash
   docker build -t supreme-bassoon-backend ./backend
   docker tag supreme-bassoon-backend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/supreme-bassoon-backend
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/supreme-bassoon-backend
   ```  
2. **Force ECS Service to Update**  
   ```bash
   aws ecs update-service --cluster supreme-bassoon-cluster --service backend-service --force-new-deployment
   ```  

---

### 6. Verify Deployment  

- Go to **AWS ECS Console** → Services  
- Check **Task Status**  
- Access the app via **Load Balancer or Public IP**  

🚀 **Your Vue 3 + Express.js app is now deployed on AWS ECS!** 🚀  
