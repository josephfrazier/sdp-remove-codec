var test = require('tape')
var sdpRemoveCodec = require('../')
var SIP = require('sip.js')

test('setting a peer connection local description after removing PCMU', function (t) {
  t.plan(5)

  var ua = new SIP.UA({traceSip: true})

  var url = 'chickens@junctionnetworks.com'
  var session = ua.invite(url, {
    media: {
      constraints: {
        fake: true,
        audio: true,
        video: false
      },
      render: {
        remote: new window.Audio()
      }
    }
  })

  session.mediaHandler.on('getDescription', function (description) {
    t.ok(description.sdp.includes('opus'))
    description.sdp = sdpRemoveCodec(/^(?!.*PCMU)/, description.sdp)
  })

  // TODO programmatically check media flow, maybe with getStats?
  session.mediaHandler.on('addStream', function () {
    // XXX sip.js calls setLocalDescription with the unmangled SDP, so we have to check the remoteDescription instead
    // https://github.com/onsip/SIP.js/blob/d9ae93c04d6aad5df37fc999cbdbc7d9060a2f06/src/WebRTC/MediaHandler.js#L503
    var answer = session.mediaHandler.peerConnection.remoteDescription.sdp
    t.notOk(answer.includes('opus'))
    t.equal(answer.match('a=rtpmap:').length, 1)
    t.equal(answer.match('a=rtpmap:0 ').length, 1)
  })

  session.on('terminated', t.pass)
})
