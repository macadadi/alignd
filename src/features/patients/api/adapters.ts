import type { Patient } from '@/shared/types/domain'
import type { PatientDTO } from '@/shared/types/dto'

export function mapPatientDtoToDomain(dto: PatientDTO): Patient {
  return {
    id: dto.id,
    fullName: dto.fullName,
    membershipNumber: dto.membershipNumber,
    schemeAdministrator: dto.schemeAdministrator,
    dependencyCode: dto.dependencyCode,
    programmeName: dto.program.name,
    programmeType: dto.program.type,
    programmePhase: dto.program.phase,
    address: {
      street: dto.address.street,
      suburb: dto.address.suburb,
      city: dto.address.city,
      province: dto.address.province,
      postalCode: dto.address.postalCode,
    },
    providerIds: dto.providers.map((provider) => provider.id),
    clinicalSummary: dto.clinicalSummary.map((entry) => ({
      id: entry.id,
      providerName: entry.providerName,
      date: entry.date,
      comment: entry.comment,
    })),
  }
}
