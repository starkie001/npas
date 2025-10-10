import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    image: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'lead_host', 'host', 'guest', 'customer'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for id to match existing API
UserSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Indexes
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);