const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubmissionFile = sequelize.define('SubmissionFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  storage_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'submission_files',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SubmissionFile;
