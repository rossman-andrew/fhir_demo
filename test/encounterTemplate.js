// Copyright (c) 2019, Andrew Rossman.

"use strict"
/**            Factory for FHIR encounter resource
 * v0.1
 * Returns a JSON string giving FHIR description of multiple
 * encounters.  If tracing enabled, the generated JSON is appended
 * to a programmer's log (traceFilename).
 */

const path = require("path");
const _V_ = "v0.1";
const _N_ = `${path.basename(__filename)} ${_V_}`

const trace = true;
const traceFilename = __dirname+"/../test/wtplog.jsonc";      // jsonc -  JSON with comments

let fs = null;
if (trace) {
  fs=require("fs");
}
module.exports.makeEncounterFHIR = makeEncounterFHIR;
function makeEncounterFHIR( values) {
  /*
   *   TEMPLATE SYMBOLICS -- values:
   *  
   *   id = ${encId}                    encounter identifier
   *   date = ${encDate}                date of encounter yyyy-mm-dd
   *   type = ${encCode}                SNOMED code for encounter type:
   *                                        444971000124105 | 1366004
   *   display = ${encType}             SNOMED text for encounter type:
   *                                        Annual wellness checkup | Treatment
   *   mrn = ${mrn}                     medical record number
   *   name = ${pname}                  patient's full name
   *   dr id = ${phyid}                 practitioner's id
   *   dr name = ${phyname}             practitioner's name
   *   reason = ${reason}               practitioner's observation
   *   priority = ${pricode}            SNOMED code for encounter priority:
   *                                        17621005
   *   priority display = ${pritext}    SNOMED text for encounter priority:
   *                                        normal
   *   service organization = ${orgid}  medical service org id
   */    
      let {encId,encDate,encCode,encType,mrn,pname,phyid,
          phyname,reason,pricode,pritext,orgid} = values;
      let result =  
          `{"Encounter": {
                  "identifier": [
                      {
                          "use": {
                              "value": "test"
                          },
                          "label": {
                              "value": "HMRS identifier"
                          },
                          "key": {
                              "value": "${encId}"         
                          }
                      }
                  ],
                  "date": {
                      "value": "${encDate}"               
                  },
                  "status": {
                      "value": "complete"
                  },
                  "type": [
                      {
                          "coding": [
                              {
                                  "system": {
                                      "value": "http://snomed.info/id"
                                  },
                                  "code": {
                                      "value": "${encCode}"        
                                  },
                                  "display": {
                                      "value": "${encType}"       
                                  }
                              }
                          ]
                      }
                  ],
                  "patientId": {
                      "type": {
                          "value": "Patient"
                      },
                      "reference": {
                          "value": "patient/@${mrn}"              
                      },
                      "display": {
                          "value": "${pname}"                     
                      }
                  },
                  "participant": [
                      {
                          "practitioner": {
                              "type": {
                                  "value": "Practitioner"
                              },
                              "reference": {
                                  "value": "practitioner/@${phyid}"   
                              },
                              "display": {
                                  "value": "${phyname}"               
                              }
                          }
                      }
                  ],
                  "reasonString": {
                      "value": "${reason}"                            
                  },
                  "priority": {
                      "coding": [
                          {
                              "system": {
                                  "value": "http://snomed.info/id"
                              },
                              "code": {
                                  "value": "${pricode}"           
                              },
                              "display": {
                                  "value": "${pritext}"           
                              }
                          }
                      ]
                  },
                  "serviceProvider": {     
                      "type": {
                          "value": "Organization"
                      },
                      "reference": {
                          "value": "organization/@${orgid}"       
                      }
                  }
              }
          }`;
  
      if (trace) {
        try {
          fs.appendFileSync(traceFilename,`//${Date(Date.now()).toString()} makeEncounterFHIR
          ${result}
          `);
        } catch( err) {
          console.log(`${Date(Date.now()).toString()} ${_N_} makeEncounterFHIR appendFileSync error: ${err}`);
        };
      }
      return result;      
  }
  