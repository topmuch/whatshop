import path from 'path'

/**
 * Répertoire de stockage des fichiers uploadés.
 * En production (Coolify/Docker) : /app/uploads
 * En dev local : ./uploads (à la racine du projet)
 */
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')