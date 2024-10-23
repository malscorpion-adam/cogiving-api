
const db = require('../config/database');

// Application Services
// Create application draft
exports.createApplicationDraft = (req, res) => {
    const applicationData = req.body;

    // Insert application into donee_application table
    db.query('INSERT INTO donee_application (status) VALUES ("draft")', (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Error creating application' });
        }

        const applicationId = result.insertId;

        // Loop through personalInformation array and insert into related tables
        applicationData.personalInformation.forEach((donee) => {
            const doneeData = {
                application_id: applicationId,
                first_name: donee.firstName,
                last_name: donee.lastName,
                dob: donee.dob,
                gender: donee.gender,
                contact_number: donee.contactNumber,
                email: donee.email,
                national_id: donee.nationalId,
                type: donee.type
            };

            // Insert donee info into donee_info table
            db.query('INSERT INTO donee_info SET ?', doneeData, (err, result) => {
                if (err) throw err;
                const doneeId = result.insertId;

                // Insert addresses into donee_address
                donee.addresses.forEach((address) => {
                    const addressData = {
                        donee_id: doneeId,
                        type: address.type,
                        address_details: `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`
                    };
                    db.query('INSERT INTO donee_address SET ?', addressData, (err) => {
                        if (err) throw err;
                    });
                });

                // Insert income into donee_income
                donee.doneeIncome.forEach((income) => {
                    const incomeData = {
                        donee_id: doneeId,
                        amount: income.amount
                    };
                    db.query('INSERT INTO donee_income SET ?', incomeData, (err) => {
                        if (err) throw err;
                    });
                });

                // Insert debt into donee_dept
                donee.doneeDept.forEach((debt) => {
                    const debtData = {
                        donee_id: doneeId,
                        amount: debt.amount
                    };
                    db.query('INSERT INTO donee_dept SET ?', debtData, (err) => {
                        if (err) throw err;
                    });
                });

                // Insert expense into donee_expense
                donee.doneeExpense.forEach((expense) => {
                    const expenseData = {
                        donee_id: doneeId,
                        amount: expense.amount
                    };
                    db.query('INSERT INTO donee_expense SET ?', expenseData, (err) => {
                        if (err) throw err;
                    });
                });

                // Insert asset into donee_asset
                donee.doneeAsset.forEach((asset) => {
                    const assetData = {
                        donee_id: doneeId,
                        description: asset.description,
                        value: asset.value
                    };
                    db.query('INSERT INTO donee_asset SET ?', assetData, (err) => {
                        if (err) throw err;
                    });
                });

                // Insert health information into donee_health
                const healthData = {
                    donee_id: doneeId,
                    health_status: donee.doneeHealth.healthStatus
                };
                db.query('INSERT INTO donee_health SET ?', healthData, (err) => {
                    if (err) throw err;
                });
            });
        });

        res.status(201).send({ applicationId, status: 'draft' });
    });
};


