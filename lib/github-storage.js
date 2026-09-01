// GitHub JSON Storage — replaces Supabase entirely
// Reads/writes data/revenue.json in the GitHub repo

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO || 'fwdbukhari/viral-mobitech-investor'
const FILE_PATH = 'data/revenue.json'
const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`

export async function readData() {
  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub read failed: ${res.status}`)
  const json = await res.json()
  const content = Buffer.from(json.content, 'base64').toString('utf-8')
  return { data: JSON.parse(content), sha: json.sha }
}

export async function writeData(data, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update revenue data — ${new Date().toISOString().slice(0, 10)}`,
      content,
      sha,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`GitHub write failed: ${err.message}`)
  }
  return res.json()
}
