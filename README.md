# RFID

This module provide a simple way to read RF TAGs. This module is intended for an [Innovations ID-12 RFID](http://id-innovations.com/httpdocs/EM%20moudule%20SERIES%202007-10-9_wfinal%20v22.pdf) reader connected to an [Acme System](http://www.acmesystems.it) board:

- [Terra board](http://www.acmesystems.it/terra)
- [Aria board](http://www.acmesystems.it/aria)
- [Fox G20 board](http://www.acmesystems.it/FOXG20).

Visit [Acme Systems](http://www.acmesystems.it/) and [Innovations](http://id-innovations.com) official sites for more informations about this hardware. You can use this module also to connect the RFID reader to a PC using an USB to serial converter.

To create documentation you must install [JSDuck](https://github.com/senchalabs/jsduck) and type in your terminal:

    $ ./gen_doc.sh

Please visit [Yoovant website](http://www.yoovant.com/rfid/) for more informations (schematic, etc.).

## Hardware

 - [Acme System](http://www.acmesystems.it) components:

     - Acme Systems [Terra board](http://www.acmesystems.it/terra) (or [Fox G20 board](http://www.acmesystems.it/FOXG20) with [Daisy-1 board](http://www.acmesystems.it/DAISY-1))

 - [Innovations](http://id-innovations.com) RFID reader:

     - [ID-12](http://id-innovations.com/httpdocs/EM%20moudule%20SERIES%202007-10-9_wfinal%20v22.pdf) connected to Terra board (or Fox board)

__NOTE__: the term "Aria" in this module is used as synonym of "Terra" because in effect
this module is intend for Terra board (with or without GPRS module). You can also inherit this module to customize it to works with an Aria module.

## Usage

Install the package as usual:

    debarm:~# npm install rfid

See full documentation into _doc_ folder and an example into _example_ folder within the [rfid](https://npmjs.org/package/rfid) package.
