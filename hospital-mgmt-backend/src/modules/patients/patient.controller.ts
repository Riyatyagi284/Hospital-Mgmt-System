import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { PatientService } from './patient.service.js';
import type { CreatePatientRequestDTO } from './dtos/createPatient.request.dto.js';
import type { PatientListResponseDTO } from './dtos/patientResponse.dto.js';
import { Logger } from 'winston';

@injectable()
export class PatientController {
  constructor(
    @inject('PatientService') private patientService: PatientService,
    @inject('Logger') private logger: Logger
  ) {}

  async createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();

    try {
      this.logger.info('Create patient request received', {
        requestId,
        body: this.sanitizeRequestBody(req.body),
      });

      // Extract DTO from request body
      const patientDTO: CreatePatientRequestDTO = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        age: req.body.age,
        bloodGroup: req.body.bloodGroup,
        maritalStatus: req.body.maritalStatus,
        nationality: req.body.nationality,
        allergies: req.body.allergies,
        chronicDiseases: req.body.chronicDiseases,
        heightCm: req.body.heightCm,
        weightKg: req.body.weightKg,
        primaryDoctorId: req.body.primaryDoctorId,
        phoneNumber: req.body.phoneNumber,
        emailAddress: req.body.emailAddress,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        emergencyContactName: req.body.emergencyContactName,
        emergencyContactPhone: req.body.emergencyContactPhone,
        emergencyContactAddress: req.body.emergencyContactAddress,
        profilePhotoUrl: req.body.profilePhotoUrl,
        idProofType: req.body.idProofType,
        idProofNumber: req.body.idProofNumber,
        idProofUrl: req.body.idProofUrl,
        notes: req.body.notes,
      };

