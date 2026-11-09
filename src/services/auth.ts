import pb from '@/lib/pocketbase/client'
import type { UserRecord } from '@/types/crm'

export async function signIn(email: string, password: string) {
  const auth = await pb.collection('users').authWithPassword(email, password)
  return auth.record as UserRecord
}

export function signOut() {
  pb.authStore.clear()
}

export function getCurrentUser() {
  return pb.authStore.record as UserRecord | null
}

export function isAuthenticated() {
  return pb.authStore.isValid
}

export async function refreshSession() {
  if (!pb.authStore.isValid) return null
  try {
    const auth = await pb.collection('users').authRefresh()
    return auth.record as UserRecord
  } catch {
    pb.authStore.clear()
    return null
  }
}

export async function requestPasswordReset(email: string) {
  await pb.collection('users').requestPasswordReset(email)
}

export function onAuthChange(callback: () => void) {
  return pb.authStore.onChange(callback)
}
