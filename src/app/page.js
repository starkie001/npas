"use client"

import { useSession, signOut } from "next-auth/react"
import Image from "next/image"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="container mt-5">
      <h1 className="mb-4">My App</h1>

      {session ? (
        <div>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={64}
              height={64}
              className="rounded-circle"
              style={{ objectFit: "cover", marginBottom: 16 }}
              priority
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