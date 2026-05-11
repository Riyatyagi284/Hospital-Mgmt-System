import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,

    specialization: {
      type: String,
      required: true,
      index: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },

    experience: Number,
    qualification: String,

    contact: {
      phone: String,
      email: String,
    },

    availability: [
      {
        day: {
          type: String,
          enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        slots: [String], // "10:00-11:00"
      },
    ],

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
