const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ml_model_version: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'departments',
  timestamps: true
});

module.exports = Department;
