/**
 * RabbitMQ Subscriber Example
 * Run this in a separate terminal to consume ride_notifications events.
 * 
 * Usage:
 *   RABBITMQ_URL=amqp://localhost node src/config/subscriber.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const EXCHANGE_NAME = 'ride_notifications';

const startSubscriber = async () => {
  try {
    const amqp = require('amqplib');
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });

    // Exclusive queue: each subscriber gets its own copy of every message
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, EXCHANGE_NAME, '');

    console.log(`✅ Subscriber connected. Listening on exchange: ${EXCHANGE_NAME}`);
    console.log('   Waiting for ride events... (Press CTRL+C to stop)\n');

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log('📥 Event received:', JSON.stringify(event, null, 2));
          channel.ack(msg);
        } catch (e) {
          console.error('Error parsing message:', e.message);
          channel.nack(msg);
        }
      }
    });
  } catch (err) {
    console.error('Subscriber error:', err.message);
    console.error('Make sure RabbitMQ is running and RABBITMQ_URL is set.');
    process.exit(1);
  }
};

startSubscriber();
