// Copyright (c) 2019, Andrew Rossman.

"use strict"
/**            Factory for FHIR condition resource
 * v0.1
 * Returns a JSON string giving FHIR description of a medical condition.
 * If tracing enabled, the generated JSON is appended to a
 * programmer's log (traceFilename).
 */

const path = require("path");
const _V_ = "v0.1";
const _N_ = `${path.basename(__filename)} ${_V_}`

const trace = false;
const traceFilename = __dirname+"/../test/wtplog.jsonc";      // jsonc -  JSON with comments

let fs = null;
if (trace) {
  fs=require("fs");
}
module.exports.makeConditionFHIR = makeConditionFHIR;
function makeConditionFHIR( values) {
  /*
   *   TEMPLATE SYMBOLICS -- values:
   *
   */
  // let { } = values;
  let result=
    `{
    }`;

  if (trace) {
     try {
        fs.appendFileSync(traceFilename,`//${Date(Date.now()).toString()} makeConditionFHIR
        ${result}
        `);
     } catch( err) {
        console.log(`${Date(Date.now()).toString()} ${_N_} makeConditionFHIR appendFileSync error: ${err}`);
     };
  }
  return result;
}