// Get application by ID
// Get application by ID
exports.getApplicationById = (req, res) => {
    const applicationId = req.params.applicationId;

    // Get the basic application information
    db.query('SELECT * FROM donee_application WHERE application_id = ?', [applicationId], (err, applicationResult) => {
        if (err) return res.status(500).send({ error: 'Error fetching application' });
        if (applicationResult.length === 0) return res.status(404).send({ error: 'Application not found' });

        const application = applicationResult[0];

        // Get the donee info related to this application
        db.query('SELECT * FROM donee_info WHERE application_id = ?', [applicationId], async (err, doneeResults) => {
            if (err) return res.status(500).send({ error: 'Error fetching donee information' });

            const personalInformation = await Promise.all(doneeResults.map(async (donee) => {
                const doneeId = donee.donee_id;

                // Initialize donee object
                const doneeData = {
                    doneeId: donee.donee_id,
                    applicationId: donee.application_id,
                    firstName: donee.first_name,
                    lastName: donee.last_name,
                    dob: donee.dob,
                    gender: donee.gender,
                    contactNumber: donee.contact_number,
                    email: donee.email,
                    nationalId: donee.national_id,
                    type: donee.type,
                    addresses: [],
                    doneeIncome: [],
                    doneeDept: [],
                    doneeExpense: [],
                    doneeAsset: [],
                    doneeHealth: null
                };

                // Fetch related addresses
                doneeData.addresses = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM donee_address WHERE donee_id = ?', [doneeId], (err, addressResults) => {
                        if (err) return reject(err);
                        resolve(addressResults.map(addr => ({
                            addressId: addr.address_id,
                            type: addr.type,
                            street: addr.address_details.split(', ')[0],
                            city: addr.address_details.split(', ')[1],
                            state: addr.address_details.split(', ')[2],
                            postalCode: addr.address_details.split(', ')[3],
                            country: addr.address_details.split(', ')[4]
                        })));
                    });
                });

                // Fetch related income
                doneeData.doneeIncome = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM donee_income WHERE donee_id = ?', [doneeId], (err, incomeResults) => {
                        if (err) return reject(err);
                        resolve(incomeResults.map(income => ({
                            incomeId: income.income_id,
                            amount: income.amount
                        })));
                    });
                });

                // Fetch related debts
                doneeData.doneeDept = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM donee_dept WHERE donee_id = ?', [doneeId], (err, deptResults) => {
                        if (err) return reject(err);
                        resolve(deptResults.map(dept => ({
                            deptId: dept.dept_id,
                            amount: dept.amount
                        })));
                    });
                });

                // Fetch related expenses
                doneeData.doneeExpense = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM donee_expense WHERE donee_id = ?', [doneeId], (err, expenseResults) => {
                        if (err) return reject(err);
                        resolve(expenseResults.map(expense => ({
                            expenseId: expense.expense_id,
                            amount: expense.amount
                        })));
                    });
                });

                // Fetch related assets
                doneeData.doneeAsset = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM donee_asset WHERE donee_id = ?', [doneeId], (err, assetResults) => {
                        if (err) return reject(err);
                        resolve(assetResults.map(asset => ({
                            assetId: asset.asset_id,
                            description: asset.description,
                            value: asset.value
                        })));
                    });
                });

                // Fetch health information
                doneeData.doneeHealth = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM donee_health WHERE donee_id = ?', [doneeId], (err, healthResults) => {
                        if (err) return reject(err);
                        if (healthResults.length > 0) {
                            resolve({
                                healthId: healthResults[0].health_id,
                                healthStatus: healthResults[0].health_status
                            });
                        } else {
                            resolve(null);
                        }
                    });
                });

                return doneeData;
            }));

            // Once all queries have been completed, return the full application
            res.status(200).send({
                applicationId: application.application_id,
                status: application.status,
                submissionDate: application.submission_date,
                personalInformation
            });
        });
    });
};

