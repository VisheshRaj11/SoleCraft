import mongoose from 'mongoose';
import 'dotenv/config';

async function testMongoDB() {
  console.log('🔍 Testing MongoDB Connection...');
  console.log('Connection String:', process.env.MONGODB_URI);
  
  try {
    // Try to connect
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB Connected!');
    
    // List databases
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    
    console.log('\n📊 Available Databases:');
    result.databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });
    
    // Check if our app database exists
    const currentDb = mongoose.connection.db.databaseName;
    console.log(`\n💾 Current Database: ${currentDb}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n🗂️ Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 MongoDB is not running. Start it with:');
      console.log('1. Open Services (services.msc)');
      console.log('2. Find "MongoDB Server"');
      console.log('3. Right-click → Start');
      console.log('OR run: net start MongoDB');
    }
  }
}

testMongoDB();