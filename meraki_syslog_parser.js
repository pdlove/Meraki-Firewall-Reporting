module.exports.meraki_ParseSyslog = meraki_ParseSyslog;
 
 function getMerakiValue(msg, parm) {
        var merakiValueStart = msg.indexOf(parm + '=') + parm.length + 1;
        if (merakiValueStart < parm.length + 2) return '';
        var merakiValueStop = 0;
        if (msg.substr(merakiValueStart, 1) == "'") {
            merakiValueStart += 1;
            merakiValueStop = msg.indexOf("'", merakiValueStart);
        } else {
            merakiValueStop = msg.indexOf(" ", merakiValueStart);
        }
        return msg.substr(merakiValueStart, merakiValueStop - merakiValueStart);
    }

    function meraki_ParseSyslog(syslogPacket) {
        var msg = syslogPacket.msg;

        syslogPacket.merakiDevice = msg.substr(0, msg.indexOf(' ', 0));

        var syslogTypeStart = msg.indexOf(' ', 0);
        var syslogTypeEnd = msg.indexOf(' ', syslogTypeStart + 1);

        syslogPacket.merakiType = msg.substr(syslogTypeStart + 1, syslogTypeEnd - syslogTypeStart - 1);
        switch (syslogPacket.merakiType) {
            case 'urls':
                syslogPacket.urls_src = getMerakiValue(msg, 'src');
                syslogPacket.urls_dst = getMerakiValue(msg, 'dst');
                syslogPacket.urls_mac = getMerakiValue(msg, 'mac');
                syslogPacket.urls_user = getMerakiValue(msg, 'user');
                syslogPacket.urls_agent = getMerakiValue(msg, 'agent');
                var startMethod = msg.indexOf('request:') + 9;
                var stopMethod = msg.indexOf(' ', startMethod);
                syslogPacket.urls_requestType = msg.substr(startMethod, stopMethod - startMethod);
                syslogPacket.urls_requestURL = msg.substr(stopMethod + 1);

                syslogPacket.msg = undefined; //Since this is a format we understand, clear the message.
                break;
            case 'flows':
                syslogPacket.flows_src = getMerakiValue(msg, 'src');
                syslogPacket.flows_dst = getMerakiValue(msg, 'dst');
                syslogPacket.flows_mac = getMerakiValue(msg, 'mac');
                syslogPacket.flows_protocol = getMerakiValue(msg, 'protocol');
                if (syslogPacket.flows_protocol==='icmp') 
                    syslogPacket.flows_protocol+':'+getMerakiValue(msg, 'type');
                syslogPacket.flows_sport = getMerakiValue(msg, 'sport');
                syslogPacket.flows_dport = getMerakiValue(msg, 'dport');
                var startMethod = msg.indexOf('pattern:') + 9;
                var stopMethod = msg.indexOf(' ', startMethod);
                syslogPacket.flows_disposition = msg.substr(startMethod, stopMethod - startMethod);
                if (syslogPacket.flows_disposition==='0') {
                    syslogPacket.flows_direction="I";
                    syslogPacket.flows_disposition="D";
                } else if (syslogPacket.flows_disposition==='1') {
                    syslogPacket.flows_direction="I";
                    syslogPacket.flows_disposition="A";
                } else if (syslogPacket.flows_disposition==='allow') {
                    syslogPacket.flows_direction="O";
                    syslogPacket.flows_disposition="A";
                } else if (syslogPacket.flows_disposition==='deny') {
                    syslogPacket.flows_direction="O";
                    syslogPacket.flows_disposition="D";
                }
                syslogPacket.flows_description = msg.substr(stopMethod + 1);
                syslogPacket.flows_direction="A"
                syslogPacket.msg = undefined; //Since this is a format we understand, clear the message.
                break;
            case 'events':
                var eventTypeEnd = msg.indexOf(':', syslogTypeEnd);
                //syslogPacket.EventType = msg.substr(syslogTypeEnd + 1, eventTypeEnd-syslogTypeEnd - 1);
                syslogPacket.EventMessage = msg.substr(syslogTypeEnd+1);
                syslogPacket.msg=undefined;
        
                break;

            case 'ids':
                break;
            case 'airmarshal_events':
                break;
        }
        return syslogPacket;
    }