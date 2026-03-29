const { v2: webdav } = require('webdav-server');
const express = require('express');

const PORT = process.env.WEBDAV_PORT || 8080;
const VAULT_PATH = '/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault';

const app = express();

// Configure Basic Auth
const userManager = new webdav.SimpleUserManager();
const user = userManager.addUser('alliance', 'nexus', false);

const privilegeManager = new webdav.SimplePathPrivilegeManager();
privilegeManager.setRights(user, '/', ['all']); // Give all rights to the user

// Set up the WebDAV Server
const server = new webdav.WebDAVServer({
    port: PORT,
    httpAuthentication: new webdav.HTTPBasicAuthentication(userManager, 'AILCC Intelligence Vault'),
    privilegeManager: privilegeManager
});

// Mount the physical Intelligence Vault to the root of the WebDAV server
server.setFileSystem('/', new webdav.PhysicalFileSystem(VAULT_PATH), (success) => {
    if (success) {
        console.log(`[WEBDAV] Successfully mounted ${VAULT_PATH}`);
    } else {
        console.error(`[WEBDAV] Failed to mount ${VAULT_PATH}`);
    }
});

// Start the Express integration
app.use(webdav.extensions.express('/', server));

app.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`🛡️  AILCC Intelligence Vault - WebDAV Online`);
    console.log(`==============================================`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`User: alliance`);
    console.log(`Pass: nexus`);
    console.log(`\nMount this drive in Finder (Cmd+K) or external tools like Obsidian/Logseq.`);
    console.log(`==============================================\n`);
});
