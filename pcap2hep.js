#!/usr/bin/nodejs

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
var decoders = require('cap').decoders;
var SIP = require('sipcore');
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
  reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
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
    //Create a udp socket for this websocket connection
    udpClient = dgram.createSocket('udp4');
 
    //When a message is received from udp server send it to the ws client
    udpClient.on('message', function(msg, rinfo) {
	console.log('sent message',msg.toString());
        ws.send(msg.toString());
    });
 
    //When a message is received from ws client send it to udp server.
    ws.on('message', function(message) {
	try { var decoded = JSON.parse(message) } catch { var decoded = false; };
        var hep_proto = { "type": "HEP", "version": 3, "payload_type": "SIP", "captureId": settings.hep_id, "ip_family": 2, "capturePass": "wss" };

	/* TCP DECODE */
	if (decoded && decoded.ipv4 && decoded.ipv4.tcp){
		var payload = String.fromCharCode(...Object.values(decoded.ipv4.udp.data));
		// console.log(payload);

        	// Build HEP3
		hep_proto.ip_family = 2;
        	hep_proto.protocol = 6;
		hep_proto.proto_type = 1;
	        hep_proto.srcIp = decoded.ipv4.src;
	        hep_proto.dstIp = decoded.ipv4.dst;
        	hep_proto.srcPort = decoded.ipv4.tcp.srcport;
        	hep_proto.dstPort = decoded.ipv4.tcp.dstport;
		hep_proto.time_sec = parseInt(decoded.ts_sec),
		hep_proto.time_usec = parseInt(decoded.ts_sec.toString().split('.')[1]) | 000 ;

		parseSIP(payload,hep_proto);

	}
	/* UDP DECODE */
	if (decoded && decoded.ipv4 && decoded.ipv4.udp){
		var payload = String.fromCharCode(...Object.values(decoded.ipv4.udp.data));
		// console.log(payload);

	        // Build HEP3
		hep_proto.ip_family = 2;
	        hep_proto.protocol = 17;
		hep_proto.proto_type = 1;
	        hep_proto.srcIp = decoded.ipv4.src;
	        hep_proto.dstIp = decoded.ipv4.dst;
	        hep_proto.srcPort = decoded.ipv4.udp.srcport;
	        hep_proto.dstPort = decoded.ipv4.udp.dstport;
		hep_proto.time_sec = parseInt(decoded.ts_sec),
		hep_proto.time_usec = parseInt(decoded.ts_sec.toString().split('.')[1]) | 000 ;

		parseSIP(payload,hep_proto);
	}

        var msgBuff = Buffer.from(message);
        // udpClient.send(msgBuff, 0, msgBuff.length, SERVER_PORT, SERVER_IP);
	return;
    });
});



var parseSIP = function(msg, rcinfo){
	try {
		var sipmsg = SIP.parse(msg);
		console.log('CSeq: '+sipmsg.headers.cseq);
		sendHEP3(sipmsg, msg, rcinfo);
	}
	catch (e) {
		if (settings.debug) console.log(e);
	}
}

/* HEP3 Socket OUT */
var sendHEP3 = function(sipmsg, msg, rcinfo){
	if (sipmsg) {
		try {
			if (settings.debug) console.log('Sending HEP3 Packet...',rcinfo,msg);
			var hep_message = HEP.encapsulate(msg,rcinfo);
			if (hep_message) {
				var packet = Buffer.from(hep_message)
				udpClient.send(packet, 0, packet.length, SERVER_PORT, SERVER_IP);
			}
		}
		catch (e) {
			console.log('HEP3 Error sending!',e);
		}
	}
}
