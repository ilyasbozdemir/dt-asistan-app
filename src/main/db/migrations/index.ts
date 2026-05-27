import Database from 'better-sqlite3'
import { migrate as migrateV1ToV2 } from './v1_to_v2'
import { migrate as migrateV2ToV3 } from './v2_to_v3'

export interface Migration {
  version: number // Target schema version after applying this migration
  migrate: (db: Database.Database) => void
}

/**
 * Migration registry.
 * Sequential execution order is guaranteed by version number sorting.
 */
export const migrations: Migration[] = [
  {
    version: 2,
    migrate: migrateV1ToV2
  },
  {
    version: 3,
    migrate: migrateV2ToV3
  }
]