/*exports.getApplicationById = (req, res) => {
    const applicationId = req.params.applicationId;

    // Get the basic application information
    db.query('SELECT * FROM donee_application WHERE application_id = ?', [applicationId], (err, applicationResult) => {
        if (err) return res.status(500).send({ error: 'Error fetching application' });
        if (applicationResult.length === 0) return res.status(404).send({ error: 'Application not found' });

        const application = applicationResult[0];

        // Get the donee info related to this application
        db.query('SELECT * FROM donee_info WHERE application_id = ?', [applicationId], (err, doneeResults) => {
            if (err) return res.status(500).send({ error: 'Error fetching donee information' });

            const personalInformation = [];

            doneeResults.forEach((donee) => {
                const doneeId = donee.donee_id;

                // Initialize donee object
                const doneeData = {
                    doneeId: donee.donee_id,
                    applicationId: donee.application_id,
                    firstName: donee.first_name,
                    lastName: donee.last_name,
                    dob: donee.dob,
                    gender: donee.gender,
                    contactNumber: donee.contact_number,
                    email: donee.email,
                    nationalId: donee.national_id,
                    type: donee.type,
                    addresses: [],
                    doneeIncome: [],
                    doneeDept: [],
                    doneeExpense: [],
                    doneeAsset: [],
                    doneeHealth: null
                };

                // Fetch related addresses
                db.query('SELECT * FROM donee_address WHERE donee_id = ?', [doneeId], (err, addressResults) => {
                    if (err) throw err;
                    doneeData.addresses = addressResults.map(addr => ({
                        type: addr.type,
                        street: addr.address_details.split(', ')[0],
                        city: addr.address_details.split(', ')[1],
                        state: addr.address_details.split(', ')[2],
                        postalCode: addr.address_details.split(', ')[3],
                        country: addr.address_details.split(', ')[4]
                    }));
                });

                // Fetch related income
                db.query('SELECT * FROM donee_income WHERE donee_id = ?', [doneeId], (err, incomeResults) => {
                    if (err) throw err;
                    doneeData.doneeIncome = incomeResults.map(income => ({
                        incomeId: income.income_id,
                        amount: income.amount
                    }));
                });

                // Fetch related debts
                db.query('SELECT * FROM donee_dept WHERE donee_id = ?', [doneeId], (err, deptResults) => {
                    if (err) throw err;
                    doneeData.doneeDept = deptResults.map(dept => ({
                        deptId: dept.dept_id,
                        amount: dept.amount
                    }));
                });

                // Fetch related expenses
                db.query('SELECT * FROM donee_expense WHERE donee_id = ?', [doneeId], (err, expenseResults) => {
                    if (err) throw err;
                    doneeData.doneeExpense = expenseResults.map(expense => ({
                        expenseId: expense.expense_id,
                        amount: expense.amount
                    }));
                });

                // Fetch related assets
                db.query('SELECT * FROM donee_asset WHERE donee_id = ?', [doneeId], (err, assetResults) => {
                    if (err) throw err;
                    doneeData.doneeAsset = assetResults.map(asset => ({
                        assetId: asset.asset_id,
                        description: asset.description,
                        value: asset.value
                    }));
                });

                // Fetch health information
                db.query('SELECT * FROM donee_health WHERE donee_id = ?', [doneeId], (err, healthResults) => {
                    if (err) throw err;
                    if (healthResults.length > 0) {
                        doneeData.doneeHealth = {
                            healthId: healthResults[0].health_id,
                            healthStatus: healthResults[0].health_status
                        };
                    }
                });

                // Add doneeData to personalInformation array
                personalInformation.push(doneeData);
            });

            // Once all queries have been completed, return the full application
            res.status(200).send({
                applicationId: application.application_id,
                status: application.status,
                submissionDate: application.submission_date,
                personalInformation
            });
        });
    });
};*/

