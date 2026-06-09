import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const RESIZE_WIDTH = 400
const RESIZE_HEIGHT = 400

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 5 MB.' },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename — always output as WebP for best quality/size ratio
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const filepath = path.join(UPLOAD_DIR, filename)

    // Read raw file buffer
    const rawBuffer = Buffer.from(await file.arrayBuffer())

    // Resize to 400x400 with sharp — cover mode crops to fill, fit keeps aspect ratio
    const resizedBuffer = await sharp(rawBuffer)
      .resize(RESIZE_WIDTH, RESIZE_HEIGHT, {
        fit: 'cover',       // crop to fill 400x400
        position: 'center', // center the crop
      })
      .webp({ quality: 85 }) // output as WebP, good quality
      .toBuffer()

    // Write resized file
    await writeFile(filepath, resizedBuffer)

    // Return the public URL
    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({ url: publicUrl, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}
