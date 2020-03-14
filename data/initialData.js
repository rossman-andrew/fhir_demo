// Copyright (c) 2019, Andrew Rossman.

"use strict"
/**
 *     initialData.js    v0.1
 * 
 * 
 *     Creates an array of objects providing values for initializing CDCs:
 *     [ {values for 1 medical record},{values for 1 medical record}, ... ]
 * 
 *     Keys: ver (service version), pid (patient id), rev (revision id), classifier,
 *           fhir (values for the record's FHIR resource).
 * 
 *     The fhir values may be
 *     (1) a single object -- for patient records,
 *     (2) an array of objects -- for encounter/condition/medication records.
 * 
 *     Each record type has a factory function for the included FHIR resource
 *     (makePatientFHIR, makeEncounterFHIR, etc) that uses a template for creating
 *     the resource.  The factory's comments explain the variables which populate
 *     the template.  Each template and the corresonding factory function 
 *     are in the xxxxTemplate.js module where xxxx is the classifier
 *     for that kind of FHIR resource. 
 */
const path = require('path');
const _V_ = "v0.1";
const _N_ = `${path.basename(__filename)} ${_V_}`

const trace = false;
const traceFilename = __dirname+"/../test/wtplog.jsonc";   // jsonc -  JSON with comments
let fs = null;
if (trace) {
  fs=require("fs");
}

// Use initialData to set values for template parameters.
// Each entry in initialData is an object holding values for the
// template corresponding to the classifier property.

const initialData = [
   //-----------------------------------------------------------------
   // Patient: Susan Low   patientId: X600000
   //-----------------------------------------------------------------
   // For encounter record with 2 visits
{ver:"1.0",pid:"X600000",rev:1,classifier:"encounter",
 fhir:[{encId:"5483",encDate:"2011-05-21",encCode:"444971000124105",
        encType:"Annual wellness checkup",mrn:"600000",pname:"Susan Lo",
        phyid:"56Q-10",phyname:"Dr. Haffner",pricode:"17621005",
        pritext:"normal",orgid: "102",
        reason:"First visit - routine checkup"
       },
       {encId:"6512",encDate:"2012-12-08",encCode:"444971000124105",
        encType:"Annual wellness checkup",mrn:"600000",pname:"Susan Lo",
        phyid:"56Q-10",phyname:"Dr. Haffner",pricode:"17621005",
        pritext:"normal", orgid: "102",
        reason:"Routine checkup"
       }
      ] 
},
   // For patient description record
{ver:"1.0",pid:"X600000",rev:0,classifier:"patient",
 fhir:{mrn:"60000",family:"Lo",given:"Susan",gender:"F",
       birthDay:"2008-10-22",phyid:"56Q-10",phyname:"Dr. Haffner",
       street:"111 Muenster Ave.",zip:"30122",city:"San Marino",
       state:"CA",phoneHome:"(992)999-1234",phoneWork:"(999)999-1234",
       orgid: "102"
      }
},
   //-----------------------------------------------------------------
   // Patient: Kyle Lefton    patientId: X607981
   //-----------------------------------------------------------------
   // For encounter record with 2 visits
{ver:"1.0",pid:"X607981",rev:0,classifier:"encounter",
 fhir:[{encId:"4901",encDate:"2011-05-21",encCode:"444971000124105",
        encType:"Annual wellness checkup",mrn:"607981",pname:"Kyle Lefton",
        phyid:"56Q-10",phyname:"Dr. Haffner",pricode:"17621005",
        pritext:"normal",orgid: "102",
        reason:"First visit - routine checkup"
       },
       {encId:"6512",encDate:"2012-12-08",encCode:"444971000124105",
        encType:"Annual wellness checkup",mrn:"607981",pname:"Kyle Lefton",
        phyid:"56Q-10",phyname:"Dr. Haffner",pricode:"17621005",
        pritext:"normal", orgid: "102",
        reason:"Routine checkup"
       }
      ]
}, // For patient description record
{ver:"1.0",pid:"X607981",rev:0,classifier:"patient",
 fhir:{mrn:"607981",family:"Lefton",given:"Kyle",gender:"M",
       birthDay:"2008-10-22",phyid:"56Q-10",phyname:"Dr. Haffner",
       street:"111 Muenster Ave.",zip:"30122",city:"San Marino",
       state:"CA",phoneHome:"(992)999-1234",phoneWork:"(999)999-1234",
       orgid: "102"
       }
}       
];

//=====================================================================
//   Don't modify the lines below when changing the
//   parameter values array.
//=====================================================================         
const {makePatientFHIR} = require("./patientTemplate.js");
const {makeEncounterFHIR} = require("./encounterTemplate.js");
const {makeConditionFHIR} = require("./conditionTemplate.js");
const {makeMedicationFHIR} = require("./medicationTemplate.js");

// Allow this module's user to control creation of the records.
module.exports.initialData = initialData;
module.exports.makeMedicalRecords = makeMedicalRecords;   

 /**
  * Create the records array from values
  * provided in an array like initialData.
  * Returns null if template logic throws
  * an exception.
  */
function makeMedicalRecords( keyValues) {
   let result = [];
   let recNbr = 0;
   let maker = {patient: makePatientFHIR,
                encounter: makeEncounterFHIR,
                condition: makeConditionFHIR,
                medication: makeMedicationFHIR
               };
   try {
       result = keyValues.map( makeOneRecord);
   } catch (err) {
       console.log(
       `${Date(Date.now()).toString()} ${_N_} makeRecords - record #: ${recNbr} keyValues: ${JSON.stringify(keyValues[recNbr])} error: ${err}`
       );
       result = null;
   };
   return result;

   /**
    * @returns Javascript object that represents one medical record.
    * @param {object} recValues
    * @param {number} ndx
    */
   function makeOneRecord( recValues, ndx) {
       recNbr = ndx;
       let rec = {};
       let items = null;
       let makeFHIR = null;
       rec.ver = recValues.ver;
       rec.patientId = recValues.pid;
       rec.classifier = recValues.classifier;
       rec.revId = recValues.rev;
       rec.doc = null;

       let values = recValues.fhir;
       let str = "";
       makeFHIR = maker[rec.classifier];
       if (Array.isArray(values)) {
         items = values.map(makeFHIR);
         str = "["+items.join()+"]";
       } else {
         str = makeFHIR(values);
       }

       if (trace) {
         try {
           fs.appendFileSync(traceFilename,`// makeOneRecord for ${JSON.stringify(rec)}\n//<<doc>>\n${str}\n`);
         } catch( err) {
           console.log(`${Date(Date.now()).toString()} ${_N_} makeOneRecord ${traceFilename} - appendFileSync error:\n${err}`);
         };
       }
       
       rec.doc = JSON.parse(str);
       return rec;
   }
};
