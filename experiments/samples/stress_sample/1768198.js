var FTPClient = require('ftp')
  , BaseDriver = require('../..').driver.BaseDriver
  , util = require('util')
  , Stream = require('stream').Stream

/**
 * Read Stream for FTP
 */
function FTPReadStream (path, client) {
  // Default state
  this.readable = true
  this.paused = false
  this.encoding = null
  this.ended = false
  this.stream = null

  // Extend Stream
  Stream.call(this)

  // Communication between the FTP client and the stream
  var self = this
  client.get(path, function (err, stream) {
    if (err) return client.emit('error', err)
    self.stream = stream
    if (self.ended) return false
    if (self.encoding) stream.setEncoding(self.encoding)
    if (self.paused) stream.pause()
    stream.on('data', function (chunk) {
      self.emit('data', chunk)
    })
    stream.on('end', function () {
      self.emit('end')
    })
    stream.on('error', function (err) {
      self.emit('error', err)
    })
  })
}

util.inherits(FTPReadStream, Stream)

FTPReadStream.prototype.setEncoding = function (encoding) {
  if (this.ended) return false
  this.encoding = encoding
  if (this.stream) this.stream.setEncoding(encoding)
}
FTPReadStream.prototype.pause = function () {
  if (this.ended) return false
  this.paused = true
  if (this.stream) this.stream.pause()
}
FTPReadStream.prototype.resume = function () {
  if (this.ended) return false
  this.paused = false
  if (this.stream) this.stream.resume()
}

FTPReadStream.prototype.destroy = function () {
  if (this.ended) return false
  if (this.stream) this.stream.destroy()
  this.emit('end')
}
FTPReadStream.prototype.destroySoon = function () {
  if (this.ended) return false
  if (this.stream) this.stream.destroySoon()
  this.emit('end')
}


/**
 * "ftp://" provider
 */
function FTPDriver (options, stream) {
  BaseDriver.call(this, options)

  // Options
  var opts = { "host": options.host }
  if (options.port) opts.port = options.port
  if (options.debug) opts.debug = options.debug
  if (options.timeout) opts.connTimeout = options.timeout

  // Connection to FTP server
  this.client = new FTPClient(opts)

  // Handle callbacks queue
  this._ready = false
  this._queue = []

  var self = this
  var ready = function () {
    if (self._ended) return false
    self._ready = true
    // Flush queue
    if (self._queue.length) {
      var cb = self._queue.shift()
      process.nextTick(function () {
        if (!self._ended) cb.call(self)
        ready()
      })
    }
  }

  // Handle authentication
  this.client.on('connect', function () {
    if (self._ended) return false
    if (options.user) {
      self.client.auth(options.user, options.password, function (err) {
        if (err) return stream.emit('error', err)
        ready()
      })
    } else {
      ready()
    }
  })

  // Termination events
  this._write_streams = 0
  this._read_streams = 0
  this._ended = false
  function finish (event, arg) {
    if (!self._ended) {
      // If it's a normal termination event, then close the connection ONLY if there is no more inner streams
      if (event != 'error' && self._write_streams == 0 && self._read_streams == 0) {
        self._ended = true
        self.client.end()
      }
      if (event) {
        stream.emit(event, arg)
      }
    }
  }
  // Client events -> stream
  this.client.on('error', function (err) {
    finish('error', err)
  })
  this.client.on('timeout', function () {
    finish('error', new Error('Connection timeout'))
  })
  this.client.on('close', function () {
    finish('close')
  })
  this.client.on('end', function () {
    finish('end')
  })

  // Start connection
  this.client.connect()
}

util.inherits(FTPDriver, BaseDriver)

FTPDriver.prototype.onReady = function (cb) {
  if (this._ready) {
    cb.call(this)
  } else {
    this._queue.push(cb)
  }
}

FTPDriver.prototype.createReadable = function (cb) {
  var self = this
  self._read_streams++
  self.onReady(function () {
    var stream = new FTPReadStream(self.path, self.client)
    stream.on('end',   function ()    { self._read_streams--; self.client.emit('end') })
    stream.on('error', function (err) { self._read_streams--; self.client.emit('error', err) })
    cb(undefined, stream)
  })
}

/**
 * TODO
FTPDriver.prototype.createWritable = function (cb) {
  this.onReady(function () {
    var client = this.client
      , stream = new FTPWriteStream(this.path, client)
    //stream.on('end', function () { client.emit('end') })
    //stream.on('error', function (err) { client.emit('error', err) })
    cb(undefined, stream)
  })
}
*/

module.exports = FTPDriver
