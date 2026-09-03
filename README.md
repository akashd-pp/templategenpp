# I&T Response Composer

A small web app that turns Petpooja's Merchant Training & Technical Support
response templates into a fill-in-the-blanks form. Pick a template, answer
the fields, and copy the finished email straight to your clipboard.

No build step, no backend, no data leaves the browser.

## Run it locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `it-response-composer`).
2. Push everything in this folder to the repo root (`index.html`,
   `manager.html`, `style.css`, `manager.css`, `app.js`, `templates.js`,
   `engine.js`, `manager.js`, `customTemplates.js`, and the `assets/` folder).
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`.
5. Save. GitHub gives you a URL like
   `https://<your-username>.github.io/it-response-composer/` within a
   minute or two.

## Four categories

The template picker groups templates into four categories:

### Mail Responses (8 templates)
Trainer Noted, Training Scheduled/Rescheduled, Follow-up Attempt Not
Connected, Ticket Reassigned, Parallel Setup Completed, Training Request
On Hold, TL → Trainer Assignment, and WCD Format. Each is a simple
fill-in-the-blanks form. No template asks for a sender name or signature —
the composer assumes your mailbox's own signature handles sign-off.

### Training Completed (1 template, 6 checklist styles)
"Training Completed" is the single entry here. After filling the standard
restaurant/trainee/training fields, you pick **one of 6 checklist styles**
in the "Product Features Covered" section — POS, Payroll, Task Check List,
TRM (Reservation Manager), Purchase, or PP Invoice/Retail POS. Choosing one
reveals that style's specific checklist items, each with a **Status
(Yes/No/NA)** dropdown and a **Remarks** text box. Only items you actually
set appear in the generated email — leave one blank and it's omitted
entirely, so you never send a checklist with unanswered rows.

Two small conditional rules here: **AI Agent** shows "NA" automatically
when Product is Payroll (Payroll has no Owner Dashboard/AI Agent concept),
and **Training Attended By** is a multi-select — more than one of
Owner/Manager/Staff can be checked.

### Follow-up (1 template — for WhatsApp/text, not email)
"Training Availability Check" is a short outreach message meant to be
copied into WhatsApp or a text message rather than an email — asking a
merchant for their training availability, training mode (Onsite/Online),
and whether prerequisites are ready. The greeting and prerequisites
wording both switch automatically based on the selected product: any
Attendo variant (Regular/Face/DS) gets "Attendo" branding and a
Laptop/Wi-Fi/LAN prerequisites line; every other product gets "Petpooja"
branding and a System/Network/Printer prerequisites line. The
prerequisites line can be toggled off entirely with a checkbox.

### Outstation Request (1 template — internal, not customer-facing)
"Out of Station Request" is an internal record for logging/requesting
approval of an outstation visit and its travel expense — not something
sent to a customer. The ticket header is a single paste-in field (paste
your existing ticket subject line from your ticketing system); everything
else is a short structured form (product type, restaurant details, travel
mode, round-trip KMs, location, training type, purpose, and expense
amount).

## Formatting in the preview

The live preview reproduces the source document's yellow highlighter marks
and bold emphasis as real formatting, not just plain text — highlighted
lines get a yellow background, bold fields render bold. Every "Label:
value" field line bolds the label and keeps the value in normal weight,
matching the source document's style. "Copy to clipboard" copies both a
plain-text version and a rich HTML version — when pasted into
Gmail/Outlook, the bold and highlight formatting carries over. Browsers
that don't support rich clipboard writes fall back to plain text
automatically.

## Colored checklist tables

The 6 Training Confirmation checklist styles render as real colored HTML
tables — both in the data-entry form and in the generated email — matching
the exact table shading from `products-checklist.docx`:

- **POS** — red headers, one mini-table per group (POS Check List,
  Dashboard Check List)
- **Payroll** — amber header row, with each Phase (1/2/3) colored
  green/blue/amber in its own column
- **Task Check List**, **Purchase** — green headers
- **TRM (Reservation Manager)** — red group-name header plus a cyan
  column-header row
- **PP Invoice / Retail POS** — blue header, with each Step colored
  green/light-blue/gold/yellow in its own column

Text color on each header automatically switches between white and dark
ink depending on the background, so every color stays readable.

## Adding or editing templates

**Ticket Response / Training Completed templates** live in `templates.js`
as hand-written `generate()` functions — edit that file directly for
changes to these 9 built-in templates.

**New templates** can be added without touching code at all, via the
**Template Manager** — the "+ Add / manage templates" link at the bottom
of the composer (`manager.html`). Build a template with a form (fields +
body text using `{{fieldId}}`, `**bold**`, `==highlight==`, and
`{{if fieldId}}...{{/if}}` for optional lines), preview it live, then
export `customTemplates.js` and drop it into this folder (and the
extension folder) to publish it. See the in-app cheatsheet for the full
token syntax.

## The 6 Training Confirmation checklist styles

Defined in `templates.js` as `CONFIRMATION_TEMPLATES`, sourced from
`products-checklist.docx`:

| Style | Groups |
|---|---|
| POS | POS Check List (8 items), Dashboard Check List (8 items) |
| Payroll | Phase 1 (4 items), Phase 2 (7 items), Phase 3 (5 items) |
| Task Check List | Petpooja Task (9 items) |
| TRM (Reservation Manager) | Reservation Manager App (13 items) |
| Purchase | Petpooja Purchase (11 items) |
| PP Invoice / Retail POS | Basic Setup, POS & Hardware Setup, Operations & Transactions, Reports & Monitoring (18 items total) |

To edit an item list or add a 7th style, edit the `CONFIRMATION_TEMPLATES`
array in `templates.js` — each entry is `{key, label, groups:[{title,
items:[...]}]}` and the form/output rendering picks it up automatically.
