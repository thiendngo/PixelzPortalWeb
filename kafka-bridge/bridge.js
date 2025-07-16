const { Kafka } = require('kafkajs');
const WebSocket = require('ws');

const kafka = new Kafka({
  clientId: 'bridge-service',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'bridge-group' });
const wss = new WebSocket.Server({ port: 8080 });

let sockets = [];

wss.on('connection', (ws) => {
  console.log('🔌 Angular client connected');
  sockets.push(ws);
  ws.on('close', () => {
    sockets = sockets.filter(s => s !== ws);
  });
});

// Kafka consumption + broadcast
async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'production-queue', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = message.value.toString();
      console.log('Kafka message:', payload);

      sockets.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    }
  });
}

start().catch(console.error);
