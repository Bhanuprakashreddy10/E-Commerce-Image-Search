const { Sequelize } = require('sequelize');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbName = process.env.DB_NAME || 'visual_search_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

// Helper to ensure visual_search_db exists before Sequelize connects
async function ensureDatabaseExists() {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres' // connect to default administrative db
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      // Escape database name safely
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    }
  } catch (err) {
    console.warn(`Could not verify/create database "${dbName}":`, err.message);
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false, // Clean console output
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true, // Use snake_case in PostgreSQL columns (e.g. created_at, updated_at)
    timestamps: true
  }
});

module.exports = {
  sequelize,
  ensureDatabaseExists
};
