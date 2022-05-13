const Sequelize = require('sequelize');
const { username, password } = require('./config.json');

const sequelize = new Sequelize('database', username, password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
});


const Rooms = sequelize.define('rooms', {
    voicechannel_id :{
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    textchannel_id :{
        type: Sequelize.STRING,
        allowNull: false,
    },
    role_id :{
        type: Sequelize.STRING,
        allowNull: false,
    }
})

const Members = sequelize.define('members', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    voicechannel_id :{
        type: Sequelize.STRING,
        allowNull: false,
        references: {
            model: Rooms,
            key: 'voicechannel_id'
        },
    }
});


module.exports = {
    sequelize,
    Rooms,
    Members,
};
