import type { Provider } from '@/shared/types/domain'
import type { ProviderDTO } from '@/shared/types/dto'

export function mapProviderDtoToDomain(dto: ProviderDTO): Provider {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
  }
}
