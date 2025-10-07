# 🔐 Password Reset Demo

A full-stack **Password Reset Flow** built with **React**, **Node.js**, and **MongoDB**, featuring email verification, token expiry, and secure password update.


## 🚀 Features

✅ Forgot Password with Email Verification  
✅ Token-based Reset Link (expires in 15 minutes)  
✅ Secure Password Hashing (bcrypt)  
✅ Gmail SMTP Integration via Nodemailer  
✅ Fully Responsive UI (Bootstrap)  
✅ Clean REST API with Express  
✅ Works seamlessly after deployment (Render + Vercel)



## 🏗️ Tech Stack

**Frontend:** React, Bootstrap, Axios  
**Backend:** Node.js, Express, Mongoose  
**Database:** MongoDB Atlas  
**Email Service:** Nodemailer (Gmail SMTP)



## 🧩 Folder Structure


password-reset-demo/
│
├── backend/
│   ├── index.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── models/
│   │   └── User.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── pages/
    │   │   ├── ForgotPassword.js
    │   │   └── ResetPassword.js
    │   └── index.js
    ├── package.json
    └── .env




## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=5003
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend `.env`
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```




## 🧠 How the Flow Works

1. User clicks **Forgot Password** and enters their email.
2. Backend checks if the user exists.
3. If valid, generates a **unique token**, stores it, and sends a reset link:

   https://your-frontend-url.vercel.app/reset-password?token=XYZ&email=user@gmail.com

4. When the user opens that link, frontend verifies the token with backend.
5. If valid, user can set a **new password**.
6. Backend updates password, clears the token, and confirms success.


## 🖥️ Running Locally

### 1️⃣ Backend
```bash
cd backend
npm install
npm start
```
Starts at: [http://localhost:5003](http://localhost:5003)

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm start
```
Starts at: [http://localhost:3000](http://localhost:3000)



## 🌍 Deployment

### Backend → [Render](https://render.com)
- Connect GitHub repo
- Root directory: `/backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env`

### Frontend → [Vercel](https://vercel.com)
- Connect GitHub repo
- Root directory: `/frontend`
- Add environment variable:

  REACT_APP_API_URL=https://your-backend-url.onrender.com
  



## ✅ Test Live

1. Go to your deployed frontend  
2. Click **Forgot Password**  
3. Enter your registered email  
4. Open your inbox → click reset link  
5. Enter new password → ✅ Done!



## 🧰 Dependencies

### Backend

express, mongoose, nodemailer, dotenv, bcryptjs, crypto, cors


### Frontend

react, react-router-dom, axios, bootstrap, query-string

