import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'users-db.json');

export class UserDao {
    async _readFile() {
        const data = await readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    }

    async _writeFile(data) {
        await writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }

    async getAllUsers() {
        return await this._readFile();
    }

    async getUserById(id) {
        const users = await this._readFile();
        const user = users.find(u => u.id === id);
        return user;
    }

    async getUserByEmail(email) {
        const users = await this._readFile();
        const user = users.find(u => u.email === email);
        return user;
    }

    async createUser(userData) {
        const users = await this._readFile();
        const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const now = new Date().toISOString();
        const newUser = {
            id: nextId,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            image: userData.image || null,
            role: userData.role || "customer",
            status: userData.status || "active",
            dateCreated: now,
            dateUpdated: now
        };
        users.push(newUser);
        await this._writeFile(users);
        return newUser;
    }

    async updateUser(id, updatedData) {
        const users = await this._readFile();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        const now = new Date().toISOString();
        users[index] = { 
            ...users[index], 
            ...updatedData,
            dateUpdated: now 
        };
        await this._writeFile(users);
        return users[index];
    }

    async deleteUser(id) {
        const users = await this._readFile();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        const deleted = users.splice(index, 1);
        await this._writeFile(users);
        return deleted[0];
    }
}