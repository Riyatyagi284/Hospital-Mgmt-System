import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock logger abstraction (no console.log per ENGINEERING_STANDARDS)
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock repository
const mockPatientRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findByPhoneOrEmail: jest.fn(),
  existsByPhone: jest.fn(),
};

const mockDoctorRepository = {
  findById: jest.fn(),
  exists: jest.fn(),
};

// Import service after mocks
import { PatientService } from '../patient.service.js';
import type { CreatePatientRequestDTO } from '../dtos/createPatient.request.dto.js';
import type { PatientResponseDTO } from '../dtos/patientResponse.dto.js';

// Custom Error classes (mandatory per ENGINEERING_STANDARDS)
class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.name = 'AppError';
  }
}

class PatientNotFoundError extends AppError {
  constructor() {
    super('PATIENT_NOT_FOUND', 'Patient not found with the provided ID', 404);
  }
}

class DuplicatePatientError extends AppError {
  constructor() {
    super(
      'PATIENT_ALREADY_EXISTS',
      'A patient with the same phone number or email already exists',
      409
    );
  }
}

class DoctorNotFoundError extends AppError {
  constructor() {
    super('PRIMARY_DOCTOR_NOT_FOUND', 'The specified primary doctor does not exist', 404);
  }
}

class PatientValidationError extends AppError {
  constructor(message: string) {
    super('PATIENT_VALIDATION_FAILED', message, 400);
  }
}

