var test = require('tape')
var sdpRemoveCodec = require('./')
var fs = require('fs')
var arrayIncludes = require('array-includes')

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

test('removes array of payload types', function (t) {
  var payloadTypes = [111, 100]
  removesLine(t, input, payloadTypes, 'a=rtpmap:111 opus/48000/2')

  var badLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126'
  var goodLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 103 104 9 0 8 106 105 13 126'
  replacesLine(t, input, payloadTypes, badLine, goodLine)

  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 ccm fir')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 nack')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 nack pli')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 goog-remb')

  t.end()
})

test('removes array of codec types', function (t) {
  var payloadTypes = ['opus', 'VP8']
  removesLine(t, input, payloadTypes, 'a=rtpmap:111 opus/48000/2')

  var badLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126'
  var goodLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 103 104 9 0 8 106 105 13 126'
  replacesLine(t, input, payloadTypes, badLine, goodLine)

  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 ccm fir')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 nack')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 nack pli')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 goog-remb')

  t.end()
})

test('removes codec types matching regular expression', function (t) {
  var payloadTypes = /OpUs|vp8/i
  removesLine(t, input, payloadTypes, 'a=rtpmap:111 opus/48000/2')

  var badLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126'
  var goodLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 103 104 9 0 8 106 105 13 126'
  replacesLine(t, input, payloadTypes, badLine, goodLine)

  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 ccm fir')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 nack')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 nack pli')
  removesLine(t, input, payloadTypes, 'a=rtcp-fb:100 goog-remb')

  t.end()
})

function removesLine (t, input, payloadType, badLine) {
  var output = sdpRemoveCodec(payloadType, input)
  var inputLines = input.split('\r\n')
  var outputLines = output.split('\r\n')
  t.ok(arrayIncludes(inputLines, badLine))
  t.notOk(arrayIncludes(outputLines, badLine))
}

function replacesLine (t, input, payloadType, badLine, goodLine) {
  var output = sdpRemoveCodec(payloadType, input)
  var inputLines = input.split('\r\n')
  var outputLines = output.split('\r\n')

  t.ok(arrayIncludes(inputLines, badLine))
  t.notOk(arrayIncludes(inputLines, goodLine))

  t.ok(arrayIncludes(outputLines, goodLine))
  t.notOk(arrayIncludes(outputLines, badLine))
}
