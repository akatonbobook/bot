const { joinRoom, leaveRoom } = require('../rooms/room');

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(old_state, new_state) {
        if (old_state.channelId === new_state.channelId) {
            return;
        }
        if (old_state.channelId !== null) {
            await leaveRoom(old_state.member, old_state.channel);
        }
        if (new_state.channelId !== null) {
            await joinRoom(new_state.member, new_state.channel);
        }
    },
}