describe('PatientService', () => {
  let patientService: PatientService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockPatientRepository.create.mockReset();
    mockPatientRepository.findById.mockReset();
    mockPatientRepository.findAll.mockReset();
    mockPatientRepository.update.mockReset();
    mockPatientRepository.softDelete.mockReset();
    mockPatientRepository.findByPhoneOrEmail.mockReset();
    mockPatientRepository.existsByPhone.mockReset();
    mockDoctorRepository.findById.mockReset();
    mockDoctorRepository.exists.mockReset();

    // Create service instance with dependency injection
    patientService = new PatientService(
      mockPatientRepository as any,
      mockDoctorRepository as any,
      mockLogger as any
    );
  });

  // Helper function to create valid patient DTO
  const createValidPatientDTO = (overrides = {}): CreatePatientRequestDTO => ({
    firstName: 'Rahul',
    lastName: 'Sharma',
    gender: 'MALE',
    dateOfBirth: '1992-05-15',
    phoneNumber: '+919876543210',
    emailAddress: 'rahul.sharma@email.com',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    emergencyContactName: 'Sita Sharma',
    emergencyContactPhone: '+919876543211',
    ...overrides,
  });

  // Helper function to create valid patient response
  const createValidPatientResponse = (overrides = {}): PatientResponseDTO => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'Rahul',
    lastName: 'Sharma',
    gender: 'MALE',
    dateOfBirth: '1992-05-15',
    age: 32,
    phoneNumber: '+919876543210',
    emailAddress: 'rahul.sharma@email.com',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    emergencyContactName: 'Sita Sharma',
    emergencyContactPhone: '+919876543211',
    status: 'ACTIVE',
    createdAt: '2024-05-20T10:30:00Z',
    updatedAt: '2024-05-20T10:30:00Z',
    ...overrides,
  });

  describe('createPatient() - Happy Path', () => {
    it('should successfully create a new patient with all required fields', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const expectedResponse = createValidPatientResponse();

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await patientService.createPatient(patientDTO);

      // Assert
      expect(mockPatientRepository.findByPhoneOrEmail).toHaveBeenCalledWith(
        patientDTO.phoneNumber,
        patientDTO.emailAddress
      );
      expect(mockPatientRepository.create).toHaveBeenCalledWith(patientDTO);
      expect(result).toEqual(expectedResponse);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating new patient',
        expect.objectContaining({
          firstName: patientDTO.firstName,
          lastName: patientDTO.lastName,
        })
      );
    });

    it('should successfully create a patient without optional fields', async () => {
      // Arrange
      const minimalPatientDTO = createValidPatientDTO({
        emailAddress: undefined,
        bloodGroup: undefined,
        allergies: undefined,
        primaryDoctorId: undefined,
      });

      const expectedResponse = createValidPatientResponse({
        emailAddress: undefined,
        bloodGroup: undefined,
        allergies: undefined,
      });

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await patientService.createPatient(minimalPatientDTO);

      // Assert
      expect(result.emailAddress).toBeUndefined();
      expect(mockPatientRepository.create).toHaveBeenCalledWith(minimalPatientDTO);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should successfully create a patient with primary doctor reference', async () => {
      // Arrange
      const doctorId = 'doctor-123-uuid';
      const patientDTO = createValidPatientDTO({ primaryDoctorId: doctorId });
      const expectedResponse = createValidPatientResponse({
        primaryDoctor: {
          id: doctorId,
          name: 'Dr. Smith',
          department: 'Cardiology',
        },
      });

      mockDoctorRepository.findById.mockResolvedValue({ id: doctorId, name: 'Dr. Smith' });
      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await patientService.createPatient(patientDTO);

      // Assert
      expect(mockDoctorRepository.findById).toHaveBeenCalledWith(doctorId);
      expect(result.primaryDoctor).toBeDefined();
      expect(result.primaryDoctor?.id).toBe(doctorId);
    });

    it('should compute age from date of birth when not provided', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO({ age: undefined });
      const computedAge = 32; // From 1992-05-15 to 2024-05-20

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockImplementation(async _dto => {
        return createValidPatientResponse({ age: computedAge });
      });

      // Act
      const result = await patientService.createPatient(patientDTO);

      // Assert
      expect(result.age).toBe(computedAge);
      expect(mockPatientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ dateOfBirth: '1992-05-15' })
      );
    });
  });

  describe('createPatient() - Validation Failures', () => {
    it('should throw PatientValidationError when phone number already exists', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const existingPatient = createValidPatientResponse();

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(existingPatient);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(DuplicatePatientError);

      expect(mockPatientRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Duplicate patient detected',
        expect.objectContaining({ phoneNumber: patientDTO.phoneNumber })
      );
    });

    it('should throw PatientValidationError when email already exists', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const existingPatient = createValidPatientResponse();

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(existingPatient);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(DuplicatePatientError);

      expect(mockPatientRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid date of birth (future date)', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO({
        dateOfBirth: '2025-12-31', // Future date
      });

      // Act & Assert - Service should validate before repository calls
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.findByPhoneOrEmail).not.toHaveBeenCalled();
      expect(mockPatientRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid phone format', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO({
        phoneNumber: '12345', // Invalid format
      });

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid pincode format', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO({
        pincode: '123', // Invalid - needs 6 digits
      });

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error when required fields are missing', async () => {
      // Arrange
      const invalidDTO = {
        firstName: 'Rahul',
        // Missing lastName, gender, etc.
      } as CreatePatientRequestDTO;

      // Act & Assert
      await expect(patientService.createPatient(invalidDTO)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.create).not.toHaveBeenCalled();
    });

    it('should throw DoctorNotFoundError when primary doctor does not exist', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO({ primaryDoctorId: 'non-existent-doctor' });

      mockDoctorRepository.findById.mockResolvedValue(null);
      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(DoctorNotFoundError);

      expect(mockPatientRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Primary doctor not found',
        expect.objectContaining({ doctorId: 'non-existent-doctor' })
      );
    });
  });

  describe('createPatient() - Database Failures', () => {
    it('should handle database connection error gracefully', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const dbError = new Error('Database connection failed');

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database error while creating patient',
        expect.objectContaining({ error: dbError })
      );
    });

    it('should handle unique constraint violation from database', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const uniqueViolationError = new Error('Duplicate entry');
      (uniqueViolationError as any).code = 'ER_DUP_ENTRY';

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockRejectedValue(uniqueViolationError);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(DuplicatePatientError);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Database unique constraint violation',
        expect.any(Object)
      );
    });

    it('should handle transaction timeout error', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const timeoutError = new Error('Transaction timeout');

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database transaction timeout',
        expect.any(Object)
      );
    });
  });

  describe('getPatientById() - Happy Path', () => {
    it('should return patient when found by valid UUID', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedPatient = createValidPatientResponse({ id: patientId });

      mockPatientRepository.findById.mockResolvedValue(expectedPatient);

      // Act
      const result = await patientService.getPatientById(patientId);

      // Assert
      expect(mockPatientRepository.findById).toHaveBeenCalledWith(patientId);
      expect(result).toEqual(expectedPatient);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Fetching patient by ID',
        expect.objectContaining({ patientId })
      );
    });

    it('should include doctor details when available', async () => {
      // Arrange
      const patientId = 'patient-123';
      const doctorId = 'doctor-456';
      const expectedPatient = createValidPatientResponse({
        id: patientId,
        primaryDoctor: {
          id: doctorId,
          name: 'Dr. Johnson',
          department: 'Neurology',
        },
      });

      mockPatientRepository.findById.mockResolvedValue(expectedPatient);

      // Act
      const result = await patientService.getPatientById(patientId);

      // Assert
      expect(result.primaryDoctor).toBeDefined();
      expect(result.primaryDoctor?.name).toBe('Dr. Johnson');
    });
  });

  describe('getPatientById() - Edge Cases', () => {
    it('should throw PatientNotFoundError when patient does not exist', async () => {
      // Arrange
      const nonExistentId = 'non-existent-uuid';

      mockPatientRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(patientService.getPatientById(nonExistentId)).rejects.toThrow(
        PatientNotFoundError
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Patient not found',
        expect.objectContaining({ patientId: nonExistentId })
      );
    });

    it('should handle invalid UUID format', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act & Assert - Service should validate before repository call
      await expect(patientService.getPatientById(invalidId)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle empty string ID', async () => {
      // Arrange
      const emptyId = '';

      // Act & Assert
      await expect(patientService.getPatientById(emptyId)).rejects.toThrow(PatientValidationError);

      expect(mockPatientRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle null or undefined ID', async () => {
      // Act & Assert
      await expect(patientService.getPatientById(null as any)).rejects.toThrow(
        PatientValidationError
      );

      await expect(patientService.getPatientById(undefined as any)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('getPatientById() - Database Failures', () => {
    it('should handle database query timeout', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const timeoutError = new Error('Query timeout');

      mockPatientRepository.findById.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(patientService.getPatientById(patientId)).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database error while fetching patient',
        expect.objectContaining({ patientId, error: timeoutError })
      );
    });

    it('should handle database connection pool exhaustion', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const poolError = new Error('Connection pool exhausted');

      mockPatientRepository.findById.mockRejectedValue(poolError);

      // Act & Assert
      await expect(patientService.getPatientById(patientId)).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database connection error',
        expect.any(Object)
      );
    });
  });

  describe('getAllPatients() - Happy Path', () => {
    it('should return paginated list of patients with default pagination', async () => {
      // Arrange
      const mockPatients = [
        createValidPatientResponse({ id: '1', firstName: 'Rahul' }),
        createValidPatientResponse({ id: '2', firstName: 'Priya' }),
      ];
      const mockPaginatedResult = {
        patients: mockPatients,
        total: 1245,
        page: 1,
        limit: 10,
        totalPages: 125,
      };

      mockPatientRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await patientService.getAllPatients({ page: 1, limit: 10 });

      // Assert
      expect(mockPatientRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        status: undefined,
        search: undefined,
      });
      expect(result.total).toBe(1245);
      expect(result.patients).toHaveLength(2);
    });

    it('should support filtering by status', async () => {
      // Arrange
      const mockResult = {
        patients: [createValidPatientResponse({ status: 'ACTIVE' })],
        total: 1089,
        page: 1,
        limit: 10,
        totalPages: 109,
      };

      mockPatientRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await patientService.getAllPatients({
        page: 1,
        limit: 10,
        status: 'ACTIVE',
      });

      // Assert
      expect(mockPatientRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ACTIVE' })
      );
      expect(result.patients[0].status).toBe('ACTIVE');
    });

    it('should support search functionality', async () => {
      // Arrange
      const searchTerm = 'Rahul';
      const mockResult = {
        patients: [createValidPatientResponse({ firstName: 'Rahul' })],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPatientRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await patientService.getAllPatients({
        page: 1,
        limit: 10,
        search: searchTerm,
      });

      // Assert
      expect(mockPatientRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: searchTerm })
      );
      expect(result.patients[0].firstName).toBe('Rahul');
    });

    it('should support custom sorting', async () => {
      // Arrange
      mockPatientRepository.findAll.mockResolvedValue({
        patients: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act
      await patientService.getAllPatients({
        page: 1,
        limit: 10,
        sortBy: 'lastVisitDate',
        sortOrder: 'ASC',
      });

      // Assert
      expect(mockPatientRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'lastVisitDate',
          sortOrder: 'ASC',
        })
      );
    });
  });

  describe('getAllPatients() - Validation Failures', () => {
    it('should throw validation error for invalid page number (negative)', async () => {
      // Act & Assert
      await expect(patientService.getAllPatients({ page: -1, limit: 10 })).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw validation error for limit exceeding maximum (100)', async () => {
      // Act & Assert
      await expect(patientService.getAllPatients({ page: 1, limit: 200 })).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid sort field', async () => {
      // Act & Assert
      await expect(
        patientService.getAllPatients({
          page: 1,
          limit: 10,
          sortBy: 'invalid_field' as any,
        })
      ).rejects.toThrow(PatientValidationError);

      expect(mockPatientRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid status value', async () => {
      // Act & Assert
      await expect(
        patientService.getAllPatients({
          page: 1,
          limit: 10,
          status: 'INVALID' as any,
        })
      ).rejects.toThrow(PatientValidationError);

      expect(mockPatientRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('getAllPatients() - Edge Cases', () => {
    it('should handle empty result set gracefully', async () => {
      // Arrange
      const emptyResult = {
        patients: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockPatientRepository.findAll.mockResolvedValue(emptyResult);

      // Act
      const result = await patientService.getAllPatients({ page: 999, limit: 10 });

      // Assert
      expect(result.patients).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should apply default values when pagination params are missing', async () => {
      // Arrange
      mockPatientRepository.findAll.mockResolvedValue({
        patients: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act
      await patientService.getAllPatients({});

      // Assert
      expect(mockPatientRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        status: undefined,
        search: undefined,
      });
    });
  });

  describe('updatePatient() - Happy Path', () => {
    it('should successfully update patient information', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        firstName: 'Rahul Updated',
        phoneNumber: '+919876543299',
      };
      const existingPatient = createValidPatientResponse({ id: patientId });
      const updatedPatient = {
        ...existingPatient,
        ...updateData,
        updatedAt: '2024-05-21T10:30:00Z',
      };

      mockPatientRepository.findById.mockResolvedValue(existingPatient);
      mockPatientRepository.update.mockResolvedValue(updatedPatient);

      // Act
      const result = await patientService.updatePatient(patientId, updateData);

      // Assert
      expect(mockPatientRepository.findById).toHaveBeenCalledWith(patientId);
      expect(mockPatientRepository.update).toHaveBeenCalledWith(patientId, updateData);
      expect(result.firstName).toBe('Rahul Updated');
      expect(result.updatedAt).not.toBe(existingPatient.updatedAt);
    });

    it('should allow partial updates', async () => {
      // Arrange
      const patientId = 'patient-123';
      const updateData = { address: '456 New Address' };
      const existingPatient = createValidPatientResponse({ id: patientId });
      const updatedPatient = { ...existingPatient, ...updateData };

      mockPatientRepository.findById.mockResolvedValue(existingPatient);
      mockPatientRepository.update.mockResolvedValue(updatedPatient);

      // Act
      const result = await patientService.updatePatient(patientId, updateData);

      // Assert
      expect(result.address).toBe('456 New Address');
      expect(result.firstName).toBe(existingPatient.firstName); // Unchanged
    });
  });

  describe('updatePatient() - Error Cases', () => {
    it('should throw PatientNotFoundError when patient does not exist', async () => {
      // Arrange
      const patientId = 'non-existent-id';
      const updateData = { firstName: 'New Name' };

      mockPatientRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(patientService.updatePatient(patientId, updateData)).rejects.toThrow(
        PatientNotFoundError
      );

      expect(mockPatientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid phone number format', async () => {
      // Arrange
      const patientId = 'patient-123';
      const updateData = { phoneNumber: 'invalid' };
      const existingPatient = createValidPatientResponse({ id: patientId });

      mockPatientRepository.findById.mockResolvedValue(existingPatient);

      // Act & Assert
      await expect(patientService.updatePatient(patientId, updateData)).rejects.toThrow(
        PatientValidationError
      );

      expect(mockPatientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw DuplicatePatientError when updating to existing phone number', async () => {
      // Arrange
      const patientId = 'patient-123';
      const updateData = { phoneNumber: '+919876543299' };
      const existingPatient = createValidPatientResponse({ id: patientId });

      mockPatientRepository.findById.mockResolvedValue(existingPatient);
      mockPatientRepository.existsByPhone.mockResolvedValue(true);

      // Act & Assert
      await expect(patientService.updatePatient(patientId, updateData)).rejects.toThrow(
        DuplicatePatientError
      );

      expect(mockPatientRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePatient() - Happy Path', () => {
    it('should soft delete patient successfully', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const existingPatient = createValidPatientResponse({ id: patientId });
      const deletedPatient = { ...existingPatient, status: 'INACTIVE' };

      mockPatientRepository.findById.mockResolvedValue(existingPatient);
      mockPatientRepository.softDelete.mockResolvedValue(deletedPatient);

      // Act
      const result = await patientService.deletePatient(patientId);

      // Assert
      expect(mockPatientRepository.findById).toHaveBeenCalledWith(patientId);
      expect(mockPatientRepository.softDelete).toHaveBeenCalledWith(patientId);
      expect(result.status).toBe('INACTIVE');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Patient soft deleted',
        expect.objectContaining({ patientId })
      );
    });
  });

  describe('deletePatient() - Error Cases', () => {
    it('should throw PatientNotFoundError when deleting non-existent patient', async () => {
      // Arrange
      const patientId = 'non-existent-id';

      mockPatientRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(patientService.deletePatient(patientId)).rejects.toThrow(PatientNotFoundError);

      expect(mockPatientRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw error when patient has active appointments (business rule)', async () => {
      // Arrange
      const patientId = 'patient-with-appointments';
      const existingPatient = createValidPatientResponse({ id: patientId });
      const businessRuleError = new Error('PATIENT_HAS_ACTIVE_APPOINTMENTS');

      mockPatientRepository.findById.mockResolvedValue(existingPatient);
      mockPatientRepository.softDelete.mockRejectedValue(businessRuleError);

      // Act & Assert
      await expect(patientService.deletePatient(patientId)).rejects.toThrow(AppError);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cannot delete patient with active appointments',
        expect.any(Object)
      );
    });
  });

  describe('Unexpected Failures - Global Error Handler Coverage', () => {
    it('should handle unhandled promise rejections gracefully', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const unexpectedError = new Error('Something completely unexpected');

      mockPatientRepository.findByPhoneOrEmail.mockImplementation(() => {
        throw unexpectedError;
      });

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error in createPatient',
        expect.objectContaining({
          error: unexpectedError,
          stack: expect.any(String),
        })
      );
    });

    it('should handle null reference exceptions from external services', async () => {
      // Arrange
      const patientId = 'patient-123';

      mockPatientRepository.findById.mockResolvedValue(null);
      mockPatientRepository.update.mockImplementation(() => {
        throw new TypeError('Cannot read property of null');
      });

      // Act & Assert
      await expect(patientService.updatePatient(patientId, { firstName: 'Test' })).rejects.toThrow(
        AppError
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error in updatePatient',
        expect.any(Object)
      );
    });

    it('should handle memory exhaustion errors', async () => {
      // Arrange
      const memoryError = new Error('JavaScript heap out of memory');

      mockPatientRepository.findAll.mockRejectedValue(memoryError);

      // Act & Assert
      await expect(patientService.getAllPatients({ page: 1, limit: 10 })).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith('Memory exhaustion error', expect.any(Object));
    });

    it('should handle database deadlock situations with retry logging', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const deadlockError = new Error('Deadlock found when trying to get lock');
      (deadlockError as any).code = 'ER_LOCK_DEADLOCK';

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockRejectedValue(deadlockError);

      // Act & Assert
      await expect(patientService.createPatient(patientDTO)).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database deadlock detected',
        expect.objectContaining({ error: deadlockError })
      );
    });
  });

  describe('Performance and Response Time Compliance', () => {
    it('should complete operation within target response time (<200ms for CRUD)', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const startTime = Date.now();

      mockPatientRepository.findByPhoneOrEmail.mockResolvedValue(null);
      mockPatientRepository.create.mockImplementation(async () => {
        // Simulate 50ms DB operation
        await new Promise(resolve => setTimeout(resolve, 50));
        return createValidPatientResponse();
      });

      // Act
      await patientService.createPatient(patientDTO);

      // Assert
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200);
    });

    it('should handle concurrent requests without race conditions', async () => {
      // Arrange
      const patientDTO = createValidPatientDTO();
      const existingPatient = createValidPatientResponse();

      // Simulate race condition where duplicate check passes for both
      mockPatientRepository.findByPhoneOrEmail
        .mockResolvedValueOnce(null) // First request passes
        .mockResolvedValueOnce(null); // Second request also passes

      mockPatientRepository.create
        .mockResolvedValueOnce(existingPatient)
        .mockRejectedValueOnce(new Error('Duplicate entry'));

      // Act - Simulate concurrent requests
      const results = await Promise.allSettled([
        patientService.createPatient(patientDTO),
        patientService.createPatient(patientDTO),
      ]);

      // Assert - At least one should succeed, one should fail with duplicate
      expect(results.some(r => r.status === 'fulfilled')).toBe(true);
      expect(results.some(r => r.status === 'rejected')).toBe(true);
    });
  });
});
