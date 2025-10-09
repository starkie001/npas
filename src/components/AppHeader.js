"use client"

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react"; 

export default function AppHeader() {
  const { data: session } = useSession();
  const [showAdminSub, setShowAdminSub] = useState(false);
    const [showMembersSub, setShowMembersSub] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link href="/" className="logo-container">
          <div className="sparkle-wrapper">
            <Image
              src="/npas-logo.png"
              alt="NPAS Logo"
              width={180}
              height={60}
            />
          </div>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <button type="button" className="btn-close" aria-label="Close" data-bs-toggle="collapse" data-bs-target="#navbarNav" style={{position: 'absolute', top: '1rem', right: '1rem', color: 'white', background: 'none', border: 'none', fontSize: '2rem', zIndex: 101}}>&times;</button>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/whats-on">What's On</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/bookings">Private Bookings</Link>
            </li>
           {session && (session.user?.role === "member" || session.user?.role === "admin" || session.user?.role === "leader") && (
          <>
            <li><button className="menu-btn" onClick={() => setShowMembersSub(v => !v)} aria-expanded={showMembersSub} aria-controls="members-submenu">Members</button></li>
            {showMembersSub && (
              <ul id="members-submenu" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                <li><Link href="/members/hosting">Hosting</Link></li>
              </ul>
            )}
          </>
        )}
        {session && session.user?.role === "admin" && (
                <>
                  <li><button className="menu-btn" onClick={() => setShowAdminSub(v => !v)} aria-expanded={showAdminSub} aria-controls="admin-submenu">Admin</button></li>
                {showAdminSub && (
                  <ul id="admin-submenu" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                    <li><Link href="/admin/users">User Management</Link></li>
                    <li><Link href="/admin/settings">Obs. Availability</Link></li>
                  </ul>
                )}
                </>
              )}
            {!session ? (
              <li className="nav-item">
                <Link className="nav-link" href="/auth/signin">
                  Login
                </Link>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light ms-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
