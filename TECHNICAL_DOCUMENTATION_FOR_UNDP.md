# Youth Centers Accessibility Assessment Tool
## Technical Documentation for Non-Technical Readers

**Document Purpose:** This guide explains how the Youth Centers Accessibility Assessment Tool was built, how it works, and what services power it. Written for readers without programming knowledge.

**Last Updated:** February 2026

---

## Table of Contents

1. [What Is This Tool?](#1-what-is-this-tool)
2. [How Was It Built?](#2-how-was-it-built)
3. [Website Structure](#3-website-structure)
4. [How Does It Work?](#4-how-does-it-work)
5. [External Services We Use](#5-external-services-we-use)
6. [About Vercel Hosting](#6-about-vercel-hosting)
7. [Costs and Limitations](#7-costs-and-limitations)
8. [Maintenance and Updates](#8-maintenance-and-updates)

---

## 1. What Is This Tool?

The **Youth Centers Accessibility Assessment Tool** is a web-based questionnaire that helps Ukrainian youth centers evaluate how accessible they are to people with different needs, including:

- People in wheelchairs
- People with visual impairments
- People with hearing impairments
- Parents with strollers
- People with limited mobility
- And 12 other user categories (17 total)

After completing approximately 100 questions across 4 sections, the tool:
- Calculates accessibility scores for each user category
- Provides specific recommendations for improvement
- Generates PDF reports that can be downloaded
- **Automatically sends results to the UNDP administrator via email**

---

## 2. How Was It Built?

### Technologies Used (Simplified)

| Technology | What It Does | Analogy |
|------------|--------------|---------|
| **React** | The main building material for the website | Like LEGO bricks for websites |
| **Vite** | Helps developers work faster | Like a power tool for builders |
| **JavaScript** | The programming language used | The language the computer understands |
| **CSS** | Makes the website look nice | Like paint and decoration |
| **html2pdf.js** | Creates PDF documents | Like a virtual printer |

### How These Work Together

Think of building a website like building a house:

1. **React** provides the structure (walls, rooms, doors)
2. **CSS** provides the appearance (paint colors, furniture)
3. **JavaScript** provides the functionality (electricity, plumbing)
4. **Vite** helps the builders work efficiently
5. **html2pdf.js** creates paper copies of what's on screen

All the code is stored in a folder structure on a computer, and when someone visits the website, their browser downloads this code and displays it.

---

## 3. Website Structure

### User Journey (Step by Step)

```
START
  |
  v
[1. Landing Page] --> Welcome screen with UNDP logo
  |                   "Start Assessment" button
  v
[2. Instructions] --> Explains how assessment works
  |                   ~100 questions, 4 sections
  |                   Must click "I Understand"
  v
[3. Mode Selection] --> Choose your experience:
  |                     - With explanations (recommended)
  |                     - Without explanations (faster)
  v
[4. Assessment] --> Answer questions section by section
  |                 Progress saved automatically
  |                 Can pause and return later
  v
[5. Results] --> See your scores and recommendations
  |              Download PDF reports
  |              Reports sent to UNDP automatically
  v
END
```

### The Four Assessment Sections

| Section | Content | Purpose |
|---------|---------|---------|
| **Section 1** | General Information | Basic data about the youth center (name, location, year established) |
| **Section 2** | Program Activities | What services the center offers, visitor statistics |
| **Section 3** | Accessibility Assessment | Physical accessibility (ramps, doors, signage, facilities) |
| **Section 4** | Additional Assessment | Communication, training, policies |

### Question Types

The tool uses different types of questions depending on what information is needed:

- **Text fields** — For typing answers (center name, address)
- **Dropdowns** — Select one option from a list (oblast selection)
- **Radio buttons** — Choose one option (Yes / Partially / No)
- **Checkboxes** — Select multiple options (which services are offered)
- **Matrix questions** — Grid of options (rate multiple items)

---

## 4. How Does It Work?

### The Complete Process Flow

```
USER'S BROWSER                    VERCEL SERVERS              EMAIL SERVICE
     |                                  |                          |
     |  1. User completes assessment    |                          |
     |                                  |                          |
     |  2. Results page loads           |                          |
     |     - Scores calculated          |                          |
     |     - Recommendations generated  |                          |
     |                                  |                          |
     |  3. AUTO: Generate PDF reports   |                          |
     |     (in user's browser)          |                          |
     |                                  |                          |
     |  4. AUTO: Send to server         |                          |
     |--------------------------------->|                          |
     |                                  |                          |
     |                                  |  5. Send email with      |
     |                                  |     PDF attachments      |
     |                                  |------------------------->|
     |                                  |                          |
     |                                  |                          |  6. Email delivered
     |                                  |                          |     to admin inbox
     |                                  |                          |
     |  7. Show success message         |                          |
     |<---------------------------------|                          |
     |                                  |                          |
     |  8. User can also download       |                          |
     |     PDFs manually                |                          |
```

### Step-by-Step Explanation

1. **User completes the assessment** — All answers are saved in the browser's memory (called "localStorage"). This means if you close the browser accidentally, your progress is saved.

2. **Results page loads** — The website calculates scores and generates recommendations based on the answers.

3. **Automatic PDF Generation** — The website creates two PDF documents in the user's browser:
   - **Results Report** (~500KB-1MB) — Scores and recommendations (for the youth center)
   - **Full Answers Report** (~1-1.5MB) — Complete responses (for UNDP administration)

4. **Automatic Email Sending** — Within seconds of loading the results page, the system automatically:
   - Sends PDF reports to the Vercel server
   - Server forwards them to the email service (Resend)
   - Email with PDF attachments is delivered to the administrator

5. **Success Confirmation** — User sees a green message: "Результати автоматично відправлено адміністратору на email!"

6. **Manual Options** — User can also:
   - Download PDFs directly to their computer
   - Manually resend email if needed

### Data Storage

| What | Where | How Long |
|------|-------|----------|
| User's answers during assessment | Browser's local storage | Until browser data is cleared |
| Completed PDF reports | **Email attachments** | Forever (in admin's inbox) |
| Email notifications | Resend service logs | According to their policy |

**Important:** PDF files are sent as email attachments and stored in the administrator's email inbox. No cloud storage is used, so there are no storage limits or expiration dates. Files remain accessible as long as the email is not deleted.

---

## 5. External Services We Use

### Service Overview

```
+------------------+                    +------------------+
|                  |                    |                  |
|   VERCEL         |------------------->|    RESEND        |
|   (Hosting)      |                    |    (Email)       |
|                  |                    |                  |
|  Runs the        |                    |  Sends email     |
|  website         |                    |  with PDF        |
|                  |                    |  attachments     |
+------------------+                    +------------------+
```

### 1. Vercel (Website Hosting)

**What it is:** Vercel is a cloud platform that hosts (runs) our website. Think of it like renting space in a shopping mall for your store — Vercel provides the building, electricity, and security, while we provide the store contents.

**Why we chose it:**
- Free tier available for non-commercial projects
- Automatic updates when we change the code
- Fast loading speeds worldwide
- No server management needed

**What Vercel does for us:**
- Hosts the website (makes it accessible at the URL)
- Runs "serverless functions" (small programs that send emails)
- Automatically deploys updates when code changes

### 2. Resend (Email Service)

**What it is:** A service that sends emails programmatically (automatically from our website).

**How we use it:** After each completed assessment, Resend sends an email to the UNDP administrator with:
- The center's name
- Date of completion
- **PDF reports attached directly to the email** (no external links needed)

**Why we chose it:**
- Free tier includes 3,000 emails/month (more than enough)
- Supports file attachments up to 40 MB per email
- Files stay in email inbox forever (no expiration)
- Simple to set up
- Reliable delivery (~99% success rate)

---

## 6. About Vercel Hosting

### What is Vercel?

Vercel is a cloud platform company founded in 2015 (originally called "Zeit"). It specializes in hosting websites, especially those built with modern technologies like React.

**Analogy:** If your website is a TV show, Vercel is the TV network that broadcasts it to viewers around the world.

### How Vercel Works for Us

```
DEVELOPER'S COMPUTER              GITHUB                    VERCEL
        |                            |                         |
        |  1. Write code             |                         |
        |                            |                         |
        |  2. Upload code            |                         |
        |--------------------------->|                         |
        |                            |                         |
        |                            |  3. Vercel detects      |
        |                            |     new code            |
        |                            |------------------------>|
        |                            |                         |
        |                            |  4. Vercel builds       |
        |                            |     the website         |
        |                            |                         |
        |                            |  5. Website is live     |
        |                            |     worldwide           |
        |                            |                         |
```

### Automatic Updates

One of Vercel's best features: whenever we update the code and push it to GitHub (a code storage service), Vercel automatically:

1. Detects the changes
2. Rebuilds the website
3. Publishes the new version

This happens in about 1-2 minutes, with zero downtime (users never see the website "under construction").

### Where is the Website Actually Running?

Vercel has servers in multiple locations worldwide (called "edge network"). When a user in Ukraine visits the website, they connect to the nearest server, making the website load faster.

---

## 7. Costs and Limitations

### Current Plan: Vercel Hobby (Free)

| Feature | Limit | Our Usage |
|---------|-------|-----------|
| **Bandwidth (Fast Data Transfer)** | 100 GB/month | Low (text-based website) |
| **Serverless Functions** | 1,000,000 invocations/month | ~1 call per assessment |
| **Build Minutes** | 6,000/month | ~1-2 min per update |
| **Edge Requests** | 1,000,000/month | Low usage |
| **Team Members** | 1 person only | Single developer |
| **Commercial Use** | NOT allowed | Compliant (non-profit tool) |

### Vercel Pro Plan ($20/user/month)

If we need to upgrade (for team collaboration or higher limits). Note: each team member costs $20/month:

| Feature | Pro Plan Limit |
|---------|----------------|
| **Bandwidth** | 1 TB/month (10x more) |
| **Team Members** | Unlimited |
| **Commercial Use** | Allowed |
| **Support** | Priority support |
| **Analytics** | Enhanced analytics |

### Resend Email Costs

| Plan | Cost | Emails/Month | Daily Limit |
|------|------|--------------|-------------|
| **Free** | $0 | 3,000 | 100/day |
| **Pro** | $20/month | 50,000 | Higher |
| **Scale** | $90/month | 100,000 | Higher |

**Our usage:** Well within the free tier (expecting ~50-100 assessments/month = ~1-2 emails/day average)

### Total Monthly Cost Estimate

| Scenario | Vercel Hosting | Resend Email | Total |
|----------|----------------|--------------|-------|
| **Hobby Plan** (up to 3,000 assessments/month) | $0 | $0 | **$0** |
| **Pro Plan** (if team features needed) | $20/user | $0 | **$20+** |

**Current Status:** We are using the Hobby (free) plan. Total cost: **$0/month**

**Capacity:** Up to 3,000 assessments per month (100 per day) on the free plan.

### Important Limitations

#### Hobby Plan Restrictions

1. **Single User Only** — Only one person can access the Vercel dashboard to manage the project
2. **No Commercial Use** — Cannot be used for revenue-generating activities (non-profit use is allowed)
3. **No Git Organization** — Cannot connect to organizational GitHub accounts
4. **No Team Features** — No collaboration, shared access, or team analytics
5. **Usage Limits** — If exceeded, service pauses until next 30-day cycle (no charges, just wait)

#### Request Size Limit

Vercel has a **4.5 MB limit** for data sent to serverless functions. Our PDFs are optimized to stay within this limit:
- Results PDF: ~500KB-1MB
- Full Answers PDF: ~1-1.5MB
- Total: ~1.5-2.5MB (well under 4.5MB limit)

#### When to Upgrade

Consider upgrading to Pro ($20/month) if:
- Multiple people need to manage the website
- The project becomes commercially funded
- You need enhanced analytics
- You need priority support

---

## 8. Maintenance and Updates

### Who Manages What

| Component | Managed By | Required Skills | Frequency |
|-----------|------------|-----------------|-----------|
| Website code | Developer | Programming (React, JavaScript) | As needed |
| Vercel hosting | Automatic | None (self-service) | — |
| Questions/content | Content editor | Edit JSON file | As needed |
| Email notifications | Automatic | None | — |
| PDF reports | Automatic (sent as email attachments) | None | — |

### How to Update Questions

Questions are stored in a file called `questions.json`. To add, modify, or remove questions:

1. Open the file in a text editor
2. Find the question you want to change
3. Make your edits following the existing format
4. Save the file
5. Upload to GitHub
6. Vercel automatically updates the live website

**Note:** This requires basic understanding of JSON format or assistance from a developer.

### Backup and Recovery

| What | Backup Method | Recovery Time |
|------|---------------|---------------|
| Website code | GitHub stores all versions | Instant (revert to previous version) |
| PDF reports | Administrator's email inbox | Always available (unless email deleted) |
| User answers | Browser only | Not recoverable |

### Security Measures

- All connections use HTTPS (encrypted)
- No passwords stored in the code
- Sensitive credentials stored in Vercel's secure environment variables
- Regular security updates from Vercel
- Email API key stored securely (not visible in code)

### Environment Variables

The following secret values are stored securely in Vercel (not in the code):

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Authentication for email service |
| `ADMIN_EMAIL` | Email address to receive assessment results |

These can be updated in the Vercel dashboard under Project Settings → Environment Variables.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface — a way for different software to communicate |
| **Browser** | Software to access websites (Chrome, Firefox, Safari, Edge) |
| **Cloud** | Remote servers accessed over the internet |
| **Deploy** | Publish a website to make it accessible online |
| **Git/GitHub** | A system for tracking code changes and collaboration |
| **Hosting** | Providing server space for a website to run |
| **JSON** | JavaScript Object Notation — a format for storing data |
| **localStorage** | Browser storage that persists data locally |
| **PDF** | Portable Document Format — a document format for printing and sharing |
| **React** | A popular tool for building websites |
| **Server** | A computer that runs 24/7 to serve websites |
| **Serverless** | Code that runs without managing servers (Vercel handles it) |
| **sessionStorage** | Browser storage that clears when the tab closes |

---

## Appendix B: Quick Reference Links

### Service Dashboards

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Resend Dashboard:** https://resend.com/overview
- **GitHub Repository:** https://github.com/ZVORRO/youth-centers-tool

### Pricing Pages

- **Vercel Pricing:** https://vercel.com/pricing
- **Resend Pricing:** https://resend.com/pricing

### Documentation

- **Vercel Limits:** https://vercel.com/docs/limits
- **Vercel Hobby Plan:** https://vercel.com/docs/plans/hobby
- **Vercel Pro Plan:** https://vercel.com/docs/plans/pro-plan
- **Resend Limits:** https://resend.com/docs/knowledge-base/account-quotas-and-limits

---

## Appendix C: Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Email not received | Email in spam folder | Check spam/junk folder |
| Email not received | Resend daily limit reached | Wait until next day (resets at midnight UTC) |
| PDF download fails | Browser blocking pop-ups | Allow pop-ups for this site |
| Assessment not saving | localStorage full/disabled | Clear browser data or use different browser |
| Website not loading | Vercel outage (rare) | Check status.vercel.com |

### Checking Email Delivery

1. Log in to Resend dashboard (https://resend.com)
2. Go to "Emails" section
3. See all sent emails with delivery status
4. Green = delivered, Yellow = pending, Red = failed

---

## Appendix D: Contact and Support

For technical issues or questions about this tool:

1. **GitHub Issues:** Report bugs or request features at the project repository
2. **Vercel Support:** Available through Vercel dashboard (Pro plan for priority support)
3. **Resend Support:** support@resend.com

---

*This document was prepared for UNDP Ukraine to provide a non-technical understanding of the Youth Centers Accessibility Assessment Tool's technical infrastructure.*
