# pcap2hep

![image](https://user-images.githubusercontent.com/1423657/77010416-02a46700-696a-11ea-8f70-a6456243bd28.png)

Barebone PCAP to HEP converter for the Browser via webSockets.

### Requirements
* Working HEP Server (HOMER, HEPIC)
* SIP PCAPs & Modern Browser

### Usage
Launch the service and browse to port 5000 to upload your PCAP:
```
./pcap2hep.js -s 127.0.0.1 -p 9060
```

#### Options
```
      -w:       HEP3 Websocket Port (8060)
      -W:       HEP3 Web Port (5000)
      -s:       HEP3 Collector IP (127.0.0.1)
      -p:       HEP3 Collector Port (9060)
      -i:       HEP3 Agent ID
```

### Credit
* HEP Websocket by QXIP
* PCAP loader by [Nick Knight](https://github.com/tinpotnick)
