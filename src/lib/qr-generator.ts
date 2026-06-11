import QRCode from 'qrcode'

export interface QROptions {
  size?: number
  color?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Generate a QR code as a base64 data URL (PNG).
 * Server-side utility — uses the Node.js `qrcode` package.
 */
export async function generateQRCodeDataURL(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    size = 600,
    color = '#000000',
    errorCorrectionLevel = 'M',
  } = options

  const dataUrl = await QRCode.toDataURL(text, {
    type: 'image/png',
    width: size,
    margin: 2,
    color: {
      dark: color,
      light: '#FFFFFF',
    },
    errorCorrectionLevel,
  })

  return dataUrl
}

/**
 * Generate a QR code as an SVG string.
 * Server-side utility — uses the Node.js `qrcode` package.
 */
export async function generateQRSVG(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    color = '#000000',
    errorCorrectionLevel = 'M',
  } = options

  const svg = await QRCode.toString(text, {
    type: 'svg',
    margin: 2,
    color: {
      dark: color,
      light: '#FFFFFF',
    },
    errorCorrectionLevel,
  })

  return svg
}