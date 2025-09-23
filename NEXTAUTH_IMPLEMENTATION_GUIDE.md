# NextAuth Implementation Guide 🚀

A comprehensive step-by-step guide to implement NextAuth.js authentication in your existing Next.js project, including Google OAuth, custom credentials authentication, user management system, and secure registration.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation & Dependencies](#installation--dependencies)
4. [Environment Configuration](#environment-configuration)
5. [Core Authentication Setup](#core-authentication-setup)
6. [Database Layer Implementation](#database-layer-implementation)
7. [User Management System](#user-management-system)
8. [API Endpoints](#api-endpoints)
9. [UI Components](#ui-components)
10. [Security Features](#security-features)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## 📚 Prerequisites

Before starting, ensure you have:
- ✅ Next.js 13+ project (App Router)
- ✅ Node.js 18+ installed
- ✅ Google Cloud Console account (for Google OAuth)
- ✅ Basic understanding of React and Next.js

---

## 📁 Project Structure

Create the following directory structure in your Next.js project:

```
your-project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.js
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.js
│   │   │   └── users/
│   │   │       ├── route.js
│   │   │       └── [id]/
│   │   │           └── route.js
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.js
│   │   │   └── signup/
│   │   │       └── page.js
│   │   ├── account/
│   │   │   └── page.js
│   │   ├── admin/
│   │   │   ├── page.js
│   │   │   └── users/
│   │   │       └── page.js
│   │   ├── layout.js
│   │   └── middleware.js
│   ├── components/
│   │   ├── icons/
│   │   │   ├── GoogleIcon.js
│   │   │   └── index.js
│   │   ├── Navbar.js
│   │   └── Providers.js
│   ├── lib/
│   │   ├── controllers/
│   │   │   └── UserController.js
│   │   ├── dao/
│   │   │   ├── UserDao.js
│   │   │   └── users-db.json
│   │   ├── middleware/
│   │   │   └── registrationSecurity.js
│   │   └── utils/
│   │       └── constants.js
│   └── auth.js
├── .env.local
└── next.config.mjs
```

---

## 📦 Installation & Dependencies

### Step 1: Install Required Packages

```bash
npm install next-auth bcryptjs bootstrap
```

### Step 2: Update package.json Scripts (Optional)

Add Turbopack for faster development:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

## ⚙️ Environment Configuration

### Step 1: Create `.env.local`

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Configuration
NODE_ENV=development
```

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Step 3: Update Next.js Config

**`next.config.mjs`**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
```

---

## 🔐 Core Authentication Setup

### Step 1: Create Main Auth Configuration

**`src/auth.js`**:
```javascript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import UserController from "./lib/controllers/UserController"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // Custom Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await UserController.authenticateUser(
            credentials.email,
            credentials.password
          )
          return user
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  
  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        try {
          // Check if user exists, create if not (JIT provisioning)
          const existingUser = await UserController.getUserByEmail(user.email)
          
          if (!existingUser) {
            await UserController.createUser({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "customer",
              provider: "google"
            })
          }
          return true
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }
      return true
    },
    
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await UserController.getUserByEmail(user.email)
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          token.status = dbUser.status
        }
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.status = token.status
      }
      return session
    },
  },
  
  pages: {
    signIn: "/auth/signin",
  },
})
```

### Step 2: Create NextAuth API Route

**`src/app/api/auth/[...nextauth]/route.js`**:
```javascript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

### Step 3: Create App Layout with Providers

**`src/components/Providers.js`**:
```javascript
"use client"

import { SessionProvider } from "next-auth/react"

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```

**Update `src/app/layout.js`**:
```javascript
import { Inter } from "next/font/google"
import "./globals.css"
import "bootstrap/dist/css/bootstrap.min.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"
import { auth } from "@/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NextAuth Implementation",
  description: "Complete NextAuth.js authentication system",
}

export default async function RootLayout({ children }) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <Navbar />
          <main className="container mt-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
```

---

## 🗄️ Database Layer Implementation

### Step 1: Create User DAO (Data Access Object)

**`src/lib/dao/UserDao.js`**:
```javascript
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'dao', 'users-db.json')

class UserDao {
  
  static async getAllUsers() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading users database:', error)
      return []
    }
  }

  static async getUserById(id) {
    const users = await this.getAllUsers()
    return users.find(user => user.id === parseInt(id))
  }

  static async getUserByEmail(email) {
    const users = await this.getAllUsers()
    return users.find(user => user.email === email)
  }

  static async createUser(userData) {
    try {
      const users = await this.getAllUsers()
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...userData,
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString()
      }
      
      users.push(newUser)
      fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  static async updateUser(id, updates) {
    try {
      const users = await this.getAllUsers()
      const userIndex = users.findIndex(user => user.id === parseInt(id))
      
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        dateUpdated: new Date().toISOString()
      }
      
      fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
      return users[userIndex]
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  static async deleteUser(id) {
    try {
      const users = await this.getAllUsers()
      const filteredUsers = users.filter(user => user.id !== parseInt(id))
      
      if (users.length === filteredUsers.length) {
        throw new Error('User not found')
      }
      
      fs.writeFileSync(DB_PATH, JSON.stringify(filteredUsers, null, 2))
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}

export default UserDao
```

### Step 2: Create Initial Users Database

**`src/lib/dao/users-db.json`**:
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "$2b$10$5l99DS3NshjhcEG4jzp99e6N3.ncJKDu4RD2jkxgqcOILdd7Pdl82",
    "image": null,
    "role": "admin",
    "status": "active",
    "dateCreated": "2025-09-22T10:00:00.000Z",
    "dateUpdated": "2025-09-22T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Customer User",
    "email": "customer@example.com",
    "password": "$2b$10$DLWUo6S6Cd22whpmLMdNxuB0cggW66.UVyAeJCjXMbfJzlt4a5Hn.",
    "image": null,
    "role": "customer",
    "status": "active",
    "dateCreated": "2025-09-22T10:00:00.000Z",
    "dateUpdated": "2025-09-22T10:00:00.000Z"
  }
]
```

> **Demo Credentials:**
> - Admin: `admin@example.com` / `admin123`
> - Customer: `customer@example.com` / `customer123`

---

## 👥 User Management System

### Step 1: Create User Controller

**`src/lib/controllers/UserController.js`**:
```javascript
import bcrypt from 'bcryptjs'
import UserDao from '../dao/UserDao'

class UserController {
  
  static async authenticateUser(email, password) {
    try {
      console.log(`🔐 Authenticating user: ${email}`)
      
      const user = await UserDao.getUserByEmail(email)
      if (!user) {
        console.log(`❌ User not found: ${email}`)
        throw new Error('Invalid credentials')
      }

      if (user.status !== 'active') {
        console.log(`❌ User account inactive: ${email}`)
        throw new Error('Account is inactive')
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log(`❌ Invalid password for: ${email}`)
        throw new Error('Invalid credentials')
      }

      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user
      console.log(`✅ Authentication successful: ${email}`)
      
      return userWithoutPassword
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }

  static async createUser(userData) {
    try {
      console.log(`👤 Creating user: ${userData.email}`)
      
      // Check if user already exists
      const existingUser = await UserDao.getUserByEmail(userData.email)
      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Hash password if provided
      let hashedPassword = null
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10)
      }

      const newUser = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        image: userData.image || null,
        role: userData.role || 'customer',
        status: userData.status || 'active'
      }

      const createdUser = await UserDao.createUser(newUser)
      
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = createdUser
      console.log(`✅ User created successfully: ${userData.email}`)
      
      return userWithoutPassword
    } catch (error) {
      console.error('User creation error:', error)
      throw error
    }
  }

  static async getAllUsers() {
    try {
      const users = await UserDao.getAllUsers()
      // Remove passwords from all user objects
      return users.map(({ password, ...user }) => user)
    } catch (error) {
      console.error('Get all users error:', error)
      throw error
    }
  }

  static async getUserById(id) {
    try {
      const user = await UserDao.getUserById(id)
      if (!user) {
        throw new Error('User not found')
      }
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Get user by ID error:', error)
      throw error
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await UserDao.getUserByEmail(email)
      if (!user) {
        return null
      }
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Get user by email error:', error)
      throw error
    }
  }

  static async updateUser(id, updates) {
    try {
      // Hash password if being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10)
      }

      const updatedUser = await UserDao.updateUser(id, updates)
      
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  static async deleteUser(id) {
    try {
      return await UserDao.deleteUser(id)
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }
}

export default UserController
```

---

## 🔌 API Endpoints

### Step 1: User Management API

**`src/app/api/users/route.js`**:
```javascript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import UserController from '@/lib/controllers/UserController'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await UserController.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userData = await request.json()
    const user = await UserController.createUser(userData)
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 400 }
    )
  }
}
```

### Step 2: Registration API

**`src/app/api/auth/register/route.js`**:
```javascript
import { NextResponse } from 'next/server'
import UserController from '@/lib/controllers/UserController'
import { applyRegistrationSecurity } from '@/lib/middleware/registrationSecurity'

export async function POST(request) {
  try {
    // Apply security middleware
    const securityResult = await applyRegistrationSecurity(request)
    if (securityResult.blocked) {
      return NextResponse.json(
        { error: securityResult.reason },
        { status: 429 }
      )
    }

    const { name, email, password, confirmPassword, honeypot } = await request.json()

    // Security checks
    if (honeypot) {
      console.log('🤖 Bot detected via honeypot field')
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = await UserController.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'customer'
    })

    return NextResponse.json(
      { message: 'Registration successful', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
```

---

## 🎨 UI Components

### Step 1: Create Google Icon Component

**`src/components/icons/GoogleIcon.js`**:
```javascript
export default function GoogleIcon({ width = 18, height = 18, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_17_40)">
        <path
          d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
          fill="#4285F4"
        />
        <path
          d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
          fill="#34A853"
        />
        <path
          d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
          fill="#FBBC04"
        />
        <path
          d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
          fill="#EA4335"
        />
      </g>
      <defs>
        <clipPath id="clip0_17_40">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
```

### Step 2: Create Navigation Component

**`src/components/Navbar.js`**:
```javascript
"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link href="/" className="navbar-brand">
            MyApp
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link href="/" className="navbar-brand">
          MyApp
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {session ? (
              <>
                <li className="nav-item">
                  <Link href="/account" className="nav-link">
                    Account
                  </Link>
                </li>
                {session.user.role === 'admin' && (
                  <li className="nav-item">
                    <Link href="/admin" className="nav-link">
                      Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    {session.user.image && (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={24}
                        height={24}
                        className="rounded-circle me-2"
                      />
                    )}
                    {session.user.name}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => signOut()}
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link href="/auth/signin" className="nav-link">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/auth/signup" className="nav-link">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
```

### Step 3: Create Authentication Pages

**`src/app/auth/signin/page.js`**:
```javascript
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import GoogleIcon from "@/components/icons/GoogleIcon"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleCredentialsLogin = async (e) => {
    e.preventDefault()
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError('Invalid email or password')
    } else {
      window.location.href = '/account'
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Sign In</h2>
                <p className="text-muted">Welcome back! Please sign in to your account.</p>
              </div>

              <div className="mb-4">
                <button
                  className="btn btn-outline-dark d-flex align-items-center justify-content-center w-100 py-2"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                  <GoogleIcon className="me-2" />
                  Continue with Google
                </button>
              </div>

              <div className="position-relative mb-4">
                <hr />
                <span 
                  className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted"
                  style={{ fontSize: '0.875rem' }}
                >
                  OR
                </span>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentialsLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Sign In
                </button>
              </form>

              <p className="text-muted text-center small">
                Use demo credentials: <br />
                <strong>admin@example.com / admin123</strong>
              </p>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-decoration-none">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**`src/app/auth/signup/page.js`**:
```javascript
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import GoogleIcon from "@/components/icons/GoogleIcon"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    honeypot: "" // Bot detection field
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registration successful! You can now sign in.")
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          honeypot: ""
        })
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Join us today! Create your account to get started.</p>
              </div>

              <div className="mb-4">
                <button
                  className="btn btn-outline-dark d-flex align-items-center justify-content-center w-100 py-2"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                  <GoogleIcon className="me-2" />
                  Continue with Google
                </button>
              </div>

              <div className="position-relative mb-4">
                <hr />
                <span 
                  className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted"
                  style={{ fontSize: '0.875rem' }}
                >
                  OR
                </span>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  style={{ display: "none" }}
                  tabIndex="-1"
                  autoComplete="off"
                />

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="text-center mt-4">
                <p>
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-decoration-none">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔒 Security Features

### Step 1: Create Registration Security Middleware

**`src/lib/middleware/registrationSecurity.js`**:
```javascript
// Simple in-memory rate limiting (use Redis in production)
const rateLimitStore = new Map()
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
  'mailinator.com', 'yopmail.com'
]

export async function applyRegistrationSecurity(request) {
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

  // Rate limiting: max 3 registration attempts per IP per hour
  const rateLimitKey = `registration:${clientIP}`
  const now = Date.now()
  const hourAgo = now - (60 * 60 * 1000)

  if (!rateLimitStore.has(rateLimitKey)) {
    rateLimitStore.set(rateLimitKey, [])
  }

  const attempts = rateLimitStore.get(rateLimitKey)
  const recentAttempts = attempts.filter(time => time > hourAgo)

  if (recentAttempts.length >= 3) {
    console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`)
    return {
      blocked: true,
      reason: 'Too many registration attempts. Please try again later.'
    }
  }

  // Add current attempt
  recentAttempts.push(now)
  rateLimitStore.set(rateLimitKey, recentAttempts)

  // Check for disposable email domains
  try {
    const body = await request.json()
    const email = body.email?.toLowerCase()
    
    if (email) {
      const domain = email.split('@')[1]
      if (DISPOSABLE_DOMAINS.includes(domain)) {
        console.log(`🚫 Disposable email detected: ${email}`)
        return {
          blocked: true,
          reason: 'Disposable email addresses are not allowed'
        }
      }
    }
  } catch (error) {
    console.error('Error parsing request body for security check:', error)
  }

  return { blocked: false }
}
```

### Step 2: Create Middleware for Route Protection

**`src/app/middleware.js`**:
```javascript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*']
}
```

---

## 🧪 Testing

### Step 1: Test Authentication Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Google OAuth**:
   - Go to `/auth/signin`
   - Click "Continue with Google"
   - Verify user is created automatically

3. **Test Credentials Login**:
   - Use demo credentials: `admin@example.com` / `admin123`
   - Verify login and session management

4. **Test Registration**:
   - Go to `/auth/signup`
   - Create a new account
   - Verify user is created and can sign in

5. **Test Protected Routes**:
   - Access `/admin` (admin only)
   - Access `/account` (authenticated users)

### Step 2: Test Security Features

1. **Rate Limiting**: Try multiple rapid registrations
2. **Bot Protection**: Test honeypot field detection
3. **Role-based Access**: Test admin vs customer permissions

---

## 🚀 Deployment

### Step 1: Environment Variables

For production, update `.env.local`:

```env
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
NODE_ENV=production
```

### Step 2: Database Considerations

For production, consider:
- **PostgreSQL/MySQL**: Replace JSON file with proper database
- **Prisma ORM**: For type-safe database operations
- **MongoDB**: For document-based storage

### Step 3: Security Enhancements

For production:
- Use **Redis** for rate limiting
- Implement **email verification**
- Add **password reset** functionality
- Enable **2FA** for admin accounts
- Add **CSRF protection**
- Implement **proper logging**

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)

---

## 🤝 Support

If you encounter issues:

1. **Check Environment Variables**: Ensure all required variables are set
2. **Verify Google OAuth Setup**: Check redirect URIs and credentials
3. **Database Permissions**: Ensure the app can read/write to the JSON file
4. **Port Conflicts**: Make sure port 3000 is available

---

## 📝 License

This implementation guide is provided as-is for educational purposes. Adapt security measures and database solutions according to your production requirements.

---

**Happy Coding! 🎉**