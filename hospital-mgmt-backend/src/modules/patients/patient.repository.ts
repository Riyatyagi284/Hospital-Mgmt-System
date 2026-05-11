import { injectable } from 'inversify';
import { Collection, ObjectId, type Filter, type DeleteResult } from 'mongodb';
import type { CreatePatientRequestDTO } from './dtos/createPatient.request.dto.js';
import type { PatientResponseDTO, PatientListResponseDTO } from './dtos/patientResponse.dto.js';
import { getMongoDB } from '../../config/db.config.js';

@injectable()
export class PatientRepository {
  private collection: Collection<PatientDocument> | null = null;

  constructor() {
    this.initCollection();
  }

  private async initCollection(): Promise<void> {
    const db = await getMongoDB();
    this.collection = db.collection<PatientDocument>('patients');

    await this.createIndexes();
  }

  // db indexes (for performance optimization)
  private async createIndexes(): Promise<void> {
    if (!this.collection) return;

    // Unique indexes
    await this.collection.createIndex({ phoneNumber: 1 }, { unique: true, sparse: true });
    await this.collection.createIndex({ emailAddress: 1 }, { unique: true, sparse: true });

    // Compound index for unique constraint (userId, postId equivalent pattern)
    await this.collection.createIndex({ phoneNumber: 1, emailAddress: 1 });

    // Indexes (for searching and filtering)
    await this.collection.createIndex({
      firstName: 'text',
      lastName: 'text',
      phoneNumber: 'text',
      emailAddress: 'text',
    });
    await this.collection.createIndex({ status: 1 });
    await this.collection.createIndex({ createdAt: -1 });
    await this.collection.createIndex({ lastVisitDate: -1 });
    await this.collection.createIndex({ primaryDoctorId: 1 });

    // Compound index (for pagination queries)
    await this.collection.createIndex({ status: 1, createdAt: -1 });
    await this.collection.createIndex({ status: 1, lastName: 1, firstName: 1 });
  }

