import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import initSqlJs, { Database } from 'sql.js';

interface DatabaseContextType {
  db: Database | null;
  loading: boolean;
  error: string | null;
  executeQuery: (query: string, params?: any[]) => any[];
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  loading: true,
  error: null,
  executeQuery: () => [],
});

export const useDatabase = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        // Initialize SQL.js
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });

        // Fetch the database file
        const response = await fetch('/california_trails.db');
        if (!response.ok) {
          throw new Error(`Failed to fetch database: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uInt8Array = new Uint8Array(arrayBuffer);

        // Create a database instance from the file
        const database = new SQL.Database(uInt8Array);
        setDb(database);
        setLoading(false);
      } catch (err) {
        console.error('Error loading database:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading database');
        setLoading(false);
      }
    };

    loadDatabase();

    // Cleanup function
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const executeQuery = (query: string, params: any[] = []) => {
    if (!db) {
      console.error('Database not initialized');
      return [];
    }

    try {
      const stmt = db.prepare(query);
      
      // Bind parameters if provided
      if (params.length > 0) {
        stmt.bind(params);
      }

      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (err) {
      console.error('Error executing query:', err, query);
      return [];
    }
  };

  return (
    <DatabaseContext.Provider value={{ db, loading, error, executeQuery }}>
      {children}
    </DatabaseContext.Provider>
  );
};