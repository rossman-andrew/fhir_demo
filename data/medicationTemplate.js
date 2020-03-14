// Copyright (c) 2019, Andrew Rossman.

"use strict"
/**                  Factory for FHIR medication resource
 * v0.1
 * Returns a JSON string giving FHIR description of one medication.
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
module.exports.makeMedicationFHIR = makeMedicationFHIR;
function makeMedicationFHIR( values) {
  
  // let { } = values;
  let result = `{}`;

  if (trace) {
    try {
        fs.appendFileSync(traceFilename,`//${Date(Date.now()).toString()} makeMedicationFHIR
        ${result}
        `);
    } catch( err) {
        console.log(`${Date(Date.now()).toString()} ${_N_} makeMedicationFHIR appendFileSync error: ${err}`);
    };
  }
  return result;    
};

