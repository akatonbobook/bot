const { Rooms, Members } = require('../db');
const { checkAll } = require('../rooms/room');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        Rooms.sync();
        Members.sync();
        await checkAll(client);
        console.log('Ready!');
    },
}