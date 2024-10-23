
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Applications
router.post('/', applicationController.createApplicationDraft);
router.get('/:applicationId', applicationController.getApplicationById);
router.put('/:applicationId', applicationController.updateApplicationDraft);
router.post('/:applicationId/submit', applicationController.submitApplication);

// Committee Services
router.get('/pool', applicationController.getApplicationsPool);
router.post('/:applicationId/claim', applicationController.claimApplicationForReview);
router.post('/:applicationId/approve', applicationController.approveApplication);
router.post('/:applicationId/reject', applicationController.rejectApplication);
router.post('/:applicationId/send-back', applicationController.sendBackApplication);

// Document Services
router.post('/documents/upload', applicationController.uploadDocument);
router.get('/documents/:documentId', applicationController.viewDocument);

// Verification Services
router.post('/verifications/:applicationId/run', applicationController.runVerification);

// Authentication Services
router.post('/auth/login', applicationController.login);
router.post('/auth/logout', applicationController.logout);

module.exports = router;
