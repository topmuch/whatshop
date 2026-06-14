import { toast } from 'sonner'

export async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    toast.error(data.error || 'Erreur lors du téléchargement')
    return null
  }
  const data = await res.json()
  return data.url
}