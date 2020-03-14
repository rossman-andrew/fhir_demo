// Copyright (c) 2019, Andrew Rossman.

"use strict"
const path = require("path");
const _V_ = "v0.1";
const _N_ = `${path.basename(__filename)} ${_V_}`;

let {initialData, makeMedicalRecords} = require("./initialData.js");

/**
 * Return patient identification attributes based on the
 * FHIR resource in a patient description medical record.
 * 
 * @param fhir 
 */
function patientIdentity( fhir) {
   let p = fhir["Patient"], res={};
   if (p===undefined) {
     res.mrn="?";
     res.fullName="?";
     res.gender="?";
     return res
   }
   try {
     res.mrn = p.identifier[0].key.value;
   } catch(err) {
     res.mrn = "?";
   }
   try {
     let family  = p.name[0].family[0].value;
     let given = p.name[0].given[0].value;
     res.fullName = given+" "+family;
   } catch(err) {
     res.fullName = "?"
   }
   try {
     res.gender = p.gender.coding[0].code.value;
   } catch(err) {
     res.gender = "?"
   }
   return res
 }
 
 let records = makeMedicalRecords( initialData);   // null iff makeMedicalRecords fails 
 if (!records) records = [];
 let n = records.length;
 module.exports.patientIdentity = patientIdentity;
 module.exports.records = records;
 console.log(`${Date(Date.now()).toString()} ${_N_} exporting ${n} records.`);
