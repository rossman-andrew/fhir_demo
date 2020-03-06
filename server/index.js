// Copyright (c) 2019, Andrew Rossman.

"use strict"
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/index');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());

// Check if a collection with that cdc is in the database
const validateCdcId = (req, res, next) => {
  try {
    db.checkCdc(req.params.cdcId, (docs => {
      if (docs.length === 0) {
        req.noCdc = true;
      }
      next();
    }));
  } catch (err) {
    console.error('Error validating cdc id', err);
  }
};
      
// List patients
app.get('/fire/:cdcId/patient/list.json', validateCdcId, (req, res) => {
  if (req.noCdc) {
    const response = {
      ver: '1.0',
      code: '03',
      text: 'unknown collection or ver missing',
    };
    return res.status(400).json(response);
  }
  try {
    db.listPatients(req.params.cdcId, (patientList) => {
      const response = {
        'ver': '1.0',
        'cdcId': req.params.cdcId,
        'list': patientList,
      };
      res.status(200).json(response);
    });
  } catch (err) {
    console.error('Error retrieving patient list', err);
    const response = {
      ver: '1.0',
      code: '04',
      text: 'resources unavailable',
    };
    res.status(500).json(response);
  }
});

// Get patient summary
app.get('/fire/:cdcId/patient/summary.json', validateCdcId, (req, res) => {
  if (req.noCdc) {
    const response = {
      ver: '1.0',
      code: '05',
      text: 'invalid request: unknown collection/subject id',
    }
    return res.status(400).json(response);
  }
  try {
    db.getPatientSummary(req.params.cdcId, req.query.id, (summary) => {
      if (Object.keys(summary).length === 0 || !summary.patient) {
        const response = {
          ver: '1.0',
          code: '05',
          text: 'invalid request: unknown collection/subject id',
        }
        return res.status(400).json(response);
      } else {
        const response = {
          'ver': '1.0',
          'cdcId': req.params.cdcId,
          'classifier': 'summary',
          'summary': summary,
        };
        res.status(200).json(response);
      }
    })
  } catch (err) {
    res.status(500).json({
      ver: '1.0',
      code: '06',
      text: 'necessary resources unavailable',
    });
  }
});

// Create clinical data collection
app.post('/fire/cdc.json', (req, res) => {
  if (!req.body.cdcId || !req.body.ver || req.body.cdcId.length < 3 || req.body.cdcId.length > 8 || !req.body.cdcId.match(/^[0-9a-zA-Z]+$/)) {
    const response = {
      ver: '1.0',
      code: '01',
      text: 'valid version/cdcId prefix missing', 
    };
    return res.status(400).json(response);
  }
  let load = '';
  if (req.body.load && req.body.load !== '') {
    load = req.body.load;
  }
  db.createCdc(req.body.cdcId, load, (results) => {
    if (!results.success) {
      if (results.code === 11) {
        const response = {
          ver: '1.0',
          code: '11',
          text: 'load parameter invalid', 
        };
        return res.status(400).json(response);
      } else if (results.code === 12) {
        const response = {
          ver: '1.0',
          code: '12',
          text: `invalid load records ${results.badRecs}`, 
        };
        return res.status(400).json(response);
      }
      res.status(500).json({
        ver: '1.0',
        code: '02',
        text: 'resources unavailable',
      });
    } else {
      res.status(200).json({
        'ver': '1.0',
        'cdcId': results.cdcId,
        'timeStamp': results.timeStamp,
      });
    }
  });
});

// Update clinical record
app.put('/fire/:cdcId/patient/:classifier.json', (req, res) => {
  if (!req.params.cdcId || !req.params.classifier || !req.body.subject || !req.body.ver || !req.body.revision || !req.body.doc || Object.keys(req.body.doc).length === 0) {
    return res.status(400).json({
      ver: '1.0',
      code: '07',
      text: 'invalid request: unknown collection/subject/revision',
    });
  }
  db.updateClinicalDoc(req, (code, timeStamp) => {
    if (code === 500) {
      res.status(500).json({
        ver: '1.0',
        code: '08',
        text: 'necessary resources unavailable',
      });
    } else if (code === 400) {
      res.status(400).json({
        ver: '1.0',
        code: '07',
        text: 'invalid request: unknown collection/subject/revision',
      });
    } else {
      res.status(200).json({
        'ver': '1.0',
        'cdcId': req.params.cdcId,
        'classifier': req.params.classifier,
        'subject': req.body.subject,
        'revision': (Number(req.body.revision) + 1).toString(),
        'timeStamp': timeStamp,
      });
    }
  });
});


app.listen(PORT, () => console.log(`FHIR demo server listening on port ${PORT} at ${(new Date()).toISOString()}`));
