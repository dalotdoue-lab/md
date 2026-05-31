const DEFAULT_ADMIN_EMAILS = ['let@admin.com']
const DEFAULT_CLIENT_EMAILS = ['dalotdoue@gmail.com']

function getAdminEmails(envValue = process.env.ADMIN_EMAILS || '') {
  return Array.from(new Set([
    ...DEFAULT_ADMIN_EMAILS,
    ...String(envValue)
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean),
  ]))
}

function isAdminEmail(email, envValue) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (DEFAULT_CLIENT_EMAILS.includes(normalizedEmail)) return false
  return getAdminEmails(envValue).includes(normalizedEmail)
}

module.exports = { getAdminEmails, isAdminEmail }