// Update application draft
exports.updateApplicationDraft = (req, res) => {
    const applicationId = req.params.applicationId;
    const applicationData = req.body;

    // Update application in donee_application table
    db.query('UPDATE donee_application SET status = ? WHERE application_id = ?', ['draft', applicationId], (err) => {
        if (err) {
            return res.status(500).send({ error: 'Error updating application' });
        }

        // Loop through personalInformation array to update donee info and related tables
        applicationData.personalInformation.forEach((donee) => {
            const doneeData = {
                first_name: donee.firstName,
                last_name: donee.lastName,
                dob: donee.dob,
                gender: donee.gender,
                contact_number: donee.contactNumber,
                email: donee.email,
                national_id: donee.nationalId,
                type: donee.type
            };

            // Update donee info in donee_info table
            db.query('UPDATE donee_info SET ? WHERE donee_id = ?', [doneeData, donee.doneeId], (err) => {
                if (err) throw err;

                // Update addresses in donee_address table
                donee.addresses.forEach((address) => {
                    if (address.addressId) {
                        // Update existing address
                        const addressData = {
                            type: address.type,
                            address_details: `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`
                        };
                        db.query('UPDATE donee_address SET ? WHERE address_id = ?', [addressData, address.addressId], (err) => {
                            if (err) throw err;
                        });
                    } else {
                        // Insert new address
                        const addressData = {
                            donee_id: donee.doneeId,
                            type: address.type,
                            address_details: `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`
                        };
                        db.query('INSERT INTO donee_address SET ?', addressData, (err) => {
                            if (err) throw err;
                        });
                    }
                });

                // Update incomes in donee_income table
                donee.doneeIncome.forEach((income) => {
                    if (income.incomeId) {
                        // Update existing income
                        const incomeData = { amount: income.amount };
                        db.query('UPDATE donee_income SET ? WHERE income_id = ?', [incomeData, income.incomeId], (err) => {
                            if (err) throw err;
                        });
                    } else {
                        // Insert new income
                        const incomeData = { donee_id: donee.doneeId, amount: income.amount };
                        db.query('INSERT INTO donee_income SET ?', incomeData, (err) => {
                            if (err) throw err;
                        });
                    }
                });

                // Update debts in donee_dept table
                donee.doneeDept.forEach((debt) => {
                    if (debt.deptId) {
                        // Update existing debt
                        const debtData = { amount: debt.amount };
                        db.query('UPDATE donee_dept SET ? WHERE dept_id = ?', [debtData, debt.deptId], (err) => {
                            if (err) throw err;
                        });
                    } else {
                        // Insert new debt
                        const debtData = { donee_id: donee.doneeId, amount: debt.amount };
                        db.query('INSERT INTO donee_dept SET ?', debtData, (err) => {
                            if (err) throw err;
                        });
                    }
                });

                // Update expenses in donee_expense table
                donee.doneeExpense.forEach((expense) => {
                    if (expense.expenseId) {
                        // Update existing expense
                        const expenseData = { amount: expense.amount };
                        db.query('UPDATE donee_expense SET ? WHERE expense_id = ?', [expenseData, expense.expenseId], (err) => {
                            if (err) throw err;
                        });
                    } else {
                        // Insert new expense
                        const expenseData = { donee_id: donee.doneeId, amount: expense.amount };
                        db.query('INSERT INTO donee_expense SET ?', expenseData, (err) => {
                            if (err) throw err;
                        });
                    }
                });

                // Update assets in donee_asset table
                donee.doneeAsset.forEach((asset) => {
                    if (asset.assetId) {
                        // Update existing asset
                        const assetData = { description: asset.description, value: asset.value };
                        db.query('UPDATE donee_asset SET ? WHERE asset_id = ?', [assetData, asset.assetId], (err) => {
                            if (err) throw err;
                        });
                    } else {
                        // Insert new asset
                        const assetData = { donee_id: donee.doneeId, description: asset.description, value: asset.value };
                        db.query('INSERT INTO donee_asset SET ?', assetData, (err) => {
                            if (err) throw err;
                        });
                    }
                });

                // Update health information in donee_health table
                if (donee.doneeHealth.healthId) {
                    const healthData = { health_status: donee.doneeHealth.healthStatus };
                    db.query('UPDATE donee_health SET ? WHERE health_id = ?', [healthData, donee.doneeHealth.healthId], (err) => {
                        if (err) throw err;
                    });
                } else {
                    // Insert new health info
                    const healthData = { donee_id: donee.doneeId, health_status: donee.doneeHealth.healthStatus };
                    db.query('INSERT INTO donee_health SET ?', healthData, (err) => {
                        if (err) throw err;
                    });
                }
            });
        });

        res.status(200).send({ message: 'Application updated successfully' });
    });
};


