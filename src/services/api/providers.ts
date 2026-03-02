import { apiClient, simulateLatency } from './client'
import { mapProviderDtoToDomain } from './adapters'
import type { Provider } from '@/types/domain'
import type { ProviderDTO } from '@/types/dto'

interface ProvidersResponseDTO {
  providers: ProviderDTO[]
}

export async function fetchProviders(): Promise<Provider[]> {
  await simulateLatency()
  const response = await apiClient.get<ProvidersResponseDTO>('/api-responses/providers.json')
  return response.data.providers.map(mapProviderDtoToDomain)
}
