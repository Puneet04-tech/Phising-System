const { env } = require('./config/env');
const { connectDB } = require('./config/db');
const { app } = require('./app');

async function start() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
