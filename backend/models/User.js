const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC USER INFORMATION
    // ============================================================
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email',
      ],
    },

    // ============================================================
    // PASSWORD
    // Google users do not have a password.
    // Therefore password is no longer required at schema level.
    // ============================================================
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    // ============================================================
    // AUTH PROVIDER
    // local = email/password account
    // google = Google account
    // ============================================================
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    // ============================================================
    // GOOGLE ACCOUNT ID
    // This is Google's unique user ID (sub).
    // ============================================================
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ============================================================
    // ROLE
    // ============================================================
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // ============================================================
    // PHONE
    // ============================================================
    phone: {
      type: String,
      trim: true,
      default: '',
    },

    // ============================================================
    // EMAIL VERIFICATION
    // ============================================================
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // ACCOUNT STATUS
    // ============================================================
    isActive: {
      type: Boolean,
      default: true,
    },

    // ============================================================
    // LOGIN SECURITY
    // ============================================================
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// HASH PASSWORD BEFORE SAVING
// ============================================================
userSchema.pre('save', async function hashPassword(next) {
  // Google accounts don't have a password.
  if (!this.password) {
    return next();
  }

  // Only hash when password is new or has been modified.
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// COMPARE PASSWORD
// ============================================================
userSchema.methods.matchPassword = async function matchPassword(
  candidate
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidate, this.password);
};

// ============================================================
// CHECK WHETHER ACCOUNT IS LOCKED
// ============================================================
userSchema.virtual('isLocked').get(function isLocked() {
  return !!(
    this.lockUntil &&
    this.lockUntil > Date.now()
  );
});

module.exports = mongoose.model('User', userSchema);