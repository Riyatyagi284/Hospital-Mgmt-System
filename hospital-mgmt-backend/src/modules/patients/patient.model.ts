import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    },
    nationality: String,

    contact: {
      phone: {
        type: String,
        required: true,
        index: true,
      },
      email: {
        type: String,
        lowercase: true,
        sparse: true,
      },
      address: {
        fullAddress: String,
        city: String,
        state: String,
        pincode: String,
      },
    },

    medicalInfo: {
      allergies: [String],
      chronicDiseases: [String],
      height: Number,
      weight: Number,
      primaryDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        index: true,
      },
    },

    emergencyContact: {
      name: String,
      relationship: {
        type: String,
        enum: ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Other'],
      },
      phone: String,
      address: String,
    },

    documents: {
      profilePhoto: String,
      idType: {
        type: String,
        enum: ['Aadhar', 'PAN', 'Passport', 'Driving License'],
      },
      idNumber: String,
      idFile: String,
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

patientSchema.index({ createdAt: -1 });

export const Patient = mongoose.model('Patient', patientSchema);
