# 🎵 Music App

I'm building a full-stack music streaming app as a hands-on project to improve my development skills and understand how a music streaming application works behind the scenes.

The main goal of this project is to learn how to build REST APIs, manage users and roles, handle authentication, upload music, and organize songs into albums.

## 🚀 Features

- **User Authentication** — User registration and login using JWT.
- **Password Security** — Passwords are hashed using bcrypt before being stored.
- **Role-Based Access Control** — Separate permissions for users and artists.
- **Music Upload** — Artists can upload music files.
- **Cloud Storage** — Music files are uploaded using ImageKit.
- **Album Management** — Artists can create albums and add music to them.
- **Fetch Music** — Retrieve uploaded songs along with artist details.
- **Album APIs** — Get all albums or fetch a specific album by its ID.
- **Logout** — Clear the authentication cookie.
- **Pagination** — Fetch music in smaller batches instead of loading everything at once.
- **Cover Images** — Songs and albums can have cover art, stored on ImageKit.
- **Edit & Delete** — Artists can rename, re-cover or delete their own songs and albums.
- **Search** — Find songs, albums and artists by name.
- **Artist Pages** — See every song and album by an artist.
- **Liked Songs** — Heart songs and find them on one page.
- **Playlists** — Create, rename and delete private playlists and add or remove songs.
- **Frontend** — React web app with a persistent audio player.

## 🛠️ Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Backend framework
- **MongoDB** — Database
- **Mongoose** — MongoDB object modeling
- **JWT** — Authentication
- **bcrypt** — Password hashing
- **Multer** — Handling file uploads
- **ImageKit** — Music file storage
- **Cookie-parser** — Reading authentication cookies
- **dotenv** — Managing environment variables

## 📁 Project Structure

```text
├── src/
│   ├── controllers/   # auth + music logic
│   ├── db/            # MongoDB connection
│   ├── middlewares/   # authUser / authArtist (JWT cookie)
│   ├── models/        # user, music, album, playlist
│   ├── routes/
│   ├── services/      # ImageKit upload
│   └── app.js
├── frontend/          # React + Vite web app
├── server.js
├── .env
├── .gitignore
└── package.json
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Lavish126/music-app.git
cd music-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your own credentials:

```env
PORT=3000                # optional, defaults to 3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

Set `NODE_ENV=production` when deploying over HTTPS so the auth cookie is marked `Secure`.

### 4. Start the server

```bash
npm run dev
```

If everything is configured correctly, the server should start on your configured port.

### 5. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` requests to the backend on port 3000.

## 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| POST | `/api/music/upload` | Upload music as an artist |
| POST | `/api/music/album` | Create an album |
| GET | `/api/music/allMusics?page=1&limit=10&artist=<id>` | Fetch paginated music, newest first (`limit` max 50, `artist` optional) |
| GET | `/api/music/albums` | Fetch all albums |
| GET | `/api/music/albums/:id` | Fetch an album by ID |
| PATCH / DELETE | `/api/music/musics/:id` | Edit (title, cover) or delete your song |
| PATCH / DELETE | `/api/music/albums/:id` | Edit (title, songs, cover) or delete your album |
| GET | `/api/music/search?q=` | Search songs, albums and artists |
| GET | `/api/music/artists/:id` | Artist profile with songs and albums |
| GET | `/api/music/liked` | Your liked songs |
| POST / DELETE | `/api/music/musics/:id/like` | Like / unlike a song |
| GET / POST | `/api/playlists` | Your playlists / create one |
| GET / PATCH / DELETE | `/api/playlists/:id` | View, rename or delete a playlist |
| POST | `/api/playlists/:id/musics` | Add a song (`{ musicId }`) |
| DELETE | `/api/playlists/:id/musics/:musicId` | Remove a song |

Uploads (`/upload`, `/album` and the PATCH routes) are `multipart/form-data`: audio in the `music` field, an optional image in `cover`, and album songs as a JSON array string in `musics`.

Auth uses an `httpOnly` cookie holding a JWT that expires after 7 days. Uploads accept audio files up to 20 MB. Errors are always returned as JSON `{ "message": "..." }`.

## 🧪 Testing

I'm using Postman to test the APIs, check responses, verify authentication, and test music uploads and album creation.

## 📚 What I'm Learning

Through this project, I'm getting practical experience with:

- Designing REST APIs
- Working with MongoDB and Mongoose
- Authentication and authorization
- Middleware in Express.js
- Handling file uploads and cloud storage
- Connecting related database documents
- Building APIs that can handle larger collections through pagination

## 🔮 What's Next?

I plan to keep improving this project as I learn more about backend development and music streaming applications.

## 🤝 Feedback

This is a learning project, and I'm still improving it step by step. Suggestions, feedback, and ideas for improvement are always welcome.

Thanks for checking out my project! 🎧
