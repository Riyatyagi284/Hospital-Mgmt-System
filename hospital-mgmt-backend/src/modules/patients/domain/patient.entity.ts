export interface PatientEntity {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: Date;
  age: number;
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
  primaryDoctorId?: string;
  phoneNumber: string;
  emailAddress?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
  profilePhotoUrl?: string;
  idProofType?: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'VOTER_ID';
  idProofNumber?: string;
  idProofUrl?: string;
  notes?: string;
  status: PatientStatus;
  lastVisitDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  primaryDoctor?: {
    id: string;
    name: string;
    department?: string;
  };
}

export type PatientStatus = 'ACTIVE' | 'INACTIVE';
