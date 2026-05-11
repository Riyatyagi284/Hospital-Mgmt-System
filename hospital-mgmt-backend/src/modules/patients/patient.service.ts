import { injectable, inject } from 'inversify';
import createHttpError from 'http-errors';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { PatientRepository } from './patient.repository.js';
// import { DoctorRepository } from '../doctors/doctor.repository.js';
import type { CreatePatientRequestDTO } from './dtos/createPatient.request.dto.js';
import type { PatientResponseDTO, PatientListResponseDTO } from './dtos/patientResponse.dto.js';

@injectable()
export class PatientService {
  constructor(
    @inject('PatientRepository') private patientRepository: PatientRepository,
    // @inject('DoctorRepository') private doctorRepository: DoctorRepository,
    @inject('Logger') private logger: Logger
  ) {}

  // create
  async createPatient(dto: CreatePatientRequestDTO): Promise<PatientResponseDTO> {
    const operationId = `create_patient_${Date.now()}`;

    const dob = new Date(dto.dateOfBirth);

    if (isNaN(dob.getTime())) {
      throw new createHttpError.BadRequest('Invalid dateOfBirth');
    }

    try {
      this.logger.info('Creating new patient', {
        operationId,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });

      // Validation
      await this.validatePatientDTO(dto);

      // duplicate patient check
      const existingPatient = await this.patientRepository.findByPhoneOrEmail(
        dto.phoneNumber,
        dto.emailAddress
      );

      if (existingPatient) {
        this.logger.warn('Duplicate patient detected', {
          operationId,
          phoneNumber: dto.phoneNumber,
          email: dto.emailAddress,
        });
        throw new createHttpError.Conflict(
          'A patient with the same phone number or email already exists'
        );
      }

      // Validate primary doctor if provided
      // if (dto.primaryDoctorId) {
      //   const doctorExists = await this.doctorRepository.findById(dto.primaryDoctorId);
      //   if (!doctorExists) {
      //     this.logger.error('Primary doctor not found', {
      //       operationId,
      //       doctorId: dto.primaryDoctorId,
      //     });
      //     throw new createHttpError.NotFound('The specified primary doctor does not exist');
      //   }
      // }

      // Age Calculation
      const age = dto.age ?? this.calculateAge(dob);

      // payload
      const patientPayload = {
        ...dto,
        dateOfBirth: dto.dateOfBirth,
        age,
      };

      const patient = await this.patientRepository.create(patientPayload);

      this.logger.info('Patient created successfully', { operationId, patientId: patient.id });

      return patient;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      // Handle database specific errors
      if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        this.logger.warn('Database unique constraint violation', { operationId, error });
        throw new createHttpError.Conflict('A patient with the same information already exists');
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        this.logger.error('Database transaction timeout', { operationId, error });
        throw new createHttpError.InternalServerError('Database operation timed out');
      }

      if (error instanceof Error && error.message.includes('connection')) {
        this.logger.error('Database connection error', { operationId, error });
        throw new createHttpError.ServiceUnavailable('Database service unavailable');
      }

      this.logger.error('Unexpected error in createPatient', {
        operationId,
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new createHttpError.InternalServerError('Failed to create patient');
    }
  }

  // getById
  async getPatientById(id: string): Promise<PatientResponseDTO> {
    const operationId = `get_patient_${Date.now()}`;

    try {
      this.logger.info('Fetching patient by ID', { operationId, patientId: id });

      // Id Validation
      if (!id || typeof id !== 'string') {
        throw new createHttpError.BadRequest('Invalid patient ID format');
      }

      if (!ObjectId.isValid(id)) {
        throw new createHttpError.BadRequest(
          'Invalid patient ID format. Must be a valid MongoDB ObjectId'
        );
      }

      const patient = await this.patientRepository.findById(id);

      if (!patient) {
        this.logger.warn('Patient not found', { operationId, patientId: id });
        throw new createHttpError.NotFound('Patient not found with the provided ID');
      }

      this.logger.info('Patient fetched successfully', { operationId, patientId: id });

      return patient;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        this.logger.error('Database query timeout', { operationId, error });
        throw new createHttpError.InternalServerError('Database query timed out');
      }

      if (error instanceof Error && error.message.includes('connection')) {
        this.logger.error('Database connection error', { operationId, error });
        throw new createHttpError.ServiceUnavailable('Database service unavailable');
      }

      this.logger.error('Database error while fetching patient', {
        operationId,
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new createHttpError.InternalServerError('Failed to fetch patient');
    }
  }

  // getAll
  async getAllPatients(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    status?: 'ACTIVE' | 'INACTIVE';
    search?: string;
  }): Promise<PatientListResponseDTO> {
    const operationId = `list_patients_${Date.now()}`;

    try {
      this.logger.info('Listing patients', { operationId, params });

      // validation
      // set defaults
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(100, Math.max(1, params.limit || 10));

      // sortBy
      const validSortFields = ['createdAt', 'firstName', 'lastName', 'lastVisitDate'];
      const sortBy =
        params.sortBy && validSortFields.includes(params.sortBy) ? params.sortBy : 'createdAt';

      // sortOrder
      const sortOrder = params.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      // status
      const status =
        params.status && ['ACTIVE', 'INACTIVE'].includes(params.status) ? params.status : undefined;

      // search
      const search =
        params.search && params.search.length >= 1 && params.search.length <= 100
          ? params.search
          : undefined;

      const result = await this.patientRepository.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        search,
      });

      this.logger.info('Patients listed successfully', {
        operationId,
        total: result.total,
        page: result.page,
      });

      return result;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error && error.message.includes('memory')) {
        this.logger.error('Memory exhaustion error', { operationId, error });
        throw new createHttpError.InternalServerError('Server resource limit exceeded');
      }

