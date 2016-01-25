var sdpTransform = require('sdp-transform')
var pluck = require('propprop')
var not = require('not')

module.exports = sdpRemoveCodec

function sdpRemoveCodec (options, sdp) {
  if (typeof options === 'number') {
    options = {
      payloadType: options
    }
  }
  var payloadType = options.payloadType
  var targetMedium = options.medium || 'audio'

  var parsed = sdpTransform.parse(sdp)
  var medium = parsed.media.filter(hasPropertyValue('type', targetMedium))[0]
  medium.rtp = medium.rtp.filter(not(hasPropertyValue('payload', payloadType)))
  medium.fmtp = medium.fmtp.filter(not(hasPropertyValue('payload', payloadType)))
  medium.payloads = medium.rtp.map(pluck('payload')).join(' ')

  var serialized = sdpTransform.write(parsed)
  return serialized
}

function hasPropertyValue (name, value) {
  return function (obj) {
    return obj[name] === value
  }
}
