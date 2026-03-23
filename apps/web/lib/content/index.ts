/**
 * Content Layer — single import point for all content.
 *
 * Phase 1-4: uses mock data (no Sanity account needed)
 * Phase 5:   swap this to re-export from './sanity' instead
 *
 * Components always import from '@/lib/content' — never directly from mock or sanity.
 */

export {
  getPrograms,
  getImpactMetrics,
  getLatestPosts,
  getAllPosts,
  getPostBySlug,
  getTeamMembers,
  getPageContent,
  getProgramBySlug,
} from './mock'

export type {
  Program,
  ImpactMetric,
  Post,
  TeamMember,
  PageContent,
} from './mock'
