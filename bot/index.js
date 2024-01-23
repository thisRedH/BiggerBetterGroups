// Licensing information can be found at the end of this file.

const { Client, LocalAuth, MessageTypes } = require("whatsapp-web.js");
const { clientAddEvents } = require("./event_handler.js");

const GROUP_IDS = ["YOURID1", "YOURID2", "YOURID3"];

logger.info("Starting...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox"],
    },
});

logger.info("Warming up, this might take between 30 seconds to 2 minutes.");

client.initialize();
clientAddEvents(client);

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
