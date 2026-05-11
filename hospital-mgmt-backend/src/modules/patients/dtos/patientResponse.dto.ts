export interface PatientResponseDTO {
  id: string;
  // Personal Information
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
  age: number;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  allergies?: string;
  chronicDiseases?: string;
  heightCm?: number;
  weightKg?: number;

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
  profilePhotoUrl?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofUrl?: string;

  // Status & Metadata
  status: 'ACTIVE' | 'INACTIVE';
  lastVisitDate?: string;
  notes?: string;

  // Timeline
  createdAt: string;
  updatedAt: string;

  // Relations
  primaryDoctor?: {
    id: string;
    name: string;
    department?: string;
  };
}

// Paginated response for listing patients
export interface PatientListResponseDTO {
  patients: PatientResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
