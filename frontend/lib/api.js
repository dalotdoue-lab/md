import { auth } from './firebase'
import { buildApiUrl } from './apiUrl'

async function getAuthHeaders() {
  const user = auth.currentUser
  let token = null
  if (user) {
    token = await user.getIdToken()
  } else if (typeof window !== 'undefined') {
    token = localStorage.getItem('token')
  }
  if (!token) return {}
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function apiGet(path) {
  const headers = await getAuthHeaders()
  const res = await fetch(buildApiUrl(path), { headers })
  if (!res.ok) {
    let msg = `GET ${path} failed: ${res.status}`
    try {
      const data = await res.json()
      msg = data.error || data.message || msg
    } catch (e) {}
    throw new Error(msg)
  }
  return res.json()
}

export async function apiPost(path, body) {
  const headers = await getAuthHeaders()
  const res = await fetch(buildApiUrl(path), {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `POST ${path} failed: ${res.status}`
    try {
      const data = await res.json()
      msg = data.error || data.message || msg
    } catch (e) {}
    throw new Error(msg)
  }
  return res.json()
}

export async function apiPut(path, body) {
  const headers = await getAuthHeaders()
  const res = await fetch(buildApiUrl(path), {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `PUT ${path} failed: ${res.status}`
    try {
      const data = await res.json()
      msg = data.error || data.message || msg
    } catch (e) {}
    throw new Error(msg)
  }
  return res.json()
}

export async function apiDelete(path) {
  const headers = await getAuthHeaders()
  const res = await fetch(buildApiUrl(path), { method: 'DELETE', headers })
  if (!res.ok) {
    let msg = `DELETE ${path} failed: ${res.status}`
    try {
      const data = await res.json()
      msg = data.error || data.message || msg
    } catch (e) {}
    throw new Error(msg)
  }
  return res.json()
}
