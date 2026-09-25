/* Pure data rules. Browser and Node share these functions. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RehabCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clinical = typeof module !== 'undefined' && module.exports ? require('./clinical-rules.js') : globalThis.ClinicalRules;
  const clone = x => JSON.parse(JSON.stringify(x));
  const text = (x, n = 500) => typeof x === 'string' ? x.slice(0, n) : '';
  const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s;
  const id = x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(x) && !(x in Object.prototype);
  const record = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const prescriptionLabels = {side:'実施する側',repetitions:'回数',sets:'セット数',hold:'保持時間',frequency:'1日の実施回数',load:'負荷・強さ',support:'支え方'};
  function prescription(raw) { return Object.fromEntries(Object.keys(prescriptionLabels).map(k=>[k,text(record(raw)?raw[k]:'',120).trim()])); }
  function prescriptionIssues(ex) {
    if(clinical?.isNew(ex)&&ex.clinicalV02?.mode==='simple')return clinical.issues(ex);
    const p=prescription(ex.prescription);
    return [...Object.keys(prescriptionLabels).filter(k=>!p[k]).map(k=>prescriptionLabels[k]),...(ex.scheduleConfirmed===true?[]:['実施曜日の確認']),...(clinical?.issues(ex)||[])];
  }
  function menu(input) {
    if (!Array.isArray(input) || input.length > 60) throw Error('メニューは60種目以内にしてください。');
    const seen = new Set();
    return input.map((m, i) => {
      if (!record(m) || !text(m.name, 120)) throw Error('種目名が不正です。');
      const mid = id(m.id) ? m.id : 'import_' + i;
      if (seen.has(mid)) throw Error('種目IDが重複しています。');
      seen.add(mid);
      const dows = m.dows === undefined ? [] : m.dows;
      if (!Array.isArray(dows) || dows.some(x => !Number.isInteger(x) || x < 0 || x > 6)) throw Error('実施曜日が不正です。');
      return { id: mid, name: text(m.name, 120), params: text(m.params, 100), note: text(m.note), ...(text(m.diseaseNote)?{diseaseNote:text(m.diseaseNote)}:{}), dows: [...new Set(dows)],
        exerciseKey: id(m.exerciseKey) ? m.exerciseKey : '', videoUrl: videoUrl(m.videoUrl), prescription:clinical?.isNew(m)?clinical.prescription(m.clinicalV02):prescription(m.prescription), scheduleConfirmed:m.scheduleConfirmed===true, ...(m.mediaDisabled === true ? {mediaDisabled:true} : {}), ...(clinical?.isNew(m)?{clinicalV02:clinical.normalize(m.clinicalV02)}:{}) };
    });
  }
  function videoUrl(s) {
    if (!s) return '';
    try { const u = new URL(s); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; }
  }
  function settings(raw, fallbackId, today) {
    if (!record(raw)) throw Error('設定データが不正です。');
    const result = { patientId: id(raw.patientId) ? raw.patientId : fallbackId,
      affectedSide: ['right','left','bilateral','none'].includes(raw.affectedSide)?raw.affectedSide:'',
      patientName: text(raw.patientName, 80), chartId: text(raw.chartId, 80), age: text(raw.age, 3), diagnosis: text(raw.diagnosis, 120),
      therapistName: text(raw.therapistName, 80), painContext:text(raw.painContext), consultContact:text(raw.consultContact), restartInstructions:text(raw.restartInstructions), startDate: validDate(raw.startDate) ? raw.startDate : today,
      nextVisit: validDate(raw.nextVisit) ? raw.nextVisit : '', template: id(raw.template) ? raw.template : null,
      menu: menu(raw.menu), knownSince: validDate(raw.knownSince) ? raw.knownSince : today, plans: [] };
    if (Array.isArray(raw.plans)) result.plans = raw.plans.slice(-1000).filter(p => record(p) && validDate(p.from)).map(p => ({from:p.from, menu:menu(p.menu)}));
    if (!result.plans.length) result.plans = [{from:result.knownSince, menu:clone(result.menu)}];
    return result;
  }
  function scheduled(items, dow) { return items.filter(x => !x.dows.length || x.dows.includes(dow)); }
  function menuAt(s, logs, key, dow) {
    if (!s || key < s.startDate) return [];
    const log = logs[key];
    if (log && Array.isArray(log.menuSnapshot)) return clone(log.menuSnapshot);
    if (key < s.knownSince) return [];
    const plans = (s.plans || []).filter(p => p.from <= key).sort((a,b) => a.from.localeCompare(b.from));
    if (!plans.length) return [];
    return clone(scheduled(plans[plans.length - 1].menu, dow));
  }
  function completion(s, logs, key, dow) {
    const log = logs[key] || {};
    const items = menuAt(s, logs, key, dow);
    const total = items.length;
    const done = items.filter(x => log.status?.[x.id] === 'done' || (!log.status?.[x.id] && log.done?.[x.id] === true)).length;
    return {done,total,pct:total ? Math.round(done/total*100) : 0, unknown:!!log.legacyUnknown};
  }
  function logs(raw) {
    if (!record(raw) || Object.keys(raw).length > 20000) throw Error('記録データが不正です。');
    const out = {};
    for (const [key,l] of Object.entries(raw)) {
      if (!validDate(key) || !record(l)) throw Error('記録の日付または形式が不正です。');
      const done = {}, status = {};
      if (record(l.done)) for (const [k,v] of Object.entries(l.done)) if (id(k) && typeof v === 'boolean') done[k] = v;
      if (record(l.status)) for (const [k,v] of Object.entries(l.status)) if (id(k) && ['done','partial','pain','forgot','rest','cancelled'].includes(v)) status[k] = v;
      out[key] = {done,status,vas:Number.isInteger(l.vas) && l.vas >= 0 && l.vas <= 10 ? l.vas : null, note:text(l.note,2000)};
      if(l.events!==undefined){
        if(!Array.isArray(l.events)||l.events.length>10000)throw Error('実施回記録が不正です。');
        const seen=new Set();out[key].events=l.events.map(e=>{
          if(!record(e)||!id(e.event_id)||!id(e.session_id)||!id(e.prescription_item_id)||seen.has(e.event_id)||e.local_date!==key||!['done','partial','pain','forgot','rest','cancelled'].includes(e.status)||(e.timestamp_unknown===true?e.timestamp!==null||!Number.isFinite(Date.parse(e.imported_at)):!Number.isFinite(Date.parse(e.timestamp))))throw Error('実施回記録の識別子・日時・状態が不正です。');
          seen.add(e.event_id);return {event_id:e.event_id,session_id:e.session_id,prescription_item_id:e.prescription_item_id,prescription_version:text(e.prescription_version,100),local_date:key,time_zone:text(e.time_zone,50),timestamp:e.timestamp_unknown===true?null:text(e.timestamp,40),...(e.timestamp_unknown===true?{timestamp_unknown:true,imported_at:text(e.imported_at,40)}:{}),status:e.status,reported_reps:Number.isFinite(e.reported_reps)&&e.reported_reps>=0?e.reported_reps:null,reason_optional:text(e.reason_optional),supersedes_event_id:id(e.supersedes_event_id)?e.supersedes_event_id:null};
        });
      }
      if (Array.isArray(l.menuSnapshot)) out[key].menuSnapshot = menu(l.menuSnapshot);
      if (l.menuRevisions !== undefined) {
        if (!Array.isArray(l.menuRevisions) || l.menuRevisions.length > 100) throw Error('当日のメニュー変更履歴が多すぎます。');
        out[key].menuRevisions = l.menuRevisions.map(r => {
          if (!record(r) || !Array.isArray(r.menuSnapshot)) throw Error('メニュー変更履歴が不正です。');
          const saved = logs({[key]:{menuSnapshot:r.menuSnapshot,done:r.done,status:r.status}})[key];
          return {menuSnapshot:saved.menuSnapshot,done:saved.done,status:saved.status};
        });
      }
      if (l.legacyUnknown) out[key].legacyUnknown = true;
      if (l.legacyOriginal !== undefined) {
        if (!record(l.legacyOriginal)) throw Error('旧記録の形式が不正です。');
        const old = l.legacyOriginal;
        // Preserve one original record only; never recurse through imported history.
        out[key].legacyOriginal = logs({[key]:{done:old.done,status:old.status,vas:old.vas,note:old.note,
          menuSnapshot:old.menuSnapshot,legacyUnknown:old.legacyUnknown}})[key];
      }
    }
    return out;
  }
  function migrate(rawS, rawL, newId, today) {
    if (!rawS) return {settings:null,logs:logs(rawL || {})};
    const s = settings(rawS,newId,today), l = logs(rawL || {});
    // Legacy logs have no historical prescription. Preserve evidence, never invent it.
    for (const value of Object.values(l)) if (!value.menuSnapshot) value.legacyUnknown = true;
    return {settings:s,logs:l};
  }
  function changeMenu(s, l, next, today, tomorrow) {
    clinical?.assertPrescribable(next,s.patientId);
    const date = l[today]?.menuSnapshot ? tomorrow : today;
    s.menu = menu(next);
    s.plans = (s.plans || []).filter(p => p.from !== date);
    s.plans.push({from:date,menu:clone(s.menu)});
    return date;
  }
  function applyMenuToday(s, l, today, dow) {
    clinical?.assertPrescribable(s.menu,s.patientId);
    if (today < s.startDate) throw Error('開始日より前には反映できません。');
    const next = menu(s.menu), current = l[today], items = scheduled(next,dow);
    if (current?.menuSnapshot && JSON.stringify(current.menuSnapshot) !== JSON.stringify(items)) {
      const revisions = current.menuRevisions || [];
      if (revisions.length >= 100) throw Error('当日のメニュー変更は100回までです。');
      const previous = menu(current.menuSnapshot), used = new Set(), done = {}, status = {};
      const signature = ex => JSON.stringify({...ex,id:'',dows:[...ex.dows].sort()});
      for (const ex of items) {
        const candidates = previous.filter(old => !used.has(old.id) && signature(old) === signature(ex));
        const old = candidates.find(old => old.id === ex.id) || (candidates.length === 1 ? candidates[0] : null);
        if (!old) continue;
        used.add(old.id);
        if (Object.hasOwn(current.done || {},old.id)) done[ex.id] = current.done[old.id];
        if (Object.hasOwn(current.status || {},old.id)) status[ex.id] = current.status[old.id];
      }
      current.menuRevisions = [...revisions,clone({menuSnapshot:previous,done:current.done || {},status:current.status || {}})];
      current.menuSnapshot = clone(items);current.done = done;current.status = status;
    }
    s.plans = (s.plans || []).filter(p => p.from < today);
    s.plans.push({from:today,menu:clone(next)});
    return today;
  }
  return {clone,text,id,record,validDate,prescription,prescriptionLabels,prescriptionIssues,menu,settings,logs,migrate,scheduled,menuAt,completion,changeMenu,applyMenuToday,videoUrl};
});
