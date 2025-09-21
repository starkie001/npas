//import { getServerSession } from "next-auth"
//import { authOptions } from "../../../auth"
//import { redirect } from "next/navigation"
import { requireAdmin } from "../../../auth-helpers"

async function getAllUsers() {
  return [
    { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
    { id: "2", name: "Customer User", email: "customer@example.com", role: "customer" },
    { id: "3", name: "Test User", email: "test@example.com", role: "customer" },
  ]
}

export default async function UsersPage() {
  /*const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    redirect("/auth/signin")
  }*/

  await requireAdmin();

  const users = await getAllUsers()

  return (
    <div className="container mt-5">
      <h1 className="mb-4">User Management</h1>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
