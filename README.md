# sdp-remove-codec
Remove a codec from a Session Description.

# Usage

```
// TODO test/fix in browsers other than firefox
// TODO require('sdp-remove-codec') and post demo to tonicdev.com
var sdpRemoveCodec = require('./')

var pc = new window.RTCPeerConnection()
pc.createOffer({offerToReceiveAudio: true})
  .then(offer => offer.sdp)
  .then(sdp => (console.log(sdp), sdp))
  .then(sdp => console.log(sdpRemoveCodec('PCMU', sdp)))
```
