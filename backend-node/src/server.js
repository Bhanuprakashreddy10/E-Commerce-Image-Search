const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { sequelize, ensureDatabaseExists } = require('./config/database');
require('./models/Product'); // Ensure model is registered

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Ensure database exists in PostgreSQL
    await ensureDatabaseExists();

    // 2. Authenticate Sequelize connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // 3. Synchronize models with database schema
    await sequelize.sync();
    console.log('PostgreSQL models synchronized successfully');

    // 4. Start HTTP Server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
