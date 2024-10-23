1. Onboarding Stage: Donee and Data Entry (DE) Role
	1.1 Donee Completes Paper Application
		The donee fills out a paper application form containing personal information, financial details, health information, and the required documents (e.g., ID card, home registration).

	1.2 DE (Data Entry) User Inputs Data into the System
		Step 1: DE logs into the system and selects "New Application."
		Step 2: DE enters all the donee's information into the system:
			Personal information (including sibling and children data).
			Financial information (income, debt, expenses, assets).
			Health information and addresses (home, office).
			Uploads documents such as ID card and home registration.

		Step 3: DE can either:
			Save Draft: Saves the application as a draft that is editable by the same DE user later.
			Submit Application: Once everything is filled in, DE submits the application, moving it to the central queue for committee review.

2. Committee Review Stage (including Approval Amount)
	2.1 Accessing the Central Queue
		Step 1: Committee users log in and view the central queue, which contains all submitted applications.
		Step 2: Committee members claim an application by saving a draft. Once claimed, the application becomes "owned" by the committee member.
		Step 3: The application is now ready for detailed review.
	
	2.2 Verifying and Analyzing the Application
		Step 1: The committee member reviews the submitted application:
			Reviews personal, financial, and health information entered by DE.
			Verifies the uploaded documents (ID card, home registration, etc.).
		Step 2: The system performs automatic checks (existing applications, identity, blacklist, fraud, income verification, grade check).
		Step 3: If further verification is needed, the committee can attach additional notes or documents.
		Step 4: The committee decides whether to: Approve the application (with or without an approved amount).
			Reject, Cancel, or Send Back the application to DE for corrections.
	
	2.3 Submitting the Decision
		Step 1: When the committee approves the application, they must input the approved amount (the Zakat amount the donee will receive).
		Step 2: The decision and approved amount are recorded:
			Approve: The application is approved, and the donee will receive the specified amount.
			Reject: The application is rejected due to missing criteria or failed verifications.
			Cancel: The application is canceled.
			Send Back: If more details are needed, the committee sends the application back to DE, who can make further edits and resubmit.
		Step 3: The committee records the decision, notes, and any relevant information regarding verification results.

3. Verification List
	3.1 Automatic Verifications
		Step 1: Once submitted by DE, the system performs automatic checks:
			Existing Application Check: Ensures the donee hasn't already applied.
			ID/PID Verification: Verifies the donee's identity using external databases.
			Blacklist Check: Cross-checks with a blacklist database.
			Income Verification: Verifies the income reported by the donee.
			Fraud Detection: Detects potential fraud in the application.
			Grade Verification: Ensures the donee meets any educational requirements if applicable.
		Step 2: The results of these checks are stored in the verification_list table with statuses such as "pending", "verified", or "failed."

	3.2 Manual Verifications
		Step 1: Committee members can manually verify phone numbers, grade reports, or other details that require human intervention.
		Step 2: The committee updates the verification status in the verification_list table.

4. Approval and Notification Stage
	4.1 Approved Application and Zakat Disbursement
		Step 1: Once an application is approved, the system stores the approved amount and decision.
		Step 2: The approved amount is used to calculate the Zakat disbursement for the donee.
		Step 3: The donee is notified of the decision (approved or rejected) and, if approved, the approved Zakat amount.

Summary:
	1. Application Submission (Onboarding)
		Donee → Paper Form → DE Enters Data → Save Draft / Submit to Central Queue
	2. Committee Review Process
		Committee Claims Application → Verifies Info & Documents → Runs Automatic and Manual Verifications → Decision (Approve / Reject / Cancel / Send Back)
	3. Decision Stage
		Approved: Input the Approved Amount for Zakat disbursement.
		Rejected or Canceled: Provide reasons and notes.
		Sent Back: Returns to DE for further editing and re-submission.
	4. Final Application Status
		Approved Applications: Donee is notified of approval and the approved amount.
		Rejected/Canceled Applications: Donee is notified with reasons.
		Sent Back Applications: DE reopens and edits the application before resubmitting.