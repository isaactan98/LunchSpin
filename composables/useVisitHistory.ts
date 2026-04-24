const STORAGE_KEY = 'lunchspin:visit_history'
const RECENT_DAYS = 3

interface VisitRecord {
  id: string
  date: string // ISO date string YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function load(): VisitRecord[] {
  if (!import.meta.client) return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as VisitRecord[]
  } catch {
    return []
  }
}

function save(records: VisitRecord[]) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function useVisitHistory() {
  function markVisited(id: string) {
    const records = load()
    const filtered = records.filter((r) => r.id !== id)
    filtered.push({ id, date: today() })
    save(filtered)
  }

  function getLastVisited(id: string): string | null {
    const records = load()
    const record = records.find((r) => r.id === id)
    return record ? record.date : null
  }

  function getRecentlyVisited(): string[] {
    const threshold = daysAgo(RECENT_DAYS)
    const records = load()
    return records
      .filter((r) => r.date >= threshold)
      .map((r) => r.id)
  }

  function getAllVisits(): Record<string, string> {
    const records = load()
    const map: Record<string, string> = {}
    records.forEach((r) => { map[r.id] = r.date })
    return map
  }

  function isRecentlyVisited(id: string): boolean {
    const threshold = daysAgo(RECENT_DAYS)
    const last = getLastVisited(id)
    return last !== null && last >= threshold
  }

  return {
    markVisited,
    getLastVisited,
    getRecentlyVisited,
    getAllVisits,
    isRecentlyVisited,
  }
}
