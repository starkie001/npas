import { requireAdmin } from "../../../auth-helpers"
import { UserController } from "../../../lib/controllers/UserController"

const userController = new UserController();

export default async function UsersPage() {
  try {
    console.log('[Admin Users Page] Loading users page');
    
    // Check authentication and authorization
    await requireAdmin();

    // Get all users from database
    const users = await userController.getAllUsers();
    console.log(`[Admin Users Page] Loaded ${users.length} users`);

    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>User Management</h1>
          <div className="text-muted">
            Total Users: {users.length}
          </div>
        </div>
        
        {users.length === 0 ? (
          <div className="alert alert-info">
            No users found in the system.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Profile</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name}
                          className="rounded-circle"
                          width="32" 
                          height="32"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{ width: '32px', height: '32px', fontSize: '12px' }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.status === 'active' ? 'bg-success' : 
                        user.status === 'inactive' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {user.dateCreated ? 
                        new Date(user.dateCreated).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('[Admin Users Page] Error loading users:', error);
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error Loading Users</h4>
          <p>Unable to load user data. Please try again later.</p>
          <small className="text-muted">Error: {error.message}</small>
        </div>
      </div>
    );
  }
}
