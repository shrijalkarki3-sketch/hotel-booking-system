import mongoose from 'mongoose';

async function testSrv() {
  const uris = [
    'mongodb+srv://shrijalkarki3_db_user:ADMIN345@cluster0.83ovfja.mongodb.net/hotelbooking?retryWrites=true&w=majority',
    'mongodb://shrijalkarki3_db_user:ADMIN345@ac-l65xiiv-shard-00-00.83ovfja.mongodb.net:27017,ac-l65xiiv-shard-00-01.83ovfja.mongodb.net:27017,ac-l65xiiv-shard-00-02.83ovfja.mongodb.net:27017/hotelbooking?authSource=admin&retryWrites=true&w=majority',
  ];

  for (const uri of uris) {
    console.log(`\nTesting: ${uri.substring(0, 45)}...`);
    try {
      const conn = await mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: 5000,
        tls: true,
        tlsAllowInvalidCertificates: true,
      }).asPromise();

      const collections = await conn.db.listCollections().toArray();
      console.log(`✓ SUCCESS! Collections count: ${collections.length}`);
      collections.forEach(c => console.log(`   - ${c.name}`));
      await conn.close();
    } catch (err) {
      console.error(`❌ FAILED: ${err.message}`);
    }
  }

  process.exit(0);
}

testSrv();
