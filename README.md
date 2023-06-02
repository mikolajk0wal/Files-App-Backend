# Files App Backend

📂 Welcome to the Files App Backend repository! This is the backend server for the Files App, providing API endpoints for user authentication, file management, comments, and user operations.

## Most important endpoints

### Authentication Endpoints

🔐 Register a User

- Endpoint: `/api/auth/register`
- Method: `POST`
- Description: Register a new user.

🔑 Login User

- Endpoint: `/api/auth/login`
- Method: `POST`
- Description: Authenticate a user and retrieve an access token.

### Comments Endpoints

💬 Get All Comments

- Endpoint: `/api/comments`
- Method: `GET`
- Description: Retrieve all comments.

✏️ Create a Comment

- Endpoint: `/api/comments`
- Method: `POST`
- Description: Create a new comment.

🗑️ Delete a Comment

- Endpoint: `/api/comments/:id`
- Method: `DELETE`
- Description: Delete a comment by ID.

### Files Endpoints

📂 Get All Files

- Endpoint: `/api/files`
- Method: `GET`
- Description: Retrieve all files.

⬆️ Upload a File

- Endpoint: `/api/files`
- Method: `POST`
- Description: Upload a new file.

📄 Get File by ID

- Endpoint: `/api/files/:id`
- Method: `GET`
- Description: Retrieve a file by ID.

🗑️ Delete a File

- Endpoint: `/api/files/:id`
- Method: `DELETE`
- Description: Delete a file by ID.

### Users Endpoints

👥 Get All Users

- Endpoint: `/api/users`
- Method: `GET`
- Description: Retrieve all users.

👤 Get User by ID

- Endpoint: `/api/users/:id`
- Method: `GET`
- Description: Retrieve a user by ID.

✏️ Update User

- Endpoint: `/api/users/:id`
- Method: `PUT`
- Description: Update a user by ID.

🗑️ Delete User

- Endpoint: `/api/users/:id`
- Method: `DELETE`
- Description: Delete a user by ID.

📣 Please note that these are just examples based on the information provided. You may need to further customize and update the documentation according to your specific project requirements.

## Technologies Used

⚙️ Node.js
🍃 MongoDB
🦅 Nest.js
🔷 TypeScript

## Getting Started

🛠️ To get started with the Files App, follow these steps:

  ### Backend:
  1. Clone repo https://github.com/creend/Files-App-Backend
  2. `npm install`
  3. Crete .env file
  4. In .env set `SECRET_TOKEN=YOUR SECRET TOKEN`
  5. In .env set `DATABASE_URL=YOUR MONGO DB DATABASE URL`
  6. In mongodb cloud configure atlas search
  7. First index's name is "default" and indexed fields are dynamic
  8. Second index's name is "autocomplete" and indexed field is "title"
  https://www.youtube.com/watch?v=3IDlOI0D8-8&t=897s (Full autocomplete mongodb guide)
  9. `npm run start:dev`

  ### Frontend:

  1. Clone repo https://github.com/creend/Files-App-Frontend
  2. `npm install`
  3. `npm run dev`

🌟 Congratulations! You now have the Files App Frontend up and running locally.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or feedback, please reach out to the project maintainer:

👤 Creend

📧 Email: creend42@gmail.com

💼 GitHub: [@creend](https://github.com/creend)
