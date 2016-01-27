var sdpTransform = require('sdp-transform')
var asArray = require('as-array')
var concatMap = require('concat-map')

module.exports = sdpRemoveCodec

function sdpRemoveCodec (codecs, sdp) {
  var payloadTypes = concatMap(asArray(codecs), codec => payloadsOfCodec(sdp, codec))
  return payloadTypes.reduce(sdpRemovePayload, sdp)
}

function payloadsOfCodec (sdp, codec) {
  if (Number.isInteger(codec)) {
    return [codec]
  }
  var parsed = sdpTransform.parse(sdp)
  return concatMap(parsed.media, media => media.rtp)
    .filter(rtp => rtp.codec === codec)
    .map(rtp => rtp.payload)
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