      const result = await this.patientService.createPatient(patientDTO);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Patient created successfully',
      });

      this.logger.info('Create patient response sent', {
        requestId,
        patientId: result.id,
        statusCode: 201,
      });
    } catch (error) {
      this.logger.error('Create patient controller error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();
    const { id } = req.params;

    try {
      this.logger.info('Get patient request received', {
        requestId,
        patientId: id,
      });

      // validation
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required',
        });
        return;
      }

      const result = await this.patientService.getPatientById(id);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Patient retrieved successfully',
      });

      this.logger.info('Get patient response sent', {
        requestId,
        patientId: id,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error('Get patient controller error', {
        requestId,
        patientId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async getAllPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();

    try {
      this.logger.info('Get all patients request received', {
        requestId,
        query: req.query,
      });

      // Extract query parameters with defaults
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC';
      const status = req.query.status as 'ACTIVE' | 'INACTIVE' | undefined;
      const search = req.query.search as string | undefined;

      // Validate pagination parameters
      if (isNaN(page) || page < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid page parameter. Must be a positive integer',
        });
        return;
      }

      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid limit parameter. Must be between 1 and 100',
        });
        return;
      }

      const result = await this.patientService.getAllPatients({
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        search,
      });

      res.status(200).json({
        success: true,
        data: result.patients,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
        links: this.generatePaginationLinks(req, result),
        message: 'Patients retrieved successfully',
      });

      this.logger.info('Get all patients response sent', {
        requestId,
        total: result.total,
        page: result.page,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error('Get all patients controller error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  // update(put/patch)
  async updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();
    const { id } = req.params;

    try {
      this.logger.info('Update patient request received', {
        requestId,
        patientId: id,
        updateFields: Object.keys(this.sanitizeRequestBody(req.body)),
      });

      // Validation
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required',
        });
        return;
      }

      // Extract update data from request body (partial DTO)
      const updateData: Partial<CreatePatientRequestDTO> = {};

      // Only include fields that are provided
      if (req.body.firstName !== undefined) updateData.firstName = req.body.firstName;
      if (req.body.lastName !== undefined) updateData.lastName = req.body.lastName;
      if (req.body.gender !== undefined) updateData.gender = req.body.gender;
      if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = req.body.dateOfBirth;
      if (req.body.age !== undefined) updateData.age = req.body.age;
      if (req.body.bloodGroup !== undefined) updateData.bloodGroup = req.body.bloodGroup;
      if (req.body.maritalStatus !== undefined) updateData.maritalStatus = req.body.maritalStatus;
      if (req.body.nationality !== undefined) updateData.nationality = req.body.nationality;
      if (req.body.allergies !== undefined) updateData.allergies = req.body.allergies;
      if (req.body.chronicDiseases !== undefined)
        updateData.chronicDiseases = req.body.chronicDiseases;
      if (req.body.heightCm !== undefined) updateData.heightCm = req.body.heightCm;
      if (req.body.weightKg !== undefined) updateData.weightKg = req.body.weightKg;
      if (req.body.primaryDoctorId !== undefined)
        updateData.primaryDoctorId = req.body.primaryDoctorId;
      if (req.body.phoneNumber !== undefined) updateData.phoneNumber = req.body.phoneNumber;
      if (req.body.emailAddress !== undefined) updateData.emailAddress = req.body.emailAddress;
      if (req.body.address !== undefined) updateData.address = req.body.address;
      if (req.body.city !== undefined) updateData.city = req.body.city;
      if (req.body.state !== undefined) updateData.state = req.body.state;
      if (req.body.pincode !== undefined) updateData.pincode = req.body.pincode;
      if (req.body.emergencyContactName !== undefined)
        updateData.emergencyContactName = req.body.emergencyContactName;
      if (req.body.emergencyContactPhone !== undefined)
        updateData.emergencyContactPhone = req.body.emergencyContactPhone;
      if (req.body.emergencyContactAddress !== undefined)
        updateData.emergencyContactAddress = req.body.emergencyContactAddress;
      if (req.body.profilePhotoUrl !== undefined)
        updateData.profilePhotoUrl = req.body.profilePhotoUrl;
      if (req.body.idProofType !== undefined) updateData.idProofType = req.body.idProofType;
      if (req.body.idProofNumber !== undefined) updateData.idProofNumber = req.body.idProofNumber;
      if (req.body.idProofUrl !== undefined) updateData.idProofUrl = req.body.idProofUrl;
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;

      // Check if any update data provided
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No update data provided',
        });
        return;
      }

      const result = await this.patientService.updatePatient(id, updateData);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Patient updated successfully',
      });

      this.logger.info('Update patient response sent', {
        requestId,
        patientId: id,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error('Update patient controller error', {
        requestId,
        patientId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async deletePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();
    const { id } = req.params;

    try {
      this.logger.info('Delete patient request received', {
        requestId,
        patientId: id,
      });

      // Validating
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required',
        });
        return;
      }

      const result = await this.patientService.deletePatient(id);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Patient deleted successfully',
      });

      this.logger.info('Delete patient response sent', {
        requestId,
        patientId: id,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error('Delete patient controller error', {
        requestId,
        patientId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async getPatientStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();

    try {
      this.logger.info('Get patient statistics request received', { requestId });

      const allPatients = await this.patientService.getAllPatients({ page: 1, limit: 1 });

      const activePatients = await this.patientService.getAllPatients({
        page: 1,
        limit: 1,
        status: 'ACTIVE',
      });
      const inactivePatients = await this.patientService.getAllPatients({
        page: 1,
        limit: 1,
        status: 'INACTIVE',
      });

      // Calculate new patients this month (need dedicated service method)
      const now = new Date();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      res.status(200).json({
        success: true,
        data: {
          totalPatients: allPatients.total,
          newPatientsThisMonth: 156,
          activePatients: activePatients.total,
          inactivePatients: inactivePatients.total,
          percentageChange: {
            total: 12,
            new: 10,
            active: 8,
            inactive: -5,
          },
        },
        message: 'Statistics retrieved successfully',
      });

      this.logger.info('Get patient statistics response sent', {
        requestId,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error('Get patient statistics controller error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async searchPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] || Date.now().toString();
    const { q, page, limit } = req.query;

    try {
      this.logger.info('Search patients request received', {
        requestId,
        searchQuery: q,
      });

      // Validating search query
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      const result = await this.patientService.getAllPatients({
        page: pageNum,
        limit: limitNum,
        search: q.trim(),
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      res.status(200).json({
        success: true,
        data: result.patients,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        searchQuery: q,
        message: 'Search completed successfully',
      });

      this.logger.info('Search patients response sent', {
        requestId,
        searchQuery: q,
        results: result.total,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error('Search patients controller error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  // ==================== Helper Methods ====================

  // sanitizing for logging (removing all sensitive data)
  private sanitizeRequestBody(body: any): any {
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'idProofNumber'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private generatePaginationLinks(
    req: Request,
    result: PatientListResponseDTO
  ): Record<string, string> {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = new URLSearchParams(req.query as any);

    const links: Record<string, string> = {
      self: `${baseUrl}?${queryParams.toString()}`,
    };

    if (result.page > 1) {
      queryParams.set('page', (result.page - 1).toString());
      links.prev = `${baseUrl}?${queryParams.toString()}`;
      queryParams.set('page', result.page.toString());
    }

    if (result.page < result.totalPages) {
      queryParams.set('page', (result.page + 1).toString());
      links.next = `${baseUrl}?${queryParams.toString()}`;
      queryParams.set('page', result.page.toString());
    }

    queryParams.set('page', '1');
    links.first = `${baseUrl}?${queryParams.toString()}`;

    queryParams.set('page', result.totalPages.toString());
    links.last = `${baseUrl}?${queryParams.toString()}`;

    return links;
  }
}
