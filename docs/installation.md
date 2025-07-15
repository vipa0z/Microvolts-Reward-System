[← Previous: Docs Home](./index.md)

# Installation Guide

This document will help you set up and run the Microvolts OverVolt Rewards Server on your local machine or server environment.

---

## Prerequisites

- **Node.js** (version 18.x or higher recommended)
- **npm** (comes with Node.js)
- **Git** (to clone the repository)
- **MariaDB** or **MySQL** database server

## 1. Clone the Repository

```
git clone https://github.com/vipa0z/Microvolts-Reward-System.git
cd Microvolts-Reward-System
```

## 2. Install Dependencies

Run the following command in the project root to install all required packages:

```
npm install
```

## 3. Set Up Environment Variables

Copy the example environment file and edit it as needed:

```
cp .env.example .env
```
Edit `.env` to match your database credentials and desired settings. See the [Environment Variables](./environment-variables.md) documentation for details.

## 4. Configure the Database

Ensure your MariaDB/MySQL server is running. For first-time setup, you may want to populate the database tables automatically:

```
node server.js --populate
```

See the [Database Setup](./database-setup.md) guide for more details.

## 5. Run the Server

To start the server:

```
node server.js
```
or
```
npm start
```

For development with automatic restarts on file changes:

run with node/nodemon
```
node ./server.js
```
![alt text](image.png)

## Troubleshooting
- Make sure your database server is running and credentials are correct in `.env`.
- If you encounter missing module errors, re-run `npm install`.
- For more help, see the [Configuration](./configuration.md) and [Environment Variables](./environment-variables.md) docs.

---
[Next: API Routes ->](https://github.com/vipa0z/Microvolts-Reward-System/blob/main/docs/API%20Routes.md)
 
[Docs Home <-](./index.md)
