/* Copyright 2011-2014 Brendan Linn

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>. */

goog.provide('output');
goog.provide('r5js.test.matchers.setOutputPort');
goog.setTestOnly('output');
goog.setTestOnly('r5js.test.matchers.setOutputPort');


goog.require('goog.array');
goog.require('r5js.OutputSavingPort');
goog.require('r5js.valutil');
goog.require('tdd.matchers.Matcher');


/**
 * @param {string} output
 * @return {!tdd.matchers.Matcher}
 */
const output = function(output) {
  return new HasOutput_(output,
      /** @type {!r5js.OutputSavingPort} */ (HasOutput_.sharedOutputPort_));
};



/**
 * @param {string} expectedOutput
 * @param {!r5js.OutputSavingPort} outputPort
 * @implements {tdd.matchers.Matcher}
 * @struct
 * @constructor
 * @private
 */
const HasOutput_ = function(expectedOutput, outputPort) {
  /** @const @private */ this.expectedOutput_ = expectedOutput;
  /** @private {?string} */ this.actualOutput_ = null;
  /** @const @private */ this.outputPort_ = outputPort;
};


/** @private {r5js.OutputSavingPort} */
HasOutput_.sharedOutputPort_ = null;


/** @override */
HasOutput_.prototype.matches = function(input) {
  this.actualOutput_ = this.outputPort_.dequeueOutput();
  return this.actualOutput_ === this.expectedOutput_;
};


/** @override */
HasOutput_.prototype.getFailureMessage =
    function(input) {
  return 'want ' + this.expectedOutput_ + ' got ' + this.actualOutput_;
};


/**
 * @param {!r5js.OutputSavingPort} outputPort
 * @suppress {accessControls}
 */
r5js.test.matchers.setOutputPort = function(outputPort) {
  HasOutput_.sharedOutputPort_ = outputPort;
};
