import { useSyncExternalStore } from 'react'

/**
 * Tiny external store that holds the live marketplace query (search text,
 * category, location, sort). It lets the sticky header's search box and the
 * marketplace grid share one source of truth, so results update instantly
 * on every keystroke — no server round trip, no waiting for Enter.
 *
 * The URL remains the persistent source of truth: the marketplace seeds this
 * store from the URL on first mount and mirrors local changes back to the
 * URL (debounced) so links and refreshes keep working.
 */

export interface SearchQuery {
  q: string
  category: string
  location: string
  sort: string
}

export const DEFAULT_SEARCH_QUERY: SearchQuery = {
  q: '',
  category: '',
  location: '',
  sort: 'newest',
}

let state: SearchQuery = { ...DEFAULT_SEARCH_QUERY }
let pristine = true

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeSearchQuery(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSearchQuery(): SearchQuery {
  return state
}

export function setSearchQuery(next: SearchQuery) {
  state = { ...next }
  pristine = false
  emit()
}

/** Seeds the store from the URL, but only before anything was ever set —
 *  refresh and shared links restore the query without clobbering typing. */
export function seedSearchQuery(next: SearchQuery) {
  if (!pristine) return
  state = { ...next }
  pristine = false
  emit()
}

export function useSearchQuery(): SearchQuery {
  return useSyncExternalStore(subscribeSearchQuery, getSearchQuery, () => DEFAULT_SEARCH_QUERY)
}

/** True until the store has been seeded from the URL (first hydration). */
export function isSearchQueryPristine(): boolean {
  return pristine
}
