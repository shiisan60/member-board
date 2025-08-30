const { MongoClient } = require('mongodb');

async function cleanupDatabase() {
  const uri = "mongodb+srv://02shimizu:j9iHR0kOeRSQDxjX@cluster0.lqvqs.mongodb.net/member-board?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('member-board');
    const usersCollection = db.collection('users');

    console.log('Connected to MongoDB');

    // First, list all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`Total users found: ${allUsers.length}`);
    
    allUsers.forEach(user => {
      console.log(`- ${user.email} (ID: ${user._id}) - ${user.name}`);
    });

    // Delete problematic users
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com',
      '03shimizu@gmail.com'
    ];

    console.log('\nDeleting problematic users...');
    for (const email of problematicEmails) {
      try {
        const result = await usersCollection.deleteOne({ email });
        if (result.deletedCount > 0) {
          console.log(`✅ Deleted: ${email}`);
        } else {
          console.log(`ℹ️  Not found: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete ${email}:`, error.message);
      }
    }

    // List remaining users
    const remainingUsers = await usersCollection.find({}).toArray();
    console.log(`\nRemaining users: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`- ${user.email} (ID: ${user._id}) - ${user.name}`);
    });

  } catch (error) {
    console.error('Database cleanup error:', error);
  } finally {
    await client.close();
  }
}

cleanupDatabase();