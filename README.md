# Backend-Macky-Merch-API

A RESTful API built to manage product inventory and merchandise data.

## Setup Instructions

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MySQL** installed and running locally

### Installation & Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
    Make sure to fill up the env variables, specifically the password for your mysql, and ensure your MySQL is running.

3. **Run the server:**
   ```bash
   npm run dev
   ```

4.  **Run tests:**
   ```bash
   npm run test
   ```

## Architectural Explanation

I chose this folder structure because it was simple to understand. It is clear where each code section belongs to through the folder names. I would have likely changed some things such as making routers, controllers, and models folders for MVC were not for other reasons that will be known in the challenges section. The MySQL database was chosen for its strong relational data integrity and familiar SQL syntax. I had very little experience using the other databases and I lacked time doing so.

## Challenges Faced

I faced a pretty huge hurdle where in the past week, my laptop has been blacking out frequently so it was incredibly hard to do my tasks. I managed to handle this by learning the necessary information during the time it has blacked out and applying that knowledge when it isnt. I also faced another bug when configuring my env were it was somehow not pairing up with the MYSQL database. I eventually learned that the problem had to do with the env file having a bad naming convention. Process.env.user, for example, actually bases the value on a default value by the actual OS system, and I had to rename it to DB_USER.
