export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];

  pagination: PaginationMeta;

  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };

  message: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  age: number;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  allergies?: string;
  chronicDiseases?: string;
  height?: number;
  weight?: number;
  primaryDoctor?: string;
  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
  profilePhoto?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofUrl?: string;
  notes?: string;
  status: "Active" | "Inactive";
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;

  onDelete: (id: string) => void;

  onEdit: (patient: Patient) => void;
}

export interface PatientStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  activePatients: number;
  inactivePatients: number;
  percentageChange: {
    total: number;
    new: number;
    active: number;
    inactive: number;
  };
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  age?: number;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;

  allergies?: string;
  chronicDiseases?: string;
  height?: number;
  weight?: number;
  primaryDoctor?: string;
  phoneNumber: string;
  emailAddress?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
  profilePhoto?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofUrl?: string;
  notes?: string;
  status?: "Active" | "Inactive";
}

export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {}

export interface PatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "Active" | "Inactive";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
