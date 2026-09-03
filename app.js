(function(){

  const ALL_TEMPLATES = TEMPLATES.concat(
    (typeof CUSTOM_TEMPLATES !== 'undefined' ? CUSTOM_TEMPLATES : []).map(compileCustomTemplate)
  );

  const templatePicker = document.getElementById('templatePicker');
  const templateMeta = document.getElementById('templateMeta');
  const formEl = document.getElementById('dynamicForm');
  const previewBody = document.getElementById('previewBody');
  const stubEyebrow = document.getElementById('stubEyebrow');
  const stubTitle = document.getElementById('stubTitle');
  const stamp = document.getElementById('stamp');
  const copyBtn = document.getElementById('copyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const copyToast = document.getElementById('copyToast');
  const clock = document.getElementById('clock');

  let state = { templateId: ALL_TEMPLATES[0].id, values: {} };

  function contrastTextColorJs(hex){
    const h = (hex || '#FFFFFF').replace('#','');
    const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return luminance > 0.6 ? '#1B2430' : '#FFFFFF';
  }

  function currentTemplate(){
    return ALL_TEMPLATES.find(t => t.id === state.templateId);
  }

  function populatePicker(){
    const categories = [];
    ALL_TEMPLATES.forEach(t => {
      const cat = t.category || 'Templates';
      if(!categories.includes(cat)) categories.push(cat);
    });
    templatePicker.innerHTML = categories.map(cat => {
      const opts = ALL_TEMPLATES.filter(t => (t.category || 'Templates') === cat)
        .map(t => `<option value="${t.id}">${t.number}. ${t.title}</option>`).join('');
      return `<optgroup label="${cat}">${opts}</optgroup>`;
    }).join('');
    templatePicker.value = state.templateId;
  }

  function initDefaults(tpl){
    const values = {};
    tpl.fields.forEach(f => {
      if(f.type === 'checkboxGroup') values[f.id] = [];
      else if(f.type === 'checkbox') values[f.id] = f.default !== undefined ? f.default : false;
      else if(f.type === 'checklist' || f.type === 'checklistGroups') values[f.id] = {};
      else values[f.id] = f.default || '';
    });
    return values;
  }

  function renderMeta(tpl){
    templateMeta.innerHTML = `<b>When to use:</b> ${tpl.whenToUse}<br><b>Audience:</b> ${tpl.audience}`;
  }

  function isVisible(field, values){
    return typeof field.showIf !== 'function' || field.showIf(values);
  }

  function renderForm(){
    const tpl = currentTemplate();
    formEl.innerHTML = '';

    if(!tpl.interactive){
      const note = document.createElement('p');
      note.className = 'field-hint';
      note.style.fontSize = '13px';
      note.style.lineHeight = '1.6';
      note.textContent = 'This template has no variable fields — it is ready to copy as-is.';
      formEl.appendChild(note);
      return;
    }

    tpl.fields.forEach(field => {
      if(!isVisible(field, state.values)) return;

      const group = document.createElement('div');
      group.className = 'field-group' + (typeof field.showIf === 'function' ? ' conditional' : '');

      const label = document.createElement('label');
      label.className = 'field-label';
      label.textContent = field.label;
      label.htmlFor = 'f_' + field.id;
      group.appendChild(label);

      switch(field.type){

        case 'text': {
          const input = document.createElement('input');
          input.type = 'text';
          input.id = 'f_' + field.id;
          input.placeholder = field.placeholder || '';
          input.value = state.values[field.id] || '';
          input.addEventListener('input', e => {
            state.values[field.id] = e.target.value;
            renderPreview();
          });
          group.appendChild(input);
          break;
        }

        case 'textarea': {
          const input = document.createElement('textarea');
          input.id = 'f_' + field.id;
          input.placeholder = field.placeholder || '';
          input.value = state.values[field.id] || '';
          input.addEventListener('input', e => {
            state.values[field.id] = e.target.value;
            renderPreview();
          });
          group.appendChild(input);
          break;
        }

        case 'date': {
          const input = document.createElement('input');
          input.type = 'date';
          input.id = 'f_' + field.id;
          input.value = state.values[field.id] || '';
          input.addEventListener('change', e => {
            state.values[field.id] = e.target.value;
            renderForm();
            renderPreview();
          });
          group.appendChild(input);
          break;
        }

        case 'time': {
          const input = document.createElement('input');
          input.type = 'time';
          input.id = 'f_' + field.id;
          input.value = state.values[field.id] || '';
          input.addEventListener('change', e => {
            state.values[field.id] = e.target.value;
            renderForm();
            renderPreview();
          });
          group.appendChild(input);
          break;
        }

        case 'select': {
          const input = document.createElement('select');
          input.id = 'f_' + field.id;
          const opts = field.options.slice();
          if(!field.default) opts.unshift('');
          input.innerHTML = opts.map(o =>
            `<option value="${o}">${o === '' ? 'Select…' : (field.optionLabels && field.optionLabels[o] ? field.optionLabels[o] : o)}</option>`
          ).join('');
          input.value = state.values[field.id] || '';
          input.addEventListener('change', e => {
            state.values[field.id] = e.target.value;
            renderForm();
            renderPreview();
          });
          group.appendChild(input);
          break;
        }

        case 'radio': {
          const row = document.createElement('div');
          row.className = 'radio-row';
          field.options.forEach(opt => {
            const pill = document.createElement('label');
            pill.className = 'radio-pill';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'f_' + field.id;
            radio.value = opt;
            radio.checked = (state.values[field.id] || field.default) === opt;
            radio.addEventListener('change', () => {
              state.values[field.id] = opt;
              renderForm();
              renderPreview();
            });
            pill.appendChild(radio);
            pill.appendChild(document.createTextNode(opt));
            row.appendChild(pill);
          });
          group.appendChild(row);
          break;
        }

        case 'checkbox': {
          const row = document.createElement('label');
          row.className = 'checkbox-row';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = !!state.values[field.id];
          cb.addEventListener('change', e => {
            state.values[field.id] = e.target.checked;
            renderPreview();
          });
          row.appendChild(cb);
          row.appendChild(document.createTextNode(field.hint || 'Include'));
          group.appendChild(row);
          break;
        }

        case 'checkboxGroup': {
          const col = document.createElement('div');
          col.className = 'checkbox-col';
          field.options.forEach(opt => {
            const row = document.createElement('label');
            row.className = 'checkbox-row';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = opt;
            const current = state.values[field.id] || [];
            cb.checked = current.includes(opt);
            cb.addEventListener('change', e => {
              let arr = state.values[field.id] || [];
              if(e.target.checked) arr = [...arr, opt];
              else arr = arr.filter(x => x !== opt);
              state.values[field.id] = arr;
              renderForm();
              renderPreview();
            });
            row.appendChild(cb);
            row.appendChild(document.createTextNode(opt));
            col.appendChild(row);
          });
          group.appendChild(col);
          break;
        }

        case 'checklist': {
          const col = document.createElement('div');
          col.className = 'checklist-col';
          if(!state.values[field.id]) state.values[field.id] = {};
          field.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'checklist-row';
            const itemLabel = document.createElement('span');
            itemLabel.className = 'checklist-item-label';
            itemLabel.textContent = item;
            const sel = document.createElement('select');
            sel.className = 'checklist-select';
            sel.innerHTML = ['','Yes','No','NA'].map(o =>
              `<option value="${o}">${o === '' ? '—' : o}</option>`
            ).join('');
            sel.value = state.values[field.id][item] || '';
            sel.addEventListener('change', e => {
              state.values[field.id][item] = e.target.value;
              renderPreview();
            });
            row.appendChild(itemLabel);
            row.appendChild(sel);
            col.appendChild(row);
          });
          group.appendChild(col);
          break;
        }
        case 'checklistGroups': {
          const wrap = document.createElement('div');
          wrap.className = 'checklist-groups-wrap';
          if(field.headerColor){
            wrap.style.borderTop = `4px solid ${field.headerColor}`;
          }
          if(!state.values[field.id]) state.values[field.id] = {};
          field.groups.forEach(g => {
            const groupTitle = document.createElement('p');
            groupTitle.className = 'checklist-group-title';
            groupTitle.textContent = field.columnLabel ? `${field.columnLabel}: ${g.title}` : g.title;
            const barColor = g.color || field.subHeaderColor || field.headerColor;
            if(barColor){
              groupTitle.style.background = barColor;
              groupTitle.style.color = contrastTextColorJs(barColor);
              groupTitle.classList.add('checklist-group-title-colored');
            }
            wrap.appendChild(groupTitle);

            const col = document.createElement('div');
            col.className = 'checklist-col';
            g.items.forEach(item => {
              const key = g.title + '|' + item;
              const row = document.createElement('div');
              row.className = 'checklist-group-row';
              if(barColor) row.style.borderLeft = `3px solid ${barColor}`;

              const itemLabel = document.createElement('span');
              itemLabel.className = 'checklist-item-label';
              itemLabel.textContent = item;

              const sel = document.createElement('select');
              sel.className = 'checklist-select';
              sel.innerHTML = ['','Yes','No','NA'].map(o =>
                `<option value="${o}">${o === '' ? '—' : o}</option>`
              ).join('');
              const existing = state.values[field.id][key] || {};
              sel.value = existing.status || '';

              const remarks = document.createElement('input');
              remarks.type = 'text';
              remarks.className = 'checklist-remarks';
              remarks.placeholder = 'Remarks';
              remarks.value = existing.remarks || '';

              sel.addEventListener('change', e => {
                const cur = state.values[field.id][key] || {};
                state.values[field.id][key] = Object.assign({}, cur, {status: e.target.value});
                renderPreview();
              });
              remarks.addEventListener('input', e => {
                const cur = state.values[field.id][key] || {};
                state.values[field.id][key] = Object.assign({}, cur, {remarks: e.target.value});
                renderPreview();
              });

              row.appendChild(itemLabel);
              const controls = document.createElement('div');
              controls.className = 'checklist-row-controls';
              controls.appendChild(sel);
              controls.appendChild(remarks);
              row.appendChild(controls);
              col.appendChild(row);
            });
            wrap.appendChild(col);
          });
          group.appendChild(wrap);
          break;
        }

        const hint = document.createElement('p');
        hint.className = 'field-hint';
        hint.textContent = field.hint;
        group.appendChild(hint);
      }

      formEl.appendChild(group);
    });
  }

  // --- segment-based rendering: turns generate() output into plain text and safe HTML ---
  function escapeHtml(s){
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  function segmentsToPlain(segments){
    return segments.map(s => s.text).join('');
  }

  function segmentsToHtml(segments){
    return segments.map(s => {
      let t = escapeHtml(s.text);
      if(s.mark) t = `<mark class="hl-${s.mark}">${t}</mark>`;
      if(s.bold) t = `<strong>${t}</strong>`;
      return t;
    }).join('');
  }

  function buildOutputs(lines){
    const plainParts = lines.map(l => l.__table ? l.plain : segmentsToPlain(l));
    const plain = plainParts.join('\n');

    // For the on-screen <pre> preview, a \n-joined string is fine for normal
    // lines (CSS white-space:pre-wrap handles it); table lines insert their
    // HTML <table> directly, no \n join needed around it.
    const previewHtml = lines.map(l => l.__table ? l.html : segmentsToHtml(l)).join('\n');

    // For the clipboard, mail clients ignore bare \n between text nodes — each
    // normal line needs to be its own block element or everything collapses
    // into one paragraph. Table lines are already block-level, inserted as-is.
    const clipboardHtml = lines.map(l => {
      if(l.__table) return l.html;
      const inner = segmentsToHtml(l).replace(/\n/g, '<br>');
      return `<div>${inner === '' ? '&nbsp;' : inner}</div>`;
    }).join('');

    return { plain, previewHtml, clipboardHtml };
  }

  function renderPreview(){
    const tpl = currentTemplate();
    stubEyebrow.textContent = `TEMPLATE ${String(tpl.number).padStart(2,'0')}`;
    stubTitle.textContent = tpl.title;
    stamp.textContent = tpl.stamp;
    stamp.className = 'stamp' + (tpl.stampColor !== 'teal' ? ' ' + tpl.stampColor : '');

    const lines = tpl.generate(state.values);
    const { plain, previewHtml, clipboardHtml } = buildOutputs(lines);
    previewBody.innerHTML = previewHtml;
    previewBody.dataset.plain = plain;
    previewBody.dataset.clipboardHtml = clipboardHtml;
  }

  function selectTemplate(id){
    state.templateId = id;
    state.values = initDefaults(currentTemplate());
    renderMeta(currentTemplate());
    renderForm();
    renderPreview();
  }

  function copyToClipboard(){
    const plainText = previewBody.dataset.plain || previewBody.textContent;
    const htmlText = `<div style="font-family:'Times New Roman', Times, serif;">${previewBody.dataset.clipboardHtml || previewBody.innerHTML}</div>`;
    const done = () => {
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 1600);
    };

    if(navigator.clipboard && window.ClipboardItem){
      const item = new ClipboardItem({
        'text/plain': new Blob([plainText], {type:'text/plain'}),
        'text/html': new Blob([htmlText], {type:'text/html'})
      });
      navigator.clipboard.write([item]).then(done).catch(() => {
        navigator.clipboard.writeText(plainText).then(done).catch(() => fallbackCopy(plainText, done));
      });
    } else if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(plainText).then(done).catch(() => fallbackCopy(plainText, done));
    } else {
      fallbackCopy(plainText, done);
    }
  }

  function fallbackCopy(text, done){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch(e) {}
    document.body.removeChild(ta);
  }

  function updateClock(){
    if(!clock) return;
    const now = new Date();
    const opts = { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' };
    clock.textContent = now.toLocaleString('en-IN', opts);
  }

  function templateIdFromUrl(){
    try{
      const params = new URLSearchParams(window.location.search);
      const t = params.get('t');
      return ALL_TEMPLATES.some(x => x.id === t) ? t : null;
    } catch(e){ return null; }
  }

  function buildTemplateUrl(id){
    try{
      const url = new URL(window.location.href);
      url.searchParams.set('t', id);
      return url.toString();
    } catch(e){
      const base = window.location.href.split('?')[0];
      return base + '?t=' + encodeURIComponent(id);
    }
  }

  function openTemplateInNewTab(id){
    const url = buildTemplateUrl(id);

    // Inside a Chrome/Edge extension (e.g. the side panel), window.open is
    // unreliable — side panels are a restricted context. chrome.tabs.create
    // works consistently there and needs no extra permission for this use.
    if(typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create){
      chrome.tabs.create({ url });
      return;
    }

    const opened = window.open(url, '_blank');
    if(!opened){
      // Popup blocked (or file:// restrictions) — fall back to navigating
      // this tab rather than silently doing nothing.
      window.location.href = url;
    }
  }

  templatePicker.addEventListener('change', e => {
    const newId = e.target.value;
    openTemplateInNewTab(newId);
    templatePicker.value = state.templateId; // keep this tab exactly as it was
  });
  copyBtn.addEventListener('click', copyToClipboard);
  resetBtn.addEventListener('click', () => selectTemplate(state.templateId));

  populatePicker();
  selectTemplate(templateIdFromUrl() || ALL_TEMPLATES[0].id);
  updateClock();
  setInterval(updateClock, 30000);

})();
