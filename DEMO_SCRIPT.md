# 90-Second Demo Script — Patch Compliance Reporter

## Timer: 0:00 — 0:10 (Opening — 10 seconds)
**Say:** "Hi, I'm Sagar, Java Developer 2 on Tool-96.
This is Patch Compliance Reporter — an AI-powered web app
that tracks software patch compliance across IT assets."

**Show:** Login page at localhost:3000

---

## Timer: 0:10 — 0:25 (Login + Records List — 15 seconds)
**Say:** "Log in with your credentials — JWT authentication
secures all endpoints."

**Do:** Type username + password → click Sign In

**Say:** "The records list shows all 15 patch records with
severity badges, compliance scores, and status."

**Show:** PatchListPage with the table of records

---

## Timer: 0:25 — 0:40 (Search + Filter — 15 seconds)
**Say:** "Search is debounced — type 'CVE' to filter by patch ID."

**Do:** Type "CVE" in search box — watch it filter

**Say:** "Filter by status — show only Non-Compliant records
that need immediate attention."

**Do:** Select "Non-Compliant" from status dropdown

**Do:** Click "Clear" to reset filters

---

## Timer: 0:40 — 0:55 (Dashboard + Analytics — 15 seconds)
**Say:** "The Dashboard shows 4 KPI cards — total records,
compliance rate, non-compliant count, and average score."

**Do:** Click Dashboard in navbar

**Show:** KPI cards and bar chart

**Say:** "Click View Full Analytics for detailed trend charts."

**Do:** Click "View Full Analytics" button

**Show:** Analytics page with 4 charts briefly

---

## Timer: 0:55 — 1:10 (Create Record + Detail — 15 seconds)
**Say:** "Create a new patch record — all fields validated."

**Do:** Click + New Record → fill in Asset Name + Patch ID → show validation

**Say:** "The detail page shows the full record with compliance
score badge and the AI Analysis panel."

**Do:** Navigate to /patch/1 — show detail page

---

## Timer: 1:10 — 1:25 (AI Panel + Export — 15 seconds)
**Say:** "Click Describe to get an AI-powered analysis
from Groq's LLaMA-3 model."

**Do:** Click Describe button — show loading spinner

**Say:** "Export all records as CSV with one click."

**Do:** Go back to list — click Export CSV button

---

## Timer: 1:25 — 1:30 (Closing — 5 seconds)
**Say:** "Built with Spring Boot, React, PostgreSQL,
Redis, and Groq AI. Thank you."

**Show:** Dashboard overview