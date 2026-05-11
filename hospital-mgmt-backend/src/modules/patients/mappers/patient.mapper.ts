import type { CreatePatientRequestDTO } from '../dtos/createPatient.request.dto.js';
import type { PatientResponseDTO } from '../dtos/patientResponse.dto.js';
import type { PatientEntity } from '../domain/patient.entity.js';

export class PatientMapper {
  // Convert (DTO to Entity)
  static toEntity(dto: CreatePatientRequestDTO): Partial<PatientEntity> {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      age: dto.age,
      bloodGroup: dto.bloodGroup,
      maritalStatus: dto.maritalStatus,
      nationality: dto.nationality,
      allergies: dto.allergies,
      chronicDiseases: dto.chronicDiseases,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      primaryDoctorId: dto.primaryDoctorId,
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
    };
  }

  // Convert (Entity to Response DTO)
  static toResponse(entity: PatientEntity): PatientResponseDTO {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      gender: entity.gender,
      dateOfBirth: entity.dateOfBirth,
      age: entity.age,
      bloodGroup: entity.bloodGroup,
      maritalStatus: entity.maritalStatus,
      nationality: entity.nationality,
      allergies: entity.allergies,
      chronicDiseases: entity.chronicDiseases,
      heightCm: entity.heightCm,
      weightKg: entity.weightKg,
      phoneNumber: entity.phoneNumber,
      emailAddress: entity.emailAddress,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      pincode: entity.pincode,
      emergencyContactName: entity.emergencyContactName,
      emergencyContactPhone: entity.emergencyContactPhone,
      emergencyContactAddress: entity.emergencyContactAddress,
      profilePhotoUrl: entity.profilePhotoUrl,
      idProofType: entity.idProofType,
      idProofNumber: entity.idProofNumber,
      idProofUrl: entity.idProofUrl,
      status: entity.status,
      lastVisitDate: entity.lastVisitDate?.toISOString().split('T')[0],
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      primaryDoctor: entity.primaryDoctor
        ? {
            id: entity.primaryDoctor.id,
            name: entity.primaryDoctor.name,
            department: entity.primaryDoctor.department,
          }
        : undefined,
    };
  }
}
