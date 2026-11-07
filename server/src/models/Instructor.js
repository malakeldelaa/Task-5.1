
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    department: {
      type: String
    },
    role: {
      type: String,
      enum: ['instructor', 'superadmin'],
      default: 'instructor'
    },
    apiKey: {
      type: String,
      select: false
    },
    privateEmail: {
      type: String,
      select: false
    },
    privatePhone: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
);

// Hash the password whenever a document is created or its password changes.
instructorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare a submitted password with the stored hash.
instructorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Instructor = mongoose.model('Instructor', instructorSchema);
