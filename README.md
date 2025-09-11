# Sravz Backend Node.js Codebase

This is the Node.js backend for the Sravz Portfolio Analytics Platform. It provides REST APIs, WebSocket support, job scheduling, authentication, and integration with MongoDB, Redis, and NSQ.

## Features

- Express.js REST API server
- WebSocket support (Socket.IO)
- MongoDB integration (Mongoose)
- Redis integration (ioredis)
- NSQ integration (nsqjs)
- Authentication (Passport.js with multiple strategies)
- Job scheduling (cron)
- Modular architecture (controllers, models, routes, services)
- Docker and Makefile support for local and containerized development
- Grunt-based build and test scripts

## Directory Structure

```
backend-node/
├── app/
│   ├── assets/
│   ├── controllers/
│   ├── jobs/
│   ├── models/
│   ├── modules/
│   ├── ngx-admin/
│   ├── policies/
│   ├── routes/
│   ├── services/
│   └── views/
├── config/
│   ├── env/
│   ├── config.js
│   └── ...
├── tests/
├── tmp/
├── server.js
├── package.json
├── Makefile
├── Dockerfile
├── README.md
└── ...
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- MongoDB instance (local or remote)
- Redis instance (optional, for caching)
- Docker (optional, for containerized builds)

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm start
```
or
```bash
node server.js
```
The server will start on the port specified in your environment (default: 3032).

### Build Docker Image

```bash
make build
```
or
```bash
docker build -t sravz-backend-node .
```

### Running in Production

Use the provided `Procfile` with a process manager like `forever` or `pm2`:
```
web: ./node_modules/.bin/forever -m 5 server.js
```

## Testing

```bash
npm test
```
or
```bash
grant test
```

## Main Dependencies

- express, mongoose, ioredis, nsqjs, passport, socket.io, winston, body-parser, cors, helmet, lodash, grunt

## Configuration

- Environment-specific configs are in `config/env/`
- Main config is in `config/config.js`
- Set `NODE_ENV` to select the environment (default: vagrant)

## Project Structure

- `app/controllers/` - Express route controllers
- `app/models/` - Mongoose models
- `app/routes/` - Express route definitions
- `app/services/` - Business logic and integrations
- `config/` - Application and environment configuration
- `tests/` - Unit and integration tests

## License
All rights reserved. Sravz LLC.