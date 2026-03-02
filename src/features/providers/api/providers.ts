import { apiClient, simulateLatency } from '@/services/api/client'
import { mapProviderDtoToDomain } from './adapters'
import type { Provider } from '@/shared/types/domain'
import type { ProviderDTO } from '@/shared/types/dto'

interface ProvidersResponseDTO {
  providers: ProviderDTO[]
}

export async function fetchProviders(): Promise<Provider[]> {
  await simulateLatency()
  const response = await apiClient.get<ProvidersResponseDTO>('/api-responses/providers.json')
  return response.data.providers.map(mapProviderDtoToDomain)
}
