// TODO require('sdp-remove-codec') and post demo to tonicdev.com
var sdpRemoveCodec = require('./')

console.log("\n\nHere's some SDP *with* PCMU, following by the SDP *without* PCMU\n\n")
var pc = new window.RTCPeerConnection()
pc.createOffer({offerToReceiveAudio: true})
  .then(offer => offer.sdp)
  .then(sdp => (console.log(sdp), sdp))
  .then(sdp => console.log(sdpRemoveCodec('PCMU', sdp)))
  .then(global.window.close)