      this.logger.error('Error listing patients', {
        operationId,
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new createHttpError.InternalServerError('Failed to fetch patients list');
    }
  }

  // update
  async updatePatient(
    id: string,
    updateData: Partial<CreatePatientRequestDTO>
  ): Promise<PatientResponseDTO> {
    const operationId = `update_patient_${Date.now()}`;

    try {
      this.logger.info('Updating patient', { operationId, patientId: id });

      // validation
      // ID
      if (!ObjectId.isValid(id)) {
        throw new createHttpError.BadRequest(
          'Invalid patient ID format. Must be a valid MongoDB ObjectId'
        );
      }

      // Check patient exists or not
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        this.logger.warn('Patient not found for update', { operationId, patientId: id });
        throw new createHttpError.NotFound('Cannot update: Patient not found');
      }

      // if phone number changed
      if (updateData.phoneNumber && updateData.phoneNumber !== existingPatient.phoneNumber) {
        if (!this.isValidPhoneNumber(updateData.phoneNumber)) {
          throw new createHttpError.BadRequest('Invalid phone number format');
        }

        const phoneExists = await this.patientRepository.existsByPhone(updateData.phoneNumber);
        if (phoneExists) {
          throw new createHttpError.Conflict('Phone number already exists for another patient');
        }
      }

      // if email changed
      if (updateData.emailAddress && updateData.emailAddress !== existingPatient.emailAddress) {
        if (!this.isValidEmail(updateData.emailAddress)) {
          throw new createHttpError.BadRequest('Invalid email address format');
        }
      }

      // pincode
      if (updateData.pincode && !this.isValidPincode(updateData.pincode)) {
        throw new createHttpError.BadRequest('Invalid pincode format');
      }

      // date of birth
      if (updateData.dateOfBirth && !this.isValidDateOfBirth(updateData.dateOfBirth)) {
        throw new createHttpError.BadRequest('Invalid date of birth. Cannot be in the future');
      }

      // Recalculate age if DOB changed
      if (updateData.dateOfBirth) {
        updateData.age = this.calculateAge(updateData.dateOfBirth);
      }

      const updatedPatient = await this.patientRepository.update(id, updateData);

      this.logger.info('Patient updated successfully', { operationId, patientId: id });

      return updatedPatient;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      this.logger.error('Unexpected error in updatePatient', {
        operationId,
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new createHttpError.InternalServerError('Failed to update patient');
    }
  }

  // softDelete
  async deletePatient(id: string): Promise<PatientResponseDTO> {
    const operationId = `delete_patient_${Date.now()}`;

    try {
      this.logger.info('Deleting patient', { operationId, patientId: id });

      // Validate ID
      if (!ObjectId.isValid(id)) {
        throw new createHttpError.BadRequest(
          'Invalid patient ID format. Must be a valid MongoDB ObjectId'
        );
      }

      // Check if patient exists
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        this.logger.warn('Patient not found for deletion', { operationId, patientId: id });
        throw new createHttpError.NotFound('Cannot delete: Patient not found');
      }

      const deletedPatient = await this.patientRepository.softDelete(id);

      this.logger.info('Patient soft deleted successfully', { operationId, patientId: id });

      return deletedPatient;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error && error.message.includes('PATIENT_HAS_ACTIVE_APPOINTMENTS')) {
        this.logger.warn('Cannot delete patient with active appointments', {
          operationId,
          patientId: id,
        });
        throw new createHttpError.UnprocessableEntity(
          'Cannot delete patient with active appointments. Please reschedule or cancel appointments first'
        );
      }

      if (error instanceof Error && error.message.includes('PATIENT_HAS_PENDING_BILLING')) {
        this.logger.warn('Cannot delete patient with pending billing', {
          operationId,
          patientId: id,
        });
        throw new createHttpError.UnprocessableEntity(
          'Cannot delete patient with pending billing records'
        );
      }

      this.logger.error('Unexpected error in deletePatient', {
        operationId,
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new createHttpError.InternalServerError('Failed to delete patient');
    }
  }

  // ==================== Helper Methods ====================

  // patient DTO validation
  private async validatePatientDTO(dto: CreatePatientRequestDTO): Promise<void> {
    // validation
    // Required
    const requiredFields = [
      'firstName',
      'lastName',
      'gender',
      'dateOfBirth',
      'phoneNumber',
      'address',
      'city',
      'state',
      'pincode',
      'emergencyContactName',
      'emergencyContactPhone',
    ];

    for (const field of requiredFields) {
      if (!dto[field as keyof CreatePatientRequestDTO]) {
        throw new createHttpError.BadRequest(`${field} is required`);
      }
    }

    // Gender
    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(dto.gender)) {
      throw new createHttpError.BadRequest('Invalid gender value');
    }

    // DOB
    if (!this.isValidDateOfBirth(dto.dateOfBirth)) {
      throw new createHttpError.BadRequest(
        'Date of birth must be in YYYY-MM-DD format and cannot be in the future'
      );
    }

    // Phone number
    if (!this.isValidPhoneNumber(dto.phoneNumber)) {
      throw new createHttpError.BadRequest(
        'Phone number must be in E.164 format (e.g., +919876543210)'
      );
    }

    // Email
    if (dto.emailAddress && !this.isValidEmail(dto.emailAddress)) {
      throw new createHttpError.BadRequest('Invalid email address format');
    }

    // Pincode(6 digits)
    if (!this.isValidPincode(dto.pincode)) {
      throw new createHttpError.BadRequest('Pincode must be a 6-digit number');
    }

    // Blood group
    if (dto.bloodGroup) {
      const validBloodGroups = [
        'A_POSITIVE',
        'A_NEGATIVE',
        'B_POSITIVE',
        'B_NEGATIVE',
        'AB_POSITIVE',
        'AB_NEGATIVE',
        'O_POSITIVE',
        'O_NEGATIVE',
      ];
      if (!validBloodGroups.includes(dto.bloodGroup)) {
        throw new createHttpError.BadRequest('Invalid blood group value');
      }
    }

    // Height
    if (dto.heightCm && (dto.heightCm < 30 || dto.heightCm > 300)) {
      throw new createHttpError.BadRequest('Height must be between 30cm and 300cm');
    }

    // Weight
    if (dto.weightKg && (dto.weightKg < 2 || dto.weightKg > 500)) {
      throw new createHttpError.BadRequest('Weight must be between 2kg and 500kg');
    }

    // Emergency contact phone
    if (!this.isValidPhoneNumber(dto.emergencyContactPhone)) {
      throw new createHttpError.BadRequest(
        'Emergency contact phone number must be in E.164 format'
      );
    }
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: Date): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Validate dob
  private isValidDateOfBirth(dateOfBirth: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthDate = new Date(dateOfBirth);
    birthDate.setHours(0, 0, 0, 0);

    return birthDate <= today;
  }

  // Validate phone number
  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
  }

  // Validate pincode (6 digits)
  private isValidPincode(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }
}
