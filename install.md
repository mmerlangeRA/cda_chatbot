# CDA Chatbot Installation

This document provides instructions on how to run the CDA Chatbot application locally and how to build and run it using Docker.

## Running Locally

To run the application locally, you need to have Node.js and npm installed. You can then follow these steps:

1. **Configure environment variables:**

   Create a `.env` file in the root directory of the project and add your chatbot server URL:

   ```
   REACT_APP_CHATBOT_SERVER_URL=YOUR_CHATBOT_SERVER_URL_HERE
   REACT_APP_DOCUMENT_SERVER_URL=http://localhost:8000
   ```

   Replace `YOUR_CHATBOT_SERVER_URL_HERE` with the actual URL of your chatbot server. The `REACT_APP_DOCUMENT_SERVER_URL` should point to your document management backend.

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

   This will start the application in development mode and open it in your default web browser at `http://localhost:3000`.

   **Note:** For the document management features (listing, viewing, and deleting documents) to work, ensure your document server is running and accessible at the `REACT_APP_DOCUMENT_SERVER_URL` specified in your `.env` file.

## Running with Docker

To run the application with Docker, you need to have Docker installed. You can then follow these steps:

1. **Build the Docker image:**

   ```bash
   docker build -t cda-chatbot .
   ```

2. **Run the Docker container:**

   ```bash
   docker run -p 8080:80 cda-chatbot
   ```

   This will start the application in a Docker container and make it accessible at `http://localhost:8080`.
