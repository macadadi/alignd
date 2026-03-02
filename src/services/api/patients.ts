import { apiClient, simulateLatency } from './client'
import { mapPatientDtoToDomain } from './adapters'
import type { Patient } from '@/types/domain'
import type { PatientDTO } from '@/types/dto'

interface PatientsResponseDTO {
  patients: PatientDTO[]
}

export async function fetchPatients(): Promise<Patient[]> {
  await simulateLatency()
  const response = await apiClient.get<PatientsResponseDTO>('/api-responses/patients.json')
  return response.data.patients.map(mapPatientDtoToDomain)
}

export async function persistProviderLinks(_patientId: string, _providerIds: string[]): Promise<void> {
  await simulateLatency(300)
}
