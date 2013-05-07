/*jslint bitwise: true */

/**
 * @class node_modules.rfid
 *
 * @author Marcello Gesmundo
 * 
 * This module provide a simple way to read RF TAGs. This module is intended for an [Innovations ID-12 RFID](http://id-innovations.com/httpdocs/EM%20moudule%20SERIES%202007-10-9_wfinal%20v22.pdf) reader connected to an [Acme System](http://www.acmesystems.it) board:
 * 
 *  - [Terra board](http://www.acmesystems.it/terra)
 *  - [Aria board](http://www.acmesystems.it/aria)
 *  - [Fox G20 board](http://www.acmesystems.it/FOXG20).
 * 
 * Visit [Acme Systems](http://www.acmesystems.it/) and [Innovations](http://id-innovations.com) official sites for more informations about this hardware. You can use this module also to connect the RFID reader to a PC using an USB to serial converter.
 * 
 * For an example of usage see the example folder.
 * 
 * Hardware:
 * 
 *  - [Acme System](http://www.acmesystems.it) components:
 * 
 *      - Acme Systems [Terra board](http://www.acmesystems.it/terra) (or [Fox G20 board](http://www.acmesystems.it/FOXG20) with  [Daisy-1 board](http://www.acmesystems.it/DAISY-1))
 * 
 *  - [Innovations](http://id-innovations.com) RFID reader:
 * 
 *      - [ID-12](http://id-innovations.com/httpdocs/EM%20moudule%20SERIES%202007-10-9_wfinal%20v22.pdf) connected to Terra board (or Fox board)
 * 
 * __NOTE__: the term "Aria" in this module is used as synonym of "Terra" because in effect
 * this module is intend for Terra board (with or without GPRS module). You can also inherit this module to customize it to works with an Aria module.
 * 
 * # License
 * 
 * Copyright (c) 2013 Yoovant by Marcello Gesmundo. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *    * Neither the name of Yoovant nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module.exports = function(config) {
    var utils         = require('object_utils');
    var chicEvent     = require('chic-event');
    var Event         = chicEvent.Event;
    var EventEmitter  = chicEvent.EventEmitter;
    var com           = require('serialport');
    var SerialPort    = com.SerialPort;
                     
    var events        = new EventEmitter();
    var START_OF_TEXT = '\u0002';
    var END_OF_TEXT   = '\u0003';
    var parser        = com.parsers.readline('\r\n' + END_OF_TEXT);

    /**
     * @event init Fired when the RFIF reader is ready
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * 
     * ### Example
     * 
     *      var rfid = require('rfid')({
     *          model: 'aria',
     *          connector: 'D10'
     *      });
     *      
     *      rfid.attach('init', function(event) {
     *          console.log(event.data.err);                // undefined if success
     *      });
     */ 

    /**
     * @event data Fired when a new TAG is read
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * @param {String} tag The TAG read
     * 
     * ### Example
     * 
     *      var rfid = require('rfid')({
     *          model: 'aria',
     *          connector: 'D10'
     *      });
     *      
     *      rfid.attach('data', function(event) {
     *          console.log(event.data.err);                // undefined if success
     *          console.log(event.data.tag);                // read data
     *      });
     */ 

    /**
     * @event error Fired when an error occurred
     * @param {String} err The error
     * @param {Object} sender The sender of the event
     */ 

    /**
     * @event close Fired when the serial is closed
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     */ 

    // namespace
    var my = {
        name: 'RFID'
    };

    /**
     * Configuration
     */
    my.config = {
        /**
         * @cfg {String} model The model of the device. Values allowed:
         * 
         *  - aria: for an Acme Systems Aria G25
         *  - fox: for an Acme Systems FoxBoard G20
         */
        model: 'aria',
        /**
         * @cfg {String} connector The connector port used to connect the RFID reader.
         * 
         * Allowed values:
         * 
         *  - D10, D13 or D17 on Terra board (D17 only on Terra board without modem!)
         *  - D1, D6 or D8 on Fox board
         * 
         * __Note__: on Aria board you can inherit this module and customize it using pins as you want
         * (according your connected hardware)
         */
        connector: 'D13',
        /**
         * @cfg {Boolean} debug Set true if you want trace running module
         */
        debug: false,
        /**
         * @cfg {Object} logger The logger used in debug mode
         */
        logger: console
    };

    config = config || {};
    
    // merge new config with default config
    utils.merge(my.config, config);
    
    var model     = my.config.model,
        debug     = my.config.debug,
        logger    = my.config.logger,
        connector = my.config.connector;

    if (model !== 'aria' && model !== 'fox') {
        throw new Error('wrong model!');
    }

    var gpio = require('aria_fox_gpio')({
        model: model,
        debug: debug,
        logger: logger
    });

    var serials = gpio.getSerials();
    // set the serial
    my.serial = serials[connector];
    
    if (!my.serial) {
        logger.error(my.name + ' error: serial not found on ' + connector + ' connector');  
        throw new Error('serial not found');
    }

    // empty function
    var emptyFn = function() {};
    
    if (debug) {
        if (logger && 'function' !== typeof logger.debug) {
            // console does not have debug method
            logger.debug = logger.log;
        }
    } else {
        logger = {
            debug: emptyFn,
            log: emptyFn,
            warn: emptyFn,
            error: emptyFn,
            info: emptyFn
        };
    }
    
    logger.info(my.name + ' info: using ' + my.serial + ' port on ' + connector + ' connector');  

    /**
     * @param {String} data 12 ASCII chars: 10 useful data + 2 checksum
     * @return {String} Returns the error if occurred
     * @private
     * 
     * ### Example
     * 
     *  data        = 47007650A8C9
     * 
     *  useful data = 47007650A8
     * 
     *  checksum    = C9
     *  
     */
    var verifyChecksum = function(data) {
        var i,
            j,
            r,
            ok = true;
        if (data.length !== 12) {
            return 'wrong data length';
        }
        for (i = 0; i < 2; i++) {
            r = -1;
            for (j = (2 + i); j < (10 + i); j += 2) {
                if (r === -1) {
                    r = parseInt(data.charAt(i), 16);
                }
                r = r ^ parseInt(data.charAt(j), 16);
            }
            ok = ok && (r === parseInt(data.charAt(10 + i), 16));
        }
        if (!ok) {
            return 'checksum mismatch';
        }
    };
        
    // define the serial port
    var serialPort = new SerialPort(my.serial, {
        baudrate: 9600,
        databits: 8,
        stopbits: 1,
        parity  : 'none',
        parser  : parser
    });    
    
    serialPort.on('error', function(err) {
        logger.error(my.name + ' error: ' + err);
        events.emit('error', new Event({
            err: err
        }));
    });
    
    serialPort.on('close', function(err) {
        logger.debug(my.name + ' debug: serial ' + my.serial + ' closed ' + err);
        events.emit('close', new Event({
            err: err
        }));
    });
    
    serialPort.on('open', function() {
        logger.debug(my.name + ' debug: serial ' + my.serial + ' opened');
        events.emit('init', new Event());
    });
    
    serialPort.on('data', function(data) {
        logger.debug(my.name + ' debug: read TAG ' + data);
        if (data.charAt(0) === START_OF_TEXT) {
            data = data.substring(1);
        }
        var err = verifyChecksum(data);
        events.emit('data', new Event({
            err: err,
            tag: data
        }));
    });
    
    /**
     * Attach a listener to an event
     * 
     * @param {String} event Event name
     * @param {Function} callback The listener for the event
     * @return {callback(event)} The callback
     * @param {{ type: String, target: Object, data: Object }} callback.event The fired event
     * @param {String} callback.event.type The event type name
     * @param {Object} callback.event.target The object emitter
     * @param {Object} callback.event.data The data sent through the event
     */
    my.attach = function(event, callback) {
        events.on(event, callback);
    };   
    /**
     * Remove a listener from an event.
     * If the callback is not provided, all listeners for the event are removed.
     * If the event is not provided, all listeners are removed.
     * 
     * @param {String} event (optional) Event name
     * @param {Function} callback (optional) The listener for the event
     * @return {callback(event)} The callback
     * @param {{ type: String, target: Object, data: Object }} callback.event The fired event
     * @param {String} callback.event.type The event type name
     * @param {Object} callback.event.target The object emitter
     * @param {Object} callback.event.data The data sent through the event
     */
    my.detach = function(event, callback) {
        events.off(event, callback);
    };
    
    return my;
};
