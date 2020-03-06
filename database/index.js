// Copyright (c) 2019, Andrew Rossman.

const mongoose = require('mongoose');
const uniqid = require('uniqid');

mongoose.connect('mongodb://localhost/fhir', {useNewUrlParser: true, useCreateIndex: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.once('open', () => console.log('Connection to database established'));

const Schema = mongoose.Schema;
const cdcDocSchema = new Schema({
  cdcId: {
    type: String,
    index: true,
    unique: true,
  },
  timeStamp: String,
  patientIdentityFunc: [{type: String}],
});
const clinicalDocSchema = new Schema({
  cdcId: {
    type: String,
    index: true,
  },
  patientId: {
    type: String,
    index: true,
  },
  classifier: {
    type: String,
    index: true,
  },
  revId: Number,
  doc: Object,
  timeStamp: String,
});

const CdcDoc = mongoose.model('CdcDoc', cdcDocSchema);
const ClinicalDoc = mongoose.model('ClinicalDoc', clinicalDocSchema);

const checkCdc = (cdcId, cb) => {
  CdcDoc.find({cdcId}).limit(1).exec((err, docs) => {
    if (err) {
      throw new Error(err);
    }
    cb(docs);
  });
};

const listPatients = (cdcId, cb) => {
  let patientIdentity = (recordDoc) => null;
  CdcDoc.find({cdcId}, (err, docs) => {
    if (err) {
      throw new Error(err);
    } else {
      if (docs.length > 0 && docs[0].patientIdentityFunc) {
        patientIdentity = new Function(docs[0].patientIdentityFunc[0], docs[0].patientIdentityFunc[1]);
      }
      ClinicalDoc.find({cdcId, classifier: 'patient'}, (err, docs) => {
        if (err) {
          throw new Error(err);
        }
        if (docs.length === 0) {
          cb([]);
        } else {
          cb(docs.map(record => {
            return {
              subject: record.patientId,
              desc: patientIdentity(record.doc),
            };
          }));
        }
      });
    }
  });
};

const getPatientSummary = (cdcId, patientId, cb) => {
  ClinicalDoc.find({cdcId, patientId}, (err, docs) => {
    if (err) {
      return console.error('Either cdc-id or patient id does not exist:', err);
    }
    const summaryObj = {};
    docs.forEach(document => {
      switch(document.classifier) {
        case 'patient':
          summaryObj.patient = {
            classifier: document.classifier,
            subject: document.patientId,
            revision: document.revId.toString(),
            doc: document.doc,
            timeStamp: document.timeStamp,
          }
          break;
        case 'encounter':
          summaryObj.encounters = {
            classifier: document.classifier,
            subject: document.patientId,
            revision: document.revId.toString(),
            doc: document.doc,
            timeStamp: document.timeStamp,
          }
          break;
        case 'condition':
          summaryObj.conditions = {
            classifier: document.classifier,
            subject: document.patientId,
            revision: document.revId.toString(),
            doc: document.doc,
            timeStamp: document.timeStamp,
          }
          break;
        case 'medication':
          summaryObj.medications = {
            classifier: document.classifier,
            subject: document.patientId,
            revision: document.revId.toString(),
            doc: document.doc,
            timeStamp: document.timeStamp,
          }
          break;
        default:
          console.warn(`Unexpected classifier value ${document.classifier} for cdcId ${cdcId}, patient id ${patientId}`);
          return;
      }
    });
    cb(summaryObj);
  });
};

const createCdc = (cdcIdPrefix, loadPath, cb) => {
  // Generate unique cdc-id
  let cdcId = null, result = null, count = 0;
  (async () => {
    do {
      cdcId = cdcIdPrefix.concat('-', uniqid().slice(13));
      result = await CdcDoc.find({cdcId}).limit(1);
      count += 1;
    } while (result.length !== 0 && count < 10);
  })();
  if (count === 10) {
    return cb({
      success: false,
      code: 2,
      badRecs: [],
      timeStamp: null,
    });
  }
  // Check if medical record in the records array from 'load' is well-formed
  const isValidLoadRecord = (doc) => {
    if (!doc.doc) return false;
    let id = false, classifier = false, revId = false;
    for (let key in doc) {
      if (key === 'patientId') {
        if (!id && typeof doc[key] === 'string') {
          id = true;
        } else {
          return false;
        }
      } else if (key === 'classifier') {
        if (!classifier && typeof doc[key] === 'string') {
          classifier = true;
        } else {
          return false;
        }
      } else if (key === 'revId' && typeof doc[key] === 'number') {
        if (!revId) {
          revId = true;
        } else {
          return false;
        }
      }
    }
    return id && classifier && revId;
  };

  let cdcRecords = [], load = {}, patientIdentity = null;
  if (loadPath !== '') {
    try {
      load = require(loadPath);
    } catch (err) {
      return cb({
        success: false,
        code: 11,
        badRecs: [],
        timeStamp: null,
      });
    }
    // Malformed records data in the load parameter
    if (!Array.isArray(load.records)) {
      return cb({
        success: false,
        code: 11,
        badRecs: [],
        timeStamp: null,
      });
    }
    // Missing or incorrect patientIdentity function in the load parameter 
    if (typeof load.patientIdentity !== 'function') {
      return cb({
        success: false,
        code: 11,
        badRecs: [],
        timeStamp: null,
      });
    }
    patientIdentity = load.patientIdentity;
    const badRecs = [];
    let sub = 0;
    cdcRecords = load.records.map(doc => {
      if (!isValidLoadRecord(doc)) {
        badRecs.push(sub);
      } else {
        doc.cdcId = cdcId;
        doc.timeStamp = (new Date()).toISOString();
      }
      sub += 1;
      return doc;
    });
    if (badRecs.length > 0) {
      cb({
        success: false,
        code: 12,
        badRecs: badRecs,
        timeStamp: null,
      });
    }
    if (cdcRecords.length > 0) {
      // load cdc records into collection;
      insertLoad(cdcRecords, (success, response) => {
        if (!success) {
          console.log('Error inserting load', response);
        } else {
          console.log('Inserted docs:', response);
        }
      });
    }
  }

  const newTimeStamp = (new Date()).toISOString();
  const str = patientIdentity ? patientIdentity.toString() : '';
  const parameter = patientIdentity ? str.substring(str.indexOf('(') + 1, str.indexOf(')')) : '';
  const body = patientIdentity ? str.substring(str.indexOf('{') + 1, str.length - 1) : 'return null';
  const cdcRecord = new CdcDoc({cdcId, patientIdentityFunc: [parameter, body], timeStamp: newTimeStamp});
  cdcRecord.save((err, res) => {
    if (err) {
      return cb({
        success: false,
        code: 2,
        badRecs: [],
        timeStamp: null,
      });
    }
    return cb({
        success: true,
        code: null,
        badRecs: [],
        timeStamp: res.timeStamp,
        cdcId,
      });
  });
};

const updateClinicalDoc = (request, cb) => {
  ClinicalDoc.findOneAndReplace({
    cdcId: request.params.cdcId,
    patientId: request.body.subject,
    classifier: request.params.classifier,
    revId: Number(request.body.revision),
  },
  {
    cdcId: request.params.cdcId,
    patientId: request.body.subject,
    classifier: request.params.classifier,
    revId: Number(request.body.revision) + 1,
    doc: request.body.doc,
    timeStamp: (new Date()).toISOString(),
  },
  {new: true},
  (err, doc) => {
    if (err) {
      cb(500)
    } else if (!doc) {
      cb(400);
    } else {
      cb(200, doc.timeStamp);
    }
  });
};

const insertLoad = (docArray, cb) => {
  db.collection("clinicaldocs").insertMany(docArray, (err, docs) => {
    if (err) {
      cb(false, err);
    } else {
      cb(true, docs);
    }
  })
};

module.exports = {
  ClinicalDoc,
  checkCdc,
  listPatients,
  getPatientSummary,
  createCdc,
  updateClinicalDoc,
  insertLoad,
};
