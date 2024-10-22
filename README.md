# Godaddy DNS-updater

The purpouse of this service/script is to listen changes in the external IP address of the host it is running on. If an address change occurs, the service will, through GoDaddys REST API, update the DNS record to reflect that change.

## Build with docker-compose 

``` bash
docker compose build ./src
```

## Environment variables

* `GO_DADDY_API_KEY`
    Set with `k -n infra create secret generic godaddy-api-secret --from-literal=apiToken=<secret>`

## Testing

As this is a relatively small service with regards to lines of code, and given the high amount of I/O, and my lack of Python testing knowledge, unit tessting this service is not really an option.

The solution, blackboxtesting using docker compose.

### Write some tests 

As this service only relies outgoing HTTP requests, and does not expose a API of its own, we only need some HTTP endpoints of our own that our service can reach. For simplisity Nodejs/Express is used to set up mocked REST endpoints. For better reporting and testing support it would probably be better to use Jest as well, then again everything is allowed in the land of PoC.

``` javascript
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
```

### TLS 

Since the service uses TLS, as it should, given that is sends API-tokens, we also need to generate some self signed certificates. It would be tempting to downgrade the service to use HTTP instead of HTTPS. As we all know, security can be a pain in the butt, and that goes double for certificates. As painful as security may be, being without can hurt even more. 

To help us along we utlize the CLI tool mkcert

``` bash
$ sudo apt install mkcert
```

To generate the correct certificate we need the domains that our system under test is calling. In this case we need `api.my-ip.io` and `api.godaddy.com`.

``` bash
mkcert api.my-ip.io api.my-ip.io -cert-file ./certs/cert.pem -key-file ./certs/key.pem
```

Since we are signing our own certificates we also need the certificate autorithy certificate and inject it into the system under test container. To get the location of the CA cert:

``` bash
CACERT=$(mkdir -CAROOT)
cp $CACERT ./certsrootCA.pem
```

### Containerize the tests 

Make a docker file. Copy the test files and certificates into a container.

``` Dockerfile
FROM node:current-alpine3.19

COPY . /app

EXPOSE 80
EXPOSE 443

WORKDIR /app

RUN npm install

CMD node server.js
```

### Tying it all together

