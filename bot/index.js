// Licensing information can be found at the end of this file.

const fs = require('fs');
const path = require('path');

const { Client, LocalAuth } = require("whatsapp-web.js");

const { reloadModule } = require("./debug.js");
const { Logger } = require("./logger.js");
const { clientRegisterEvents, clientReloadEvents } = require("./event_handler.js");

logger.info("Starting...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox"],
    },
});

logger.info("Warming up, this might take between 30 seconds to 2 minutes.");

client.initialize();
clientRegisterEvents(client);

/* fs.readdir("./", (err, files) => {
    const jsFiles = files.filter(file => path.extname(file) === ".js");

    jsFiles.forEach(jsFile => {
        const filePath = path.join("./", jsFile);

        fs.watchFile(filePath, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                logger.debug(`File ${jsFile} changed, reloading module...`);
                const { clientRegisterEvents, clientReloadEvents } = reloadModule("./event_handler.js");
                clientReloadEvents(client);
            }
        });
    });
});
 */
fs.watchFile("./event_handler.js", (curr, prev) => {
    if (curr.mtime > prev.mtime) {
        logger.debug("File ./event_handler.js changed");
        const { clientRegisterEvents, clientReloadEvents } = reloadModule("./event_handler.js");
        clientReloadEvents(client);
    }
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
