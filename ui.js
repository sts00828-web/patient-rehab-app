// Shared UI, QR controls and startup. Clinical/data rules live in core.js and app-v2.js.
const TEMPLATES = {};
const DOW_LABEL = ['日','月','火','水','木','金','土'];
let S=null,L={},T={};
let calDate=new Date(),calSelectedKey=null,pressTimer=null,pressStartXY=null,__editingExIdx=null,__qrScanner=null,toastTimer=null;

function dk(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

function todayKey() { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }

function parseDate(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }

function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }

function fmtJ(d) { return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${DOW_LABEL[d.getDay()]}）`; }

function getMenu() { return (S && S.menu) ? S.menu : []; }

function getAllTemplates() {
  const templates=Object.assign({}, TEMPLATES, Object.fromEntries(Object.entries(T).filter(([key])=>!key.startsWith('doseDefault_'))));
  // Filter the selection view only; stored templates and historical menus stay intact.
  return Object.fromEntries(Object.entries(templates).map(([key,t])=>[key,{...t,menu:t.menu.filter(ex=>typeof ClinicalRules==='undefined'||!ClinicalRules.isNew(ex)||ClinicalRules.definition(ex)?.status!=='retired')}]));
}

function isExForDow(ex, dow) {
  if (!ex.dows || ex.dows.length === 0) return true;
  return ex.dows.includes(dow);
}

function dayCount() {
  if (!S || !S.startDate) return 0;
  const start = parseDate(S.startDate);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.max(0, Math.floor((today - start) / 86400000) + 1);
}

function renderHeader() {
  if (!S) {
    document.getElementById('hdr-name').textContent = '未設定';
    document.getElementById('hdr-day').textContent = '';
    return;
  }
  document.getElementById('hdr-name').textContent = S.patientName || '患者さん';
  const day = dayCount();
  document.getElementById('hdr-day').textContent = `${day} 日目`;
}

function calSelect(key) { calSelectedKey = calSelectedKey === key ? null : key; renderCalendar(); }

function switchTab(t) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nbtn').forEach(b => b.classList.remove('on'));
  document.getElementById('tab-'+t).classList.add('active');
  document.getElementById('nbtn-'+t).classList.add('on');
  if (t === 'today') renderToday();
  if (t === 'cal') { calDate = new Date(); calSelectedKey = null; renderCalendar(); }
  if (t === 'prog') renderProgress();
  window.scrollTo({top:0,behavior:'instant'});
}

function bindTitleLongPress() {
  const t = document.querySelector('.header');
  const PRESS_MS = 2000;
  const MOVE_TOLERANCE = 18; // px

  const start = (e) => {
    cancel();
    const pt = e.touches ? e.touches[0] : e;
    pressStartXY = { x: pt.clientX, y: pt.clientY };
    t.classList.add('pressing');
    pressTimer = setTimeout(() => {
      t.classList.remove('pressing');
      pressTimer = null;
      openPinModal();
    }, PRESS_MS);
  };
  const cancel = () => {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    t.classList.remove('pressing');
    pressStartXY = null;
  };
  const move = (e) => {
    if (!pressStartXY) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - pressStartXY.x;
    const dy = pt.clientY - pressStartXY.y;
    if (dx*dx + dy*dy > MOVE_TOLERANCE*MOVE_TOLERANCE) cancel();
  };
  t.addEventListener('touchstart', start, { passive:true });
  t.addEventListener('touchend', cancel);
  t.addEventListener('touchcancel', cancel);
  t.addEventListener('touchmove', move, { passive:true });
  t.addEventListener('mousedown', start);
  t.addEventListener('mouseup', cancel);
  t.addEventListener('mouseleave', cancel);
  t.addEventListener('mousemove', move);

  // フォールバック: URL末尾に #staff を付ければ直接起動
  if (location.hash === '#staff') openPinModal();
}

function openPinModal() {
  if(!localPin){staffUnlocked=true;openTherapist();return;}
  document.getElementById('pin-input').value = '';
  document.getElementById('pinModal').classList.add('on');
  setTimeout(() => document.getElementById('pin-input').focus(), 100);
}

function closePinModal() { document.getElementById('pinModal').classList.remove('on'); }

function saveCurrentAsTemplate() {
  if (!requireStaff()) return;
  if (!S || !Array.isArray(S.menu) || S.menu.length === 0) {
    alert('メニューが空です。種目を追加してから保存してください。'); return;
  }
  showSaveTemplateModal();
}

function showSaveTemplateModal() {
  const defaultName = S.diagnosis || '';
  const html = `<div class="t-overlay on" id="saveTplModal" onclick="if(event.target===this)closeSaveTplModal()">
    <div class="t-modal" style="max-width:420px">
      <div class="t-hd">
        <h2>💾 テンプレートとして保存</h2>
        <button class="t-close" onclick="closeSaveTplModal()">×</button>
      </div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.6">
        現在のメニュー（${S.menu.length}種目）を疾患テンプレートとして保存します。<br>
        次回から他の患者にも適用できます。
      </p>
      <div class="fld">
        <label class="fld-lbl">テンプレート名 * （疾患名など）</label>
        <input class="fld-inp" id="tpl-save-name" type="text" value="${escapeAttr(defaultName)}" placeholder="例: 膝OA">
      </div>
      <div class="fld-row">
        <div class="fld" style="flex:0 0 110px">
          <label class="fld-lbl">アイコン</label>
          <input class="fld-inp" id="tpl-save-icon" type="text" value="🩺" maxlength="4" style="text-align:center;font-size:20px">
        </div>
        <div class="fld">
          <label class="fld-lbl">説明（短文）</label>
          <input class="fld-inp" id="tpl-save-desc" type="text" value="" placeholder="例: 大腿四頭筋強化中心">
        </div>
      </div>
      <div class="hint" style="margin-bottom:10px">
        アイコン候補: 💪 🌿 🦴 🦵 🦶 ✋ 🤚 🧘 🩺 🌱 🏃 🚶
      </div>
      <button class="btn btn-pri" onclick="doSaveTemplate()">💾 保存する</button>
    </div>
  </div>`;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstChild);
}

function closeSaveTplModal() { const m = document.getElementById('saveTplModal'); if (m) m.remove(); }

function deleteCustomTemplate(key) {
  if (!requireStaff()) return;
  const tpl = T[key];
  if (!tpl) return;
  if (!confirm(`カスタムテンプレ「${tpl.name}」を削除しますか？\n※既に適用済みの患者メニューには影響しません`)) return;
  delete T[key];
  saveTemplates();
  renderTherapist();
  toast('削除しました');
}

function exportTemplates() {
  if (!requireStaff()) return;
  if (Object.keys(T).length === 0) {
    alert('カスタムテンプレートがありません。'); return;
  }
  const data = JSON.stringify({ templates: T, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rehab_templates_${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function showShareQR() {
  if (!requireStaff()) return;
  if (!S || !S.menu || S.menu.length === 0) {
    alert('メニューが未設定です。テンプレを選択するか、種目を追加してから転送してください。');
    return;
  }
  const url = buildShareUrl();
  if (!url) return;
  const html = `<div class="t-overlay on" id="qrModal" onclick="if(event.target===this)closeQR()">
    <div class="t-modal" style="max-width:420px;text-align:center">
      <div class="t-hd">
        <h2>📱 患者スマホへ転送</h2>
        <button class="t-close" onclick="closeQR()">×</button>
      </div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:8px">
        患者さんのアプリを開き、<strong>「設定QRを読み取る」</strong>で読み取ってください。呼び名は患者さんの端末で入力します。
      </p>
      <div id="qrBox"></div>
      <div style="font-size:11px;color:var(--text2);margin-top:10px;text-align:left;font-weight:700">📎 URL（タップで全選択→長押しでコピー）</div>
      <textarea id="qrUrl" readonly onclick="this.select()" style="width:100%;min-height:60px;font-size:10px;font-family:monospace;padding:8px;border:1.5px solid var(--border);border-radius:6px;margin-top:4px;background:#fafcfd;color:var(--text);word-break:break-all;resize:none">${escapeHtml(url)}</textarea>
      <button class="btn btn-pri" style="margin-top:8px" onclick="copyShareUrl()">📋 URLをコピー</button>
      <div class="hint" style="margin-top:8px;text-align:left">
        ※ 既存データがある場合は患者側で確認ダイアログが出ます<br>
        ※ <strong>LINEで送る場合は通常メッセージとして1行で送信</strong>（改行・スペースを入れない）<br>
        ※ 患者側でうまく開けない場合は、URLを長押しコピーしてアプリを直接開き、「📥 URLから読み込む」欄に貼り付け
      </div>
    </div>
  </div>`;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstChild);

  // QR生成
  try {
    if (typeof qrcode === 'undefined') throw new Error('qrcode未読込');
    let qr,level='M';
    try{qr=qrcode(0,level);qr.addData(url);qr.make();}
    catch{level='L';qr=qrcode(0,level);qr.addData(url);qr.make();}
    document.getElementById('qrBox').innerHTML = qr.createSvgTag({ scalable:true, margin:4 })+(level==='L'?'<p class="hint">指示が多いため、明るい場所で画面全体を読み取ってください。読み取りにくい場合は下のURLをコピーして渡せます。</p>':'');
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    const reason = /overflow|too long/i.test(detail)
      ? '個別指示などの情報量がQRコードの容量を超えています。'
      : 'QRコードを生成できませんでした：'+detail;
    document.getElementById('qrBox').innerHTML =
      `<div style="color:var(--orange);font-size:12px;padding:20px">${escapeHtml(reason)}<br>内容は省略していません。下のURLを全文コピーして患者さんへ渡してください。</div>`;
  }
}

function closeQR() { const m = document.getElementById('qrModal'); if (m) m.remove(); }

function showInstallQR() {
  const url = `${location.origin}${location.pathname}`;
  const html = `<div class="t-overlay on" id="installQrModal" onclick="if(event.target===this)closeInstallQR()">
    <div class="t-modal" style="max-width:420px;text-align:center">
      <div class="t-hd">
        <h2>📲 アプリインストール用QR</h2>
        <button class="t-close" onclick="closeInstallQR()">×</button>
      </div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:8px;line-height:1.7">
        全患者共通のアプリURL。<strong>待合室に印刷掲示</strong>してもOK。<br>
        患者がスマホで読み取り→Safariで開く→「ホーム画面に追加」でインストール完了。
      </p>
      <div id="installQrBox"></div>
      <div style="font-size:11px;color:var(--text2);margin-top:10px;text-align:left;font-weight:700">📎 URL</div>
      <textarea id="installQrUrl" readonly onclick="this.select()" style="width:100%;min-height:36px;font-size:11px;font-family:monospace;padding:8px;border:1.5px solid var(--border);border-radius:6px;margin-top:4px;background:#fafcfd;color:var(--text);word-break:break-all;resize:none">${escapeHtml(url)}</textarea>
      <button class="btn btn-pri" style="margin-top:8px" onclick="copyInstallUrl()">📋 URLをコピー</button>
      <div class="hint" style="margin-top:10px;text-align:left;line-height:1.7">
        <strong>患者の手順：</strong><br>
        ① スマホのカメラでQR読み取り<br>
        ② Safariが開く → 共有ボタン → <strong>「ホーム画面に追加」</strong><br>
        ③ ホーム画面アイコンをタップ → セラピストの「設定データQR」を待つ
      </div>
    </div>
  </div>`;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstChild);

  // QR生成
  try {
    if (typeof qrcode === 'undefined') throw new Error('qrcode未読込');
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    document.getElementById('installQrBox').innerHTML = qr.createSvgTag({ scalable:true, margin:2 });
    // ボックスサイズ調整
    const svg = document.querySelector('#installQrBox svg');
    if (svg) { svg.style.width = '240px'; svg.style.height = '240px'; svg.style.display = 'inline-block'; svg.style.background = '#fff'; svg.style.padding = '10px'; svg.style.border = '1px solid var(--border)'; svg.style.borderRadius = '8px'; }
  } catch (e) {
    document.getElementById('installQrBox').innerHTML =
      `<div style="color:var(--orange);font-size:12px;padding:20px">QR生成失敗：${escapeHtml(e.message)}</div>`;
  }
}

function closeInstallQR() { const m = document.getElementById('installQrModal'); if (m) m.remove(); }

function copyInstallUrl() {
  const el = document.getElementById('installQrUrl');
  const url = el.value || '';
  navigator.clipboard.writeText(url).then(() => toast('URLをコピーしました')).catch(() => {
    el.select && el.select();
    try { document.execCommand('copy'); toast('URLをコピーしました'); }
    catch(e) { toast('長押しで手動コピーしてください'); }
  });
}

function startQrScan() {
  if (__qrScanner) {
    if (__qrScanner.cancelled) toast('カメラの終了処理中です。少し待ってからお試しください。');
    return;
  }
  if (typeof Html5Qrcode === 'undefined') {
    alert('QR読み取りライブラリ未読込。オンラインで再度お試しください。');
    return;
  }
  const html = `<div class="t-overlay on" id="qrScanModal">
    <div class="t-modal" style="max-width:380px">
      <div class="t-hd">
        <h2>📷 QRコードを読み取り</h2>
        <button class="t-close" onclick="stopQrScan()">×</button>
      </div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:10px;line-height:1.6">
        セラピストの「設定データQR」をカメラに向けてください。<br>
        自動的に読み取られます。
      </p>
      <div id="qr-reader" style="width:100%;background:#000;border-radius:8px;overflow:hidden;min-height:280px"></div>
      <div id="qr-reader-status" style="text-align:center;margin-top:8px;font-size:12px;color:var(--text2)">カメラを起動しています...</div>
      <button class="btn btn-out" style="margin-top:10px" onclick="stopQrScan()">キャンセル</button>
    </div>
  </div>`;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstChild);

  const session = { scanner: null, cancelled: false, started: false, ready: null, closing: null };
  __qrScanner = session;
  const config = { fps: 10, qrbox: { width: 240, height: 240 } };
  let handled = false;
  session.ready = Promise.resolve().then(() => {
    if (session.cancelled) return;
    session.scanner = new Html5Qrcode('qr-reader');
    return session.scanner.start(
    { facingMode: 'environment' },  // リアカメラ優先
    config,
    (decodedText) => {
      if (handled || session.cancelled) return;
      handled = true;
      // 読み取り成功
      stopQrScan().then(() => {
        try { manualImport(decodedText); }
        catch(e) { alert('読み取り後の処理でエラー: ' + e.message); }
      });
    },
    () => { /* 各フレームの未検出は無視 */ }
    ).then(() => { session.started = true; });
  }).then(() => {
    if (session.cancelled) return;
    const s = document.getElementById('qr-reader-status');
    if (s) s.textContent = '🔍 QRコードに向けてください';
  }).catch(err => {
    if (session.cancelled) return;
    const s = document.getElementById('qr-reader-status');
    if (s) s.innerHTML = `<span style="color:var(--red)">カメラ起動失敗：${escapeHtml(String(err))}<br>カメラ許可を確認するか、URLコピーをお使いください。</span>`;
  });
}

function stopQrScan() {
  const session = __qrScanner;
  if (!session) return Promise.resolve();
  if (session.closing) return session.closing;
  session.cancelled = true;
  const modal = document.getElementById('qrScanModal');
  if (modal) modal.style.display = 'none';
  // Keep the reader mounted until a pending permission/start request has settled.
  session.closing = session.ready.then(async () => {
    try { if (session.started) await session.scanner.stop(); }
    catch(e) {
      modal?.querySelectorAll('video').forEach(video => video.srcObject?.getTracks().forEach(track => track.stop()));
    }
    finally {
      try { session.scanner?.clear(); } catch(e) {}
      modal?.remove();
      if (__qrScanner === session) __qrScanner = null;
    }
  });
  return session.closing;
}

function copyShareUrl() {
  const el = document.getElementById('qrUrl');
  // textarea なので value、もし textContent しか無くてもどちらかが取れる
  const url = (el.value !== undefined ? el.value : el.textContent) || '';
  navigator.clipboard.writeText(url).then(() => toast('URLをコピーしました')).catch(() => {
    // fallback
    el.select && el.select();
    try { document.execCommand('copy'); toast('URLをコピーしました'); }
    catch(e) { toast('コピー失敗 - 長押しで手動コピーしてください'); }
  });
}

function extractImportData() {
  // 1) クエリ ?d= / ?import= （URL生抽出で +を保持）
  const search = location.search || '';
  let m = search.match(/[?&](?:d|import)=([^&]+)/);
  if (m) {
    // %xx をデコード（+ が %2B として送られている場合に + に戻る）
    try { return decodeURIComponent(m[1]); } catch(e) { return m[1]; }
  }
  // 2) ハッシュ #d= / #import= (後方互換)
  const hash = location.hash || '';
  m = hash.match(/[#&](?:d|import)=([^&]+)/);
  if (m) {
    try { return decodeURIComponent(m[1]); } catch(e) { return m[1]; }
  }
  return null;
}

function escapeHtml(s) {
  return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function escapeAttr(s) { return escapeHtml(s).replace(/`/g,'&#96;'); }

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1800);
}

function init() {
  loadState();
  // URLハッシュからのインポート（PT端末からのQR読み取り）
  handleImportFromHash();
  // 登録済みの空処方は休養日として表示し、初回案内で覆わない。
  if (!S) {
    const ov = document.getElementById('setupOverlay');
    ov.hidden = false;
    // PWA（standalone）として開いているかで案内文を切り替え
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                       || window.navigator.standalone === true;
    document.getElementById('setup-intro-standalone').style.display = isStandalone ? 'block' : 'none';
    document.getElementById('setup-intro-browser').style.display    = isStandalone ? 'none'  : 'block';
  }
  bindTitleLongPress();
  renderHeader();
  renderToday();
}

document.addEventListener('DOMContentLoaded',init);
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
