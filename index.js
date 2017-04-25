var url = require('url');
var queue = require('queue');

var syslogd = require('./syslog');
var merakiSyslogParser = require('./meraki_syslog_parser')

var netflow = require('node-netflowv9');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('flowdb.sqlite')

CreateTables();
var syslogCount = 0;
var netflowCount = 0;


function CreateTables() {
    db.run("CREATE TABLE IF NOT EXISTS flows_inbound " +
        "(instance datetime, " +
        "merakiDevice varchar(100), " +
        "syslogSourceIP varchar(100), " +
        "flows_src varchar(100), " +
        "flows_dst varchar(100), " +
        "flows_mac varchar(100), " +
        "flows_protocol varchar(100), " +
        "flows_srcport int, " +
        "flows_dstport int, " +
        "flows_direction varchar(100), " +
        "flows_disposition varchar(100), " +
        "flows_description varchar(100))");

    db.run("CREATE TABLE IF NOT EXISTS urls_inbound " +
        "(instance datetime, " +
        "merakiDevice varchar(100), " +
        "syslogSourceIP varchar(100), " +
        "urls_src varchar(100), " +
        "urls_dst varchar(100), " +
        "urls_mac varchar(100), " +
        "urls_user varchar(100), " +
        "urls_agent varchar(100), " +
        "urls_requestType varchar(100), " +
        "urls_protocol varchar(100), " +
        "urls_host varchar(100), " +
        "urls_dstport int, " +
        "urls_path varchar(100))");

    db.run("CREATE TABLE IF NOT EXISTS events_inbound " +
        "(instance datetime, " +
        "merakiDevice varchar(100), " +
        "syslogSourceIP varchar(100), " +
        "events_type varchar(100), " +
        "events_message varchar(100))");

    db.run("CREATE TABLE IF NOT EXISTS syslog_inbound " +
        "(instance datetime, " +
        "merakiDevice varchar(100), " +
        "syslogSourceIP varchar(100), " +
        "syslog_message varchar(8000))");

}

syslogd(receiveSyslogMessage).listen(514, function (err) {
    console.log('Started Syslog Monitor');
});

var knownFlowParameters = ['ipv4_src_addr', 'ipv4_dst_addr', 'l4_src_port', 'l4_dst_port', 'in_bytes', 'out_bytes', 'in_pkts', 'out_pkts', 'protocol', 'input_snmp', 'first_switched', 'last_switched', 'fsId'];
var flowCollector = netflow({ port: 3000 });
flowCollector.on('data', function (data) {
    //console.log(data);
    if (netflowCount === 0) console.log("Netflow received");
    netflowCount = 1;

    for (var i = 0, len = data.flows.length; i < len; i++) {
        for (var parmName in data.flows[i]) {
            if (knownFlowParameters.indexOf(parmName) < 0) {
                console.log("Missing Parameter: " + parmName);
            }
        }
    }


    for (var flow in data.flows) {
        
    }
});


function receiveNetflow(flow) {
    console.log(flow);

}

function receiveSyslogMessage(syslogMessage) {
    if (syslogCount === 0) console.log("Syslog received");
    syslogCount = 1;
    //Need to add a detection of what kind of syslog message it is.
    var logreply = merakiSyslogParser.meraki_ParseSyslog(syslogMessage);
    if (logreply.merakiType === 'flows') {
        if (logreply.flows_sport == '') logreply.flows_sport = null;
        if (logreply.flows_dport == '') logreply.flows_dport = null;
        var flow_insert = "INSERT INTO flows_inbound " +
            "(instance, merakiDevice, syslogSourceIP, flows_src, flows_dst, flows_mac, flows_protocol, " +
            "flows_srcport, flows_dstport, flows_direction, flows_disposition, flows_description) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
        db.run(flow_insert, logreply.time, logreply.merakiDevice, logreply.sourceIP, logreply.flows_src, logreply.flows_dst, logreply.flows_mac, logreply.flows_protocol, logreply.flows_sport, logreply.flows_dport, logreply.flows_direction, logreply.flows_disposition, logreply.flows_description);
    } else if (logreply.merakiType === 'urls') {
        var apiURL = url.parse(logreply.urls_requestURL);
        var myPort = 0;
        switch (apiURL.protocol) {
            case 'http:': myPort = 80; break;
            case 'https:': myPort = 443; break;
        }
        var url_insert = "INSERT INTO urls_inbound " +
            "(instance, merakiDevice, syslogSourceIP, urls_src, urls_dst, urls_mac, urls_user, " +
            "urls_agent, urls_requestType, urls_protocol, urls_host, urls_dstport, urls_path) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
        db.run(url_insert, logreply.time, logreply.merakiDevice, logreply.sourceIP, logreply.urls_src, logreply.urls_dst, logreply.urls_mac, logreply.urls_user,
            logreply.urls_agent, logreply.urls_requestType, apiURL.protocol, apiURL.hostname, apiURL.port || myPort, apiURL.path);
    } else if (logreply.merakiType === 'events') {
        var event_insert = "INSERT INTO events_inbound " +
            "(instance, merakiDevice, syslogSourceIP, events_type, events_message) " +
            "VALUES (?,?,?,?,?)";
        db.run(event_insert, logreply.time, logreply.merakiDevice, logreply.sourceIP, logreply.events_type, logreply.EventMessage);


    } else {
        console.log(logreply);
    }
}
