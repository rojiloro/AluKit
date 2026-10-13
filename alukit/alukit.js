(function(){

function showPopup(msg, type) {
  const old = document.getElementById('ovl-toast'); if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'ovl-toast';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:72px;left:24px;z-index:999999;background:#111;color:#fff;' +
    'font-family:Inter,Segoe UI,Tahoma,sans-serif;font-size:12px;font-weight:600;padding:9px 14px;' +
    'border-radius:8px;border:1px solid ' + (type === 'error' ? '#ef4444' : 'rgba(255,255,255,0.25)') +
    ';box-shadow:0 4px 20px rgba(0,0,0,0.8);transition:opacity 0.3s;transform:rotate(-0.6deg);';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 1800);
}

// === ADVANCED FILTERS UI ===
// ── Persistence helpers ───────────────────────────────────────────
// Settings are held in this variable only. Nothing is written to browser storage of any kind,
// so they are gone when the page reloads.
let memorySettings = {};
function loadSettings() { return memorySettings; }
function saveSettings(data) { memorySettings = data; }

function createAxiomUI() {
  const existing = document.getElementById('ovl-advanced-filters');
  if (existing) existing.remove();

  const F = "'Inter','Segoe UI',Tahoma,Geneva,Verdana,sans-serif";
  const BG = '#000000';
  const BG2 = '#111111';
  const BORDER = 'rgba(255,255,255,0.18)';

  // Load previously saved state
  const savedSettings = loadSettings();

  // ── Overlay backdrop ──────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'ovl-advanced-filters';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.80);
    backdrop-filter: blur(6px);
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${F};
  `;
  function closeOverlay() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); overlay.remove(); }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

  // ── Modal card ────────────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: relative;
    width: 634px;
    max-width: calc(100vw - 32px);
    transform: translate(9px, -6px) rotate(0.4deg);
    background: ${BG};
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.6);
    box-shadow: 0 34px 90px rgba(0,0,0,1), 0 0 0 2px rgba(255,255,255,0.08);
    color: #ffffff;
    overflow: hidden;
    user-select: none;
  `;

  // Drag support
  let isDragging = false, dragOX = 0, dragOY = 0;
  modal.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'LABEL' || e.target.tagName === 'TEXTAREA') return;
    isDragging = true;
    const mr = modal.getBoundingClientRect();
    dragOX = e.clientX - mr.left; dragOY = e.clientY - mr.top;
    modal.style.position = 'fixed'; modal.style.margin = '0';
    modal.style.left = mr.left + 'px'; modal.style.top = mr.top + 'px';
    overlay.style.alignItems = 'unset'; overlay.style.justifyContent = 'unset';
  });
  const onMove = (e) => {
    if (!isDragging) return;
    modal.style.left = (e.clientX - dragOX) + 'px';
    modal.style.top  = (e.clientY - dragOY) + 'px';
  };
  const onUp = () => { isDragging = false; };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  // ── Top-level section tabs (Filters / X Tracker) ──────────────────
  const sectionTabBar = document.createElement('div');
  sectionTabBar.style.cssText = `display:flex;gap:0;border-bottom:1px solid ${BORDER};background:${BG};`;

  const sectionDefs = ['Advanced Filters','X Tracker'];
  let activeSectionTab = savedSettings._activeSection || 'Advanced Filters';
  const sectionBtns = [];
  const sectionPanels = {};

  sectionDefs.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.dataset.section = name;
    btn.style.cssText = `
      padding:${name === 'X Tracker' ? '8px 20px 13px' : '11px 20px'};background:transparent;border:none;border-bottom:2px solid transparent;
      margin-bottom:-1px;cursor:pointer;font-size:12px;font-weight:600;
      font-family:${F};transition:all 0.2s;color:#666;
    `;
    btn.addEventListener('click', () => switchSection(name));
    sectionTabBar.appendChild(btn);
    sectionBtns.push(btn);

    const panel = document.createElement('div');
    panel.style.display = 'none';
    sectionPanels[name] = panel;
  });

  function switchSection(name) {
    activeSectionTab = name;
    sectionBtns.forEach(b => {
      const on = b.dataset.section === name;
      b.style.color = on ? '#ffffff' : '#555';
      b.style.borderBottom = on ? '2px solid #ffffff' : '2px solid transparent';
    });
    Object.entries(sectionPanels).forEach(([k,v]) => v.style.display = k === name ? '' : 'none');
  }

  // ── Header ────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px 20px 0;
    background: ${BG};
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    cursor: move;
  `;
  const headerLeft = document.createElement('div');
  const titleEl = document.createElement('div');
  titleEl.textContent = 'Settings';
  titleEl.style.cssText = 'font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 2px;';
  const subtitleEl = document.createElement('div');
  subtitleEl.textContent = 'Configure your trading setting below';
  subtitleEl.style.cssText = 'font-size: 11px; color: #888; margin-bottom: 10px;';
  headerLeft.appendChild(titleEl);
  headerLeft.appendChild(subtitleEl);
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.style.cssText = `background:transparent;border:none;color:#444;font-size:22px;line-height:1;cursor:pointer;padding:0 2px;transition:color 0.2s;`;
  closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = '#ffffff');
  closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = '#444');
  closeBtn.addEventListener('click', () => closeOverlay());
  header.appendChild(headerLeft);
  header.appendChild(closeBtn);

  // ══════════════════════════════════════════════════════════════════
  // PANEL 1 — Advanced Filters
  // ══════════════════════════════════════════════════════════════════
  const filtersPanel = sectionPanels['Advanced Filters'];

  // ── Body (two columns) ────────────────────────────────────────────
  const body = document.createElement('div');
  body.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:0;padding:18px 20px 14px;background:${BG};`;

  // LEFT: Trading Settings
  const leftCol = document.createElement('div');
  leftCol.style.cssText = `padding-right:20px;border-right:1px solid ${BORDER};`;

  const leftTitle = document.createElement('div');
  leftTitle.textContent = 'Trading Settings';
  leftTitle.style.cssText = `font-size:11px;font-weight:700;color:#22d3ee;margin-bottom:12px;padding-bottom:5px;border-bottom:2px solid #22d3ee;display:inline-block;text-transform:uppercase;letter-spacing:0.05em;`;
  leftCol.appendChild(leftTitle);

  const tabBar = document.createElement('div');
  tabBar.style.cssText = `display:flex;gap:0;margin-bottom:14px;border-bottom:1px solid ${BORDER};`;

  const tabFields = {
    'New Pairs':     ['Age','Dev Holding %','Liquidity','Volume','Market Cap'],
    'Final Stretch': ['Market Cap','Global Fees Paid (SOL)'],
    'Migrated':      ['Liquidity','Market Cap','Global Fees Paid (SOL)'],
  };

  const fieldsContainer = document.createElement('div');

  // Track all inputs for save/load
  const allInputs = {}; // key: `${tab}__${label}__${minmax}` → input element

  function makeMinMaxRow(tabName, label) {
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom:10px;';
    const lbl = document.createElement('div');
    lbl.textContent = label + ':';
    lbl.style.cssText = `font-size:${label.length % 2 ? 12 : 10}px;color:#aaa;margin-bottom:${label.length % 2 ? 2 : 6}px;font-weight:400;`;
    row.appendChild(lbl);
    const inputs = document.createElement('div');
    inputs.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
    ['Min','Max'].forEach(ph => {
      const inp = document.createElement('input');
      inp.type = 'text'; inp.placeholder = ph;
      const saveKey = `${tabName}__${label}__${ph}`;
      inp.value = (savedSettings.filters && savedSettings.filters[saveKey]) || '';
      inp.style.cssText = `
        width:${ph === 'Min' ? '108%' : '92%'};padding:${ph === 'Min' ? '6px 9px' : '4px 9px'};
        background:#0d0d0d;
        border:1px solid rgba(255,255,255,0.15);
        border-radius:${ph === 'Min' ? 6 : 2}px;color:#ffffff;
        font-size:11px;font-family:${F};
        box-sizing:border-box;outline:none;transition:border-color 0.2s;
      `;
      inp.addEventListener('focus', () => inp.style.borderColor = 'rgba(255,255,255,0.5)');
      inp.addEventListener('blur',  () => inp.style.borderColor = 'rgba(255,255,255,0.15)');
      allInputs[saveKey] = inp;
      inputs.appendChild(inp);
    });
    row.appendChild(inputs);
    return row;
  }

  let currentTab = savedSettings._activeTab || 'New Pairs';

  function renderFields(tabName) {
    currentTab = tabName;
    fieldsContainer.replaceChildren();
    tabFields[tabName].forEach(l => fieldsContainer.appendChild(makeMinMaxRow(tabName, l)));
    // restore saved values for this tab
    if (savedSettings.filters) {
      tabFields[tabName].forEach(l => {
        ['Min','Max'].forEach(ph => {
          const k = `${tabName}__${l}__${ph}`;
          if (allInputs[k]) allInputs[k].value = savedSettings.filters[k] || '';
        });
      });
    }
  }

  const tabDefs = ['New Pairs', 'Final Stretch', 'Migrated'];
  const tabBtns = [];
  tabDefs.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.dataset.tab = name;
    const isActive = name === currentTab;
    btn.style.cssText = `
      padding:${name.length % 2 ? '7px 12px 8px' : '9px 10px 5px'};background:transparent;
      color:${isActive ? '#22d3ee' : '#888'};
      border:none;border-bottom:2px solid ${isActive ? '#22d3ee' : 'transparent'};
      margin-bottom:-1px;cursor:pointer;
      font-size:11px;font-weight:${isActive ? '600' : '400'};
      font-family:${F};transition:all 0.2s;
    `;
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        const on = b.dataset.tab === name;
        b.style.color = on ? '#22d3ee' : '#888';
        b.style.borderBottom = on ? '2px solid #22d3ee' : '2px solid transparent';
        b.style.fontWeight = on ? '600' : '400';
      });
      renderFields(name);
    });
    tabBar.appendChild(btn);
    tabBtns.push(btn);
  });

  leftCol.appendChild(tabBar);
  renderFields(currentTab);
  leftCol.appendChild(fieldsContainer);

  // RIGHT: Advanced Filters checkboxes
  const rightCol = document.createElement('div');
  rightCol.style.cssText = 'padding-left:20px;';
  const rightTitle = document.createElement('div');
  rightTitle.textContent = 'Advanced Filtres';
  rightTitle.style.cssText = `font-size:11px;font-weight:700;color:#818cf8;margin-bottom:12px;padding-bottom:5px;border-bottom:2px solid #818cf8;display:inline-block;text-transform:uppercase;letter-spacing:0.05em;`;
  rightCol.appendChild(rightTitle);

  const checkboxRefs = {};
  ['Filter Developer with Migrated Tokens','Filter Bot Activity','Filter Fake Transactions','Filter Inactive Tokens','Positive Buy/Sell Ratio'].forEach(label => {
    const item = document.createElement('label');
    item.style.cssText = `display:flex;align-items:center;gap:${label.length % 2 ? 5 : 11}px;margin-bottom:${(label.length % 3) * 5 + 6}px;cursor:pointer;font-size:${label.length % 2 ? 11 : 10}px;color:#aaa;font-weight:400;user-select:none;`;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!(savedSettings.checkboxes && savedSettings.checkboxes[label]);
    cb.style.cssText = `width:13px;height:13px;flex-shrink:0;accent-color:#818cf8;cursor:pointer;`;
    checkboxRefs[label] = cb;
    item.appendChild(cb);
    item.appendChild(document.createTextNode(label));
    item.addEventListener('mouseenter', () => item.style.color = '#ffffff');
    item.addEventListener('mouseleave', () => item.style.color = '#aaa');
    rightCol.appendChild(item);
  });

  body.appendChild(leftCol);
  body.appendChild(rightCol);
  filtersPanel.appendChild(body);

  // ══════════════════════════════════════════════════════════════════
  // PANEL 2 — X Tracker
  // ══════════════════════════════════════════════════════════════════
  const xPanel = sectionPanels['X Tracker'];
  xPanel.style.cssText = `padding:18px 20px 14px;background:${BG};`;

  const xTitle = document.createElement('div');
  xTitle.textContent = 'X (Twitter) Tracker';
  xTitle.style.cssText = `font-size:11px;font-weight:700;color:#1d9bf0;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #1d9bf0;display:inline-block;text-transform:uppercase;letter-spacing:0.05em;`;
  xPanel.appendChild(xTitle);

  const xSubtitle = document.createElement('div');
  xSubtitle.textContent = 'Track X/Twitter accounts for token signals. One handle per line.';
  xSubtitle.style.cssText = `font-size:11px;color:#888;margin-bottom:12px;margin-top:6px;`;
  xPanel.appendChild(xSubtitle);

  const xGrid = document.createElement('div');
  xGrid.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:16px;`;

  // ── Left: Accounts list ──
  const xLeft = document.createElement('div');

  const xAccLabel = document.createElement('div');
  xAccLabel.textContent = 'Accounts to track';
  xAccLabel.style.cssText = 'font-size:11px;color:#aaa;margin-bottom:5px;font-weight:600;';
  xLeft.appendChild(xAccLabel);

  const xTextarea = document.createElement('textarea');
  xTextarea.placeholder = '@elonmusk\n@VitalikButerin\n@cz_binance';
  xTextarea.value = (savedSettings.xTracker && savedSettings.xTracker.accounts) || '';
  xTextarea.style.cssText = `
    width:100%;height:130px;padding:8px 10px;
    background:#0d0d0d;border:1px solid rgba(255,255,255,0.15);
    border-radius:7px;color:#ffffff;font-size:11px;
    font-family:${F};box-sizing:border-box;
    outline:none;resize:vertical;transition:border-color 0.2s;line-height:1.5;
  `;
  xTextarea.addEventListener('focus', () => xTextarea.style.borderColor = 'rgba(255,255,255,0.5)');
  xTextarea.addEventListener('blur',  () => xTextarea.style.borderColor = 'rgba(255,255,255,0.15)');
  xLeft.appendChild(xTextarea);

  // ── Right: Settings ──
  const xRight = document.createElement('div');

  function xSettingRow(labelText, inputId, placeholder, savedVal) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:10px;';
    const lbl = document.createElement('div');
    lbl.textContent = labelText;
    lbl.style.cssText = 'font-size:11px;color:#aaa;margin-bottom:4px;font-weight:600;';
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = placeholder; inp.id = inputId;
    inp.value = savedVal || '';
    inp.style.cssText = `
      width:100%;padding:6px 9px;background:#0d0d0d;
      border:1px solid rgba(255,255,255,0.15);border-radius:6px;
      color:#ffffff;font-size:11px;font-family:${F};
      box-sizing:border-box;outline:none;transition:border-color 0.2s;
    `;
    inp.addEventListener('focus', () => inp.style.borderColor = 'rgba(255,255,255,0.5)');
    inp.addEventListener('blur',  () => inp.style.borderColor = 'rgba(255,255,255,0.15)');
    wrap.appendChild(lbl); wrap.appendChild(inp);
    xRight.appendChild(wrap);
    return inp;
  }

  const xKeywords = xSettingRow('Signal Keywords', 'xKeywords', 'gem, 100x, buy, alpha',
    savedSettings.xTracker && savedSettings.xTracker.keywords);
  const xMinFollowers = xSettingRow('Min Followers', 'xMinFollowers', '10000',
    savedSettings.xTracker && savedSettings.xTracker.minFollowers);
  const xAlertMode = xSettingRow('Alert Mode', 'xAlertMode', 'popup / silent',
    savedSettings.xTracker && savedSettings.xTracker.alertMode);

  // Notify toggle
  const notifyRow = document.createElement('div');
  notifyRow.style.cssText = 'margin-top:6px;';
  const notifyLabel = document.createElement('label');
  notifyLabel.style.cssText = `display:flex;align-items:center;gap:8px;cursor:pointer;font-size:11px;color:#aaa;user-select:none;`;
  const notifyCb = document.createElement('input');
  notifyCb.type = 'checkbox';
  notifyCb.checked = !!(savedSettings.xTracker && savedSettings.xTracker.notify);
  notifyCb.style.cssText = `width:13px;height:13px;flex-shrink:0;accent-color:#1d9bf0;cursor:pointer;`;
  notifyLabel.appendChild(notifyCb);
  notifyLabel.appendChild(document.createTextNode('Show popup on new signal'));
  notifyLabel.addEventListener('mouseenter', () => notifyLabel.style.color = '#ffffff');
  notifyLabel.addEventListener('mouseleave', () => notifyLabel.style.color = '#aaa');
  notifyRow.appendChild(notifyLabel);
  xRight.appendChild(notifyRow);

  xGrid.appendChild(xLeft);
  xGrid.appendChild(xRight);
  xPanel.appendChild(xGrid);

  // Divider + tracked signals list
  const xDiv = document.createElement('div');
  xDiv.style.cssText = `border-top:1px solid ${BORDER};margin-top:14px;padding-top:12px;`;
  const xTrackedTitle = document.createElement('div');
  xTrackedTitle.textContent = 'Recent Signals';
  xTrackedTitle.style.cssText = 'font-size:11px;color:#aaa;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;';
  xDiv.appendChild(xTrackedTitle);
  const xSignalsList = document.createElement('div');
  const savedSignals = (savedSettings.xTracker && savedSettings.xTracker.signals) || [];
  if (savedSignals.length === 0) {
    xSignalsList.style.cssText = 'font-size:11px;color:#555;font-style:italic;';
    xSignalsList.textContent = 'No signals tracked yet. Signals appear here after save when accounts post.';
  } else {
    savedSignals.forEach(sig => {
      const row = document.createElement('div');
      row.style.cssText = `font-size:11px;color:#888;padding:4px 0;border-bottom:1px solid ${BORDER};`;
      row.textContent = sig;
      xSignalsList.appendChild(row);
    });
  }
  xDiv.appendChild(xSignalsList);
  xPanel.appendChild(xDiv);

  // ── Footer ────────────────────────────────────────────────────────
  const footer = document.createElement('div');
  footer.style.cssText = `padding:12px 20px 16px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid ${BORDER};background:${BG};`;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    padding:8px 18px;background:transparent;color:#888;
    border:1px solid rgba(255,255,255,0.15);border-radius:7px;cursor:pointer;
    font-size:13px;font-weight:500;font-family:${F};
    transition:all 0.2s;
  `;
  cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.color='#fff'; cancelBtn.style.borderColor='rgba(255,255,255,0.4)'; });
  cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.color='#888'; cancelBtn.style.borderColor='rgba(255,255,255,0.15)'; });
  cancelBtn.addEventListener('click', () => closeOverlay());

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.cssText = `
    padding:8px 26px;background:#1a1a1a;color:#ffffff;border:1px solid rgba(255,255,255,0.3);
    border-radius:7px;cursor:pointer;font-size:13px;font-weight:700;
    font-family:${F};transition:background 0.2s,transform 0.1s;
    box-shadow:0 4px 14px rgba(0,0,0,0.5);
  `;
  saveBtn.addEventListener('mouseenter', () => { saveBtn.style.background='#2a2a2a'; saveBtn.style.transform='translateY(-1px)'; });
  saveBtn.addEventListener('mouseleave', () => { saveBtn.style.background='#1a1a1a'; saveBtn.style.transform='translateY(0)'; });
  saveBtn.addEventListener('click', () => {
    // Collect all filter inputs across all tabs
    const filters = {};
    const savedFilters = (savedSettings.filters) || {};
    // Persist already-rendered tab
    tabFields[currentTab].forEach(label => {
      ['Min','Max'].forEach(ph => {
        const k = `${currentTab}__${label}__${ph}`;
        if (allInputs[k]) filters[k] = allInputs[k].value;
      });
    });
    // Preserve other tabs' saved data (don't wipe unrendered tabs)
    Object.keys(savedFilters).forEach(k => { if (!filters[k]) filters[k] = savedFilters[k]; });

    // Collect checkboxes
    const checkboxes = {};
    Object.entries(checkboxRefs).forEach(([label, cb]) => { checkboxes[label] = cb.checked; });

    // Collect X Tracker
    const xTracker = {
      accounts: xTextarea.value,
      keywords: xKeywords.value,
      minFollowers: xMinFollowers.value,
      alertMode: xAlertMode.value,
      notify: notifyCb.checked,
      signals: savedSignals
    };

    saveSettings({
      filters,
      checkboxes,
      xTracker,
      _activeTab: currentTab,
      _activeSection: activeSectionTab
    });

    showPopup('Settings saved ✅','info');
    closeOverlay();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  // ── Assemble ──────────────────────────────────────────────────────
  modal.appendChild(header);
  modal.appendChild(sectionTabBar);
  Object.values(sectionPanels).forEach(p => modal.appendChild(p));
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Init section display
  switchSection(activeSectionTab);
}

// === Overlay toggle button ===
function createLunarKitButton() {
  if (document.getElementById('ovl-btn')) return;
  const btn = document.createElement('div');
  btn.id = 'ovl-btn';
  btn.textContent = 'Filters';
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 999997;
    background: #000000;
    color: #cccccc;
    font-family: 'Inter','Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 18px;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.9);
    border: 1px solid rgba(255,255,255,0.08);
    transition: background 0.2s, transform 0.1s;
    transform: rotate(-1deg);
    user-select: none;
  `;
  btn.addEventListener('mouseenter', () => {
    btn.style.background = '#111111';
    btn.style.transform = 'translateY(-1px)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = '#000000';
    btn.style.transform = 'translateY(0)';
  });
  btn.addEventListener('click', () => createAxiomUI());
  document.body.appendChild(btn);
}

createLunarKitButton();


// Open the panel when the bookmarklet is clicked
createAxiomUI();
})();
