var test = require('tape')
var sdpRemoveCodec = require('./')
var fs = require('fs')

var input = fs.readFileSync('./sdp.txt', 'utf8')

test('removes a=rtpmap line', function (t) {
  removesLine(input, 111, 'a=rtpmap:111 opus/48000/2', t)
  t.end()
})

test('removes a=fmtp line', function (t) {
  removesLine(input, 111, 'a=fmtp:111 minptime=10; useinbandfec=1', t)
  t.end()
})

test('removes payload type from m=audio line', function (t) {
  var badLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126'
  var goodLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 103 104 9 0 8 106 105 13 126'
  replacesLine(input, 111, badLine, goodLine, t)
  t.end()
})

test('removes a=rtcp-fb lines', function (t) {
  removesLine(input, 100, 'a=rtcp-fb:100 ccm fir', t)
  removesLine(input, 100, 'a=rtcp-fb:100 nack', t)
  removesLine(input, 100, 'a=rtcp-fb:100 nack pli', t)
  removesLine(input, 100, 'a=rtcp-fb:100 goog-remb', t)
  t.end()
})

function removesLine (input, payloadType, badLine, t) {
  var output = sdpRemoveCodec(payloadType, input)
  t.ok(input.includes(badLine))
  t.notOk(output.includes(badLine))
}

function replacesLine (input, payloadType, badLine, goodLine, t) {
  var output = sdpRemoveCodec(payloadType, input)

  t.ok(input.includes(badLine))
  t.notOk(input.includes(goodLine))

  t.ok(output.includes(goodLine))
  t.notOk(output.includes(badLine))
}
