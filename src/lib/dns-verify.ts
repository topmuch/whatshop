import dns from 'dns/promises'

const BOUTIKO_TARGET = process.env.CUSTOM_DOMAIN_TARGET || 'boutiko.pro'

interface DnsVerificationResult {
  success: boolean
  cnameFound: boolean
  expectedTarget: string
  actualTarget?: string
  message: string
}

/**
 * Verify that a domain has a CNAME record pointing to boutiko.pro (or the configured target).
 */
export async function verifyDomainDns(domain: string): Promise<DnsVerificationResult> {
  try {
    const cnames = await dns.resolveCname(domain)

    if (cnames.length === 0) {
      // Try A record fallback
      try {
        const addresses = await dns.resolve4(domain)
        // Check if it resolves to our server IP
        const boutikoIp = await dns.resolve4(BOUTIKO_TARGET)
        if (addresses.some(ip => boutikoIp.includes(ip))) {
          return {
            success: true,
            cnameFound: false,
            expectedTarget: BOUTIKO_TARGET,
            actualTarget: addresses.join(', '),
            message: `Enregistrement A trouvé pointant vers ${BOUTIKO_TARGET} ✓`,
          }
        }
      } catch { /* ignore */ }

      return {
        success: false,
        cnameFound: false,
        expectedTarget: BOUTIKO_TARGET,
        message: `Aucun enregistrement CNAME ou A trouvé pour ${domain}. Ajoutez un CNAME pointant vers ${BOUTIKO_TARGET}.`,
      }
    }

    const mainCname = cnames[0].toLowerCase()
    const target = BOUTIKO_TARGET.toLowerCase()

    if (mainCname === target || mainCname.endsWith(`.${target}`)) {
      return {
        success: true,
        cnameFound: true,
        expectedTarget: BOUTIKO_TARGET,
        actualTarget: cnames[0],
        message: `CNAME correct : ${cnames[0]} → ${BOUTIKO_TARGET} ✓`,
      }
    }

    return {
      success: false,
      cnameFound: true,
      expectedTarget: BOUTIKO_TARGET,
      actualTarget: cnames[0],
      message: `CNAME incorrect : trouvé "${cnames[0]}", attendu "${BOUTIKO_TARGET}".`,
    }
  } catch (error) {
    return {
      success: false,
      cnameFound: false,
      expectedTarget: BOUTIKO_TARGET,
      message: `Impossible de vérifier le DNS : ${error instanceof Error ? error.message : 'erreur inconnue'}. Le domaine est peut-être invalide ou non enregistré.`,
    }
  }
}