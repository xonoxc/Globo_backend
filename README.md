# 🌐 Globo Blog Backend

A robust and scalable backend service for the Globo blogging platform, built with Node.js, TypeScript, and Express.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)
![Express](https://img.shields.io/badge/express-%5E4.18.0-lightgrey)

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database](#database)
- [File Upload](#file-upload)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- RESTful API endpoints for blog management
- User authentication and authorization
- MySQL database with Prisma ORM
- File upload handling with Multer and Cloudinary
- TypeScript for type safety
- Input validation and sanitization
- Error handling middleware
- Unit and integration tests

## 🛠 Technologies

- Node.js
- TypeScript
- Express.js
- MySQL
- Prisma ORM
- Docker
- Multer
- Cloudinary

## 📝 Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- TypeScript >= 5.0.0
- MySQL >= 8.0
- Cloudinary account

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/globo-backend.git
cd globo-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .sample.env .env
```

4. Start the MySQL container:
```bash
docker-compose up -d
```

5. Run Prisma migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

> [!NOTE]
> this is a high level overview of the file structure the overall file structure may change as development progresses

```
src/
├── caching/        # redis config
├── controllers/    # Request handlers
├── middlewares/    # Custom middleware
├── models/         # Prisma schema and types
├── lib/            # libraries and utilities
├── routes/         # API routes
├── types/          # Common types
├── constants/      # constants
├── utils/          # Utility functions
├── cloudinary/     # cloudinary config
└── app/            # App configuration
└── index.ts        # App entry point
```


## 💾 Database

The application uses MySQL as the primary database, containerized with Docker. Prisma ORM is used for database operations.

## 📤 File Upload

File uploads are handled using Multer for temporary storage and Cloudinary for permanent storage.

### Supported File Types

- Images: .jpg, .jpeg, .png, .gif
- Maximum file size: 5MB

## 🔐 Environment Variables

Create a `.env` file in the root directory 


### Production Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

A project By [xonoxc](https://github.com/xonoxc)
