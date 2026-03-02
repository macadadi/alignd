export interface PatientAddress {
  street: string
  suburb: string
  city: string
  province: string
  postalCode: string
}

export interface ClinicalSummaryEntry {
  id: string
  providerName: string
  date: string
  comment: string
}

export interface Patient {
  id: string
  fullName: string
  membershipNumber: string
  schemeAdministrator: string
  dependencyCode: string
  programmeName: string
  programmeType: string
  programmePhase: string
  address: PatientAddress
  providerIds: string[]
  clinicalSummary: ClinicalSummaryEntry[]
}

export interface Provider {
  id: string
  name: string
  type: string
}
