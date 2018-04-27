var http = require('http');
var url = require("url");
var fs = require("fs");
var rl = require("readline");
var path = require("path");
var extensions = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".mp4": "audio/mp4",
    ".ogg": "audio/ogg",
    ".sql": "application/sql"
};

var webblacklist = ["Webhoster.js"];

function blacklisted(string) {
    for (var i = 0; i < webblacklist.length; i++) {
        if (string.search(webblacklist[i]) > -1) {
            return true;
        }
    }
    return false;
}

var server = http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var filename;
    if (req.url == "/") {
        filename = "." + path.sep + "content/iTest.html";
    }
    else {
        filename = "." + path.sep + "content" + q.pathname;
    }
    fs.exists(filename, function (exists) {
        if (exists) {
            fs.readFile(filename, function (err, data) {
                if (err) {
                    console.dir(err);
                }
                else if (blacklisted(filename)) {
                    res.writeHead(401, { 'Content-Type': 'text/html' });
                    res.end("401 Unauthorized");
                }
                else {
                    res.writeHead(200, {
                        'Content-Type': extensions[path.extname(filename)],
                        'Content-Length': data.length
                    });
                    res.end(data);
                }
            });
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            console.log(filename + " Not Found");
            res.end("404 Not Found");
        }
    });
});
server.listen(8080);

var interface = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

interface.setPrompt("0: > ");
interface.prompt();

var lineno = 0;
interface.on('line', function (line) {
    lineno++;
    interface.setPrompt(lineno + ": > ");
    if (line == "stop") {
        console.log('Stopped pid ' + process.pid);
        process.kill(process.pid);
    }
    else if (line == "close") {
        console.log('Closed connection');
        server.close();
    }
    else if (line == "open") {
        server.listen(8080);
    }
    interface.prompt();
});