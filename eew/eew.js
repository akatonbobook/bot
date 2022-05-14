const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { EEWGuilds, Rooms } = require('../db.js');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<html><body><div id="aaa">AAA<div></body></html>`);
const { document } = dom.window;
const jquery = require('jquery');
const $ = jquery(dom.window);

var client;
var timerId = null;
var eews = {};
var textChannelMsg = {};
const eewInit = function(c) {
    client = c;
    startTimer();
}

const addGuild = async function(guild) {
    try {
        var eewGuild = await EEWGuilds.findOne({ where: { guild_id: guild.id }});
        if (!eewGuild) {
            await EEWGuilds.create({ guild_id: guild.id });
        }
    } catch (err) {
        console.log(err);
    }
}

const removeGuild = async function(guild) {
    try {
        var eewGuild = await EEWGuilds.findOne({ where: { guild_id: guild.id }});
        if (eewGuild) {
            await EEWGuilds.destroy({ where: {guild_id: guild.id }});
        }
    } catch (err) {
        console.log(err);
    }
}

const startTimer = function() {
    if (!timerId) {
        timerId = setInterval(getKMoni, 1000);
    }
}

const dblDigitStr = function(num) {
    return num < 10 ? '0' + String(num) : String(num);
}

const sendMsg = async function(report_id) {
    const eew = eews[report_id];
    const guilds = await EEWGuilds.findAll({ attributes: ['guild_id']});
    const guildIds = guilds.map(g => g.guild_id);
    const rooms = await Rooms.findAll({ attributes: ['textchannel_id'] });
    const textChannelIds = rooms.map(r => r.textchannel_id);
    for (const textChannelId of textChannelIds) {
        const textChannel = await client.channels.fetch(textChannelId);
        if (guildIds.some(gid => gid == textChannel.guild.id)) {
            if (textChannelId in textChannelMsg[report_id]) {
                textChannelMsg[report_id][textChannelId] = await textChannelMsg[report_id][textChannelId].edit({ embeds: [eew['embed']] });
            } else {
                textChannelMsg[report_id][textChannelId] = await textChannel.send({ embeds: [eew['embed']] });
            }
        }
    }
}

const getKMoni = async function() {
    const current = new Date();
    const time = Date.now() - 1000;
    current.setTime(time);
    var ary = new Array();
    ary[ary.length] = dblDigitStr(current.getFullYear());
    ary[ary.length] = dblDigitStr(current.getMonth()+1);
    ary[ary.length] = dblDigitStr(current.getDate());
    ary[ary.length] = dblDigitStr(current.getHours());
    ary[ary.length] = dblDigitStr(current.getMinutes());
    ary[ary.length] = dblDigitStr(current.getSeconds());
    console.log(ary.join(''));
    try {
        // const res = await fetch(`http://www.kmoni.bosai.go.jp/webservice/hypo/eew/${ary.join('')}.json`);
        // const json = await res.json();
        $.ajax({
			type: "GET",
			url: `http://www.kmoni.bosai.go.jp/webservice/hypo/eew/${ary.join('')}.json`,
			dataType: "jsonp",
			data: {},
			async: true,
			timeout: 0,
			cache: true,
			jsonp: "jsoncallback",
			success: async function(json,status){
                if (json.report_num != '') {
                    const report_id = json.report_id;
                    const report_num = json.report_num;
                    const isFinal = json.is_final;
                    var f = false;
                    for (id in eews) {
                        if (id == report_id && eews[id]["num"] == report_num) {
                            f = true;
                            break;
                        }
                    }
                    if (!f) {
                        if (!(report_id in textChannelMsg)) {
                            textChannelMsg[report_id] = {};
                        }
                        eews[report_id] = {};
                        eews[report_id]["num"] = report_num;
                        eews[report_id]["origin_time"] = json.origin_time.substring(4,6) + '月'
                                                     + json.origin_time.substring(6,8) + '日'
                                                     + json.origin_time.substring(8,10) + '時'
                                                     + json.origin_time.substring(10,12) + '分'
                                                     + json.origin_time.substring(12,14) + '秒';
                        eews[report_id]["region_name"] = json.region_name;
                        eews[report_id]["magunitude"] = json.magunitude;
                        eews[report_id]["calcintensity"] = json.calcintensity;
                        eews[report_id]["embed"] = new MessageEmbed()
                                .setColor('#c01717')
                                .setTitle('緊急地震速報')
                                .setURL('http://www.kmoni.bosai.go.jp/')
                                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                                .setDescription(`緊急地震速報　第${eews[report_id]['num']}報` + (isFinal ? " (最終報)" : ""))
                                .addFields(
                                    { name: '地震情報', value: `発生時刻: ${eews[report_id]['origin_time']}頃\n
                                                              震源: ${eews[report_id]['region_name']}\n
                                                              マグニチュード: ${eews[report_id]['magunitude']}\n
                                                              最大震度: ${eews[report_id]['calcintensity']}` }
                                )
                                .setTimestamp();
                        await sendMsg(report_id);
                        return;
                    }
                } else {
                    eews = {};
                    textChannelMsg = {};
                }
			},
			error: function(xhr,status,err){
                
			}
		});
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    eewInit,
    addGuild,
    removeGuild,
}