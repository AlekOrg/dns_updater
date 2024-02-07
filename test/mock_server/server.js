const http = require('node:http');
const https = require('node:https');
var fs = require('fs');
const process = require('process')

const express = require("express")
const app = express()
const hostname = '0.0.0.0';

const mockFn = (req, res) => {

    console.log(req.url)
    console.log(req.get("host"))
    if (req.hostname.includes("my-ip")) {
        res.setHeader('Content-Type', 'text/plain');
        res.send(`127.0.0.1
            sgdfgssdfgsdg
            rfsdfsdfsdbs`);
    }

    else {
        let err = false;
        if (req.method !== "PUT") { err = true; console.log("Error! Wrong method: " + req.method); }
        if (req.url !== "/v1/domains/organiccode.net/records/A/%40") {
            err = 1;
            console.log("URL does not match expected: " + req.url);
        }
        if (req.get("Authorization") !== "sso-key test token") {
            err = true;
            console.log("wrong auth token: " + req.get("Authorization"));
        }
        if (req.body[0] && req.body[0].data !== "127.0.0.1") {
            err = true;
            console.log("wrong request body: " + req.body[0]);
        }

        res.send();
        if (err) { process.exit(1) }
        process.exit(0)
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