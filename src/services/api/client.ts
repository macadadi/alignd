import axios from 'axios'

export const apiClient = axios.create({
  timeout: 5000,
})

export async function simulateLatency(ms = 450): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

