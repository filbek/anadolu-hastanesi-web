import { createTables } from '../lib/supabase';

// This function can be called to initialize the database tables
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    const result = await createTables();
    
    if (result) {
      console.log('Database initialized successfully');
    } else {
      console.error('Failed to initialize database');
    }
    
    return result;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}
