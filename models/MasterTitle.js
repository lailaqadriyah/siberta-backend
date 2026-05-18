const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MasterTitle = sequelize.define('MasterTitle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'master_titles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = MasterTitle;
