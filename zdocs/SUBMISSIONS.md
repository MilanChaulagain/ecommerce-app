# Forms App — Submission Flow Documentation

This document summarizes the recent changes made to the Forms app to support public submissions, improved validation reporting, file uploads, and frontend payload adjustments.

## Goals
- Allow anonymous/public POST submissions to `/api/submissions/` (while keeping other actions authenticated).
- Return clear validation errors on bad payloads (400) for faster debugging.
- Ensure `FormSubmission` instances are saved reliably and uploaded files are attached to the saved submission.
- Ensure the frontend includes file-field keys in the `data` JSON so required-field validation can detect presence/absence.

## Backend changes

File: `backend/forms_app/views.py`

- `FormSubmissionViewSet.get_permissions()`
  - Returns `AllowAny()` for the `create` action so public submissions are permitted.
  - Other actions continue to require authentication.

- `FormSubmissionViewSet.create()`
  - Uses `serializer.is_valid()` and returns a structured JSON response with `{'message': 'Validation failed', 'errors': ...}` on validation failure (HTTP 400).
  - Uses `serializer.save()` to persist the `FormSubmission` and obtains the created instance.
  - Iterates over `request.FILES` and creates `FormFile` records linked to the created submission.
  - Prints serializer errors to server console for debugging during development.

File: `backend/forms_app/serializers.py`
- `FormSubmissionSerializer.validate()`
  - Ensures that every field in `form_schema.fields_structure` marked `required` is present in the submitted `data` JSON; if missing, returns a non-field error naming the missing field id.

## Frontend changes

File: `frontend/components/form-submissions/FormPreviewTab.tsx`

- When building a `FormData` submission (to support file uploads), file inputs are appended to `FormData` under keys like `file__{fieldId}` or `file__{fieldId}_{idx}`.
- The `data` JSON (appended to the FormData as the `data` field) now includes placeholders for file fields as follows:
  - If a file is present, the `data` entry contains the filename (or an array of filenames for multi files).
  - If no file is selected for a required file field, the `data` entry is set to an empty string (so the backend sees the key and can fail validation appropriately).
- Non-file fields continue to serialize into `data` as before.

File: `frontend/lib/api-client.ts`
- `submissions.submitForm` is used to POST the `FormData` to `/api/submissions/`.

## Endpoint behavior

- `POST /api/submissions/` — Public (anonymous POST allowed).
  - Body should be `FormData` with:
    - `slug`: form slug
    - `data`: JSON string of the non-file data plus file placeholders
    - zero or more file fields with keys `file__{fieldId}` or `file__{fieldId}_{idx}`
  - Response on success: HTTP 201 with `{ "message": "Form submitted successfully", "submission_id": <id> }`.
  - Response on validation failure: HTTP 400 with `{ "message": "Validation failed", "errors": { ... } }`.

- `GET /api/forms/{slug}/submissions/` — Authenticated listing of submissions for the form owner.

## Example submission (FormData)
- `slug`: "abc123"
- `data`: `{"field_1":"Alice","field_2":"alice@example.com","file_photo":"profile.jpg"}` (string)
- `file__file_photo`: binary file data

## Debugging tips
- When you receive a 400 with `"Required field 'field_xxx' is missing"`, check the POST request in the browser DevTools:
  - Confirm the `data` form field is present and includes the missing field key.
  - Confirm file fields in `request.FILES` appear (for file inputs sent via FormData) — server console will show saved files.
- Server prints serializer validation errors to the console for faster diagnosis during development.

## Recommended follow-ups
- Update backend validation to consider `request.FILES` when checking required file-type fields (so server doesn't rely solely on `data` JSON presence).
- Add spam protections (rate-limiting, captcha) for anonymous submissions.
- Add frontend UX to show detailed backend validation errors to users (display `errors` payload fields under form fields).
- Add an integration test for public submission with file upload.

---

If you'd like, I can patch the backend to check for file presence in `request.FILES` for required file fields and/or add a prettier frontend display for backend validation errors. Which would you prefer next?
