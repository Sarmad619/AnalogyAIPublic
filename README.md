# AnalogyAI 🧠✨

A full-stack web application that democratizes learning by translating complex topics into simple, personalized analogies using generative AI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)

**Live Demo:** [**https://analogyai-app-362544124568.us-central1.run.app/**](https://analogyai-app-362544124568.us-central1.run.app/)

## About The Project

AnalogyAI was built to bridge the knowledge gap for students, professionals, and lifelong learners. Unlike generic explanation tools, its primary differentiator is its deep personalization capability. Users can ground abstract concepts in their own unique interests and hobbies, which significantly enhances comprehension and information retention.

### Key Features

* **AI-Powered Analogies:** Leverages the OpenAI GPT-4o model to generate clear and accurate analogies.
* **Deep Personalization:** Tailors explanations to user-provided interests and knowledge levels (beginner, intermediate, advanced).
* **User Accounts & History:** Secure Google OAuth 2.0 authentication and persistent user history, allowing users to review past analogies.
* **Customizable Profiles:** Users can set default preferences for knowledge level and analogy style.
* **Responsive Design:** A polished user experience on both desktop and mobile devices.

### Built With

This project utilizes a modern, full-stack TypeScript architecture.

* **Frontend:** [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [TanStack Query](https://tanstack.com/query/latest)
* **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
* **Authentication:** [Passport.js](http://www.passportjs.org/) with Google OAuth 2.0
* **Deployment:** [Docker](https://www.docker.com/), [Google Cloud Build](https://cloud.google.com/build), and [Google Cloud Run](https://cloud.google.com/run)

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

You will need the following software installed on your machine:
* [Node.js (v20.x or later)](https://nodejs.org/en/download/)
* [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
* [Git](https://git-scm.com/downloads)
* [PostgreSQL (v16 or later)](https://www.postgresql.org/download/)

### Installation & Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Sarmad619/AnalogyAIPublic.git](https://github.com/Sarmad619/AnalogyAIPublic.git)
    cd AnalogyAI
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up the local database:**
    * Connect to your local PostgreSQL instance as a superuser (e.g., `psql -U postgres`).
    * Run the following SQL commands to create a dedicated user and database:
        ```sql
        CREATE USER your_username WITH PASSWORD 'your_password';
        CREATE DATABASE analogyai OWNER your_username;
        ```

4.  **Configure Environment Variables:**
    * Create a `.env` file in the root of the project. It's recommended to copy the example file:
        ```bash
        # For macOS/Linux
        cp .env.example .env

        # For Windows Command Prompt
        copy .env.example .env
        ```
    * Fill in the `.env` file with your credentials for your **local setup**.

5.  **Run the Database Migration:**
    * This command uses Drizzle Kit to create all the necessary tables in your database.
        ```bash
        npm run db:push
        ```

6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Your application should now be running at `http://localhost:5000`.

---

## ☁️ Deployment

This application is configured for deployment on **Google Cloud Run**. A multi-stage `Dockerfile` is included in the repository, which builds a lean, production-ready container image.

The deployment process involves:
1.  Building the container image using Google Cloud Build (`gcloud builds submit`).
2.  Deploying the image to Google Cloud Run (`gcloud run deploy`), connecting it to a Cloud SQL database instance and passing in production environment variables.

## 📄 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## 📧 Contact

Muhammad Sarmad Khan - [www.linkedin.com/in/muhammad-sarmad-khan-a5233a175]