const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  decision: {
    type: DataTypes.STRING(16),
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Review;
