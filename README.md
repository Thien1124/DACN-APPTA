# 📘 EnglishMaster – AI English Learning Platform

**EnglishMaster** is a smart English learning system that combines the power of Artificial Intelligence (AI) with Gamification mechanics to provide a personalized and highly interactive learning roadmap for users.

## 🚀 Key Features (Backend Focused)

* **AI-Powered Content:** Integrated **Google Gemini AI API** to automate vocabulary definitions, generate context-aware examples, and provide intelligent feedback to learners.
* **Real-time Engagement:** Implemented real-time updates for Missions, Leaderboards, and Virtual Shops using **Socket.io**.
* **Advanced Interaction Modules:** Developed robust processing pipelines for:
    * **Dictation:** Automated listening and transcription exercises.
    * **Shadowing:** Speech recognition and scoring through Speech-to-Text integration.
* **Adaptive Learning Roadmap:** Backend algorithms to track user progress and dynamically suggest the next steps in their learning journey.
* **Security & Authorization:** Secure user sessions and Role-Based Access Control (RBAC) implemented via **JWT**.

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose) |
| **AI Engine** | Google Gemini AI API |
| **Real-time** | Socket.io |
| **Authentication** | JSON Web Token (JWT) |
| **Dev Tools** | Postman, Git, Docker |

## 🏗 Database Architecture

The project utilizes **MongoDB** with a flexible schema design to handle diverse data types:
* **Users:** Stores profiles, learning progress, and virtual currency (Gems).
* **Flashcards:** A dynamic vocabulary bank optimized for high-speed querying.
* **Missions & Leaderboards:** Structured for efficient real-time data broadcasting.

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Thien1124/DACN-APPTA.git](https://github.com/Thien1124/DACN-APPTA.git)
   cd DACN-APPTAInstall dependencies:

2.**Install dependencies:**
    
    npm install
    
3.**Configure Environment Variables (.env):
Create a .env file in the root directory and add:**

   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_ai_key
   JWT_SECRET=your_secret_key
    
4. **Run the application:**
    ```bash
     npm start
    
## 📝 Project Information

* Category: Major Project (Đồ án chuyên ngành)
* Institution: Ho Chi Minh City University of Technology (HUTECH)
* Role: 
* P.Thien (Lead) & D.Phat : Backend Developer (System Design, API Development & AI Integration)
* V.Son : Frontend Developer 
