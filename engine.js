/* ---------------------------------------------------------
   Shared rendering engine for CUSTOM (manager-built) templates.
   Built-in templates (templates.js) use hand-written generate()
   functions and don't go through this file.

   Body markup supported inside a custom template's "body" text:
     {{fieldId}}          -> field value (dates/times auto-formatted)
     {{fieldId|lower}}    -> field value, lowercased
     **text**             -> bold segment
     ==text==             -> yellow-highlight segment
     {{if fieldId}}        block only rendered if the field has a value
     ...
     {{/if}}
     {{checklist:fieldId}} -> expands a checklist field's set items
                              as "Item : Status" lines under its label
--------------------------------------------------------- */

function engineFmtDate(iso){
  if(!iso) return '__/__/____';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function engineFmtTime(t){
  if(!t) return '--:-- --';
  let [h,m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if(h === 0) h = 12;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${suffix}`;
}

function engineGetField(template, id){
  return (template.fields || []).find(f => f.id === id);
}

function engineFormatValue(field, raw){
  if(field){
    if(field.type === 'date') return engineFmtDate(raw);
    if(field.type === 'time') return engineFmtTime(raw);
    if(field.type === 'checkboxGroup') return Array.isArray(raw) && raw.length ? raw.join(', ') : (field.fallback ?? '—');
  }
  return (raw === undefined || raw === null || raw === '') ? (field?.fallback ?? '____________') : raw;
}

function engineTruthy(template, values, fieldId){
  const field = engineGetField(template, fieldId);
  const v = values[fieldId];
  if(field && field.type === 'checkbox') return !!v;
  if(field && field.type === 'checkboxGroup') return Array.isArray(v) && v.length > 0;
  if(field && field.type === 'checklist') return v && Object.values(v).some(x => x);
  return v !== undefined && v !== null && v !== '';
}

function engineChecklistBlock(field, values){
  const data = (values[field.id]) || {};
  const rows = (field.items || [])
    .map(item => [item, data[item] || ''])
    .filter(([, status]) => status !== '')
    .map(([item, status]) => `${item} : ${status}`);
  if(rows.length === 0) return '';
  return [field.label.replace(/\s*—\s*optional$/i,'') + ':', ...rows].join('\n');
}

// Splits raw body text into lines, applies {{if}}...{{/if}} block filtering
// (single level, no nesting), then token-substitutes and parses **bold**/==mark==
// into segment arrays. Returns an array of "lines" (array of segments each).
function renderCustomTemplate(template, values){
  const rawLines = (template.body || '').split('\n');
  const kept = [];
  let skipping = false;

  rawLines.forEach(raw => {
    const ifMatch = raw.trim().match(/^\{\{if\s+(\w+)\}\}$/);
    const endMatch = raw.trim().match(/^\{\{\/if\}\}$/);
    if(ifMatch){
      skipping = !engineTruthy(template, values, ifMatch[1]);
      return;
    }
    if(endMatch){
      skipping = false;
      return;
    }
    if(!skipping) kept.push(raw);
  });

  const outLines = [];

  kept.forEach(raw => {
    const checklistMatch = raw.trim().match(/^\{\{checklist:(\w+)\}\}$/);
    if(checklistMatch){
      const field = engineGetField(template, checklistMatch[1]);
      if(!field) return;
      const block = engineChecklistBlock(field, values);
      if(!block) return;
      block.split('\n').forEach(l => outLines.push([{text:l}]));
      return;
    }

    let text = raw.replace(/\{\{(\w+)(\|lower)?\}\}/g, (m, id, lowerFlag) => {
      const field = engineGetField(template, id);
      let v = engineFormatValue(field, values[id]);
      if(lowerFlag) v = String(v).toLowerCase();
      return v;
    });

    const segments = [];
    let idx = 0;
    const re = /(\*\*[^*]+\*\*|==[^=]+==)/g;
    let m;
    while((m = re.exec(text))){
      if(m.index > idx) segments.push({text: text.slice(idx, m.index)});
      const token = m[0];
      if(token.startsWith('**')) segments.push({text: token.slice(2,-2), bold:true});
      else segments.push({text: token.slice(2,-2), mark:'yellow'});
      idx = re.lastIndex;
    }
    if(idx < text.length) segments.push({text: text.slice(idx)});
    if(segments.length === 0) segments.push({text:''});
    outLines.push(segments);
  });

  return outLines;
}

// Wraps a declarative custom-template definition with a generate() function
// so it behaves exactly like a built-in template from app.js's point of view.
function compileCustomTemplate(def){
  return Object.assign({}, def, {
    interactive: (def.fields || []).length > 0,
    generate(values){ return renderCustomTemplate(def, values); }
  });
}
