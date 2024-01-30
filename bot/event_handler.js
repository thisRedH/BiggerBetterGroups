// Licensing information can be found at the end of this file.

const sha256 = require('sha256');
const { MessageTypes } = require("whatsapp-web.js");
const { loggerMsg, Logger } = require("./logger.js");

//const GROUP_IDS = ["YOURID1", "YOURID2", "YOURID3"];
const GROUP_IDS = ["120363221942837930@g.us", "120363221441263336@g.us", "120363222515376602@g.us"];
const ALLOWED_MEDIA_TYPES = [
    MessageTypes.TEXT,
    MessageTypes.AUDIO,
    MessageTypes.VOICE,
    MessageTypes.IMAGE,
    MessageTypes.VIDEO,
    MessageTypes.DOCUMENT,
];

var msgHistory = [];
var clientChats = null;

function getMsgHash(msg, salt = "") {
    const strings = [
        msg.timestamp.toString(),
        msg.body,
        msg.type,
        msg.author,
        msg.from,
        msg.to,
    ];
    const hash = sha256(strings.join(salt));
    return hash;
}

function findMsgs(msgHistory, msg) {
    try {
        for (let i = 0; i < msgHistory.length; i++) {
            for (let j = 0; j < msgHistory[i].length; j++) {
                if (getMsgHash(msgHistory[i][j]) === getMsgHash(msg)) {
                    return msgHistory[i];
                }
            }
        }
    } catch (error) { }
}

function clientRegisterEvents(client) {
    logger.info("Registering Client Events...");

    _clientRegisterMisc(client);
    _clientRegisterCallReject(client);

    if (true)                                   //TODO: Load from config if to activate this
        _clientRegisterExtendedGroups(client);
}

function _clientRegisterMisc(client) {
    client.on("loading_screen", (percent, message) => {
        logger.info(`Loading screen: ${percent}% ${message}`);
    });

    client.on("qr", (qr) => {
        logger.info(`QR received: ${qr}`);
        //TODO: create a QR code png
    });

    client.on("authenticated", () => {
        logger.info("Authenticated successfully!");
    });

    client.on("auth_failure", msg => {
        logger.error(`Authentication Failure! (${msg})`);
    });

    client.on("ready", async () => {
        logger.info("Bot initialized");

        logger.info("Getting chats");
        clientChats = await client.getChats();
        
        logger.info("All chats:");
        clientChats.forEach(chat => {
            logger.info(`\t${chat.name} - ${chat.id.user}@${chat.id.server}`);
        });

        logger.info("Forwarding chats:");
        clientChats.forEach(chat => {
            if (!GROUP_IDS.includes(`${chat.id.user}@${chat.id.server}`)) return;
            logger.info(`\t${chat.name} - ${chat.id.user}@${chat.id.server}`);
        });

        logger.info("Bot is ready");
    });

    client.on("group_join", (notification) => {
    });

    client.on("group_leave", (notification) => {
    });

    client.on("change_state", state => {
    });

    client.on("disconnected", (reason) => {
        Logger.error(`Client was logged out! Reason: ${reason}`);
    });
}

function _clientRegisterCallReject(client) {
    client.on("call", async (call) => {
        logger.info(
            `Call received from: ${call.from}, type: ${call.isGroup ? "group" : ""} ${call.isVideo ? "video" : "audio"}`
        );

        await call.reject();
        logger.info("Call rejected by Bot");
        await client.sendMessage(
            call.from,
            "Sorry, but your call was automatically rejected."
        )
    });
}

function _clientRegisterExtendedGroups(client) {
    client.on("message", async msg => {
        const chat = await msg.getChat();
        const userName = (await msg.getContact()).pushname;

        loggerMsg.info(`From "${userName}" in "${chat.name}": ${msg.body} (${msg.type})`);
        await chat.sendSeen();

        if (!GROUP_IDS.includes(`${chat.id.user}@${chat.id.server}`)) return;
        if (!ALLOWED_MEDIA_TYPES.includes(msg.type)) return;

        var msgOptions = {};

        if (msg.hasMedia) {
            msgOptions.media = await msg.downloadMedia();
            if (msgOptions.media.mimetype.includes("video") ||
                msgOptions.media.mimetype.includes("document"))
                msgOptions.sendMediaAsDocument = true;
        }

        var msgSend = [];
        for (const group_id of GROUP_IDS) {
            if (group_id === `${chat.id.user}@${chat.id.server}`) continue;
            if (msg.hasQuotedMsg) {
                const quotedMsgs = findMsgs(msgHistory, await msg.getQuotedMessage());
                if (quotedMsgs) {
                    console.log(quotedMsgs);
                    for (const quotedMsg of quotedMsgs) {
                        if ((quotedMsg.to !== group_id && quotedMsg.fromMe) ||
                        (quotedMsg.from !== group_id && !quotedMsg.fromMe))
                        continue;

                        msgOptions.quotedMessageId = quotedMsg.id._serialized;
                    }
                }
            }

            const msgOut = await client.sendMessage(
                `${group_id}`,
                `[ ${chat.name} ]\n*${userName}*:\n${msg.body}`,
                msgOptions
            );
            loggerMsg.info(`To "${chat.name}": ${msgOut.body.replace(/(?:\r\n|\r|\n)/g, '\\n')}`);
            msgSend.push(msgOut);
        }

        msgSend.push(msg);
        msgHistory.unshift(msgSend);

    });

    client.on("message_revoke_everyone", async (after, before) => {
        if (after.fromMe) return;

        if (before) {
            const delMsgs = findMsgs(msgHistory, before);
            if (!delMsgs) return;
            msgHistory.splice(msgHistory.indexOf(delMsgs), 1);

            for (const msg of delMsgs) {
                if (getMsgHash(msg) === getMsgHash(before)) continue;
                await msg.delete(true);
            }
            loggerMsg.info(`Deleted from ${before.author}: ${before.body.replace(/(?:\r\n|\r|\n)/g, '\\n')}`);
        }
    });
}

function clientReloadEvents(client) {
    logger.info("Reloading Client Events...");

    client.removeAllListeners();
    clientRegisterEvents(client);
}

module.exports = {
    clientRegisterEvents,
    clientReloadEvents,
}

/**
 * Copyright 2024 Matthias Roth
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
