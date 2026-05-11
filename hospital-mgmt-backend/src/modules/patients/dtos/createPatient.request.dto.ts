export interface CreatePatientRequestDTO {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: Date;
  age?: number;
  bloodGroup?:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  nationality?: string;
  allergies?: string;
  chronicDiseases?: string;
  heightCm?: number;
  weightKg?: number;
  primaryDoctorId?: string; // objectId

  // Contact Information
  phoneNumber: string;
  emailAddress?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;

  // Additional Information
  profilePhotoUrl?: string; // URL
  idProofType?: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'VOTER_ID';
  idProofNumber?: string;
  idProofUrl?: string; // URL

  // Metadata
  notes?: string;
}
