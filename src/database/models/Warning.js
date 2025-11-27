const Sequelize = require('sequelize');
const sequelize = require('../db');

const Warning = sequelize.define('Warning', {
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    moderatorId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    reason: {
        type: Sequelize.TEXT,
        defaultValue: 'No reason provided',
    },
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
});

module.exports = Warning;
