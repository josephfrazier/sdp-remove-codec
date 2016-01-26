var test = require('tape')
var sdpRemoveCodec = require('./')
var fs = require('fs')

var input = fs.readFileSync('./sdp.txt', 'utf8')

test('removes a=rtpmap line', function (t) {
  removesLine(t, input, 111, 'a=rtpmap:111 opus/48000/2')
  t.end()
})

test('removes a=fmtp line', function (t) {
  removesLine(t, input, 111, 'a=fmtp:111 minptime=10; useinbandfec=1')
  t.end()
})

test('removes payload type from m=audio line', function (t) {
  var badLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126'
  var goodLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 103 104 9 0 8 106 105 13 126'
  replacesLine(t, input, 111, badLine, goodLine)
  t.end()
})

test('removes a=rtcp-fb lines', function (t) {
  removesLine(t, input, 100, 'a=rtcp-fb:100 ccm fir')
  removesLine(t, input, 100, 'a=rtcp-fb:100 nack')
  removesLine(t, input, 100, 'a=rtcp-fb:100 nack pli')
  removesLine(t, input, 100, 'a=rtcp-fb:100 goog-remb')
  t.end()
})

function removesLine (t, input, payloadType, badLine) {
  var output = sdpRemoveCodec(payloadType, input)
  t.ok(input.includes(badLine))
  t.notOk(output.includes(badLine))
}

function replacesLine (t, input, payloadType, badLine, goodLine) {
  var output = sdpRemoveCodec(payloadType, input)

  t.ok(input.includes(badLine))
  t.notOk(input.includes(goodLine))

  t.ok(output.includes(goodLine))
  t.notOk(output.includes(badLine))
}
