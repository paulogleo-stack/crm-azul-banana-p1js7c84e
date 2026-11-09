import pb from '@/lib/pocketbase/client'
import type { UserRecord } from '@/types/crm'

export async function listUsers() {
  return (await pb.collection('users').getFullList({ sort: 'name' })) as UserRecord[]
}
