import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString?.split('@')[1] || 'unknown');

try {
  const sql = postgres(connectionString);
  
  // Test connection
  const result = await sql`SELECT NOW() as current_time`;
  console.log('✓ Database connection successful!');
  console.log('Current time:', result[0].current_time);
  
  // Check if governmentVipApplications table exists
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'governmentVipApplications'
  `;
  
  if (tables.length > 0) {
    console.log('✓ governmentVipApplications table exists');
    
    // Count records
    const count = await sql`SELECT COUNT(*) as count FROM "governmentVipApplications"`;
    console.log('Records in governmentVipApplications:', count[0].count);
  } else {
    console.log('✗ governmentVipApplications table NOT found');
  }
  
  // List all tables
  const allTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  
  console.log('\nAll tables in database:');
  allTables.forEach(t => console.log('  -', t.table_name));
  
  await sql.end();
} catch (error) {
  console.error('✗ Connection failed:', error.message);
  process.exit(1);
}
