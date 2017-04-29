
var snmpEnum_ ifType = {
    "12": "proteon-10Mbit",
    "26": "ethernet-3Mbit",
    "13": "proteon-80Mbit",
    "6": "ethernet-csmacd",
    "7": "iso88023-csmacd",
    "10": "iso88026-man",
    "32": "frame-relay",
    "8": "iso88024-tokenBus",
    "9": "iso88025-tokenRing",
    "4": "ddn-x25",
    "5": "rfc877-x25",
    "20": "basicISDN",
    "18": "ds1",
    "30": "ds3",
    "19": "e1",
    "25": "eon",
    "15": "fddi",
    "3": "hdh1822",
    "14": "hyperchannel",
    "16": "lapb",
    "27": "nsip",
    "1": "other",
    "23": "ppp",
    "21": "primaryISDN",
    "22": "propPointToPointSerial",
    "2": "regular1822",
    "17": "sdlc",
    "31": "sip",
    "28": "slip",
    "24": "softwareLoopback",
    "11": "starLan",
    "29": "ultra"
}

var snmpEnum_ifAdminStatus = {
    "1": "up",
    "2": "down",
    "3": "test"
}

var snmpEnum_ifOperStatus = {
    "1": "up",
    "2": "down",
    "3": "testing",
    "4": "unknown",
    "5": "dormant",
    "6": "notPresent",
    "7": "lowerLayerDown"
}

var switches = {
    "190.200.22.3": {
        "Name": "Test",
        "IP": "190.200.22.3",
        "CommunityName": "Tacit321",
        "Make": "HP",
        "Model": "Something",
        "Location": "Somewhere",
        "LastScan": "Today",
        "Ports": {
            "0": {
                "Index": "0",
                "Name": "",
                "Alias": "",
                "hasPhysicalConnector": "",
                "lastCollectionError": "",
                "InterfaceSpeed": "",
                "Promiscuous": "",
                "AdminStatus": "",
                "LastChange": "",
                "MTU": "",
                "OperationalStatus": "",
                "MACAddress": "",
                "SpecificOID": "",
                "Statistics": {
                    "InterfaceType": "",
                    "InDiscards": "0",
                    "InErrors": "0",
                    "InUnknownProts": "0",
                    "OutDiscards": "0",
                    "OutErrors": "0",
                    "OutQLen": "0",
                    "InBroadcastPackets": "0",
                    "InMulticastPacket": "0",
                    "InBytes": "0",
                    "InUCastPackets": "0",
                    "OutBroadcastPackets": "0",
                    "OutMulticastPackets": "0",
                    "OutBytes": "0",
                    "OutUCastPackets": "0"
                }
            }
        }
    }
};

function UpdateSwitch(ipaddress, communityname) {
    if (switches[ipaddress] === undefined)
        switches[ipaddress] = { "IP": ipaddress, "CommunityName": communityname, "Ports": {} };
    //Get BaseSNMP
    //Get HighSpeedSNMP
    //Get LLDP Information
    //Get Bridge MIB Data

}