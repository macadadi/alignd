/** DTO types from API responses. */

export interface PatientProgramDTO {
  name: string
  type: string
  phase: string
}

export interface PatientAddressDTO {
  street: string
  suburb: string
  city: string
  province: string
  postalCode: string
}

export interface LinkedProviderDTO {
  id: string
}

export interface ClinicalSummaryDTO {
  id: string
  providerName: string
  date: string
  comment: string
}

export interface PatientDTO {
  id: string
  fullName: string
  membershipNumber: string
  schemeAdministrator: string
  dependencyCode: string
  program: PatientProgramDTO
  address: PatientAddressDTO
  providers: LinkedProviderDTO[]
  clinicalSummary: ClinicalSummaryDTO[]
}

export interface ProviderDTO {
  id: string
  name: string
  type: string
}
