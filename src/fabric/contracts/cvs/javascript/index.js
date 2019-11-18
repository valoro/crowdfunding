/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const cvs = require('./lib/cvs');

module.exports.cvs = cvs;
module.exports.contracts = [ cvs ];
