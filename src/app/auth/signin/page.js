"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useSession, signOut } from "next-auth/react";

export default function SignInPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = '/handle-redirect-after-login';
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Sign In</h2>
                <p className="text-muted">
                  Welcome back! Please sign in to your account.
                </p>
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
                  style={{ fontSize: "0.875rem" }}
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
                  Don't have an account?{" "}
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
  );
}
