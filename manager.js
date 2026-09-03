(function(){

  const STORAGE_KEY = 'itComposer.customTemplates.draft';

  const templateList = document.getElementById('templateList');
  const newTemplateBtn = document.getElementById('newTemplateBtn');
  const editorEmpty = document.getElementById('editorEmpty');
  const editorForm = document.getElementById('editorForm');
  const fieldsList = document.getElementById('fieldsList');
  const addFieldBtn = document.getElementById('addFieldBtn');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const previewFormHost = document.getElementById('previewFormHost');
  const previewBody = document.getElementById('previewBody');
  const stubEyebrow = document.getElementById('stubEyebrow');
  const stubTitle = document.getElementById('stubTitle');
  const stamp = document.getElementById('stamp');

  const fTitle = document.getElementById('fTitle');
  const fStamp = document.getElementById('fStamp');
  const fWhenToUse = document.getElementById('fWhenToUse');
  const fStampColor = document.getElementById('fStampColor');
  const fAudience = document.getElementById('fAudience');
  const fBody = document.getElementById('fBody');

  const FIELD_TYPES = ['text','textarea','date','time','select','radio','checkbox','checkboxGroup','checklist'];

  // in-memory working set of custom template definitions (plain, not compiled)
  let items = loadDraft();
  let editingId = null;
  let previewValues = {};

  function loadDraft(){
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved) return JSON.parse(saved);
    } catch(e){}
    return (typeof CUSTOM_TEMPLATES !== 'undefined' ? CUSTOM_TEMPLATES : []).map(t => JSON.parse(JSON.stringify(t)));
  }

  function saveDraft(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function slugify(text){
    return text.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'field';
  }

  function uniqueId(base){
    let id = base, n = 1;
    while(items.some(t => t.id === id)) id = base + (++n);
    return id;
  }

  // --- list rendering ---
  function renderList(){
    if(items.length === 0){
      templateList.innerHTML = '<p class="mgr-list-empty">No custom templates yet.</p>';
      return;
    }
    templateList.innerHTML = '';
    items.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mgr-list-item' + (t.id === editingId ? ' active' : '');
      btn.textContent = t.title || '(untitled)';
      btn.addEventListener('click', () => selectTemplate(t.id));
      templateList.appendChild(btn);
    });
  }

  // --- editor ---
  function blankTemplate(){
    const n = (items.length ? Math.max(...items.map(t=>t.number||0)) : 9) + 1;
    return {
      id: uniqueId('custom_' + Date.now()),
      number: n,
      title: '',
      whenToUse: '',
      audience: 'Customer',
      stamp: 'NEW',
      stampColor: 'teal',
      fields: [],
      body: 'Dear Customer,\n\nGreetings from Petpooja!\n\n'
    };
  }

  function selectTemplate(id){
    editingId = id;
    const t = items.find(x => x.id === id);
    editorEmpty.style.display = 'none';
    editorForm.style.display = 'flex';
    fTitle.value = t.title || '';
    fStamp.value = t.stamp || '';
    fWhenToUse.value = t.whenToUse || '';
    fStampColor.value = t.stampColor || 'teal';
    fAudience.value = t.audience || '';
    fBody.value = t.body || '';
    renderFieldsEditor(t.fields || []);
    previewValues = {};
    renderList();
    renderPreview();
  }

  function currentEditingTemplate(){
    return items.find(x => x.id === editingId);
  }

  function renderFieldsEditor(fields){
    fieldsList.innerHTML = '';
    fields.forEach((f, idx) => fieldsList.appendChild(fieldCard(f, idx)));
  }

  function fieldCard(f, idx){
    const card = document.createElement('div');
    card.className = 'mgr-field-card';

    const row1 = document.createElement('div');
    row1.className = 'mgr-field-card-row';

    const labelWrap = document.createElement('div');
    labelWrap.innerHTML = '<label>Field label</label>';
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.value = f.label || '';
    labelInput.placeholder = 'e.g. Refund amount';
    labelInput.addEventListener('input', () => {
      f.label = labelInput.value;
      if(!f._idLocked) f.id = uniqueFieldId(f, slugify(labelInput.value));
      tokenEl.textContent = '{{' + f.id + '}}';
      syncEditingTemplate();
    });
    labelWrap.appendChild(labelInput);

    const typeWrap = document.createElement('div');
    typeWrap.innerHTML = '<label>Field type</label>';
    const typeSelect = document.createElement('select');
    typeSelect.innerHTML = FIELD_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
    typeSelect.value = f.type || 'text';
    typeSelect.addEventListener('change', () => {
      f.type = typeSelect.value;
      renderFieldsEditor(currentEditingTemplate().fields);
      syncEditingTemplate();
    });
    typeWrap.appendChild(typeSelect);

    row1.appendChild(labelWrap);
    row1.appendChild(typeWrap);
    card.appendChild(row1);

    if(['select','radio','checkboxGroup'].includes(f.type)){
      const row2 = document.createElement('div');
      row2.className = 'mgr-field-card-row';
      const optWrap = document.createElement('div');
      optWrap.style.gridColumn = '1 / -1';
      optWrap.innerHTML = '<label>Options (comma separated)</label>';
      const optInput = document.createElement('input');
      optInput.type = 'text';
      optInput.value = (f.options || []).join(', ');
      optInput.placeholder = 'Option A, Option B, Option C';
      optInput.addEventListener('input', () => {
        f.options = optInput.value.split(',').map(s => s.trim()).filter(Boolean);
        syncEditingTemplate();
      });
      optWrap.appendChild(optInput);
      row2.appendChild(optWrap);
      card.appendChild(row2);
    }

    if(f.type === 'checklist'){
      const row2 = document.createElement('div');
      row2.className = 'mgr-field-card-row';
      const itemsWrap = document.createElement('div');
      itemsWrap.style.gridColumn = '1 / -1';
      itemsWrap.innerHTML = '<label>Checklist items (comma separated)</label>';
      const itemsInput = document.createElement('input');
      itemsInput.type = 'text';
      itemsInput.value = (f.items || []).join(', ');
      itemsInput.placeholder = 'Item one, Item two, Item three';
      itemsInput.addEventListener('input', () => {
        f.items = itemsInput.value.split(',').map(s => s.trim()).filter(Boolean);
        syncEditingTemplate();
      });
      itemsWrap.appendChild(itemsInput);
      row2.appendChild(itemsWrap);
      card.appendChild(row2);
    }

    const footer = document.createElement('div');
    footer.className = 'mgr-field-card-row';
    footer.style.marginTop = '8px';
    footer.style.alignItems = 'center';

    const tokenEl = document.createElement('span');
    tokenEl.className = 'mgr-field-token';
    tokenEl.textContent = '{{' + f.id + '}}';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'mgr-field-remove';
    removeBtn.textContent = 'Remove field';
    removeBtn.addEventListener('click', () => {
      const t = currentEditingTemplate();
      t.fields = t.fields.filter(x => x !== f);
      renderFieldsEditor(t.fields);
      syncEditingTemplate();
    });

    footer.appendChild(tokenEl);
    footer.appendChild(removeBtn);
    card.appendChild(footer);

    if(!f.id) f.id = uniqueFieldId(f, slugify(f.label || 'field'));
    return card;
  }

  function uniqueFieldId(field, base){
    const t = currentEditingTemplate();
    let id = base, n = 1;
    while(t.fields.some(x => x !== field && x.id === id)) id = base + (++n);
    return id;
  }

  function syncEditingTemplate(){
    const t = currentEditingTemplate();
    if(!t) return;
    t.title = fTitle.value;
    t.stamp = fStamp.value || 'NEW';
    t.whenToUse = fWhenToUse.value;
    t.stampColor = fStampColor.value;
    t.audience = fAudience.value;
    t.body = fBody.value;
    saveDraft();
    renderList();
    renderPreview();
  }

  [fTitle, fStamp, fWhenToUse, fStampColor, fAudience, fBody].forEach(el => {
    el.addEventListener('input', syncEditingTemplate);
    el.addEventListener('change', syncEditingTemplate);
  });

  newTemplateBtn.addEventListener('click', () => {
    const t = blankTemplate();
    items.push(t);
    saveDraft();
    selectTemplate(t.id);
  });

  addFieldBtn.addEventListener('click', () => {
    const t = currentEditingTemplate();
    if(!t) return;
    t.fields.push({id:'', label:'', type:'text'});
    renderFieldsEditor(t.fields);
    syncEditingTemplate();
  });

  saveBtn.addEventListener('click', () => {
    syncEditingTemplate();
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => saveBtn.textContent = 'Save template', 1200);
  });

  deleteBtn.addEventListener('click', () => {
    if(!editingId) return;
    if(!confirm('Delete this template? This only removes it from your draft — click Export afterwards to update the file.')) return;
    items = items.filter(t => t.id !== editingId);
    editingId = null;
    saveDraft();
    editorForm.style.display = 'none';
    editorEmpty.style.display = 'block';
    renderList();
  });

  // --- live preview ---
  function renderPreview(){
    const t = currentEditingTemplate();
    if(!t){ previewBody.textContent = ''; return; }

    previewFormHost.innerHTML = '';
    (t.fields || []).forEach(f => {
      if(!f.id) return;
      const group = document.createElement('div');
      group.className = 'field-group';
      const label = document.createElement('label');
      label.className = 'field-label';
      label.textContent = f.label || f.id;
      group.appendChild(label);

      let input;
      if(f.type === 'textarea'){
        input = document.createElement('textarea');
        input.value = previewValues[f.id] || '';
        input.addEventListener('input', () => { previewValues[f.id] = input.value; runPreview(); });
      } else if(f.type === 'select'){
        input = document.createElement('select');
        input.innerHTML = ['', ...(f.options||[])].map(o => `<option value="${o}">${o||'Select…'}</option>`).join('');
        input.value = previewValues[f.id] || '';
        input.addEventListener('change', () => { previewValues[f.id] = input.value; runPreview(); });
      } else if(f.type === 'checkbox'){
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!previewValues[f.id];
        input.addEventListener('change', () => { previewValues[f.id] = input.checked; runPreview(); });
      } else if(f.type === 'date' || f.type === 'time'){
        input = document.createElement('input');
        input.type = f.type;
        input.value = previewValues[f.id] || '';
        input.addEventListener('change', () => { previewValues[f.id] = input.value; runPreview(); });
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = previewValues[f.id] || '';
        input.addEventListener('input', () => { previewValues[f.id] = input.value; runPreview(); });
      }
      group.appendChild(input);
      previewFormHost.appendChild(group);
    });

    runPreview();
  }

  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function segmentsToHtml(segments){
    return segments.map(s => {
      let t = escapeHtml(s.text);
      if(s.mark) t = `<mark class="hl-${s.mark}">${t}</mark>`;
      if(s.bold) t = `<strong>${t}</strong>`;
      return t;
    }).join('');
  }

  function runPreview(){
    const t = currentEditingTemplate();
    if(!t) return;
    stubEyebrow.textContent = 'PREVIEW';
    stubTitle.textContent = t.title || '(untitled)';
    stamp.textContent = t.stamp || 'NEW';
    stamp.className = 'stamp' + (t.stampColor && t.stampColor !== 'teal' ? ' ' + t.stampColor : '');
    try{
      const lines = renderCustomTemplate(t, previewValues);
      previewBody.innerHTML = lines.map(segmentsToHtml).join('\n');
    } catch(e){
      previewBody.textContent = 'Preview error: ' + e.message;
    }
  }

  // --- export / import ---
  exportBtn.addEventListener('click', () => {
    const clean = items.map(t => ({
      id:t.id, number:t.number, title:t.title, whenToUse:t.whenToUse,
      audience:t.audience, stamp:t.stamp, stampColor:t.stampColor,
      fields:t.fields, body:t.body
    }));
    const content =
`/* ---------------------------------------------------------
   Custom templates added via manager.html.
   Exported ${new Date().toISOString().slice(0,10)}.
   Keep this file alongside templates.js, engine.js, app.js
   and style.css in both the web app and extension folders.
--------------------------------------------------------- */
const CUSTOM_TEMPLATES = ${JSON.stringify(clean, null, 2)};
`;
    const blob = new Blob([content], {type:'text/javascript'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customTemplates.js';
    a.click();
    URL.revokeObjectURL(url);
  });

  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const match = reader.result.match(/const\s+CUSTOM_TEMPLATES\s*=\s*(\[[\s\S]*\]);/);
        if(!match) throw new Error('Could not find CUSTOM_TEMPLATES in this file.');
        const parsed = JSON.parse(match[1]);
        items = parsed;
        saveDraft();
        editingId = null;
        editorForm.style.display = 'none';
        editorEmpty.style.display = 'block';
        renderList();
      } catch(err){
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  renderList();

})();
