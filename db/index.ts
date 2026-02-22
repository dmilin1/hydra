import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

export const expoDb = SQLite.openDatabaseSync("db.db", {
  enableChangeListener: true,
});

const db = drizzle(expoDb);

/**
 * This is a horrifying workaround to resolve a memory leak in drizzle.
 * Drizzle does not clean up after itself and finalize statements after they
 * are executed.
 *
 * https://github.com/drizzle-team/drizzle-orm/issues/4519
 */
const baseExecuteSync = SQLite.SQLiteStatement.prototype.executeSync;
SQLite.SQLiteStatement.prototype.executeSync = function (...args: any[]) {
  const results = baseExecuteSync.apply(this, args);
  try {
    this.finalizeSync();
  } catch (_e) {
    // statement may already be finalized
  }
  return results;
};

export default db;
