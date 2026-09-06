/* ---------------------------------------------------------
   Petpooja I&T Response Composer — template definitions
   Source: ack-format.docx (latest revision — templates 1–9)
   Each template: id, number, title, whenToUse, audience,
   stampColor, fields[], generate(values) -> array of "lines"

   A line is either:
     - a plain string (no formatting)
     - an array of segments: [{text, bold, mark}, ...]
       mark is 'yellow' to reproduce the doc's highlighter marks.
   Use seg(text, opts) to build segments, and plainLine()/boldLine()/
   mixed()/hl() shorthands below.
--------------------------------------------------------- */

function fmtDate(iso){
  if(!iso) return '__/__/____';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function fmtTime(t){
  if(!t) return '--:-- --';
  let [h,m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if(h === 0) h = 12;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${suffix}`;
}
function val(v, fallback){
  return (v === undefined || v === null || v === '') ? (fallback ?? '____________') : v;
}

// --- formatted line builders ---
function seg(text, opts){ return Object.assign({text}, opts||{}); }
function plainLine(text){ return [seg(text)]; }
function boldLine(text){ return [seg(text, {bold:true})]; }
function mixed(...parts){
  return parts.map(p => typeof p === 'string' ? seg(p) : p);
}
function hl(text){ return seg(text, {mark:'yellow'}); }
// "Label: value" line with the label bold and the value in normal weight —
// keeps field names scannable without shouting the whole line.
function fieldLine(label, value){
  return [seg(label + ':', {bold:true}), seg(' ' + value)];
}
// A rich checklist table — rendered as a real colored HTML table in the
// preview/clipboard, and as a readable grouped list in plain-text copies.
function tableLine(plainText, htmlTable){
  return { __table:true, plain: plainText, html: htmlTable };
}

function line(condition, value){
  return condition ? value : null;
}
function join(lines){
  const filtered = lines.filter(l => l !== null && l !== undefined && l !== '');
  filtered.push(plainLine(''));
  return filtered;
}

const TAT_TITLE_LINE = () => mixed('I&T Turnaround Time (TAT) ', hl('(Except Sunday & Public Holidays)'));

const TAT_BODY =
`Virtual Training: Up to 24 hours
Physical Visit: Within 48–72 hours
Outstation Visit: Within 72–120 hours

Note: TAT is calculated from the time the ticket is assigned and all required information and prerequisites are complete. Delays due to merchant unavailability, rescheduling requests, public holidays, remote locations, unexpected emergencies or force majeure are excluded from the committed TAT.`;

const SUPPORT_LINE_NO_ACK =
`We hope the session was informative. For any questions or further assistance, reach us any time on +91 79 6922 3344 (available 24×7) or support@petpooja.com.

We also welcome your feedback — it helps us keep improving our service.`;

// --- Training Confirmation checklist datasets (from products-checklist.docx) ---
// Each entry: { key, label, headerColor, groups:[{title, color?, items:[...]}] }
// Colors are taken directly from the source document's table shading.
// Every item is filled by the user as Status (Yes/No/NA) + free-text Remarks.

const CONFIRMATION_TEMPLATES = [
  {
    key:'pos', label:'POS', headerColor:'#FF0000',
    groups:[
      { title:'POS Check List', items:[
        'POS Installation & Setup','Printer Configuration & Cash Drawer','Billing & Order Flow',
        'Operations','Item Management (POS Menu)','Inventory & Stock Management',
        'Reports','Restaurant Configuration & Logs'
      ]},
      { title:'Dashboard Check List', items:[
        'Main Dashboard View','Daily Operations','Menu Management','Reports','CRM',
        'User Management','Petpooja Agent AI','Petpooja App & Quick Links Configurations'
      ]}
    ]
  },
  {
    key:'payroll', label:'Payroll', headerColor:'#FFC000', columnLabel:'Phase',
    groups:[
      { title:'Phase 1', color:'#92D050', items:[
        'Owner Dashboard & Mobile App','Biometric Device Intro & Setup','Device Light Indication','Wi-Fi Connectivity'
      ]},
      { title:'Phase 2', color:'#00B0F0', items:[
        'Add Employee (Web & App)','Biometric Registration','Shift & Roster Management',
        'Week Off & Leave Setup','User Management & Reports','Payroll Module & Salary Slip','Owner App Quick Actions'
      ]},
      { title:'Phase 3', color:'#FFC000', items:[
        'Employee App Training','Language Setup','Leave Apply & Regularisation',
        'Attendance & Salary Slip Check','Relogin after Device Change'
      ]}
    ]
  },
  {
    key:'task', label:'Task Check List', headerColor:'#92D050',
    groups:[
      { title:'Petpooja Task', items:[
        'Task Assignment Process Understanding Taken','Sub Task / Group Task – Applicable or Not',
        'Project Management – Applicable or Not','Forms – Applicable or Not',
        'Application Downloaded & Login URL Bookmarked','Department Created & User Assigned',
        'Task Assignment and Browse Templates','Task Completion Process Explained','Reports'
      ]}
    ]
  },
  {
    key:'trm', label:'TRM (Reservation Manager)', headerColor:'#FF0000', subHeaderColor:'#00FFFF',
    groups:[
      { title:'Reservation Manager App', items:[
        'Employee Management','Form & QR Creation','Reservation and Queue Management Feature','Inquiries',
        'Order While In Queue','Customer Profile','RSVP Feature Explained','Cover Charge & Transaction',
        'Live Table Flow','Calendar View','Feedback Flow','Reservations Management and Aggregator Integrations','Report'
      ]}
    ]
  },
  {
    key:'purchase', label:'Purchase', headerColor:'#92D050',
    groups:[
      { title:'Petpooja Purchase', items:[
        'Standard Raw Material','Item/AI Recipe Activated','Dashboard','Upload Invoice (mention count in remarks)',
        'Review Invoice','Tag Management','Push to Petpooja','Reports','Petty Cash Management','Purchase App','Banking & KYC'
      ]}
    ]
  },
  {
    key:'ppinvoice', label:'PP Invoice / Retail POS', headerColor:'#5B9BD5', columnLabel:'Step',
    groups:[
      { title:'Basic Setup', color:'#00B050', items:[
        'Login Process','Item Addition','Inventory Preferences','Sales Preferences','POS Preferences','GST and Tax Preferences'
      ]},
      { title:'POS & Hardware Setup', color:'#A3DBFF', items:[
        'POS Installations and Counter Set-up','Printers and Template Set-up','Barcode Set-up and Printing Guide'
      ]},
      { title:'Operations & Transactions', color:'#FFCE3C', items:[
        'Stock Management','Purchase Bill and Purchase Training (advance plan)','Auto-sync and Retail Invoices on the Dashboard',
        'Dashboard Overview','Invoice Creation and Preferences','Process of Adding Receipts and Payments',
        'POS Overview and Understanding','Step-by-Step POS Usage Guide'
      ]},
      { title:'Reports & Monitoring', color:'#FFFF00', items:[
        'Reports and Dashboard'
      ]}
    ]
  }
];

function getConfirmationTemplate(key){
  return CONFIRMATION_TEMPLATES.find(c => c.key === key);
}

// Builds the "Product Features Covered" block for the chosen confirmation
// template using values stored as values[fieldId]['group|item'] = {status, remarks}
function confirmationBlock(key, data){
  const tpl = getConfirmationTemplate(key);
  if(!tpl || !data) return null;
  const groupBlocks = tpl.groups.map(g => {
    const rows = g.items
      .map(item => {
        const cell = data[g.title + '|' + item] || {};
        return [item, cell.status || '', cell.remarks || ''];
      })
      .filter(([, status]) => status !== '')
      .map(([item, status, remarks]) => remarks ? `${item} : ${status} — ${remarks}` : `${item} : ${status}`);
    if(rows.length === 0) return null;
    return [g.title, ...rows].join('\n');
  }).filter(Boolean);
  if(groupBlocks.length === 0) return null;
  return groupBlocks.join('\n\n');
}

function escapeHtmlLocal(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Picks white or dark ink text depending on background luminance so every
// header color (including bright red) stays readable.
function contrastTextColor(hex){
  const h = (hex || '#FFFFFF').replace('#','');
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.6 ? '#1B2430' : '#FFFFFF';
}

// Builds the same "Product Features Covered" content as a real colored HTML
// table, replicating the source document's exact table layout and shading —
// a combined color-coded column for Payroll/PP Invoice's phase/step grouping,
// a two-tier header for TRM, and one mini-table per group otherwise (POS/Task/Purchase).
function confirmationTableHtml(key, data){
  const tpl = getConfirmationTemplate(key);
  if(!tpl || !data) return '';
  const esc = escapeHtmlLocal;
  const cellStyle = 'border:1px solid #999;padding:6px 9px;font-family:Arial,Helvetica,sans-serif;font-size:13px;text-align:left;';
  const headStyle = (bg) => `${cellStyle}background:${bg};color:${contrastTextColor(bg)};font-weight:bold;`;

  const filledItemsOf = g => g.items.filter(item => (data[g.title + '|' + item] || {}).status);

  if(tpl.columnLabel){
    // Payroll / PP Invoice: one combined table, first column colored per group (Phase/Step)
    const rows = [];
    tpl.groups.forEach(g => {
      filledItemsOf(g).forEach(item => {
        const cell = data[g.title + '|' + item] || {};
        rows.push(`<tr>` +
          `<td style="${cellStyle}background:${g.color || '#eee'};color:${contrastTextColor(g.color || '#eee')};font-weight:bold;">${esc(g.title)}</td>` +
          `<td style="${cellStyle}">${esc(item)}</td>` +
          `<td style="${cellStyle}">${esc(cell.status || '')}</td>` +
          `<td style="${cellStyle}">${esc(cell.remarks || '')}</td>` +
          `</tr>`);
      });
    });
    if(rows.length === 0) return '';
    return `<table style="border-collapse:collapse;width:100%;margin:4px 0;">` +
      `<tr>` +
      `<th style="${headStyle(tpl.headerColor)}">${esc(tpl.columnLabel)}</th>` +
      `<th style="${headStyle(tpl.headerColor)}">Item</th>` +
      `<th style="${headStyle(tpl.headerColor)}">Status</th>` +
      `<th style="${headStyle(tpl.headerColor)}">Remarks</th>` +
      `</tr>${rows.join('')}</table>`;
  }

  if(tpl.subHeaderColor){
    // TRM: full-width group-name header row, then a colored column-label row
    const g = tpl.groups[0];
    const filled = filledItemsOf(g);
    if(filled.length === 0) return '';
    const rows = filled.map(item => {
      const cell = data[g.title + '|' + item] || {};
      return `<tr>` +
        `<td style="${cellStyle}">${esc(item)}</td>` +
        `<td style="${cellStyle}">${esc(cell.status || '')}</td>` +
        `<td style="${cellStyle}">${esc(cell.remarks || '')}</td>` +
        `</tr>`;
    });
    return `<table style="border-collapse:collapse;width:100%;margin:4px 0;">` +
      `<tr><td colspan="3" style="${headStyle(tpl.headerColor)}text-align:center;">${esc(g.title)}</td></tr>` +
      `<tr>` +
      `<th style="${headStyle(tpl.subHeaderColor)}">Training Checklist Pointers</th>` +
      `<th style="${headStyle(tpl.subHeaderColor)}">Status</th>` +
      `<th style="${headStyle(tpl.subHeaderColor)}">Remarks</th>` +
      `</tr>${rows.join('')}</table>`;
  }

  // POS / Task / Purchase: one mini-table per group, group name as the header's first column
  const tables = tpl.groups.map(g => {
    const filled = filledItemsOf(g);
    if(filled.length === 0) return null;
    const rows = filled.map(item => {
      const cell = data[g.title + '|' + item] || {};
      return `<tr>` +
        `<td style="${cellStyle}">${esc(item)}</td>` +
        `<td style="${cellStyle}">${esc(cell.status || '')}</td>` +
        `<td style="${cellStyle}">${esc(cell.remarks || '')}</td>` +
        `</tr>`;
    });
    return `<table style="border-collapse:collapse;width:100%;margin:4px 0;">` +
      `<tr>` +
      `<th style="${headStyle(tpl.headerColor)}">${esc(g.title)}</th>` +
      `<th style="${headStyle(tpl.headerColor)}">Status</th>` +
      `<th style="${headStyle(tpl.headerColor)}">Remarks</th>` +
      `</tr>${rows.join('')}</table>`;
  }).filter(Boolean);

  return tables.join('');
}

// Generates the six conditional field definitions (one per confirmation
// template) that expose group/item status+remarks inputs when selected.
function confirmationChecklistFields(){
  return CONFIRMATION_TEMPLATES.map(tpl => ({
    id: 'checklist_' + tpl.key,
    label: tpl.label + ' checklist',
    type: 'checklistGroups',
    groups: tpl.groups,
    headerColor: tpl.headerColor,
    subHeaderColor: tpl.subHeaderColor,
    columnLabel: tpl.columnLabel,
    showIf: v => v.confirmationTemplate === tpl.key
  }));
}

const TEMPLATES = [

// ---------------------------------------------------------
{
  id:'t1',
  number:1,
  title:'Trainer Noted',
  category:'Mail Responses',
  whenToUse:'Trainer acknowledges the assigned ticket.',
  audience:'Customer and Team',
  stamp:'ACK', stampColor:'teal',
  interactive:false,
  fields:[],
  generate(){
    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine('I acknowledge your training request and will connect with you shortly.'),
      plainLine(''),
      TAT_TITLE_LINE(),
      plainLine(TAT_BODY)
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t2',
  number:2,
  title:'Training Scheduled / Rescheduled',
  category:'Mail Responses',
  whenToUse:'Confirming a new or revised training slot.',
  audience:'Customer and Team',
  stamp:'SCHEDULED', stampColor:'teal',
  interactive:true,
  fields:[
    {id:'action', label:'Action', type:'select', options:['Scheduled','Rescheduled'], default:'Scheduled'},
    {id:'date', label:'Training date', type:'date'},
    {id:'time', label:'Training time', type:'time'},
    {id:'mode', label:'Mode', type:'radio', options:['Virtual','Physical'], default:'Virtual'},
    {id:'reason', label:'Reason', type:'textarea', placeholder:'Reason for scheduling / rescheduling'},
    {id:'specialNote', label:'Special note — optional', type:'textarea', placeholder:'Any additional note'}
  ],
  generate(v){
    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine(`Your training has been ${(v.action||'Scheduled').toLowerCase()}.`),
      plainLine(''),
      // "Schedule / reschedule details & reason" is an internal form-fill label only — not shown in the sent email.
      fieldLine('Date & Time', `${fmtDate(v.date)}, ${fmtTime(v.time)}`),
      fieldLine('Mode', val(v.mode,'Virtual')),
      boldLine(`Reason: ${val(v.reason,'—')}`),
      line(v.specialNote, boldLine(`Special Note: ${v.specialNote}`)),
      plainLine(''),
      plainLine('Kindly ensure the required hardware device, network (internet connection) and concerned staff are available.'),
      plainLine(''),
      plainLine('If you are unavailable at the scheduled time, please inform us in advance to avoid delays.'),
      plainLine(''),
      plainLine('Thank you for your understanding.')
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t3',
  number:3,
  title:'Follow-up Attempt — Not Connected',
  category:'Mail Responses',
  whenToUse:'Merchant unreachable after repeated contact attempts.',
  audience:'Customer and Team',
  stamp:'UNREACHABLE', stampColor:'amber',
  interactive:true,
  fields:[
    {id:'productName', label:'Product / training name', type:'text', placeholder:'e.g. POS Basic'},
    {id:'unreachableReason', label:'Reason unable to reach', type:'select',
      options:['Number Not Reachable','Switched Off','Ringing – No Answer','Busy','Call Declined','Invalid Number']},
    {id:'call1Date', label:'Call 1 — date', type:'date'},
    {id:'call1Time', label:'Call 1 — time', type:'time'},
    {id:'call1Result', label:'Call 1 — result', type:'select',
      options:['No Answer','Busy','Switched Off','Call Declined','Ringing – No Answer','Invalid Number']},
    {id:'call2Date', label:'Call 2 — date (optional)', type:'date'},
    {id:'call2Time', label:'Call 2 — time (optional)', type:'time'},
    {id:'call2Result', label:'Call 2 — result (optional)', type:'select',
      options:['','No Answer','Busy','Switched Off','Call Declined','Ringing – No Answer','Invalid Number']},
    {id:'call3Date', label:'Call 3 — date (optional)', type:'date'},
    {id:'call3Time', label:'Call 3 — time (optional)', type:'time'},
    {id:'call3Result', label:'Call 3 — result (optional)', type:'select',
      options:['','No Answer','Busy','Switched Off','Call Declined','Ringing – No Answer','Invalid Number']},
    {id:'call4Date', label:'Call 4 — date (optional)', type:'date'},
    {id:'call4Time', label:'Call 4 — time (optional)', type:'time'},
    {id:'call4Result', label:'Call 4 — result (optional)', type:'select',
      options:['','No Answer','Busy','Switched Off','Call Declined','Ringing – No Answer','Invalid Number']},
    {id:'whatsappStatus', label:'WhatsApp status', type:'select',
      options:['Sent','Delivered','Read','Not Sent','Not Applicable']}
  ],
  generate(v){
    function callLine(n, date, time, result){
      if(!(date || time || result)) return null;
      return mixed(seg(`Call ${n}:`, {bold:true, mark:'yellow'}), seg(` ${fmtDate(date)} – ${fmtTime(time)} – ${val(result,'—')}`, {mark:'yellow'}));
    }
    const call2 = callLine(2, v.call2Date, v.call2Time, v.call2Result);
    const call3 = callLine(3, v.call3Date, v.call3Time, v.call3Result);
    const call4 = callLine(4, v.call4Date, v.call4Time, v.call4Result);
    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine(`I have attempted to contact you regarding your assigned ${val(v.productName,'[Product Name]')} training. Despite multiple attempts, I have been unable to reach you due to ${val(v.unreachableReason,'[reason]')}.`),
      plainLine(''),
      plainLine('Kindly reply to this email or contact us at your convenience so that we can schedule your training and assist you further.'),
      plainLine(''),
      plainLine('If we do not receive a response, the ticket may be reassigned or closed as per process and TAT.'),
      plainLine(''),
      plainLine('Attempts made (attach evidence)'),
      mixed(seg('Call 1:', {bold:true, mark:'yellow'}), seg(` ${fmtDate(v.call1Date)} – ${fmtTime(v.call1Time)} – ${val(v.call1Result,'—')}`, {mark:'yellow'})),
      call2,
      call3,
      call4,
      mixed(seg('WhatsApp:', {bold:true, mark:'yellow'}), seg(` ${val(v.whatsappStatus,'—')}`, {mark:'yellow'}))
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t4',
  number:4,
  title:'Ticket Reassigned (by Trainer)',
  category:'Mail Responses',
  whenToUse:'Trainer cannot service the ticket and requests reassignment.',
  audience:'Internal — Training Team',
  stamp:'REASSIGNED', stampColor:'rust',
  interactive:true,
  fields:[
    {id:'reasonDropdown', label:'Reason', type:'select',
      options:['Scheduled Physical Visit','Outstation Visit','Leave','Weekly Off','Emergency','Network Issue','Other']},
    {id:'otherReason', label:'Specify other reason', type:'text',
      showIf:v => v.reasonDropdown === 'Other'}
  ],
  generate(v){
    const reasonText = v.reasonDropdown === 'Other' && v.otherReason
      ? `Other — ${v.otherReason}`
      : val(v.reasonDropdown,'[select from dropdown]');
    return join([
      plainLine('Dear Team,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine('To ensure timely service and avoid delay, kindly reassign this ticket to another available trainer.'),
      plainLine(''),
      fieldLine('Reason', reasonText)
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t5',
  number:5,
  title:'Parallel Setup Completed',
  category:'Mail Responses',
  whenToUse:'Confirming a completed parallel setup.',
  audience:'Customer',
  stamp:'SETUP DONE', stampColor:'teal',
  interactive:true,
  fields:[
    {id:'setupDate', label:'Date of setup', type:'date'},
    {id:'restaurantId', label:'Restaurant ID / ORG ID', type:'text'},
    {id:'restaurantName', label:'Restaurant / business name', type:'text'},
    {id:'userType', label:'User type', type:'radio', options:['NPU (Non-Petpooja User)','PPU (Petpooja User)']},
    {id:'traineeName', label:'Name of trainee', type:'text'},
    {id:'traineeContact', label:'Contact of trainee', type:'text'},
    {id:'trainingMode', label:'Training mode', type:'select', options:['Virtual','Physical','Out of station'], default:'Virtual'},
    {id:'product', label:'Product', type:'select', options:['POS','Payroll','PP Invoice','Other']},
    {id:'subProduct', label:'Sub-product', type:'select',
      options:['POS Basic','POS+Growth','POS+Scale','Local POS Basic','Other','NA']},
    {id:'startTime', label:'Training start time', type:'time'},
    {id:'endTime', label:'Training end time', type:'time'},
    {id:'notes', label:'Notes', type:'textarea', placeholder:'Device count, billing status, pending task — complete for physical visits'},
    {id:'setupStatus', label:'Setup status', type:'radio', options:['Complete','Incomplete'], default:'Complete'},
    {id:'incompleteReason', label:'Reason (if incomplete) + attachment note', type:'textarea',
      showIf:v => v.setupStatus === 'Incomplete'}
  ],
  generate(v){
    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine('Thank you for your time. This email confirms that the parallel setup has been successfully conducted.'),
      plainLine(''),
      fieldLine('Date of Setup', fmtDate(v.setupDate)),
      fieldLine('Restaurant ID / ORG ID', val(v.restaurantId)),
      fieldLine('Restaurant Name/Business Name', val(v.restaurantName)),
      fieldLine('User Type', val(v.userType)),
      fieldLine('Name of Trainee', val(v.traineeName)),
      fieldLine('Contact of Trainee', val(v.traineeContact)),
      fieldLine('Training Type', 'New'),
      fieldLine('Training Mode', val(v.trainingMode,'Virtual')),
      fieldLine('Product', val(v.product)),
      fieldLine('Sub-product', val(v.subProduct)),
      fieldLine('Training Start Time', fmtTime(v.startTime)),
      fieldLine('Training End Time', fmtTime(v.endTime)),
      mixed(seg('Notes:', {bold:true}), ` ${val(v.notes,'—')} `, hl('(complete for physical visits)')),
      plainLine(''),
      plainLine('Parallel Setup Attachment (Mandatory)'),
      v.setupStatus === 'Incomplete'
        ? boldLine(`Incomplete — ${val(v.incompleteReason,'reason pending')} (supportive attachment enclosed)`)
        : plainLine('Attachment enclosed.')
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t6',
  number:6,
  title:'Training Completed',
  category:'Training Completed',
  whenToUse:'Session finished and ticket closed — acknowledgement to merchant.',
  audience:'Customer',
  stamp:'COMPLETED', stampColor:'teal',
  interactive:true,
  fields:[
    {id:'date', label:'Date', type:'date'},
    {id:'restaurantId', label:'Restaurant ID / ORG ID', type:'text'},
    {id:'restaurantName', label:'Restaurant / business name', type:'text'},
    {id:'userType', label:'User type', type:'radio', options:['NPU (Non-Petpooja User)','PPU (Petpooja User)']},
    {id:'traineeName', label:'Name of trainee', type:'text'},
    {id:'traineeContact', label:'Contact of trainee', type:'text'},
    {id:'ticketReceivedFrom', label:'Ticket received from', type:'select',
      options:['New Zoho Ticket','New Support Ticket','Centralized Query Sheet']},
    {id:'trainingType', label:'Training type', type:'select', options:['New','Retraining','Support Issue']},
    {id:'retrainingReason', label:'Retraining / support issue reason', type:'textarea',
      showIf:v => v.trainingType === 'Retraining' || v.trainingType === 'Support Issue'},
    {id:'trainingMode', label:'Training mode', type:'select', options:['Physical','Virtual','Out of station']},
    {id:'product', label:'Product', type:'select',
      options:['POS','Payroll','PP Invoice (Retail)','Reservation Manager','Purchase','Kharcha Pay','Other']},
    {id:'subProduct', label:'Sub-product', type:'select',
      options:['POS Basic','POS+Growth','POS+Scale','POSS+MP','Android POSS','Android POSS Lite',
        'Touch POSS','Local-POS','Local POSS + Growth','Local POSS + Scale','Other']},
    {id:'startTime', label:'Training start time', type:'time'},
    {id:'endTime', label:'Training end time', type:'time'},
    {id:'trainingStatus', label:'Training status', type:'radio', options:['Completed','Incomplete'], default:'Completed'},
    {id:'ownerDashboard', label:'Owner dashboard shown', type:'radio', options:['Yes','No'], default:'No'},
    {id:'aiAgent', label:'AI Agent (Petpooja) shown', type:'radio', options:['Yes','No','Not interested'],
      showIf:v => v.ownerDashboard === 'Yes' && v.product !== 'Payroll', hint:'Mandatory if Owner Dashboard = Yes; NA for Payroll'},
    {id:'attendedBy', label:'Training attended by', type:'checkboxGroup', options:['Owner','Manager','Staff']},
    {id:'parallelSetupDone', label:'Parallel setup done', type:'select', options:['Yes','No','NA']},
    {id:'confirmationTemplate', label:'Product features covered — select checklist template', type:'select',
      options: CONFIRMATION_TEMPLATES.map(t => t.key),
      optionLabels: CONFIRMATION_TEMPLATES.reduce((m,t)=>Object.assign(m,{[t.key]:t.label}),{}),
      hint:'Choose which checklist to fill in below — it fills the "Product Features Covered" section.'},
    ...confirmationChecklistFields(),
    {id:'marketplaceServices', label:'Marketplace services covered — optional', type:'textarea',
      hint:'As per client plan or individual services bought'},
    {id:'specialNote', label:'Special note / instructions — optional', type:'textarea',
      placeholder:'Location or setup exceptions, remote device setup, development requirement, unresolved issue, replacement, etc.'}
  ],
  generate(v){
    const modeText = val(v.trainingMode,'Physical/Virtual/Out of station');
    const featuresPlain = confirmationBlock(v.confirmationTemplate, v['checklist_' + v.confirmationTemplate]);
    const featuresHtml = confirmationTableHtml(v.confirmationTemplate, v['checklist_' + v.confirmationTemplate]);

    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine(`Thank you for your time. This email confirms that the ${modeText} training session has been successfully conducted and the ticket is now closed.`),
      plainLine(''),
      fieldLine('Date', fmtDate(v.date)),
      fieldLine('Restaurant ID / ORG ID', val(v.restaurantId)),
      fieldLine('Restaurant Name/Business Name', val(v.restaurantName)),
      fieldLine('User Type', val(v.userType)),
      fieldLine('Name of Trainee', val(v.traineeName)),
      fieldLine('Contact of Trainee', val(v.traineeContact)),
      fieldLine('Ticket Received From', val(v.ticketReceivedFrom)),
      fieldLine('Training Type', val(v.trainingType,'New')),
      line((v.trainingType === 'Retraining' || v.trainingType === 'Support Issue') && v.retrainingReason,
        fieldLine('Retraining Reason', v.retrainingReason)),
      fieldLine('Training Mode', modeText),
      fieldLine('Product', val(v.product)),
      fieldLine('Sub-product', val(v.subProduct)),
      fieldLine('Training Start Time', fmtTime(v.startTime)),
      fieldLine('Training End Time', fmtTime(v.endTime)),
      fieldLine('Training Status', val(v.trainingStatus,'Completed')),
      fieldLine('Owner Dashboard', val(v.ownerDashboard,'No')),
      line(v.ownerDashboard === 'Yes', v.product === 'Payroll'
        ? fieldLine('AI Agent (Petpooja)', 'NA')
        : mixed(seg('AI Agent (Petpooja):', {bold:true}), ` ${val(v.aiAgent,'—')} `, hl('(mandatory if Owner Dashboard = Yes, NA for payroll)'))),
      fieldLine('Training Attended By', (v.attendedBy && v.attendedBy.length) ? v.attendedBy.join(', ') : '____________'),
      fieldLine('Parallel Setup Done', val(v.parallelSetupDone)),
      mixed(seg('Product Features Covered:', {bold:true, mark:'yellow'})),
      (featuresHtml && featuresPlain) ? tableLine(featuresPlain, featuresHtml) : plainLine('—'),
      plainLine(''),
      line(v.marketplaceServices, mixed(hl(`Marketplace Services Covered: ${v.marketplaceServices}`))),
      line(v.marketplaceServices, plainLine('')),
      line(v.specialNote, boldLine(`Special Note / Instructions: ${v.specialNote}`)),
      plainLine(''),
      plainLine('We hope the session was informative. For any questions or further assistance, reach us any time on +91 79 6922 3344 (available 24×7) or support@petpooja.com. Kindly acknowledge receipt of this email.'),
      plainLine(''),
      plainLine('We also welcome your feedback — it helps us keep improving our service.'),
      plainLine(''),
      mixed(hl('Feedback link: https://forms.gle/XXHMVTV8xxZH3AXg6'))
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t7',
  number:7,
  title:'Training Request On Hold — Pending Merchant Action',
  category:'Mail Responses',
  whenToUse:'Prerequisites incomplete; training paused pending merchant.',
  audience:'Customer',
  stamp:'ON HOLD', stampColor:'amber',
  interactive:true,
  fields:[
    {id:'pendingItems', label:'Pending items', type:'checkboxGroup',
      options:['Menu not shared','Networking (internet) unavailable','Hardware (POS device) unavailable',
        'Printer unavailable','Staff unavailable','Other']},
    {id:'otherText', label:'Specify other pending item', type:'text',
      showIf:v => (v.pendingItems||[]).includes('Other')}
  ],
  generate(v){
    const items = (v.pendingItems || []).map(item =>
      item === 'Other' && v.otherText ? `• Other: ${v.otherText}` : `• ${item}`
    );
    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine('Your training is currently on hold due to pending prerequisites.'),
      plainLine(''),
      plainLine('Pending items'),
      plainLine(items.length ? items.join('\n') : '• —'),
      plainLine(''),
      mixed('Please update us once these are complete. ', hl('(Tag the respective Sales POC.)')),
      plainLine(''),
      TAT_TITLE_LINE(),
      plainLine(TAT_BODY)
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t8',
  number:8,
  title:'TL → Trainer Assignment',
  category:'Mail Responses',
  whenToUse:'Team Lead assigns the ticket to a specific trainer.',
  audience:'Customer',
  stamp:'ASSIGNED', stampColor:'teal',
  interactive:true,
  fields:[
    {id:'trainerName', label:'Trainer name', type:'text'},
    {id:'includeParallelLine', label:'Also request parallel setup coordination', type:'checkbox'}
  ],
  generate(v){
    const trainer = val(v.trainerName,'[Trainer Name]');
    return join([
      plainLine('Dear Customer,'),
      plainLine(''),
      plainLine('Greetings from Petpooja!'),
      plainLine(''),
      plainLine('Thank you for contacting the Merchant Training Team. Your request has been received and assigned to our trainer.'),
      plainLine(''),
      plainLine(`@${trainer} — please take note and coordinate with the customer to conduct the training session at the earliest.`),
      line(v.includeParallelLine, plainLine(`@${trainer} — please take note and coordinate with the customer to conduct the parallel setup at the earliest.`)),
      plainLine(''),
      TAT_TITLE_LINE(),
      plainLine(TAT_BODY)
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t9',
  number:9,
  title:'WCD (Waiter Calling Device) Format',
  category:'Mail Responses',
  whenToUse:'Confirming WCD installation & training after online setup.',
  audience:'Customer',
  stamp:'CONFIRMED', stampColor:'teal',
  interactive:true,
  fields:[
    {id:'trainingDate', label:'Training date', type:'date'},
    {id:'restaurantName', label:'Restaurant name', type:'text'},
    {id:'restaurantId', label:'Restaurant ID', type:'text'},
    {id:'startTime', label:'Training start time', type:'time'},
    {id:'completedTime', label:'Training completed time', type:'time'},
    {id:'providedTo', label:'Training provided to', type:'text'},
    {id:'traineeContact', label:'Contact number of trainee', type:'text'},
    {id:'setupType', label:'Setup type', type:'select', options:['Wi-Fi','LAN','Other']}
  ],
  generate(v){
    return join([
      plainLine('Hello,'),
      plainLine(''),
      plainLine(`This is a confirmation email for the online training & setup provided on ${fmtDate(v.trainingDate)}. Details are as follows:`),
      plainLine(''),
      fieldLine('Restaurant Name', val(v.restaurantName)),
      fieldLine('Restaurant ID', val(v.restaurantId)),
      fieldLine('Training Start Time', fmtTime(v.startTime)),
      fieldLine('Training Completed Time', fmtTime(v.completedTime)),
      fieldLine('Training Provided To', val(v.providedTo)),
      fieldLine('Contact Number of Trainee', val(v.traineeContact)),
      plainLine(''),
      plainLine('In this training I covered:'),
      plainLine(`• Waiter Calling Device (00) — installation (setup type: ${val(v.setupType,'Wi-Fi')}) & training`),
      plainLine(''),
      plainLine('A screenshot of the working WCD is attached.'),
      plainLine(''),
      boldLine('Note: Charge all devices fully overnight using the dedicated charger only. Recharge every 4–5 days. If a device is fully discharged, its lights will turn on only after about half an hour of continuous charging.'),
      plainLine(''),
      plainLine('Kindly acknowledge receipt of this email.'),
      plainLine(''),
      plainLine(SUPPORT_LINE_NO_ACK.replace('We also welcome','We welcome')),
      plainLine(''),
      plainLine('Feedback link: https://forms.gle/XXHMVTV8xxZH3AXg6')
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t10',
  number:10,
  title:'Training Availability Check',
  category:'Follow-up',
  whenToUse:'First outreach via WhatsApp/text to check training availability and prerequisites.',
  audience:'Customer',
  stamp:'WHATSAPP', stampColor:'teal',
  interactive:true,
  fields:[
    {id:'senderName', label:'Your name', type:'text', default:'Akashdip'},
    {id:'product', label:'Product', type:'select',
      options:['Attendo-Regular','Attendo-Face','Attendo-DS','POSS','Invoice','WCD','TASK','Reservation Manager','Petpooja EDC']},
    {id:'orgName', label:'Restaurant / organization name', type:'text'},
    {id:'trainingMode', label:'Training mode', type:'select', options:['Onsite','Online']},
    {id:'alternateDate', label:'Alternate date — optional', type:'date'},
    {id:'alternateTime', label:'Alternate time — optional', type:'time'},
    {id:'includePrereqCheck', label:'Include prerequisites check line', type:'checkbox', default:true}
  ],
  generate(v){
    const isAttendo = (v.product || '').startsWith('Attendo');
    const brand = isAttendo ? 'Attendo' : 'Petpooja';
    let prereqLine;
    if(v.product === 'Attendo-Regular'){
      prereqLine = 'Laptop/Computer, Wi-Fi, LAN, Staff are ready & available?';
    } else if(v.product === 'Attendo-Face' || v.product === 'Attendo-DS'){
      prereqLine = 'Do you want Door lock configuration with Em lock/unlock switch configuration?';
    } else {
      prereqLine = 'System, Network (LAN connections), Printer, Staffs are ready & available?';
    }
    const altParts = [];
    if(v.alternateDate) altParts.push(fmtDate(v.alternateDate));
    if(v.alternateTime) altParts.push(fmtTime(v.alternateTime));
    const altText = altParts.length ? altParts.join(', ') : '';
    return join([
      plainLine('Namaste,'),
      plainLine(''),
      plainLine(`${val(v.senderName,'Akashdip')} this side from ${brand}.`),
      plainLine(''),
      plainLine('From Training & installation team.'),
      plainLine(''),
      plainLine(`This is regarding ${val(v.product,'[Product]')} training for ${val(v.orgName,'[Restaurant/Organization Name]')}`),
      plainLine(`Training mode: ${val(v.trainingMode,'Onsite')}`),
      plainLine(''),
      plainLine(`Let me know your availability today${altText ? ' or ' + altText : ''}.`),
      line(v.includePrereqCheck !== false, plainLine('')),
      line(v.includePrereqCheck !== false, plainLine(prereqLine)),
      plainLine(''),
      plainLine('Thank you!')
    ]);
  }
},

// ---------------------------------------------------------
{
  id:'t11',
  number:11,
  title:'Out of Station Request',
  category:'Outstation Request',
  whenToUse:'Internal record/approval request for an outstation visit and its travel expense.',
  audience:'Internal',
  stamp:'OUTSTATION', stampColor:'amber',
  interactive:true,
  fields:[
    {id:'ticketHeader', label:'Ticket header (paste from ticketing system)', type:'textarea',
      placeholder:'e.g. Re: [## 00000 ##] Installation request | Payroll | RID NPU [11111111] (REGULAR DEVICE)'},
    {id:'productType', label:'Product type', type:'select', options:['PAYROLL','POSS','HARDWARE','RETAIL-POS','OTHER']},
    {id:'otherProductName', label:'Specify product name', type:'text', showIf:v => v.productType === 'OTHER'},
    {id:'restName', label:'Rest name', type:'text'},
    {id:'orgRestId', label:'Org/Rest name ID', type:'text'},
    {id:'travellingMode', label:'Travelling mode', type:'select', options:['Public transport','Personal transport']},
    {id:'roundTripKms', label:'Round trip (KMs)', type:'text', placeholder:'Total round trip in KMs'},
    {id:'location', label:'Location', type:'text', placeholder:'From location to location name'},
    {id:'trainingType', label:'Training type', type:'select', options:['New','Support','Retraining','Renewal','Other']},
    {id:'otherTrainingType', label:'Specify training type', type:'text', showIf:v => v.trainingType === 'Other'},
    {id:'purposeOfTraining', label:'Purpose of training', type:'text', placeholder:'e.g. Payroll training, installation'},
    {id:'amount', label:'Amount (expense cost)', type:'text'}
  ],
  generate(v){
    const productType = v.productType === 'OTHER' && v.otherProductName
      ? `Other — ${v.otherProductName}`
      : val(v.productType);
    const trainingType = v.trainingType === 'Other' && v.otherTrainingType
      ? `Other — ${v.otherTrainingType}`
      : val(v.trainingType);
    return join([
      plainLine(val(v.ticketHeader,'[Paste ticket header]')),
      plainLine(''),
      fieldLine('Product type', productType),
      fieldLine('REST NAME', val(v.restName)),
      fieldLine('Org/Rest name ID', val(v.orgRestId)),
      fieldLine('TRAVELLING MODE', val(v.travellingMode)),
      fieldLine('ROUND TRIP', val(v.roundTripKms) === '____________' ? '____________' : `${v.roundTripKms} KMS total round trip`),
      fieldLine('LOCATION', val(v.location)),
      fieldLine('TRAINING TYPE', trainingType),
      fieldLine('PURPOSE OF TRAINING', val(v.purposeOfTraining)),
      fieldLine('AMOUNT', val(v.amount) === '____________' ? '____________' : `${v.amount} (expense cost)`)
    ]);
  }
}

];
