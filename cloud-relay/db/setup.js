const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up CloudTab database...');
    
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    await pool.query(schemaSQL);
    
    console.log('✅ Database schema created successfully!');
    console.log('📊 Tables created: sessions, files, shopkeepers');
    
    // Create a default shopkeeper for testing
    const apiKey = 'SHOP_' + Math.random().toString(36).substring(2, 15);
    await pool.query(
      'INSERT INTO shopkeepers (id, name, api_key) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      ['SHOP_001', 'Test Shopkeeper', apiKey]
    );
    
    console.log('🔑 Test shopkeeper created:');
    console.log('   ID: SHOP_001');
    console.log('   API Key:', apiKey);
    console.log('\n💡 Save this API key for your shopkeeper app configuration!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
