// TODO dedupe tests into helper functions for detecting codec absence/presence?
var test = require('tape')
var sdpRemoveCodec = require('../')
var fs = require('fs')
var arrayIncludes = require('array-includes')
var path = require('path')

var input = fs.readFileSync(path.join(__dirname, 'sdp.txt'), 'utf8')

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

// https://stackoverflow.com/questions/1538512/how-can-i-invert-a-regular-expression-in-javascript/1538524#1538524
// TODO make this more thorough
// TODO export a helper function that builds the regex? What if the user only
// cares about one media section? For example, forcing opus in this way would
// remove all payload types from the video section.
test('forces particular codecs with negative lookahead regular expression', function (t) {
  var payloadTypes = /^(?!.*opus|VP8)/

  var badLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126'
  var goodLine = 'm=audio 56333 UDP/TLS/RTP/SAVPF 111'
  replacesLine(t, input, payloadTypes, badLine, goodLine)
  console.log(sdpRemoveCodec(payloadTypes, input).indexOf(goodLine))

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