// Submit application
exports.submitApplication = (req, res) => {
    const applicationId = req.params.applicationId;
    db.query('UPDATE donee_application SET status = "submitted" WHERE application_id = ?', [applicationId], (err) => {
        if (err) throw err;
        res.status(200).send({ message: 'Application submitted successfully' });
    });
};

// Committee Services
// Get applications from central pool
exports.getApplicationsPool = (req, res) => {
    db.query('SELECT * FROM donee_application WHERE status = "submitted"', (err, results) => {
        if (err) throw err;
        res.status(200).send(results);
    });
};

// Claim application for review
exports.claimApplicationForReview = (req, res) => {
    const applicationId = req.params.applicationId;
    const committeeUserId = req.body.committeeUserId;
    db.query('INSERT INTO committee_review SET application_id = ?, committee_user_id = ?', [applicationId, committeeUserId], (err, result) => {
        if (err) throw err;
        res.status(200).send({ message: 'Application claimed for review' });
    });
};

// Approve application
exports.approveApplication = (req, res) => {
    const applicationId = req.params.applicationId;
    const approvalReason = req.body.approvalReason;
    db.query('UPDATE donee_application SET status = "approved" WHERE application_id = ?', [applicationId], (err) => {
        if (err) throw err;
        res.status(200).send({ message: 'Application approved', reason: approvalReason });
    });
};

// Reject application
exports.rejectApplication = (req, res) => {
    const applicationId = req.params.applicationId;
    const rejectionReason = req.body.rejectionReason;
    db.query('UPDATE donee_application SET status = "rejected" WHERE application_id = ?', [applicationId], (err) => {
        if (err) throw err;
        res.status(200).send({ message: 'Application rejected', reason: rejectionReason });
    });
};

// Send back application for corrections
exports.sendBackApplication = (req, res) => {
    const applicationId = req.params.applicationId;
    const correctionNotes = req.body.correctionNotes;
    db.query('UPDATE donee_application SET status = "sent_back" WHERE application_id = ?', [applicationId], (err) => {
        if (err) throw err;
        res.status(200).send({ message: 'Application sent back for corrections', notes: correctionNotes });
    });
};

// Document Services
// Upload document for application
exports.uploadDocument = (req, res) => {
    const documentData = {
        donee_id: req.body.donee_id,
        file_type: req.body.file_type,
        file_path: req.file.path,  // Assumes multer middleware is used for file uploads
        uploaded_by: req.body.uploaded_by
    };
    db.query('INSERT INTO donee_document SET ?', documentData, (err, result) => {
        if (err) throw err;
        res.status(200).send({ message: 'Document uploaded successfully', documentId: result.insertId });
    });
};

// View document by documentId
exports.viewDocument = (req, res) => {
    const documentId = req.params.documentId;
    db.query('SELECT * FROM donee_document WHERE document_id = ?', [documentId], (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
    });
};

// Verification Services
// Run verification on an application
exports.runVerification = (req, res) => {
    const applicationId = req.params.applicationId;
    const verificationResults = {
        idCheck: 'passed',
        incomeCheck: 'failed'
    }; // Mock data for now
    db.query('INSERT INTO verification_list SET ?', { application_id: applicationId, verification_type: 'id_check', status: verificationResults.idCheck }, (err) => {
        if (err) throw err;
        db.query('INSERT INTO verification_list SET ?', { application_id: applicationId, verification_type: 'income', status: verificationResults.incomeCheck }, (err2) => {
            if (err2) throw err2;
            res.status(200).send({ message: 'Verification completed', results: verificationResults });
        });
    });
};

// Authentication Services
exports.login = (req, res) => {
    const { username, password } = req.body;
    // In a real app, you'd validate the password properly, here we assume a valid user for simplicity
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const token = "dummy.jwt.token";  // Mock JWT token
            res.status(200).send({ token });
        } else {
            res.status(401).send({ message: 'Authentication failed' });
        }
    });
};

exports.logout = (req, res) => {
    res.status(200).send({ message: 'Logout successful' });
};
