const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  console.log('Starting MongoDB Memory Server...');
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'letinvestments',
        storageEngine: 'ephemeralForTest'
      }
    });

    const uri = mongod.getUri();
    console.log(`✅ MongoDB Memory Server started successfully!`);
    console.log(`URI: ${uri}`);
    console.log(`Port: 27017`);
    console.log(`Press Ctrl+C to stop.`);

    process.on('SIGINT', async () => {
      console.log('Stopping MongoDB Memory Server...');
      await mongod.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Failed to start MongoDB Memory Server:', err);
    process.exit(1);
  }
}

start();
