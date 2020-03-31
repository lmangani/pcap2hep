#!/usr/bin/nodejs

/* WS to UDP Proxy for HEP */
/* HEP Hackaton */

if(process.argv.indexOf("-h") != -1){
	console.log('Browser PCAP to HEP Mopster. For more information please visit: http://sipcapture.org ');
	console.log('Usage:');
	console.log();
	console.log('      -w:     	HEP3 Websocket Port (8060)');
	console.log('      -W:     	HEP3 Web Port (5000)');
	console.log('      -s:     	HEP3 Collector IP (127.0.0.1)');
	console.log('      -p:     	HEP3 Collector Port (9060)');
	console.log('      -i:     	HEP3 Agent ID');
	console.log();
	console.log('      -debug: 	Debug Internals    (ie: -debug true)');
	console.log('      CRTL-C: 	Exit');
	console.log();
	process.exit();
}

/* Settings Section */
	var settings = { debug: false, hep_server: '127.0.0.1', hep_port: 9060, hep_id: 8080, wss_port: 8060, web_port: 5000 };

	if(process.argv.indexOf("-debug") != -1){
	   settings.debug = process.argv[process.argv.indexOf("-debug") + 1];
	}
	if(process.argv.indexOf("-s") != -1){
	    settings.hep_server = process.argv[process.argv.indexOf("-s") + 1];
	}
	if(process.argv.indexOf("-p") != -1){
	    settings.hep_port = process.argv[process.argv.indexOf("-p") + 1];
	}
	if(process.argv.indexOf("-w") != -1){
	    settings.wss_port = process.argv[process.argv.indexOf("-w") + 1];
	}
	if(process.argv.indexOf("-W") != -1){
	    settings.web_port = process.argv[process.argv.indexOf("-W") + 1];
	}
	if(process.argv.indexOf("-i") != -1){
	    settings.hep_id = process.argv[process.argv.indexOf("-i") + 1];
	}

/* Required Modules */
var HEP = require('hep-js');
const fastify = require('fastify')()
const path = require('path')
//var Buffer = require('buffer').Buffer;
var dgram = require('dgram');
var WebSocketServer = require('ws').Server;

// Web Service
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public')
})

fastify.get('/', function (req, reply) {
  reply.sendFile('index.html')
})

fastify.listen(settings.web_port, '0.0.0.0', (err, address) => {
  if (err) throw err
  console.log("server listening: "+address)
})

// Websocket Service
var wss = new WebSocketServer({port: 8060});

//The ip &amp; port of the udp server
var SERVER_IP = settings.hep_server || '127.0.0.1'
var SERVER_PORT = settings.hep_port || 9060
var udpClient;

wss.on('connection', function(ws) {
    udpClient = dgram.createSocket('udp4');
    //When a message is received from udp server send it to the ws client
    udpClient.on('message', function(msg, rinfo) {
        ws.send(msg);
    });
    //When a message is received from ws client send it to udp server.
    ws.on('message', function(message) {
	if(settings.debug) try { console.log(HEP.decapsulate(message)); } catch(e) { console.log(e); }
	if (packet && packet.length) udpClient.send(packet, 0, packet.length, SERVER_PORT, SERVER_IP);
	return;
    });
});
