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
  removeMediumPayload(medium, payloadType)

  var serialized = sdpTransform.write(parsed)
  return serialized
}

function removeMediumPayload (medium, payloadType) {
  removeAttributePayload(medium, 'rtp', payloadType)
  removeAttributePayload(medium, 'fmtp', payloadType)
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
