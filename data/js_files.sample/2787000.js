// Copyright 2009 the Sputnik authors.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/**
 * @name: S11.13.2_A4.9_T2.4;
 * @section: 11.13.2, 11.10.1;
 * @assertion: The production x &= y is the same as x = x & y; 
 * @description: Type(x) is different from Type(y) and both types vary between Number (primitive or object) and Undefined;
 */

//CHECK#1
x = 1;
x &= undefined;
if (x !== 0) {
  $ERROR('#1: x = 1; x &= undefined; x === 0. Actual: ' + (x));
}

//CHECK#2
x = undefined;
x &= 1;
if (x !== 0) {
  $ERROR('#2: x = undefined; x &= 1; x === 0. Actual: ' + (x));
}

//CHECK#3
x = new Number(1);
x &= undefined;
if (x !== 0) {
  $ERROR('#3: x = new Number(1); x &= undefined; x === 0. Actual: ' + (x));
}

//CHECK#4
x = undefined;
x &= new Number(1);
if (x !== 0) {
  $ERROR('#4: x = undefined; x &= new Number(1); x === 0. Actual: ' + (x));
}
