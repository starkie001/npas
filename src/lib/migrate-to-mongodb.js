/**
 * Migration Script: JSON to MongoDB
 * 
 * This script migrates existing data from JSON files to MongoDB
 * Run this once after setting up your MongoDB connection
 * 
 * Usage: npm run db:migrate
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConnect from './dbConfig.js';
import User from './models/User.js';
import Booking from './models/Booking.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateUsers() {
    console.log('\n🔄 Migrating users...');
    try {
        const usersData = await readFile(
            path.join(__dirname, 'dao', 'users-db.json'),
            'utf-8'
        );
        const users = JSON.parse(usersData);
        
        // Clear existing users (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        
        for (const user of users) {
            // Check if user already exists by email
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                console.log(`⏭️  User already exists: ${user.email}`);
                continue;
            }
            
            await User.create({
                name: user.name,
                email: user.email,
                password: user.password,
                image: user.image,
                role: user.role,
                status: user.status,
                createdAt: user.dateCreated,
                updatedAt: user.dateUpdated
            });
            console.log(`✅ Migrated user: ${user.email}`);
        }
        
        console.log('✨ Users migration completed!');
    } catch (error) {
        console.error('❌ Error migrating users:', error.message);
    }
}

async function migrateBookings() {
    console.log('\n🔄 Migrating bookings...');
    try {
        const bookingsData = await readFile(
            path.join(__dirname, 'dao', 'bookings.json'),
            'utf-8'
        );
        const bookings = JSON.parse(bookingsData);
        
        // Clear existing bookings (optional - comment out if you want to keep existing data)
        // await Booking.deleteMany({});
        
        for (const booking of bookings) {
            // Check if booking already exists
            const existingBooking = await Booking.findOne({ 
                userId: booking.userId,
                date: booking.date,
                groupName: booking.groupName
            });
            
            if (existingBooking) {
                console.log(`⏭️  Booking already exists: ${booking.groupName} on ${booking.date}`);
                continue;
            }
            
            await Booking.create({
                userId: booking.userId,
                role: booking.role,
                groupName: booking.groupName,
                groupType: booking.groupType,
                groupSize: booking.groupSize,
                interests: booking.interests,
                otherInfo: booking.otherInfo,
                date: booking.date,
                status: booking.status,
                created: booking.created
            });
            console.log(`✅ Migrated booking: ${booking.groupName} on ${booking.date}`);
        }
        
        console.log('✨ Bookings migration completed!');
    } catch (error) {
        console.error('❌ Error migrating bookings:', error.message);
    }
}

async function runMigration() {
    try {
        console.log('🚀 Starting MongoDB migration...\n');
        console.log('📋 Make sure your MONGODB_URI is set in .env.local\n');
        
        // Connect to MongoDB
        await dbConnect();
        console.log('✅ Connected to MongoDB\n');
        
        // Run migrations
        await migrateUsers();
        await migrateBookings();
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Verify your data in MongoDB');
        console.log('   2. Test your application endpoints');
        console.log('   3. Once confirmed, you can safely backup and remove the JSON files');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run the migration
runMigration();
