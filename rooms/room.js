const { Rooms, Members } = require('../db.js');
const AsyncLock = require('async-lock');
const lock = new AsyncLock({timeout: 1000 * 10});
const { Permissions, GuildMember, VoiceChannel } = require('discord.js');

/**
 * 入室処理
 * @param {GuildMember} member 
 * @param {VoiceChannel} voiceChannel 
 * @returns 
 */
const joinRoom = async function(member, voiceChannel) {
    //  入室先がAFKチャンネルならreturn
    if (voiceChannel == voiceChannel.guild.afkChannel) return;
    const guild = voiceChannel.guild;
    await lock.acquire('room-lock', async () => {
        var room = await Rooms.findOne({ where: { voicechannel_id: voiceChannel.id }});
        if (!room) {
            const role = await guild.roles.create({
                name: `${voiceChannel.name} member`, 
            });
            const textChannel = await guild.channels.create(`${voiceChannel.name}`,{
                topic: `${voiceChannel}用のテキストチャンネル`,
                permissionOverwrites: [
                    { 
                        id: guild.roles.everyone,
                        deny: [
                            Permissions.FLAGS.READ_MESSAGE_HISTORY,
                            Permissions.FLAGS.VIEW_CHANNEL,
                            Permissions.FLAGS.SEND_MESSAGES,
                        ]
                    },
                    {
                        id: guild.me,
                        allow: [
                            Permissions.FLAGS.READ_MESSAGE_HISTORY,
                            Permissions.FLAGS.VIEW_CHANNEL,
                            Permissions.FLAGS.SEND_MESSAGES,
                        ]
                    },
                    {
                        id: role,
                        allow: [
                            Permissions.FLAGS.READ_MESSAGE_HISTORY,
                            Permissions.FLAGS.VIEW_CHANNEL,
                            Permissions.FLAGS.SEND_MESSAGES,
                        ]
                    }
                ],
                parent: voiceChannel.parent,
                position: voiceChannel.position,
            });
            try {
                room = await Rooms.create({
                    voicechannel_id: voiceChannel.id,
                    textchannel_id: textChannel.id,
                    role_id: role.id
                });
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log('room already exists.');
                } else {
                    return;
                }
            }
        }
        const role = await guild.roles.fetch(room.get('role_id'));
        await member.roles.add(role);
        try {
            await Members.create({
                id: member.id,
                voicechannel_id: voiceChannel.id
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                console.log('room already exists.');
            } else {
                return;
            }
        }
    });
}

/**
 * 退室処理
 * @param {GuildMember} member 
 * @param {VoiceChannel} voiceChannel 
 * @returns 
 */
const leaveRoom = async function(member, voiceChannel) {
    //  退室元がAFKチャンネルならreturn
    if (voiceChannel == voiceChannel.guild.afkChannel) return;

    await lock.acquire('room-lock', async () => {
        const room = await Rooms.findOne({ where: { voicechannel_id: voiceChannel.id }});
        if (room) {
            const guild = voiceChannel.guild;
            const role = await guild.roles.fetch(room.get('role_id'));
            if (role) await member.roles.remove(role);
            await Members.destroy({ where: {id: member.id}});

            if (voiceChannel.members.filter(member => !member.user.bot).size === 0) {
                const textChannel = await guild.channels.fetch(room.get('textchannel_id'));
                textChannel?.delete();
                role?.delete();
                await Rooms.destroy({ where: {voicechannel_id: voiceChannel.id}});
            }
        }
    });
}

const checkVoiceChannel = async function(voiceChannel) {
    const guild = voiceChannel.guild;
    for (const member of voiceChannel.members.filter(member => !(member.user.bot)).values()) {
        await joinRoom(member, voiceChannel);
    }
    for (const member_inst of await Members.findAll({where: {voicechannel_id: voiceChannel.id}})) {
        const member = await guild.members.fetch(member_inst.get('id'));
        if (voiceChannel.members.filter(m => m.id === member.id).size === 0) {
            await leaveRoom(member, voiceChannel);
        }
    }
}

const checkAll = async function(client) {
    for (const guild of (await client.guilds.fetch()).values()) {
        for (const voiceChannel of (await (await guild.fetch()).channels.fetch()).filter(channel => channel instanceof VoiceChannel).values()) {
            await checkVoiceChannel(voiceChannel);
        }
    }
}

module.exports = {
    checkAll,
    joinRoom,
    leaveRoom,
}