  async create(dto: CreatePatientRequestDTO): Promise<PatientResponseDTO> {
    if (!this.collection) {
      await this.initCollection();
    }

    const now = new Date();
    const patientDocument: PatientDocument = {
      _id: new ObjectId(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      age: dto.age!,
      bloodGroup: dto.bloodGroup,
      maritalStatus: dto.maritalStatus,
      nationality: dto.nationality,
      allergies: dto.allergies,
      chronicDiseases: dto.chronicDiseases,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      primaryDoctorId: dto.primaryDoctorId ? new ObjectId(dto.primaryDoctorId) : undefined,
      phoneNumber: dto.phoneNumber,
      emailAddress: dto.emailAddress,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      emergencyContactAddress: dto.emergencyContactAddress,
      profilePhotoUrl: dto.profilePhotoUrl,
      idProofType: dto.idProofType,
      idProofNumber: dto.idProofNumber,
      idProofUrl: dto.idProofUrl,
      notes: dto.notes,
      status: 'ACTIVE',
      lastVisitDate: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const result = await this.collection!.insertOne(patientDocument);

    return this.documentToResponse(patientDocument, result.insertedId.toString());
  }

  async findById(id: string): Promise<PatientResponseDTO | null> {
    if (!this.collection) {
      await this.initCollection();
    }

    try {
      const objectId = new ObjectId(id);
      const document = await this.collection!.findOne({
        _id: objectId,
        deletedAt: null,
      });

      if (!document) {
        return null;
      }

      return this.documentToResponse(document, id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Invalid ObjectId format
      return null;
    }
  }

  async findByPhoneOrEmail(
    phoneNumber: string,
    emailAddress?: string
  ): Promise<PatientResponseDTO | null> {
    if (!this.collection) {
      await this.initCollection();
    }

    const query: Filter<PatientDocument> = {
      deletedAt: null,
      $or: [{ phoneNumber }],
    };

    if (emailAddress) {
      query.$or!.push({ emailAddress });
    }

    const document = await this.collection!.findOne(query);

    if (!document) {
      return null;
    }

    return this.documentToResponse(document, document._id.toString());
  }

  async existsByPhone(phoneNumber: string): Promise<boolean> {
    if (!this.collection) {
      await this.initCollection();
    }

    const count = await this.collection!.countDocuments({
      phoneNumber,
      deletedAt: null,
    });

    return count > 0;
  }

  async existsByEmail(emailAddress: string): Promise<boolean> {
    if (!this.collection) {
      await this.initCollection();
    }

    const count = await this.collection!.countDocuments({
      emailAddress,
      deletedAt: null,
    });

    return count > 0;
  }

  async findAll(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    status?: 'ACTIVE' | 'INACTIVE';
    search?: string;
  }): Promise<PatientListResponseDTO> {
    if (!this.collection) {
      await this.initCollection();
    }

    const { page, limit, sortBy, sortOrder, status, search } = params;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: Filter<PatientDocument> = { deletedAt: null };

    if (status) {
      filter.status = status;
    }

    // Text search across multiple fields
    if (search && search.trim().length > 0) {
      filter.$text = { $search: search };
    }

    // Build sort options
    const sortOptions: any = {};
    const sortField = this.getSortField(sortBy);
    sortOptions[sortField] = sortOrder === 'ASC' ? 1 : -1;

    // Execute queries in parallel for performance
    const [documents, total] = await Promise.all([
      this.collection!.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
      this.collection!.countDocuments(filter),
    ]);

    const patients = documents.map(doc => this.documentToResponse(doc, doc._id.toString()));

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    updateData: Partial<CreatePatientRequestDTO>
  ): Promise<PatientResponseDTO> {
    if (!this.collection) {
      await this.initCollection();
    }

    const objectId = new ObjectId(id);

    const updateFields: Partial<PatientDocument> = {
      updatedAt: new Date(),
    };

    // Personal Information
    if (updateData.firstName !== undefined) {
      updateFields.firstName = updateData.firstName;
    }

    if (updateData.lastName !== undefined) {
      updateFields.lastName = updateData.lastName;
    }

    if (updateData.gender !== undefined) {
      updateFields.gender = updateData.gender;
    }

    if (updateData.dateOfBirth !== undefined) {
      updateFields.dateOfBirth = new Date(updateData.dateOfBirth);
      updateFields.age = this.calculateAge(updateData.dateOfBirth);
    }

    if (updateData.age !== undefined) {
      updateFields.age = updateData.age;
    }

    if (updateData.bloodGroup !== undefined) {
      updateFields.bloodGroup = updateData.bloodGroup;
    }

    if (updateData.maritalStatus !== undefined) {
      updateFields.maritalStatus = updateData.maritalStatus;
    }

    if (updateData.nationality !== undefined) {
      updateFields.nationality = updateData.nationality;
    }

    if (updateData.allergies !== undefined) {
      updateFields.allergies = updateData.allergies;
    }

    if (updateData.chronicDiseases !== undefined) {
      updateFields.chronicDiseases = updateData.chronicDiseases;
    }

    if (updateData.heightCm !== undefined) {
      updateFields.heightCm = updateData.heightCm;
    }

    if (updateData.weightKg !== undefined) {
      updateFields.weightKg = updateData.weightKg;
    }

    // Doctor Relation
    if (updateData.primaryDoctorId !== undefined) {
      updateFields.primaryDoctorId = updateData.primaryDoctorId
        ? new ObjectId(updateData.primaryDoctorId)
        : undefined;
    }

    // Contact Information
    if (updateData.phoneNumber !== undefined) {
      updateFields.phoneNumber = updateData.phoneNumber;
    }

    if (updateData.emailAddress !== undefined) {
      updateFields.emailAddress = updateData.emailAddress;
    }

    if (updateData.address !== undefined) {
      updateFields.address = updateData.address;
    }

    if (updateData.city !== undefined) {
      updateFields.city = updateData.city;
    }

    if (updateData.state !== undefined) {
      updateFields.state = updateData.state;
    }

    if (updateData.pincode !== undefined) {
      updateFields.pincode = updateData.pincode;
    }

    // Emergency Contact
    if (updateData.emergencyContactName !== undefined) {
      updateFields.emergencyContactName = updateData.emergencyContactName;
    }

    if (updateData.emergencyContactPhone !== undefined) {
      updateFields.emergencyContactPhone = updateData.emergencyContactPhone;
    }

    if (updateData.emergencyContactAddress !== undefined) {
      updateFields.emergencyContactAddress = updateData.emergencyContactAddress;
    }

    // Additional Information
    if (updateData.profilePhotoUrl !== undefined) {
      updateFields.profilePhotoUrl = updateData.profilePhotoUrl;
    }

    if (updateData.idProofType !== undefined) {
      updateFields.idProofType = updateData.idProofType;
    }

    if (updateData.idProofNumber !== undefined) {
      updateFields.idProofNumber = updateData.idProofNumber;
    }

    if (updateData.idProofUrl !== undefined) {
      updateFields.idProofUrl = updateData.idProofUrl;
    }

    if (updateData.notes !== undefined) {
      updateFields.notes = updateData.notes;
    }

    const result = await this.collection!.findOneAndUpdate(
      {
        _id: objectId,
        deletedAt: null,
      },
      {
        $set: updateFields,
      },
      {
        returnDocument: 'after',
      }
    );

    if (!result) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    return this.documentToResponse(result, id);
  }

  async softDelete(id: string): Promise<PatientResponseDTO> {
    if (!this.collection) {
      await this.initCollection();
    }

    const objectId = new ObjectId(id);

    const result = await this.collection!.findOneAndUpdate(
      { _id: objectId, deletedAt: null },
      {
        $set: {
          deletedAt: new Date(),
          status: 'INACTIVE',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    return this.documentToResponse(result, id);
  }

  async hardDelete(id: string): Promise<boolean> {
    if (!this.collection) {
      await this.initCollection();
    }

    const objectId = new ObjectId(id);
    const result: DeleteResult = await this.collection!.deleteOne({ _id: objectId });

    return result.deletedCount === 1;
  }

  async updateLastVisit(id: string, lastVisitDate: Date): Promise<void> {
    if (!this.collection) {
      await this.initCollection();
    }

    const objectId = new ObjectId(id);

    await this.collection!.updateOne(
      { _id: objectId, deletedAt: null },
      {
        $set: {
          lastVisitDate: lastVisitDate,
          updatedAt: new Date(),
        },
      }
    );
  }

  // patient KPI(statistics) for dashboard
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  }> {
    if (!this.collection) {
      await this.initCollection();
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, inactive, newThisMonth] = await Promise.all([
      this.collection!.countDocuments({ deletedAt: null }),
      this.collection!.countDocuments({ deletedAt: null, status: 'ACTIVE' }),
      this.collection!.countDocuments({ deletedAt: null, status: 'INACTIVE' }),
      this.collection!.countDocuments({
        deletedAt: null,
        createdAt: { $gte: firstDayOfMonth },
      }),
    ]);

    return { total, active, inactive, newThisMonth };
  }

  async bulkInsert(patients: CreatePatientRequestDTO[]): Promise<string[]> {
    if (!this.collection) {
      await this.initCollection();
    }

    const now = new Date();
    const documents: PatientDocument[] = patients.map(dto => ({
      _id: new ObjectId(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      age: dto.age || this.calculateAge(dto.dateOfBirth),
      bloodGroup: dto.bloodGroup,
      maritalStatus: dto.maritalStatus,
      nationality: dto.nationality,
      allergies: dto.allergies,
      chronicDiseases: dto.chronicDiseases,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      primaryDoctorId: dto.primaryDoctorId ? new ObjectId(dto.primaryDoctorId) : undefined,
      phoneNumber: dto.phoneNumber,
      emailAddress: dto.emailAddress,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      emergencyContactAddress: dto.emergencyContactAddress,
      profilePhotoUrl: dto.profilePhotoUrl,
      idProofType: dto.idProofType,
      idProofNumber: dto.idProofNumber,
      idProofUrl: dto.idProofUrl,
      notes: dto.notes,
      status: 'ACTIVE',
      lastVisitDate: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    const result = await this.collection!.insertMany(documents);
    return Object.values(result.insertedIds).map(id => id.toString());
  }

  // ==================== Helper Methods ====================

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

  private getSortField(sortBy: string): string {
    const sortMap: Record<string, string> = {
      createdAt: 'createdAt',
      firstName: 'firstName',
      lastName: 'lastName',
      lastVisitDate: 'lastVisitDate',
    };
    return sortMap[sortBy] || 'createdAt';
  }

  // Convert MongoDB document to Response DTO
  private documentToResponse(doc: PatientDocument, id: string): PatientResponseDTO {
    return {
      id: id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      gender: doc.gender,
      dateOfBirth: doc.dateOfBirth,
      age: doc.age,
      bloodGroup: doc.bloodGroup,
      maritalStatus: doc.maritalStatus,
      nationality: doc.nationality,
      allergies: doc.allergies,
      chronicDiseases: doc.chronicDiseases,
      heightCm: doc.heightCm,
      weightKg: doc.weightKg,
      phoneNumber: doc.phoneNumber,
      emailAddress: doc.emailAddress,
      address: doc.address,
      city: doc.city,
      state: doc.state,
      pincode: doc.pincode,
      emergencyContactName: doc.emergencyContactName,
      emergencyContactPhone: doc.emergencyContactPhone,
      emergencyContactAddress: doc.emergencyContactAddress,
      profilePhotoUrl: doc.profilePhotoUrl,
      idProofType: doc.idProofType,
      idProofNumber: doc.idProofNumber,
      idProofUrl: doc.idProofUrl,
      status: doc.status,
      lastVisitDate: doc.lastVisitDate?.toISOString().split('T')[0],
      notes: doc.notes,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      primaryDoctor: undefined, // can be populated by service layer
    };
  }
}

// ==================== MongoDB Document Interface ====================

export interface PatientDocument {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: Date;
  age: number;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  allergies?: string;
  chronicDiseases?: string;
  heightCm?: number;
  weightKg?: number;
  primaryDoctorId?: ObjectId;
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
  idProofType?: string;
  idProofNumber?: string;
  idProofUrl?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastVisitDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
