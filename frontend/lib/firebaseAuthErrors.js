export function getFirebaseAuthErrorMessage(error) {
  const code = error?.code || ''
  const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain'

  const messages = {
    'auth/account-exists-with-different-credential': 'An account already exists with the same email. Sign in with the original method first.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase is using an invalid API key. Check the frontend Firebase environment variables in Vercel.',
    'auth/invalid-api-key': 'Firebase is using an invalid API key. Check the frontend Firebase environment variables in Vercel.',
    'auth/network-request-failed': 'Google sign-in could not reach Firebase. Check your connection and try again.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase Authentication. Enable the Google provider for the stkpush-cff51 project.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Please allow popups or try again.',
    'auth/popup-closed-by-user': '',
    'auth/unauthorized-domain': `Google sign-in is blocked because ${host} is not an authorized Firebase domain. Add ${host} in Firebase Authentication > Settings > Authorized domains.`,
    'auth/web-storage-unsupported': 'Your browser is blocking storage needed for Google sign-in. Try another browser or enable site storage.',
  }

  return messages[code] || error?.message || 'Google sign-in failed. Please try again.'
}

export function withFirebaseAuthMessage(error) {
  if (error && !error.userMessage) {
    error.userMessage = getFirebaseAuthErrorMessage(error)
  }
  return error
}
