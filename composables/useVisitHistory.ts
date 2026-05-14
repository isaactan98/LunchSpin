import { ref } from 'vue'

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

function toMap(records: VisitRecord[]): Record<string, string> {
  const map: Record<string, string> = {}
  records.forEach((r) => { map[r.id] = r.date })
  return map
}

// Module-level reactive state so all consumers share the same source of truth.
const allVisitsRef = ref<Record<string, string>>({})
let hydrated = false

function hydrate(): void {
  if (hydrated || !import.meta.client) return
  allVisitsRef.value = toMap(load())
  hydrated = true
}

export function useVisitHistory() {
  hydrate()

  function markVisited(id: string) {
    const records = load()
    const filtered = records.filter((r) => r.id !== id)
    filtered.push({ id, date: today() })
    save(filtered)
    allVisitsRef.value = toMap(filtered)
  }

  function getLastVisited(id: string): string | null {
    return allVisitsRef.value[id] ?? null
  }

  function getRecentlyVisited(): string[] {
    const threshold = daysAgo(RECENT_DAYS)
    return Object.entries(allVisitsRef.value)
      .filter(([, date]) => date >= threshold)
      .map(([id]) => id)
  }

  function getAllVisits(): Record<string, string> {
    return allVisitsRef.value
  }

  function isRecentlyVisited(id: string): boolean {
    const threshold = daysAgo(RECENT_DAYS)
    const last = allVisitsRef.value[id]
    return last !== undefined && last >= threshold
  }

  return {
    allVisits: allVisitsRef,
    markVisited,
    getLastVisited,
    getRecentlyVisited,
    getAllVisits,
    isRecentlyVisited,
  }
}
