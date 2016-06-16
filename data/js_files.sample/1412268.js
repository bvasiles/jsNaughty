/*!
 *  Copyright © 2011-2015 Peter Magnusson.
 *  All rights reserved.
 */
var b = require('./bits')
  ,protocol = require('./protocol')
  , EventEmitter = require('events').EventEmitter
  , util = require('util');

var EasyField = function(op, storage) {
  //store parameters
  this.op = op;
  this.storage = storage;
  //set some defaults
  this.isBit = false;
  this.bitNum = -1;
  this._value = 0;
  this._isActive = false;
  //check type of operand
  var operand = protocol.parseOperand(op.substring(0,1));
  this.operand = operand;

  //check if bit field or not
  var point = op.indexOf('.');
  if (point > -1) {
    this.isBit = true;
    this.bitNum = parseInt(op.substring(point + 1));
  }
  else {
    //second char must be a W
    if (op.substring(1,2) !== 'W') {
      throw new Error('Badly formated op:' + op);
    }
  }

  //get the index from the op field
  var s = this.isBit ? 1 : 2 ;
  var e = this.isBit ? point : op.length;
  var index = parseInt(op.substring(s,e));
  this.index = index;


  //if WORD field then we will want to manipulate bits anyhow
  if (!this.isBit ) {
    this.setBit = function(bitNum) {
      this.value = b.setBit(this.value, bitNum);
    };
    this.clearBit = function(bitNum) {
      this.value = b.clearBit(this.value, bitNum);
    };
    this.checkBit = function(bitNum) {
      return b.checkBit(this.value, bitNum) === 1;
    };
  }
};//end constructor

util.inherits(EasyField, EventEmitter);


EasyField.prototype.__defineGetter__('value', function() {
  if (typeof(this.storage) !== 'undefined' && this.storage !== null) {
    var val = this.storage.get(this.operand, this.index);
    if (this.isBit) {
      val = b.checkBit(val, this.bitNum);
    }
    this._value = val;
  }
  return this._value;
});

EasyField.prototype.__defineSetter__('value', function(val) {
  //test for valid values
  if (this.isBit) {
    if (val < 0 || val > 1) {
      throw new Error('Bits can only bet set to 1 or 0:' + this.op);
    }
  }
  if (val > 65535) {
    throw new Error('65535 is the maximum value for a word:' + this.op);
  }
  //store locally
  this._value = val;
  if (typeof(this.storage) !== 'undefined' && this.storage !== null) {
    //put in storage as well
    if (this.isBit) {
      var fn = val === 1 ? b.setBit : b.clearBit;
      val = fn(this.storage.get(this.operand, this.index), this.bitNum);
    }
    this.storage.set(this.operand, this.index, val);
  }
});

EasyField.prototype.setActive = function() {
  if (this._isActive === true) return;
  this._isActive = true;
  var self = this;
  //if someone changed this..... emit or..?
  self.storage.on('changed', function(changed_operand, changed_index, changed_previous_value, changed_to_value) {
    if (changed_operand === self.operand && changed_index === self.index) {
      if (self.isBit) {
        var o = b.checkBit(changed_previous_value, self.bitNum);
        var n =  b.checkBit(changed_to_value, self.bitNum);
        if (o !== n) {
          self._value = n;
          trigger(o, n);
        }
      }
      else {
        if (changed_previous_value !== changed_to_value) {
          self._value = changed_to_value;
          trigger(changed_previous_value, changed_to_value);
        }
      }
    }

    function trigger(pv, cv) {
      self.emit('changed', self, pv, cv);
    };
  }); //storage.on
};


exports = module.exports = EasyField;
