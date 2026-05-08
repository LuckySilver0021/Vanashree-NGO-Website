import { NextResponse } from 'next/server'

// TEMPORARY DEBUG ENDPOINT — remove after fixing env vars
export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY
  const web3 = process.env.WEB3FORMS_ACCESS_KEY
  const certSecret = process.env.CERTIFICATE_SECRET

  return NextResponse.json({
    GOOGLE_SHEET_ID: sheetId ? `SET (${sheetId.length} chars) — value: ${sheetId}` : 'NOT SET',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: email ? `SET (${email.length} chars) — value: ${email}` : 'NOT SET',
    GOOGLE_PRIVATE_KEY: rawKey
      ? {
          length: rawKey.length,
          startsCorrectly: rawKey.trimStart().startsWith('-----BEGIN PRIVATE KEY-----'),
          endsCorrectly: rawKey.trimEnd().endsWith('-----END PRIVATE KEY-----'),
          hasLiteralBackslashN: rawKey.includes('\\n'),
          hasRealNewlines: rawKey.includes('\n'),
          first50chars: rawKey.substring(0, 50),
          last50chars: rawKey.substring(rawKey.length - 50),
        }
      : 'NOT SET',
    WEB3FORMS_ACCESS_KEY: web3 ? `SET (${web3.length} chars) — value: ${web3}` : 'NOT SET',
    CERTIFICATE_SECRET: certSecret ? `SET (${certSecret.length} chars) — value: ${certSecret}` : 'NOT SET',
  })
}
