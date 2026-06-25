Here's a recruiter-impressive README. Open `README.md` in VS Code, select all, delete, paste this:

```markdown
# VaultLock 🔐
### A Modern, Secure Password Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)

> **VaultLock** is a full-stack password manager that stores your credentials with 
> AES-256 encryption. Every password is protected behind a master password confirmation, 
> ensuring zero-trust access to your sensitive data.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 **Encrypted Storage** | All passwords encrypted with AES-256 before saving to DB |
| 👤 **Auth System** | Secure register/login with bcrypt-style password hashing |
| 🛡️ **Master Password** | Re-confirm identity before viewing or copying any password |
| 🔍 **Smart Search** | Instantly search vault by site, username, or email |
| 💪 **Health Check** | Detects weak, reused, or old passwords |
| ⚡ **Password Generator** | Generate strong passwords with custom rules |
| 🌙 **Dark Mode** | Sleek dark UI built with Tailwind CSS |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- tRPC (type-safe API calls)

**Backend**
- Node.js + Express
- tRPC + Drizzle ORM
- MySQL Database
- JWT Session Authentication

**Security**
- AES-256 password encryption
- scrypt password hashing (salt + hash)
- HttpOnly cookies
- Master password vault protection

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- pnpm
- MySQL database

### Installation

```bash
# Clone the repo
git clone https://github.com/Bhavyachandrika/vaultlock.git
cd vaultlock

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
```

### Environment Variables

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
NODE_ENV=development
```

### Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📸 How It Works

```
User registers/logs in
        ↓
JWT session cookie set (HttpOnly)
        ↓
Passwords saved → AES-256 encrypted → stored in MySQL
        ↓
To view/copy a password → Master password required
        ↓
scrypt hash verified → password decrypted → shown/copied
```

---

## 🔒 Security Design

- Passwords are **never stored in plain text**
- Each user has a unique **salt** for password hashing
- Session tokens are **HttpOnly cookies** (XSS protected)
- Vault access requires **re-authentication** via master password
- Encryption key is stored only in server environment variables

---

## 📁 Project Structure

```
vaultlock/
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/   # Login, Vault, Dashboard, Generator
│   │   ├── components/
│   │   └── lib/
├── server/          # Express backend
│   ├── _core/       # Auth, OAuth, middleware
│   ├── db/          # Drizzle ORM schema
│   └── routers/     # tRPC routers
└── shared/          # Shared types & constants
```

---

## 👩‍💻 Author

**Bhavya Chandrika**  
[GitHub](https://github.com/Bhavyachandrika)

---

> Built as a college project to demonstrate full-stack development,  
> security best practices, and modern web technologies.
```

Save, then push:

```powershell
git add README.md
git commit -m "Add impressive README"
git push origin main
```
