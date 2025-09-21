"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleCredentialsLogin = async (e) => {
    e.preventDefault()
    await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: "/", // go back to homepage after login
    })
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sign In</h1>

      {/* Google login */}
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign in with Google
        </button>
      </div>

      {/* Credentials login */}
      <form onSubmit={handleCredentialsLogin} className="mb-3">
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

        <button type="submit" className="btn btn-secondary">
          Sign in with Credentials
        </button>
      </form>

      <p className="text-muted">
        Use demo credentials: <br />
        <strong>admin@example.com / admin123</strong>
      </p>
    </div>
  )
}
