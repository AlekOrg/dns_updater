const http = require('node:http');
const https = require('node:https');
var fs = require('fs');
const { assert } = require('node:console');

const express = require("express")
const app = express()
const hostname = '0.0.0.0';

const mockFn = (req, res) => {

    console.log(req.url)
    console.log(req.get("host"))
    if (req.hostname.includes("my-ip")) {
        res.setHeader('Content-Type', 'text/plain');
        res.send("127.0.0.1\nsgdfgssdfgsdg\nrfsdfsdfsdbs")
    }

    else {
        assert(req.method === "PUT")
        assert(req.url === "/v1/domains/organiccode.net/records/A/%40", "URL does not match expected: " + req.url)
        assert(req.get("Authorization") === "sso-key test token")
        assert(req.body.data === "127.0.0.1")
        
        res.send();
    }
}

app.use(express.json());
app.use((err, req, res, next) => {
    console.log(err)
})
app.all(/\/.*/, mockFn);

http.createServer(app).listen(80, hostname, () => {
    console.log(`Server running at http://${hostname}:${80}/`);
});

// This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync('certs/key.pem'),
    cert: fs.readFileSync('certs/cert.pem'),

};

https.createServer(options, app).listen(443, hostname, () => {
    console.log(`Server running at https://${hostname}:${443}/`);
});