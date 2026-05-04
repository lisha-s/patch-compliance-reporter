# Rehearsal Checklist — Java Developer 2
# Demo Day: Friday 9 May 2026

---

## Pre-Demo Setup (15 mins before)

- [ ] Open Docker Desktop — green icon in taskbar
- [ ] Run: `docker-compose up postgres redis -d`
- [ ] Run backend Spring Boot
- [ ] Run: `cd frontend && npm run dev`
- [ ] Open browser → http://localhost:3000
- [ ] Login with username: sagar / password: password123
- [ ] Verify 15 records showing in list
- [ ] Verify Dashboard KPI cards showing numbers
- [ ] Verify Analytics charts loading
- [ ] Open slides: http://localhost:3000/slides.html
- [ ] Browser fullscreen (F11)
- [ ] DevTools closed
- [ ] Phone on silent

---

## My Demo Section (1:30 min target)

### What I Show:
1. **Records List** (30 sec) — 15 records, badges, search filter
2. **Dashboard** (20 sec) — KPI cards, bar chart
3. **Analytics** (20 sec) — 4 charts, period selector
4. **Create Form** (15 sec) — validation, form fields
5. **Detail + AI** (15 sec) — score badge, AI panel

---

## 5 Key Questions I Must Answer Without Notes

### Q1: What did YOU build?
**Answer:** "I built the complete React frontend — all 6 pages,
AuthContext with JWT, responsive design for mobile/tablet/desktop,
Recharts analytics dashboard, debounced search with filters,
create/edit forms with validation, and the AI panel.
On the backend I built the Flyway migrations V1/V2/V3,
PatchRecord entity and repository, full service layer with CSV export,
Swagger documentation, and Spring AOP audit logging."

### Q2: How does the login work?
**Answer:** "User enters credentials → frontend calls POST /api/auth/login →
Spring Boot validates and returns a JWT token signed with HS256 →
Frontend stores token in localStorage via AuthContext →
Every subsequent API call sends the token as Bearer header →
If token is missing or expired, backend returns 401 →
Frontend's Axios interceptor catches 401 and redirects to login."

### Q3: What is the most complex thing you built?
**Answer:** "The AuthContext with ProtectedRoute system.
It wraps the entire app, reads the JWT from localStorage on startup,
decodes the payload to get the username and role,
and provides isAuthenticated, login, and logout functions
to every component through React Context API.
ProtectedRoute uses this to guard all pages — if not authenticated,
it redirects to login."

### Q4: How is the database structured?
**Answer:** "Three tables — patch_records for the main data with
all fields like asset_name, severity, status and compliance_score,
users for JWT authentication with BCrypt hashed passwords,
and audit_log which records every create/update/delete via
a PostgreSQL trigger I wrote in V2 migration.
V3 migration added 7 composite indexes including a full-text
GIN index on asset_name and patch_title for fast search."

### Q5: What would you improve with more time?
**Answer:** "Three things — first, implement real JWT with jjwt library
instead of the demo stub. Second, add WebSocket notifications so users
get real-time alerts when a patch deadline is approaching.
Third, add CSV import so security teams can bulk-upload patch records
from existing spreadsheets instead of creating them one by one."

---

## Backup Plan — If Backend Fails

If Spring Boot crashes during demo:
1. Don't panic — say "Let me show the frontend while the backend restarts"
2. Press F12 → Console → paste the test token
3. Demo data will show from patchService.js fallback
4. All frontend features still work with demo data
5. Say "In production this connects to a live PostgreSQL database"

---

## Time Practice Log

| Run | Time | Issues Found |
|---|---|---|
| Run 1 | _____ | ____________ |
| Run 2 | _____ | ____________ |
| Run 3 | _____ | ____________ |