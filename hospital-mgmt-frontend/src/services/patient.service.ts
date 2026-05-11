import apiClient from "@/lib/apiClient";
import {
  Patient,
  PatientStats,
  CreatePatientDTO,
  UpdatePatientDTO,
  PatientQueryParams,
  ApiResponse,
  PaginatedApiResponse,
} from "@/types/api.types";

class PatientService {
  private baseUrl = "/patients";

  async getPatients(
    params: PatientQueryParams,
  ): Promise<PaginatedApiResponse<Patient>> {
    const endpoint = params.search?.trim()
      ? `${this.baseUrl}/search`
      : this.baseUrl;

    const response = await apiClient.get<PaginatedApiResponse<Patient>>(
      endpoint,
      {
        params: {
          ...params,

          q: params.search,
        },
      },
    );

    return response;
  }

  // GetById
  async getPatientById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(
      `${this.baseUrl}/${id}`,
    );
    return response.data;
  }

  // Create
  async createPatient(data: CreatePatientDTO): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<Patient>>(
      this.baseUrl,
      data,
    );
    return response.data;
  }

  // Update patient
  async updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<Patient>>(
      `${this.baseUrl}/${id}`,
      data,
    );
    return response.data;
  }

  // Delete
  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Get patient statistics
  async getPatientStats(): Promise<PatientStats> {
    const response = await apiClient.get<ApiResponse<PatientStats>>(
      `${this.baseUrl}/statistics/dashboard`,
    );
    return response.data;
  }
  
  async searchPatients(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedApiResponse<Patient>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedApiResponse<Patient>>
    >(`${this.baseUrl}/search`, {
      params: {
        q: query,
        page,
        limit,
      },
    });

    return response.data;
  }
}

export const patientService = new PatientService();
