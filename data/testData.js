// Copyright (c) 2019, Andrew Rossman.

// Initial data load module for FHIR proj.
// Exports patientIdentity, records.
// The patientIdentity function is coded
// to return "?" values if the document
// structure does not have the expected
// JSON keys and value organization.
function patientIdentity(doc) {
  let p = doc["Patient"], res={};
  if (p === undefined) {
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
    family  = p.name[0].family[0].value;
    given = p.name[0].given[0].value;
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

module.exports.patientIdentity = patientIdentity;

const records = [
  {"ver":"1.0","classifier":"condition","patientId":"112345","revId":1,"doc":{"body":"patient 112345 fhir array of conditions"}},
  {"ver":"1.0","classifier":"condition","patientId":"212345","revId":1,"doc":{"body":"patient 212345 fhir array of conditions"}},
  {"ver":"1.0","classifier":"encounter","patientId":"212345","revId":2,"doc":{"body":"patient 212345 fhir array of encounters"}},
  {"ver":"1.0","classifier":"patient","patientId":"312345","revId":0,"nonSchemaKey":"junk","nonSchemaArrayKey":["more","junk"],"doc":{"body":"patient 312345 fhir description"}},
  {"patientId":"000000","classifier":"encounter","revId":2,"doc":{"body":"updated patient 000000 fhir array of encounters"}},
  {"ver":"1.0","classifier":"encounter","patientId":"112345","revId":2,"doc":{"body":"patient 112345 fhir array of encounters"}},
  {"ver":"1.2","patientId":"0246810","classifier":"medication","revId":1,"doc":{"body":"patient 012345 fhir array of medications"}},
  {"ver":"1.0","classifier":"patient","patientId":"212345","revId":0,"doc":{"body":"patient 212345 fhir description"}},
  {"ver":"1.0","classifier":"patient","patientId":"112345","revId":0,"doc":{"body":"patient 112345 fhir description"}},
  {"patientId":"112345","classifier":"medication","revId":3,"doc":{"body":"updated patient 112345 fhir array of medications"}},
  {"ver":"1.0","patientId":"012345","classifier":"encounter","revId":2,"doc":{"body":"patient 012345 fhir array of encounters"}},
  {"ver":"1.0","classifier":"patient","patientId":"012345","revId":0,"doc":{"body":"patient 012345 fhir description"}},
  {"ver":"1.0","patientId":"654321","classifier":"patient","revId":0,"nonSchemaKey":"junk","nonSchemaArrayKey":["more","junk"],"doc":{"_id":"521ce27743fa345f05e2e42a","Patient":{"text":{"status":{"value":"generated"},"div":"<div><p>Patient Kyle Lefton, M, May 26 2003. MRN: 654321</p></div>"},"identifier":[{"use":{"value":"document retrieval"},"label":{"value":"MRN"},"system":{"value":"urn:oid:1.2.3.4.5"},"key":{"value":"654321"}}],"name":[{"family":[{"value":"Lefton"}],"given":[{"value":"Kyle"}]}],"gender":{"coding":[{"system":{"value":"http://hl7.org/fhir/v3/AdministrativeGender"},"code":{"value":"M"}}]},"birthDate":{"value":"2003-05-26"},"telecom":[{"use":{"value":"work"}},{"system":{"value":"phone"},"value":{"value":"(415)555-1234"},"use":{"value":"home"}}],"address":[{"line":[{"value":"96 Claremount Dr"}],"city":{"value":"Berkeley"},"state":{"value":"CA"},"zip":{"value":"94706"},"country":{"value":"US"}}],"provider":{"type":{"value":"Organization"},"reference":{"value":"organization/@102"},"extension":{"url":{"value":"http://temescalmedicalgroup.com/fhir/profile/2013/Provider"},"valueString":{"value":"56Q-11"},"display":{"value":"Dr. Williams"}}},"active":{"value":true}}}},
  {"ver":"1.0","patientId":"654321","classifier":"medication","revId":0,"doc":{"MedicationPrescription":{"identifier":[{"use":{"value":"temp"},"label":{"value":"urn:oid:1.3.6.1.4.1.26580"},"key":{"value":"ms12345"}}],"dateWritten":{"value":"2012-04-04"},"status":{"value":"active"},"patient":{"type":{"value":"Patient"},"reference":{"value":"patient/@00123456789a"},"display":{"value":"Ginger Bolton"}},"prescriber":{"type":{"value":"Practitioner"},"reference":{"value":"practitioner/@123456"},"display":{"value":"Dr. Candy"}},"encounter":{"type":{"value":"Encounter"},"reference":{"value":"encounter/@3456"},"display":{"value":"Ginger's office visit on April 4, 2012"}},"reasonForPrescribingString":{"value":"condition/@c0987654321"},"medication":{"type":{"value":"Medication"},"reference":{"value":"medication/@sn374047009"},"display":{"value":"Zafirlukast 10mg tablet"}},"dosageInstruction":[{"dosageInstructionsText":{"value":"10mg tablet - one a day"},"timingSchedule":{"event":[{"start":{"value":"2012-04-04"}}]},"route":{"coding":[{"system":{"value":"http://snomed.info/id"},"code":{"value":"260548002"},"display":{"value":"oral"}}]},"doseQuantity":{"value":{"value":"10"},"units":{"value":"mg"},"system":{"value":"http://snomed.info/id"},"code":{"value":"258684004"}}}]}}},
  {"ver":"1.0","patientId":"654321","classifier":"condition","revId":0,"doc":[{"Condition":{"identifier":[{"use":{"value":"temp"},"label":{"value":"Kyle office visit on February 17, 2012"},"key":{"value":"hp5.4.3.1"}}],"text":{"status":{"value":"generated"},"div":"<div>Asthma (Date: 17 February 2012)</div>"},"patientId":{"type":{"value":"Patient"},"reference":{"value":"patient/@654321"},"display":{"value":"Kyle Lefton"}},"encounter":{"type":{"value":"Encounter"},"reference":{"value":"encounter/@8080"},"display":{"value":"Kyle encounter on February 17, 2012"}},"code":{"coding":[{"system":{"value":"http://snomed.info/id"},"code":{"value":"233678006"},"display":{"value":"Childhood asthma"}},{"system":{"value":"ICD9 2013"},"code":{"value":"439.90"},"display":{"value":"Asthma, unspecified type"}},{"system":{"value":"ICD10 2013"},"code":{"value":"J45.909"},"display":{"value":"Unspecified asthma, uncomplicated"}}],"text":{"value":"Childhood asthma - uncomplicated"}},"category":{"coding":[{"system":{"value":"http://hl7.org/fhir/condition-category"},"code":{"value":"diagnosis"},"display":{"value":"Diagnosis"}}]},"status":{"value":"confirmed"},"severity":{"coding":[{"system":{"value":"http://snomed.info/id"},"code":{"value":"255604002"},"display":{"value":"mild"}}]},"onsetDate":{"value":"2012-02-07"}}}]},
  {"ver":"1.0","patientId":"654321","classifier":"encounter","revId":0,"doc":[{"Encounter":{"identifier":[{"use":{"value":"temp"},"label":{"value":"Kyle office visit on February 17, 2012"},"key":{"value":"8080"}}],"date":{"value":"2012-02-17"},"status":{"value":"complete"},"type":[{"coding":[{"system":{"value":"http://snomed.info/id"},"code":{"value":"00000000"},"display":{"value":"Treatment"}}]}],"patientId":{"type":{"value":"Patient"},"reference":{"value":"patient/@654321"},"display":{"value":"Kyle Lefton"}},"participant":[{"practitioner":{"type":{"value":"Practitioner"},"reference":{"value":"practitioner/@123456"},"display":{"value":"Dr. Williams"}}}],"reasonString":{"value":"Sternutation and itchy eyes, wheezing, shortness of breath."},"priority":{"coding":[{"system":{"value":"http://snomed.info/id"},"code":{"value":"17621005"},"display":{"value":"normal"}}]},"serviceProvider":{"type":{"value":"Organization"},"reference":{"value":"organization/@102"}}}},{"Encounter":{"identifier":[{"use":{"value":"temp"},"label":{"value":"Kyle's visit on March 22, 2011"},"key":{"value":"1111"}}],"date":{"value":"2011-03-22"},"status":{"value":"complete"},"type":[{"coding":[{"system":{"value":"http://snomed.info/id"},"code":{"value":"00000000"},"display":{"value":"Routine wellness checkup"}}]}],"patientId":{"type":{"value":"Patient"},"reference":{"value":"patient/@654321"},"display":{"value":"Kyle Lefton"}},"participant":[{"practitioner":{"type":{"value":"Practitioner"},"reference":{"value":"practitioner/@123456"},"display":{"value":"Dr. Williams"}}}],"reasonString":{"value":"Routine checkup.  First time seeing this patient."},"priority":{"coding":[{"system":{"value":"http://snomed.info.id"},"code":{"value":"17621005"},"display":{"value":"normal"}}]},"serviceProvider":{"type":{"value":"Organization"},"reference":{"value":"organization/@102"}}}}]},
];

module.exports.records = records;

