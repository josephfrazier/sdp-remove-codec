var sdpTransform = require('sdp-transform')
var pluck = require('propprop')
var not = require('not')

module.exports = sdpRemoveCodec

function sdpRemoveCodec (payloadType, sdp) {
  var parsed = sdpTransform.parse(sdp)
  parsed.media.forEach(function (medium) {
    removeMediumPayload(medium, payloadType)
  })

  var serialized = sdpTransform.write(parsed)
  return serialized
}

function removeMediumPayload (medium, payloadType) {
  removeAttributePayload(medium, 'rtp', payloadType)
  removeAttributePayload(medium, 'fmtp', payloadType)
  removeAttributePayload(medium, 'rtcpFb', payloadType)
  medium.payloads = medium.rtp.map(pluck('payload')).join(' ')
}

function removeAttributePayload (medium, attributeKey, payloadType) {
  if (!medium[attributeKey]) {
    return
  }

  medium[attributeKey] = medium[attributeKey].filter(not(hasPropertyValue('payload', payloadType)))
}

function hasPropertyValue (name, value) {
  return function (obj) {
    return obj[name] === value
  }
}
