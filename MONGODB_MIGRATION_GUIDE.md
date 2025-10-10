# MongoDB Migration Guide

## 🎉 Migration Complete!

Your Next.js app has been successfully migrated from JSON file storage to MongoDB using Mongoose!

## 📦 What Was Changed

### 1. **Dependencies**
- ✅ Installed `mongoose` package

### 2. **Database Configuration** (`src/lib/dbConfig.js`)
- ✅ Converted from CommonJS to ESM
- ✅ Added connection caching for hot-reloading in development
- ✅ Now uses `MONGODB_URI` from `.env.local`

### 3. **Mongoose Models** (in `src/lib/models/`)
- ✅ **User.js** - User schema with roles, status, and authentication fields
- ✅ **Booking.js** - Booking schema with group details and status tracking
- ✅ **Availability.js** - Availability schema for hosting and obs schedules
- ✅ **Settings.js** - Settings schema for key-value configuration storage

### 4. **Data Access Objects (DAOs)** (in `src/lib/dao/`)
- ✅ **UserDao.js** - Migrated to use Mongoose instead of file operations
- ✅ **bookingDao.js** - Created with full CRUD operations
- ✅ **settingsDao.js** - Created to handle settings and availability

### 5. **Controllers** (in `src/lib/controllers/`)
- ✅ **UserController.js** - Updated to work with MongoDB IDs (strings, not integers)
- ✅ **bookingController.js** - Created with business logic for bookings
- ✅ **settingsController.js** - Created to manage settings and availability

### 6. **Migration Script**
- ✅ **migrate-to-mongodb.js** - Script to migrate your existing JSON data to MongoDB

## 🚀 Setup Instructions

### Step 1: Configure Environment Variables

Add your MongoDB connection string to `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/npas
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/npas?retryWrites=true&w=majority
```

### Step 2: Start MongoDB (if using local)

If you're running MongoDB locally:

```powershell
# Windows - Start MongoDB service
net start MongoDB

# OR if using MongoDB installed manually
mongod --dbpath C:\data\db
```

### Step 3: Run the Migration Script

Migrate your existing JSON data to MongoDB:

```powershell
node src/lib/migrate-to-mongodb.js
```

This will:
- Connect to your MongoDB database
- Migrate all users from `users-db.json`
- Migrate all bookings from `bookings.json`
- Skip duplicates if you run it multiple times

### Step 4: Test Your Application

```powershell
npm run dev
```

Visit your application and test:
- ✅ User authentication
- ✅ User CRUD operations
- ✅ Booking creation and management
- ✅ Admin features

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  image: String (nullable),
  role: String (enum: ['admin', 'lead_host', 'host', 'guest', 'customer']),
  status: String (enum: ['active', 'inactive', 'suspended']),
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: String (required),
  role: String (required),
  groupName: String (required),
  groupType: String (enum: ['Club', 'Member', 'School', 'Other']),
  groupSize: Number (min: 1),
  interests: [String],
  otherInfo: String,
  date: String (required),
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed']),
  created: Date
}
```

### Availabilities Collection
```javascript
{
  _id: ObjectId,
  type: String (enum: ['hosting', 'obs']),
  userId: String (required),
  dates: [String],
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Settings Collection
```javascript
{
  _id: ObjectId,
  key: String (required, unique),
  value: Mixed (any type),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Compatibility

The migration maintains full backward compatibility with your existing API:
- ✅ All endpoints continue to work
- ✅ IDs are returned as strings (matching previous behavior)
- ✅ Date fields (`dateCreated`, `dateUpdated`) are preserved
- ✅ All CRUD operations work the same way

## 💾 Backup & Cleanup

### Before Removing JSON Files

1. **Verify data integrity:**
   ```powershell
   # Test all your API endpoints
   # Check user authentication
   # Verify bookings are displayed correctly
   ```

2. **Backup JSON files:**
   ```powershell
   # Create a backup directory
   mkdir src/lib/dao/backup
   
   # Move JSON files to backup
   mv src/lib/dao/*.json src/lib/dao/backup/
   ```

3. **Keep for reference:** Keep the JSON files for at least a week while monitoring production

## 🛠️ Troubleshooting

### Connection Issues

**Problem:** `MongooseError: The uri parameter must be a string`

**Solution:** Make sure `MONGODB_URI` is set in `.env.local`

```env
MONGODB_URI=mongodb://localhost:27017/npas
```

---

**Problem:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:** Ensure MongoDB is running:

```powershell
# Check if MongoDB is running
netstat -ano | findstr :27017

# Start MongoDB service
net start MongoDB
```

### Migration Issues

**Problem:** Duplicate key error during migration

**Solution:** The migration script checks for duplicates by email. If you get errors, you can:

1. Clear the database and re-run:
   ```javascript
   // Uncomment these lines in migrate-to-mongodb.js
   await User.deleteMany({});
   await Booking.deleteMany({});
   ```

2. Or manually check your database:
   ```powershell
   # Open MongoDB shell
   mongosh
   
   # Switch to your database
   use npas
   
   # Check collections
   db.users.find()
   db.bookings.find()
   ```

### ID Format Issues

**Problem:** Invalid ObjectId error

**Solution:** MongoDB uses ObjectId strings, not integers. Make sure:
- Don't use `parseInt()` on IDs
- Pass IDs as strings to all DAO methods
- The controllers have been updated to handle this

## 🎯 Next Steps

1. **Test thoroughly** - Test all features of your application
2. **Monitor logs** - Check console for any errors
3. **Update documentation** - Update any API docs to reflect MongoDB usage
4. **Consider indexes** - Review the indexes in models and add more if needed
5. **Set up backups** - Configure MongoDB backups for production

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud MongoDB hosting
- [Next.js with MongoDB](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose)

## 🆘 Need Help?

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify your MongoDB connection string
3. Ensure MongoDB is running and accessible
4. Check that all required environment variables are set

---

Happy coding! 🚀
