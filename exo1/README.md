# Winamax Technical Test Project

This project consists of an Express server, a worker, and a testing script to simulate the processing of bets using Socket.IO. The worker processes messages sent by clients, and the testing script allows you to simulate multiple clients sending messages to the server.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

The project utilizes Node.js, Redis, Socket.IO, and Express to create a simple server-worker architecture. Clients can send messages to the server, and the worker processes these messages asynchronously.

## Getting Started

Follow the steps below to set up and run the project locally.

### Prerequisites

- Node.js installed on your machine.
- Redis database server running locally

### Installation

1. Navigate to the `express` directory:

    ```bash
    cd express
    ```

2. Install Express dependencies:

    ```bash
    npm install
    ```

3. Navigate to the `worker` directory:

    ```bash
    cd ../worker
    ```

4. Install Worker dependencies:

    ```bash
    npm install
    ```

5. Navigate to the `tests/stress_test` directory:

    ```bash
    cd ../../tests/stress_test
    ```

6. Install Stress Test dependencies:

    ```bash
    npm install
    ```

## Usage

To run the project, execute the start script:

```bash
.\tests\lancement.ps1
```

The script will start the Express server and the worker with default or specified instances number. The server will be accessible at `http://localhost:3000`.

## Project Structure

```plaintext
winamax-tech-test/
│
├─ express/
|--|-- ... (Express application files)
├─ worker/
|--|-- ... (Worker application files)
├─ tests/
│   └─ stress_test/
│       └─ index.js
│   └─ lancement.ps1
├─ front.html
└─ README.md
```

- **express/**: Contains the Express server code.
- **worker/**: Contains the worker processing logic.
- **tests/stress_test/**: Contains the stress test script.
- **front.html**: Front-end HTML file for testing the server.
- **README.md**: Project documentation.

## Configuration

No additional configuration is needed. However, you can adjust the number of instances in the testing script.

## Acknowledgments

- The project uses Node.js, Redis, Express, and Socket.IO.
- Thanks to the Winamax team for the technical test opportunity.
