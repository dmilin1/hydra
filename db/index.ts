import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export const expoDb = SQLite.openDatabaseSync('db.db', {
    enableChangeListener: true,
});

const db = drizzle(expoDb);

export default db;