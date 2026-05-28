import Database from 'better-sqlite3'
import { migration as v1_to_v2 } from './v1_to_v2'
import { migration as v2_to_v3 } from './v2_to_v3'
import { migration as v3_to_v4 } from './v3_to_v4'
import { migration as v4_to_v5 } from './v4_to_v5'

export interface Migration {
  from: number
  to: number
  up: (db: Database.Database) => void
}

/**
 * Migration registry containing all registered steps.
 * Automatically sorted sequentially by starting version.
 */
export const migrations: Migration[] = [
  v1_to_v2,
  v2_to_v3,
  v3_to_v4,
  v4_to_v5
].sort((a, b) => a.from - b.from)
