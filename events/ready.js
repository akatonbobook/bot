const { Rooms, Members, EEWGuilds } = require('../db');
const { checkAll } = require('../rooms/room');
const { eewInit } = require('../eew/eew');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        Rooms.sync();
        Members.sync();
        EEWGuilds.sync();
        await checkAll(client);
        eewInit(client);
        console.log('Ready!');
    },
}