const http = require('node:http');
const https = require('node:https');
var fs = require('fs');
const { assert } = require('node:console');


const hostname = '0.0.0.0';

const mockFn = (req, res) => {
    res.statusCode = 200;
    console.log(req.url)
    console.log(Object.keys(req))
    if (req.hostname.includes("my-ip")) {
        res.setHeader('Content-Type', 'text/plain');
        res.end("127.0.0.1\nsgdfgssdfgsdg\nrfsdfsdfsdbs")
    }

    else {
        assert(req.method === "PUT")
        assert(req.url === "/v1/domains/organiccode.net/records/A/%40", "URL does not match expected: " + req.url)
        assert(req.headers["Authorization"] === "sso-key test token")

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            console.log(chunks)
            const data = JSON.parse(Buffer.concat(chunks));
            assert(data.data === "127.0.0.1")
        })
        res.end();
    }
}

const httpServer = http.createServer(mockFn);

httpServer.listen(80, hostname, () => {
    console.log(`Server running at http://${hostname}:${80}/`);
});

// This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync('certs/key.pem'),
    cert: fs.readFileSync('certs/cert.pem'),

};

const httpsServer = https.createServer(options, mockFn);

httpsServer.listen(443, hostname, () => {
    console.log(`Server running at https://${hostname}:${443}/`);
});