var rfid = require('../lib/rfid')({
    model: 'aria',
    connector: 'D13',
    debug: true
});

// this is fired as the first
rfid.attach('init', function() {
    console.log('init');
});

rfid.attach('data', function(event) {
    console.log('TAG ' + event.data.tag);
    console.log('err: ' + event.data.err);
});
