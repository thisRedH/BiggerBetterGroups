// Licensing information can be found at the end of this file.

const { MessageTypes } = require("whatsapp-web.js");
const { loggerMsg, Logger } = require("./logger.js");

const GROUP_IDS = ["YOURID1", "YOURID2", "YOURID3"];

var clientChats = null;

function clientAddEvents(client) {
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

    client.on("message", async msg => {
        const chat = await msg.getChat();
        const userName = (await msg.getContact()).pushname;
        const chatName = chat.name;

        loggerMsg.info(`From "${userName}" in "${chatName}": ${msg.body} (${msg.type})`);
        await chat.sendSeen();

        if (!GROUP_IDS.includes(`${chat.id.user}@${chat.id.server}`)) return;
        if (msg.type !== MessageTypes.TEXT) return;

        GROUP_IDS.forEach(async group_id => {
            if (group_id !== `${chat.id.user}@${chat.id.server}`) {
                const msg_out = await client.sendMessage(
                    `${group_id}`,
                    `${userName} (${chatName}):\n${msg.body}`
                );
                loggerMsg.info(`To "${userName}": ${msg_out.body.replace(/(?:\r\n|\r|\n)/g, '\\n')}`);
            }
        });
    });

    client.on("message_revoke_everyone", async (after, before) => {
        // Fired whenever a message is deleted by anyone (including you)
        logger.debug(after); // message after it was deleted.
        if (before) {
            logger.debug(before); // message before it was deleted.
        }
    });

    client.on("group_join", (notification) => {
    });

    client.on("group_leave", (notification) => {
    });

    client.on("change_state", state => {
    });

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

    client.on("disconnected", (reason) => {
        Logger.error(`Client was logged out! Reason: ${reason}`);
    });    
}

module.exports = {
    clientAddEvents,
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
