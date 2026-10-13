require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('./config/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await connectRabbitMQ();

  // Seed demo drivers if none exist
  const { seedDrivers } = require('./config/seed');
  await seedDrivers();

  app.listen(PORT, () => {
    console.log(`\n🚀 RideFlow backend running at http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
};

start();
