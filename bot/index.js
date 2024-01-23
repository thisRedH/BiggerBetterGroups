// Licensing information can be found at the end of this file.

const { loggerMsg, Logger } = require('./logger.js');
const { Client, LocalAuth, MessageTypes } = require('whatsapp-web.js');

const GROUP_IDS = ['YOURID1', 'YOURID2', 'YOURID3'];

logger.info("Starting...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox'],
    }
    //puppeteer: { 
    //    headless: false
    //}
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    logger.info(`loading screen: ${percent}% ${message}`);
});

client.on('qr', (qr) => {
    logger.info(`QR received: ${qr}`);
});

client.on('authenticated', () => {
    logger.info('Authenticated successfully!');
});

client.on('auth_failure', msg => {
    logger.error(`Authentication Failure! (${msg})`);
});

client.on('ready', () => {
    logger.info('Bot is ready');
    client.getChats().then(chats => {
        logger.info('Chat list:');
        chats.forEach(chat => {
            logger.info(`\t${chat.id.server} - ${chat.name} - ${chat.id.user}@${chat.id.server}`);
        });
    })
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    const userName = (await msg.getContact()).pushname;
    const chatName = chat.name;
    
    loggerMsg.info(`from ${userName} in ${chatName}: ${msg.body}`);
    if (!GROUP_IDS.includes(`${chat.id.user}@${chat.id.server}`)) return;
    if (msg.type !== MessageTypes.TEXT) return;

    GROUP_IDS.forEach(async group_id => {
        if (group_id !== `${chat.id.user}@${chat.id.server}`) {
            const msg_out = await client.sendMessage(
                `${group_id}`,
                `${userName} (${chatName}):\n${msg.body}`
            );
            loggerMsg.info(`to ${group_id}:${msg_out.body.replace(/(?:\r\n|\r|\n)/g, '\\n')}`);
        }
    });
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    logger.debug(after); // message after it was deleted.
    if (before) {
        logger.debug(before); // message before it was deleted.
    }
});

client.on('group_join', (notification) => {
});

client.on('group_leave', (notification) => {
});

client.on('change_state', state => {
});

client.on('call', async (call) => {
    logger.info(
        `Call received from: ${call.from}, type: ${call.isGroup ? 'group' : ''} ${call.isVideo ? 'video' : 'audio'}`
    );

    await call.reject();
    logger.info('Call rejected by Bot');
    await client.sendMessage(
        call.from,
        'Sorry, but your call was automatically rejected.'
    )
});

client.on('disconnected', (reason) => {
    Logger.error(`Client was logged out! Reason: ${reason}`);
});

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
