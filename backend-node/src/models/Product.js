const { DataTypes } = require('sequelize');
require('pgvector/sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Product name is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Price must be a valid number'
        },
        min: {
          args: [0],
          msg: 'Price must be greater than or equal to 0'
        }
      }
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    embedding: {
      type: DataTypes.VECTOR(512),
      allowNull: true
    }
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true // maps createdAt -> created_at, updatedAt -> updated_at
  }
);

module.exports = Product;
