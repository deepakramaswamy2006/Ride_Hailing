let channel = null;
let connection = null;
const EXCHANGE_NAME = 'ride_notifications';

const connectRabbitMQ = async () => {
  if (process.env.RABBITMQ_ENABLED !== 'true') {
    console.log('ℹ️  RabbitMQ disabled. Using in-app notifications only.');
    return;
  }
  try {
    const amqp = require('amqplib');
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
    console.log('✅ RabbitMQ connected to exchange:', EXCHANGE_NAME);
  } catch (err) {
    console.warn('⚠️  RabbitMQ unavailable:', err.message);
    console.warn('   Falling back to in-app notifications.');
    channel = null;
  }
};

const publishEvent = async (eventType, rideId, payload = {}) => {
  const message = {
    eventType,
    rideId,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  if (channel) {
    try {
      channel.publish(
        EXCHANGE_NAME,
        '',
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      console.log(`📤 RabbitMQ event published: ${eventType}`);
    } catch (err) {
      console.warn('⚠️  RabbitMQ publish failed:', err.message);
    }
  }
  return message;
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, publishEvent, getChannel };
