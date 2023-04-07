const IpfsHttpClient = require('ipfs-http-client');
const fs = require('fs');
const { pipeline, PassThrough } = require('stream');
const { promisify } = require('util');

const ipfs = IpfsHttpClient({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
});

async function fetchFile(cid, outputPath) {
    try {
        const stream = await ipfs.cat(cid);
        const pass = new PassThrough();
        const fileContent = [];
        pass.on('data', (chunk) => fileContent.push(chunk));
        await promisify(pipeline)(stream, pass);

        fs.writeFileSync(outputPath, Buffer.concat(fileContent));
        console.log(`File saved to: ${outputPath}`);
    } catch (error) {
        console.error(`Error fetching file: ${error.message}`);
    }
}

async function fetchFilesFromIPFS(folderCID, filesToFetch) {
    try {
        const folderFiles = [];
        for await (const file of ipfs.ls(folderCID)) {
            folderFiles.push(file);
        }

        for (const file of folderFiles) {
            if (filesToFetch.includes(file.name)) {
                await fetchFile(file.cid, `./${file.name}`);
            }
        }
    } catch (error) {
        console.error(`Error fetching files from IPFS: ${error.message}`);
    }
}

// Replace 'folderCID' with the CID of the folder you want to fetch files from
const folderCID = 'QmExampleFolderCID';

// Specify the names of the files you want to fetch
const filesToFetch = [];

fetchFilesFromIPFS(folderCID, filesToFetch);
