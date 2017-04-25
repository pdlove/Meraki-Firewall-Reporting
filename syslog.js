var dgram = require('dgram')

module.exports = Syslogd;
function noop() {}

function Syslogd(fn, opt) {
    if (!(this instanceof Syslogd)) {
        return new Syslogd(fn, opt)
    }
    this.opt = opt || {}
    this.handler = fn
    this.server = dgram.createSocket('udp4')
}

var proto = Syslogd.prototype

proto.listen = function(port, cb) {
    var server = this.server
    if (this.port) {
        console.log('server has binded to %s', port)
        return
    }
    console.log('try bind to %s', port)
    cb = cb || noop
    this.port = port || 514 // default is 514
    var me = this
    server
        .on('error', function(err) {
            console.log('binding error: %o', err)
            cb(err)
        })
        .on('listening', function() {
            console.log('binding ok')
            cb(null)
        })
        .on('message', function(msg, rinfo) {
            var info = parser(msg, rinfo)
            me.handler(info)
        })
        .bind(port, this.opt.address )

    return this
}

var timeMaxLen = 'Dec 15 10:58:44'.length

var Severity = {}
'Emergency Alert Critical Error Warning Notice Informational Debug'.split(' ').forEach(function(x, i) {
    Severity[x.toUpperCase()] = i
})

exports.Severity = Severity

var Facility = {} // to much

function parsePRI(raw) {
    // PRI means Priority, includes Facility and Severity
    // e.g. 10110111 =  10110: facility 111: severity
    var binary = (~~raw).toString(2)
    var facility = parseInt(binary.substr(binary.length - 3), 2)
    var severity = parseInt(binary.substring(0, binary.length - 3), 2)
    return [facility, severity]
}

function parser(msg, rinfo) {
    // https://tools.ietf.org/html/rfc5424
    // e.g. <PRI>time hostname tag: info
    msg = msg + ''
	//console.log(msg);
    var syslogPacket = {}
    syslogPacket.facility = msg.substr(1,3);
    syslogPacket.severity = msg.substr(5,1);
    syslogPacket.unixtime = msg.substr(7,20); //This assumes time is in unix time (to save time for my implementation)
    
    syslogPacket.msg=msg.substr(28); //Verify this gets the message.

    syslogPacket.sourceIP=rinfo.address;
    syslogPacket.time = new Date(syslogPacket.unixtime * 1000); //TODO: How do I determine if this fails?
    
    return syslogPacket;
}

