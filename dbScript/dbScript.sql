
-- Table: users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('DE', 'Committee', 'Admin') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Table: user_roles
CREATE TABLE user_roles (
    user_role_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    role ENUM('DE', 'Committee', 'Admin') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table: donee_application_reason
CREATE TABLE donee_application_reason (
    reason_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

-- Table: donee_application
CREATE TABLE donee_application (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('draft', 'submitted', 'approved', 'rejected', 'cancelled') DEFAULT 'draft',
    reason_id INT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reason_id) REFERENCES donee_application_reason(reason_id)
);

-- Table: donee_info
CREATE TABLE donee_info (
    donee_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    dob DATE,
    gender VARCHAR(10),
    relationship_to_donee VARCHAR(255),
    type ENUM('donee', 'sibling', 'child') DEFAULT 'donee',
    FOREIGN KEY (application_id) REFERENCES donee_application(application_id)
);
ALTER TABLE donee_info ADD COLUMN contact_number VARCHAR(15);
ALTER TABLE donee_info ADD COLUMN national_id VARCHAR(20);
ALTER TABLE donee_info ADD COLUMN email VARCHAR(255);


-- Table: donee_income
CREATE TABLE donee_income (
    income_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    amount DECIMAL(15, 2),
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: donee_dept
CREATE TABLE donee_dept (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    amount DECIMAL(15, 2),
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: donee_expense
CREATE TABLE donee_expense (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    amount DECIMAL(15, 2),
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: donee_asset
CREATE TABLE donee_asset (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    description VARCHAR(255),
    value DECIMAL(15, 2),
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: donee_health
CREATE TABLE donee_health (
    health_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    health_status TEXT,
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: donee_address
CREATE TABLE donee_address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    type ENUM('home', 'office') DEFAULT 'home',
    address_details TEXT NOT NULL,
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: donee_document
CREATE TABLE donee_document (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    donee_id INT,
    file_type ENUM('id_card', 'home_registration', 'transcript', 'other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT,  -- User ID (DE or Committee)
    document_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (donee_id) REFERENCES donee_info(donee_id)
);

-- Table: verification_list
CREATE TABLE verification_list (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    verification_type ENUM('existing_app', 'id_check', 'income', 'blacklist', 'fraud', 'grade') NOT NULL,
    status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
    notes TEXT,
    verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES donee_application(application_id)
);

-- Table: committee_review
CREATE TABLE committee_review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    committee_user_id INT,  -- Committee member who reviewed the application
    decision ENUM('approve', 'reject', 'cancel', 'send_back') NOT NULL,
    reason TEXT,
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES donee_application(application_id),
    FOREIGN KEY (committee_user_id) REFERENCES users(user_id)
);

-- Table: audit_logs
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
