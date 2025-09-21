"use client"

import { useSession, signOut } from "next-auth/react"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="container mt-5">
      <h1 className="mb-4">My App</h1>

      {session ? (
        <div>
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 16 }}
            />
          )}
          <p>
            Welcome, {session.user?.name} ({session.user?.role})
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="btn btn-dark mt-2"
          >
            Logout
          </button>
        </div>
      ) : (
        <a href="/auth/signin" className="btn btn-primary">
          Login
        </a>
      )}
    </div>
  )
}