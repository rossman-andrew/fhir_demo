// Copyright (c) 2019, Andrew Rossman.

"use strict"
/**            Factory for FHIR patient resource
 * v0.1
 * Returns a JSON string giving FHIR description of a patient.
 * In debug mode appends a copy of the generated JSON to a
 * programmer's log (wtplog.jsonc).
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
module.exports.makePatientFHIR = makePatientFHIR;
function makePatientFHIR( values) {
  /*
   *   TEMPLATE SYMBOLICS
   *
   *   mrn = ${mrn}                     medical record number
   *   family name = ${family}          patient's family name
   *   given name = ${given}            patient's given name
   *   gender = ${gender}               administrative gender code (HL7)
   *   birth day = ${birthMMDDYYYY}     calculated from birthDay (YYYY-MM-DD)
   *   dr id = ${phyid}                 patient's primary care provider (PCP)
   *   dr name = ${phyname}             name of PCP
   *   address - street = ${street}     patient's address
   *   zip = ${zip}                     patient's address
   *   city = ${city}                   home city
   *   state = ${state}                 home state
   *   home phone = ${phoneHome}        patient contact number
   *   work phone = ${phoneWork}        patient contact number
   *   service organization = ${orgid}  medical service org id
   */    
  let {mrn,family,given,gender,birthDay,phoneHome,phoneWork,street,city,
       state,zip,phyid,phyname,orgid} = values;
  let birthMMDDYYYY = (birthDay.length!=10)? birthDay
                                            : birthDay.substring(5,7)+"-"+
                                              birthDay.substring(8,10)+"-"+
                                              birthDay.substring(0,4);
  let result = 
      `{
          "Patient": {
              "text": {
                "status": {
                  "value": "generated"
                },
                "div": "<div> <p>Patient ${given} ${family}, ${gender}, ${birthMMDDYYYY}. MRN: ${mrn}<\/p> <\/div>"
              },
              "identifier": [
                {
                  "use": {
                    "value": "test"
                  },
                  "label": {
                    "value": "MRN"
                  },
                  "system": {
                    "value": "urn:oid:0.0.0.0.0"
                  },
                  "key": {
                    "value": "${mrn}"
                  }
                }
              ],
              "name": [
                {
                  "family": [
                    {
                      "value": "${family}"
                    }
                  ],
                  "given": [
                    {
                      "value": "${given}"
                    }
                  ]
                }
              ],
              "gender": {
                "coding": [
                  {
                    "system": {
                      "value": "http://hl7.org/fhir/v3/AdministrativeGender"
                    },
                    "code": {
                      "value": "${gender}"
                    }
                  }
                ]
              },
              "birthDate": {
                "value": "${birthDay}"
              },
              "telecom": [
                {
                  "system": {
                    "value": "phone"
                  },
                  "value": {
                    "value": "${phoneHome}"
                  },
                  "use": {
                    "value": "home"
                  }
                },
                {
                  "system": {
                    "value": "phone"
                  },
                  "value": {
                    "value": "${phoneWork}"
                  },
                  "use": {
                    "value": "work"
                  }
                }
              ],
              "address": [
                {
                  "line": [
                    {
                      "value": "${street}"
                    }
                  ],
                  "city": {
                    "value": "${city}"
                  },
                  "state": {
                    "value": "${state}"
                  },
                  "zip": {
                    "value": "${zip}"
                  },
                  "country": {
                    "value": "US"
                  }
                }
              ],
              "provider": {
                "type": {
                  "value": "Organization"
                },
                "reference": {
                  "value": "organization/@${orgid}"
                },
                "extension": {
                  "url": {
                    "value": "http://chimes.org/fhir/profile/2014poc/Patient/PCP"
                  },
                  "valueString": {
                    "value": "${phyid}"
                  },
                  "display": {
                    "value": "${phyname}"
                  }
                }
              },
              "active": {
                "value": true
              }
            }        
      }`;
  
  if (trace) {
    try {
        fs.appendFileSync(traceFilename,`//${Date(Date.now()).toString()} makePatientFHIR
        ${result}
        `);
    } catch( err) {
        console.log(`${Date(Date.now()).toString()} ${_N_} makePatientFHIR appendFileSync error: ${err}`);
    };
  }
  return result;
}
  