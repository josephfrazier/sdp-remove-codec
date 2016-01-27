var sdpTransform = require('sdp-transform')
var asArray = require('as-array')

module.exports = sdpRemoveCodec

function sdpRemoveCodec (payloadTypes, sdp) {
  return asArray(payloadTypes).reduce(sdpRemovePayload, sdp)
}

function sdpRemovePayload (sdp, payloadType) {
  var parsed = sdpTransform.parse(sdp)
  parsed.media.forEach(m => { removeMediumPayload(m, payloadType) })

  var serialized = sdpTransform.write(parsed)
  return serialized
}

function removeMediumPayload (medium, payloadType) {
  removeAttributePayload(medium, 'rtp', payloadType)
  removeAttributePayload(medium, 'fmtp', payloadType)
  removeAttributePayload(medium, 'rtcpFb', payloadType)
  medium.payloads = medium.rtp.map(r => r.payload).join(' ')
}

function removeAttributePayload (medium, attributeKey, payloadType) {
  if (!medium[attributeKey]) {
    return
  }

  medium[attributeKey] = medium[attributeKey].filter(a => a.payload !== payloadType)
}
