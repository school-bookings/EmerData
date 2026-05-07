// ================================================================
// EMERGENCE(Y) CHARACTER CREATOR — ENGINE
// ================================================================

// ── State ──
let sessionPassword = '';
let currentMode   = null;
let quizQuestions = [];
let currentQIndex = 0;
let quizAnswers   = {};
let scoreTotals   = { economy:0, healthcare:0, education:0, social:0, environment:0 };
let lastPage      = 'landing';
let currentResult = null; // stores { best, runnerUps } after quiz
let isLocked      = false;

const STAT_CONFIG = [
  { key:'economy',     label:'The Economy',    colour:'var(--colour-economy)'    },
  { key:'healthcare',  label:'Health',         colour:'var(--colour-healthcare)' },
  { key:'education',   label:'Education',      colour:'var(--colour-education)'  },
  { key:'social',      label:'Social Justice', colour:'var(--colour-social)'     },
  { key:'environment', label:'Environment',    colour:'var(--colour-environment)'},
];

const STAT_CLASS = {
  economy:'s-economy', healthcare:'s-healthcare',
  education:'s-education', social:'s-social', environment:'s-environment'
};

// ================================================================
// ✏️  EDIT ALL TEXT HERE
// This object controls every visible label, button, title and
// caption in the app. Change any value — save — refresh. Done.
// ================================================================
const CONTENT = {

  site: {
    pageTitle: "EMERGENCE[Y]: THE GAME CHARACTER CREATOR",
    wordmark:  "EMERGENCE[Y]"
  },

  landing: {
    eyebrow:      "EMERGENCE[Y]: THE GAME · CHARACTER CREATOR",
    titleLine1:   "WHO ARE",
    titleLine2:   "YOU IN",
    titleYear:    "2030",
    titleSub:     "FIND YOUR CHARACTER",
    tagline:      "Answer a few questions and find out which character you'll play in the game.",
    startOverBtn: "✕  Start Over",
    modes: {
      small: {
        icon:      "👥",
        sizeLabel: "Under 25 people",
        title:     "Small Group",
        desc:      "5 different character roles — one voice for each of the big issues shaping Victoria's future."
      },
      medium: {
        icon:      "🏫",
        sizeLabel: "25 to 50 people",
        title:     "Medium Group",
        desc:      "10 different character roles — two sides to every issue, and twice as much to argue about."
      },
      large: {
        icon:      "🏟️",
        sizeLabel: "50 to 100 people",
        title:     "Large Group",
        desc:      "20 different character roles — a full parliament's worth of competing priorities and clashing agendas."
      },
      advanced: {
        icon:      "📜",
        sizeLabel: "Any size",
        title:     "Advanced: Build Your Own",
        desc:      "Design your own character from scratch — name, job, values, backstory and more."
      }
    }
  },

  quiz: {
    topbarSubtitle: "Character Quiz",
    startOverBtn:   "✕  Start Over",
    progressPrefix: "Question",
    progressOf:     "of",
    backBtn:        "← Back",
    nextBtn:        "NEXT →",
    finalBtn:       "SEE MY CHARACTER →"
  },

  charpage: {
    topbarSubtitle:  "Your Character",
    startOverBtn:    "✕  Start Over",
    eyebrow:         "Your role in 2030 Victoria",
    prioritiesLabel: "This character's priorities",
    priority1Label:  "#1 Priority",
    priority2Label:  "#2 Priority",
    aboutLabel:      "About this character",
    showAllBtn:      "📋  SHOW ALL CHARACTERS",
    startOverLink:   "← Start over"
  },

  allchars: {
    topbarSubtitle:  "All Characters",
    startOverBtn:    "✕  Start Over",
    title:           "ALL CHARACTERS",
    subtitle:        "Every character in the simulation and what they care about most.",
    prioritiesLabel: "Top priorities",
    backBtn:         "← Back to my character",
    startOverLink:   "← Start over"
  },

  advanced: {
    topbarSubtitle: "Build Your Character",
    startOverBtn:   "✕  Start Over",
    title:          "Character Sheet",
    subtitle:       "Design who you are in Victoria, 2030. Your answers save as you go — refreshing the page won't lose your work.",
    lockedBanner:   "✅ Character submitted — your sheet is locked. Use 'Start fresh' below to create a new character.",
    submitTitle:    "Ready to lock in your character?",
    submitText:     "Once you submit, your character will be saved. You can still read your sheet, but your answers will be locked.",
    submitBtn:      "✅  SUBMIT CHARACTER",
    submittedBtn:   "✅ SUBMITTED",
    saveDraftBtn:   "💾  Save draft",
    clearBtn:       "Start fresh",
    autoSavedLabel: "Auto-saved",
    notSavedLabel:  "Not yet saved",
    sections: {
      identity:   "Who Are You?",
      life:       "Work & Life",
      values:     "What Do You Care About Most?",
      priorities: "How Do You Think & Act?",
      story:      "Your Story"
    },
    fields: {
      name:                "Character name",
      namePlaceholder:     "e.g. Jordan Nguyen",
      age:                 "Age",
      agePlaceholder:      "e.g. 42",
      location:            "Where do they live in Victoria?",
      locationPlaceholder: "e.g. Bendigo, inner Melbourne, coastal town...",
      tenure:              "How long have they lived there?",
      job:                 "Job / occupation",
      jobPlaceholder:      "e.g. nurse, farmer, teacher, small business owner...",
      sector:              "What kind of work do they do?",
      household:           "Housing situation",
      finance:             "Money situation",
      backstory:           "What shaped this character's view of the world?",
      backstoryPlaceholder:"e.g. They grew up on a farm that flooded three times before they turned 18...",
      goal:                "What do they most want to see change in Victoria by 2060?",
      goalPlaceholder:     "e.g. They want every kid in regional Victoria to have the same chance at a good education as a kid in Toorak...",
      fear:                "What are they afraid will go wrong?",
      fearPlaceholder:     "e.g. They worry that short-term thinking will keep winning..."
    }
  },

  statLabels: {
    economy:     "Economy",
    healthcare:  "Health",
    education:   "Education",
    social:      "Social Justice",
    environment: "Environment"
  },

  priorityDescriptions: {
    economy:     "Economy",
    healthcare:  "Health",
    education:   "Education",
    social:      "Social Justice",
    environment: "Environment"
  }

}; // ── end CONTENT — edit anything above this line ──────────────


// ── PASSWORD ─────────────────────────────────────────────────────
function submitPassword() {
  const val = document.getElementById('pwInput').value.trim().toUpperCase();
  if (!val) {
    document.getElementById('pwError').style.display = 'block';
    return;
  }
  sessionPassword = val;
  document.getElementById('pwOverlay').classList.add('hidden');
  updateSessionIdBtns();
  showPage('landing');
}

function updateSessionIdBtns() {
  const label = 'ID: ' + (sessionPassword || '—');
  document.querySelectorAll('[data-session-btn]').forEach(el => el.textContent = label);
}

function openSessionChange() {
  document.getElementById('sessionModalCurrent').textContent = 'Current ID: ' + (sessionPassword || '—');
  document.getElementById('sessionModalInput').value = '';
  document.getElementById('sessionModal').classList.add('show');
  setTimeout(() => document.getElementById('sessionModalInput').focus(), 100);
}

function closeSessionChange() {
  document.getElementById('sessionModal').classList.remove('show');
}

function confirmSessionChange() {
  const val = document.getElementById('sessionModalInput').value.trim().toUpperCase();
  if (!val) return;
  sessionPassword = val;
  updateSessionIdBtns();
  closeSessionChange();
}

document.getElementById('sessionModalInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') confirmSessionChange();
  if (e.key === 'Escape') closeSessionChange();
});
document.getElementById('sessionModal').addEventListener('click', function(e) {
  if (e.target === this) closeSessionChange();
});
document.getElementById('pwInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') submitPassword();
});

// ── Boot ─────────────────────────────────────────────────────────
function init() {
  applyContent();
  buildLandingGrid();
  checkLocked();
  // Password gate is shown first; landing shown after password entry
}

// ── Apply titletext.json to the DOM ─────────────────────────────
function applyContent() {
  const C = CONTENT;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.textContent = val; };

  // Page title
  if (C.site?.pageTitle) document.title = C.site.pageTitle;

  // All wordmarks
  ['quiz-wordmark','charpage-wordmark','allchars-wordmark','adv-wordmark'].forEach(id => set(id, C.site?.wordmark));

  // All "Start Over" buttons
  const soVal = C.landing?.startOverBtn;
  ['quiz-startover-btn','charpage-startover-btn','allchars-startover-btn','adv-startover-btn'].forEach(id => set(id, soVal));

  // Landing
  set('lnd-eyebrow',      C.landing?.eyebrow);
  set('lnd-title-line1',  C.landing?.titleLine1);
  set('lnd-title-line2',  C.landing?.titleLine2);
  set('lnd-title-year',   C.landing?.titleYear);
  set('lnd-title-sub',    C.landing?.titleSub);
  set('lnd-tagline',      C.landing?.tagline);

  // Quiz
  set('quiz-topbar-sub',  C.quiz?.topbarSubtitle);

  // Character page
  set('charpage-topbar-sub',    C.charpage?.topbarSubtitle);
  set('charpage-eyebrow',       C.charpage?.eyebrow);
  set('charpage-allchars-btn',  C.charpage?.showAllBtn);
  set('charpage-startover-link',C.charpage?.startOverLink);

  // All characters
  set('allchars-topbar-sub',    C.allchars?.topbarSubtitle);
  set('allchars-title',         C.allchars?.title);
  set('allchars-subtitle',      C.allchars?.subtitle);
  set('allchars-back-btn',      C.allchars?.backBtn);
  set('allchars-startover-link',C.allchars?.startOverLink);

  // Advanced
  set('adv-topbar-sub',     C.advanced?.topbarSubtitle);
  set('adv-title',          C.advanced?.title);
  set('adv-subtitle',       C.advanced?.subtitle);
  set('lockedBanner',       C.advanced?.lockedBanner);
  set('adv-submit-title',   C.advanced?.submitTitle);
  set('adv-submit-text',    C.advanced?.submitText);
  set('submitBtn',          C.advanced?.submitBtn);
  set('adv-savedraft-btn',  C.advanced?.saveDraftBtn);
  set('clearBtn',           C.advanced?.clearBtn);
  set('saveIndicator',      C.advanced?.notSavedLabel);

  // Advanced section labels
  set('adv-sec-identity',   C.advanced?.sections?.identity);
  set('adv-sec-life',       C.advanced?.sections?.life);
  set('adv-sec-values',     C.advanced?.sections?.values);
  set('adv-sec-priorities', C.advanced?.sections?.priorities);
  set('adv-sec-story',      C.advanced?.sections?.story);

  // Advanced field labels
  set('adv-lbl-name',       C.advanced?.fields?.name);
  set('adv-lbl-age',        C.advanced?.fields?.age);
  set('adv-lbl-location',   C.advanced?.fields?.location);
  set('adv-lbl-tenure',     C.advanced?.fields?.tenure);
  set('adv-lbl-job',        C.advanced?.fields?.job);
  set('adv-lbl-sector',     C.advanced?.fields?.sector);
  set('adv-lbl-household',  C.advanced?.fields?.household);
  set('adv-lbl-finance',    C.advanced?.fields?.finance);
  set('adv-lbl-backstory',  C.advanced?.fields?.backstory);
  set('adv-lbl-goal',       C.advanced?.fields?.goal);
  set('adv-lbl-fear',       C.advanced?.fields?.fear);

  // Placeholders
  const ph = (id, val) => { const el = document.getElementById(id); if (el && val) el.placeholder = val; };
  ph('adv-name',      C.advanced?.fields?.namePlaceholder);
  ph('adv-age',       C.advanced?.fields?.agePlaceholder);
  ph('adv-location',  C.advanced?.fields?.locationPlaceholder);
  ph('adv-job',       C.advanced?.fields?.jobPlaceholder);
  ph('adv-backstory', C.advanced?.fields?.backstoryPlaceholder);
  ph('adv-goal',      C.advanced?.fields?.goalPlaceholder);
  ph('adv-fear',      C.advanced?.fields?.fearPlaceholder);

  // Stat labels
  if (C.statLabels) {
    STAT_CONFIG.forEach(s => { if (C.statLabels[s.key]) s.label = C.statLabels[s.key]; });
  }
}

// ── LANDING GRID ─────────────────────────────────────────────────
function buildLandingGrid() {
  const modes = CONTENT.landing.modes;
  const grid = document.getElementById('groupGrid');
  ['small','medium','large','advanced'].forEach(m => {
    const cfg = modes[m] || {};
    const card = document.createElement('div');
    card.className = 'group-card';
    card.dataset.mode = m;
    card.onclick = () => startMode(m);
    card.innerHTML = `
      <div class="group-card-icon">${cfg.icon || ''}</div>
      <div class="group-card-size">${cfg.sizeLabel || ''}</div>
      <div class="group-card-title">${cfg.title || m}</div>
      ${cfg.desc ? `<div class="group-card-desc">${cfg.desc}</div>` : ''}
    `;
    grid.appendChild(card);
  });
}

// ── QUIZ ─────────────────────────────────────────────────────────
function buildQuestionList() {
  // All questions are scored — shuffle and use all 12
  return [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
}

function startQuiz() {
  quizQuestions = buildQuestionList();
  currentQIndex = 0;
  quizAnswers   = {};
  scoreTotals   = { economy:0, healthcare:0, education:0, social:0, environment:0 };
  showPage('quiz');
  buildQuestion();
}

function buildQuestion() {
  const q     = quizQuestions[currentQIndex];
  const total = quizQuestions.length;
  const pct   = Math.round((currentQIndex / total) * 100);
  const C = CONTENT.quiz || {};

  document.getElementById('progressLabel').textContent = `${C.progressPrefix||'Question'} ${currentQIndex + 1} ${C.progressOf||'of'} ${total}`;
  document.getElementById('progressPct').textContent   = pct + '%';
  document.getElementById('progressFill').style.width  = pct + '%';

  const letters = ['A','B','C','D','E'];
  let ansHtml = '';
  const isLast = currentQIndex === quizQuestions.length - 1;

  if (q.type === 'likert') {
    ansHtml = `<div class="likert-wrap">` +
      q.options.map((opt, i) =>
        `<div class="likert-option" data-val="${i}" onclick="selectAnswer(${i})">
          <span class="likert-letter">${letters[i]}</span>
          <span class="likert-label">${opt.label}</span>
        </div>`
      ).join('') + `</div>`;
  } else if (q.type === 'binary') {
    // Handles 2–5 options — lays out as a responsive grid of cards
    ansHtml = `<div class="multichoice-wrap multichoice-${q.options.length}">` +
      q.options.map((opt, i) =>
        `<div class="multichoice-btn" data-val="${i}" onclick="selectAnswer(${i})">
          <span class="binary-emoji">${opt.emoji || ''}</span>
          <span class="binary-label">${opt.label}</span>
        </div>`
      ).join('') + `</div>`;
  } else if (q.type === 'scale') {
    ansHtml = `<div class="scale-wrap">
      <div class="scale-poles"><span>${q.leftLabel}</span><span>${q.rightLabel}</span></div>
      <div class="scale-buttons">
        ${[1,2,3,4,5].map(v =>
          `<div class="scale-btn" data-val="${v}" onclick="selectAnswer(${v})">${v}</div>`
        ).join('')}
      </div>
    </div>`;
  }

  const card = document.getElementById('questionCard');
  card.innerHTML = `
    <span class="question-num">${C.progressPrefix||'Question'} ${currentQIndex + 1}</span>
    <div class="question-text">${q.text}</div>
    ${q.subtext ? `<div class="question-subtext">${q.subtext}</div>` : ''}
    ${ansHtml}
    <div class="quiz-nav">
      ${currentQIndex > 0 ? `<button class="btn-secondary" onclick="prevQuestion()">← ${C.backBtn||'Back'}</button>` : ''}
      <button class="btn-primary" id="nextBtn" onclick="nextQuestion()" disabled>${isLast ? (C.finalBtn||'SEE MY CHARACTER →') : (C.nextBtn||'NEXT →')}</button>
    </div>
  `;
  card.classList.remove('animate-in');
  void card.offsetWidth;
  card.classList.add('animate-in');

  if (quizAnswers[currentQIndex] !== undefined) {
    applySelection(quizAnswers[currentQIndex]);
    document.getElementById('nextBtn').disabled = false;
  }
}

function selectAnswer(val) {
  quizAnswers[currentQIndex] = val;
  applySelection(val);
  document.getElementById('nextBtn').disabled = false;
}

function applySelection(val) {
  const q = quizQuestions[currentQIndex];
  const selector = q.type === 'likert' ? '.likert-option'
                 : q.type === 'binary' ? '.multichoice-btn' : '.scale-btn';
  document.querySelectorAll(selector).forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.val) === val);
  });
}

function nextQuestion() {
  if (quizAnswers[currentQIndex] === undefined) return;
  const q = quizQuestions[currentQIndex];
  if (q.scored) {
    let w = {};
    if (q.type === 'likert' || q.type === 'binary') w = q.options[quizAnswers[currentQIndex]].weights || {};
    else if (q.type === 'scale') w = q.weights[quizAnswers[currentQIndex] - 1] || {};
    Object.entries(w).forEach(([stat, v]) => { if (scoreTotals[stat] !== undefined) scoreTotals[stat] += v; });
  }
  if (currentQIndex < quizQuestions.length - 1) { currentQIndex++; buildQuestion(); }
  else showResult();
}

function prevQuestion() {
  if (currentQIndex === 0) return;
  const q = quizQuestions[currentQIndex];
  if (q.scored && quizAnswers[currentQIndex] !== undefined) {
    let w = {};
    if (q.type === 'likert' || q.type === 'binary') w = q.options[quizAnswers[currentQIndex]].weights || {};
    else if (q.type === 'scale') w = q.weights[quizAnswers[currentQIndex] - 1] || {};
    Object.entries(w).forEach(([stat, v]) => { if (scoreTotals[stat] !== undefined) scoreTotals[stat] -= v; });
  }
  currentQIndex--;
  buildQuestion();
}

// ── RESULT ──────────────────────────────────────────────────────
function showResult() {
  const roles = ROLES[currentMode];
  const vals  = Object.values(scoreTotals);
  const minV  = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const norm  = {};
  Object.entries(scoreTotals).forEach(([k,v]) => norm[k] = ((v-minV)/range)*10);

  const scored = roles.map(role => {
    let sim = 0;
    Object.entries(role.profile).forEach(([stat,w]) => sim += (norm[stat]||0)*w);
    return { role, sim };
  }).sort((a,b) => {
    if (b.sim !== a.sim) return b.sim - a.sim;
    // Tiebreak: prefer the role whose primary stat the player scored higher on
    return (norm[b.role.primary] || 0) - (norm[a.role.primary] || 0);
  });

  const best     = scored[0].role;
  const runnerUps = scored.slice(1).map(s => s.role); // keep all for full matching

  // Store for charpage
  currentResult = { best, runnerUps, norm };

  // Make role available globally for submission
  window._assignedRole = best;

  // Push quiz result to Firebase
  pushQuizResult(best);

  // Derive top 2 stats from the player's scores
  const sortedStats = STAT_CONFIG
    .map(cfg => ({ cfg, val: norm[cfg.key] || 0 }))
    .sort((a, b) => b.val - a.val);
  const topTwo = sortedStats.slice(0, 2);

  // Render character page inline — no redirect needed
  showCharPage(best.id);
}

// ── CHARACTER PAGE ───────────────────────────────────────────────
function showCharPage(roleId, isManualPick = false) {
  const allRoles = ROLES[currentMode];
  const role = allRoles.find(r => r.id === roleId);
  if (!role) return;

  // If the player manually chose this role from "show all characters", write to Firebase
  if (isManualPick) pushQuizResult(role);

  const pd  = CONTENT.priorityDescriptions || {};
  const CP  = CONTENT.charpage || {};
  const primCfg = STAT_CONFIG.find(s => s.key === role.primary)   || STAT_CONFIG[0];
  const secCfg  = STAT_CONFIG.find(s => s.key === role.secondary) || STAT_CONFIG[1];

  showPage('charpage');
  document.getElementById('charpageName').textContent    = role.name;
  document.getElementById('charpageTagline').textContent = role.tagline;

  document.getElementById('charpagePriorities').innerHTML =
    `<div class="charpage-priorities-label">${CP.prioritiesLabel || 'This character\'s priorities'}</div>` +
    [{ cfg: primCfg, rank: CP.priority1Label || '#1 Priority' },
     { cfg: secCfg,  rank: CP.priority2Label || '#2 Priority' }].map(({ cfg, rank }) =>
      `<div class="priority-pill-wrap">
        <div class="priority-pill-rank">${rank}</div>
        <div class="priority-pill ${STAT_CLASS[cfg.key]}">${pd[cfg.key] || cfg.label}</div>
      </div>`
    ).join('');

  document.getElementById('charpageDesc').innerHTML =
    `<span class="charpage-desc-label">${CP.aboutLabel || 'About this character'}</span>
     <div class="charpage-desc-text">${role.description}</div>`;
}

// ── ALL CHARACTERS ───────────────────────────────────────────────
function showAllChars() {
  const roles = ROLES[currentMode];
  const pd  = CONTENT.priorityDescriptions || {};
  const AC  = CONTENT.allchars || {};

  showPage('allchars');
  document.getElementById('allcharsGrid').innerHTML = roles.map(role => {
    const primCfg = STAT_CONFIG.find(s => s.key === role.primary)   || STAT_CONFIG[0];
    const secCfg  = STAT_CONFIG.find(s => s.key === role.secondary) || STAT_CONFIG[1];
    return `<div class="allchar-card" onclick="showCharPage('${role.id}', true)">
      <div class="allchar-name">${role.name}</div>
      <div class="allchar-tagline">${role.tagline}</div>
      <div class="allchars-pills-label">${AC.prioritiesLabel || 'Top priorities'}</div>
      <div class="allchar-pills">
        <div class="allchar-pill ${STAT_CLASS[role.primary]}">#1 ${pd[role.primary] || primCfg.label}</div>
        <div class="allchar-pill ${STAT_CLASS[role.secondary]}">#2 ${pd[role.secondary] || secCfg.label}</div>
      </div>
    </div>`;
  }).join('');
}

// ── ADVANCED BUILDER ─────────────────────────────────────────────
const ADV_FIELDS = ['adv-name','adv-age','adv-location','adv-tenure','adv-job','adv-sector','adv-household','adv-finance','adv-backstory','adv-goal','adv-fear'];

let advancedBuilt = false;
function buildAdvancedPage() {
  if (advancedBuilt) { loadAdvanced(); return; }
  advancedBuilt = true;

  [['tenure','adv-tenure'],['sector','adv-sector'],['household','adv-household'],['finance','adv-finance']].forEach(([key,id]) => {
    const el = document.getElementById(id);
    (ADV_DROPDOWN_OPTIONS[key]||[]).forEach(opt => {
      const o = document.createElement('option');
      o.value = o.textContent = opt;
      el.appendChild(o);
    });
  });

  document.getElementById('advStatSliders').innerHTML = STAT_CONFIG.map(s =>
    `<div class="stat-slider-row">
      <span class="stat-slider-name" style="color:${s.colour}">${s.label}</span>
      <input type="range" class="stat-slider" id="adv-stat-${s.key}" min="0" max="10" value="5"
        style="accent-color:${s.colour};" oninput="updateSliderVal('${s.key}');autoSave();">
      <span class="stat-slider-val" id="adv-stat-val-${s.key}" style="color:${s.colour}">5</span>
    </div>`
  ).join('');

  document.getElementById('advTraits').innerHTML = ADV_TRAITS.map(t => {
    const sid = 'adv-trait-' + t.replace(/[^a-zA-Z0-9]/g,'-');
    return `<label class="trait-check">
      <input type="checkbox" id="${sid}" onchange="autoSave()">
      <span class="trait-check-box">✓</span>
      <span class="trait-check-label">${t}</span>
    </label>`;
  }).join('');

  ADV_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', autoSave);
  });

  loadAdvanced();
}

function updateSliderVal(key) {
  const s = document.getElementById(`adv-stat-${key}`);
  const v = document.getElementById(`adv-stat-val-${key}`);
  if (s && v) v.textContent = s.value;
}

function getAdvData() {
  const data = {};
  ADV_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) data[id] = el.value; });
  STAT_CONFIG.forEach(({key}) => { const el = document.getElementById(`adv-stat-${key}`); if (el) data[`adv-stat-${key}`] = el.value; });
  ADV_TRAITS.forEach(t => { const id='adv-trait-'+t.replace(/[^a-zA-Z0-9]/g,'-'); const el=document.getElementById(id); if(el) data[id]=el.checked; });
  return data;
}

function autoSave() {
  if (isLocked) return;
  const data = getAdvData();
  try {
    localStorage.setItem('emergence_advanced_character', JSON.stringify(data));
    const ind = document.getElementById('saveIndicator');
    if (ind) { ind.textContent='Saved ✓'; ind.classList.add('saved'); setTimeout(()=>{ind.textContent=CONTENT.advanced?.autoSavedLabel||'Auto-saved';ind.classList.remove('saved');},2000); }
  } catch(e) {}
}

function saveAdvanced() {
  if (isLocked) return;
  autoSave();
  const ind = document.getElementById('saveIndicator');
  if (ind) { ind.textContent='Draft saved! ✓'; ind.classList.add('saved'); setTimeout(()=>{ind.textContent=CONTENT.advanced?.autoSavedLabel||'Auto-saved';ind.classList.remove('saved');},3000); }
}

function loadAdvanced() {
  try {
    const raw = localStorage.getItem('emergence_advanced_character');
    if (!raw) return;
    const data = JSON.parse(raw);
    ADV_FIELDS.forEach(id => { const el=document.getElementById(id); if(el&&data[id]!==undefined) el.value=data[id]; });
    STAT_CONFIG.forEach(({key}) => { const el=document.getElementById(`adv-stat-${key}`); const v=data[`adv-stat-${key}`]; if(el&&v!==undefined){el.value=v;updateSliderVal(key);} });
    ADV_TRAITS.forEach(t => { const id='adv-trait-'+t.replace(/[^a-zA-Z0-9]/g,'-'); const el=document.getElementById(id); if(el&&data[id]!==undefined) el.checked=data[id]; });
    const ind = document.getElementById('saveIndicator');
    if (ind) ind.textContent = CONTENT.advanced?.autoSavedLabel || 'Auto-saved';
  } catch(e) {}
}

function clearAdvanced() {
  const msg = isLocked
    ? "Your character has been submitted. Starting fresh will clear your sheet so you can create and submit a new one. Continue?"
    : "Clear all fields and start fresh? This can't be undone.";
  if (!confirm(msg)) return;
  try { localStorage.removeItem('emergence_advanced_character'); localStorage.removeItem('emergence_submitted'); } catch(e) {}
  ADV_FIELDS.forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  STAT_CONFIG.forEach(({key}) => { const el=document.getElementById(`adv-stat-${key}`); if(el){el.value=5;updateSliderVal(key);} });
  ADV_TRAITS.forEach(t => { const el=document.getElementById('adv-trait-'+t.replace(/[^a-zA-Z0-9]/g,'-')); if(el) el.checked=false; });
  const ind = document.getElementById('saveIndicator');
  if (ind) { ind.textContent='Cleared'; ind.classList.remove('saved'); }
  setLocked(false);
}

// ── SUBMIT ───────────────────────────────────────────────────────
// To save submissions to Firebase, paste your database URL below.
// See FIREBASE_SETUP.md for step-by-step instructions.
const SUBMIT_URL = 'https://emeregencey-game-default-rtdb.firebaseio.com/characters/submissions.json';
const QUIZ_SUBMIT_URL = 'https://emeregencey-game-default-rtdb.firebaseio.com/characters/quiz_results.json';

// Generate a stable key for this device so retakes overwrite rather than stack up.
function getDeviceKey() {
  const store = 'emergence_device_key';
  let key = localStorage.getItem(store);
  if (!key) {
    key = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(store, key);
  }
  return key;
}

async function pushQuizResult(role) {
  if (!QUIZ_SUBMIT_URL) return;
  const now = new Date();
  const record = {
    sessionPassword: sessionPassword || '',
    groupMode: currentMode || 'unknown',
    assignedRoleId: role.id,
    assignedRoleName: role.name,
    assignedRolePrimary: role.primary,
    assignedRoleSecondary: role.secondary,
    submittedAt: now.toISOString(),
    submittedAtNice: now.toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Australia/Melbourne' }),
    scores: { ...scoreTotals },
  };
  // PUT to a fixed key so retakes overwrite the previous record
  const safeSession = (sessionPassword || 'nosession').replace(/[^a-zA-Z0-9]/g, '_');
  const recordKey   = `${safeSession}_${getDeviceKey()}`;
  const putUrl      = QUIZ_SUBMIT_URL.replace('.json', `/${recordKey}.json`);
  try {
    await fetch(putUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch(e) { console.warn('Quiz result push failed:', e); }
}

async function submitCharacter() {
  if (isLocked) { alert('Your character is already submitted!'); return; }
  const data = getAdvData();

  // Submission timestamp — stored in both machine-readable and human-readable formats
  const now = new Date();
  data.submittedAt     = now.toISOString();
  data.submittedAtNice = now.toLocaleString('en-AU', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Australia/Melbourne'
  });
  data.sessionPassword = sessionPassword || '';
  data.groupMode       = currentMode || 'unknown';
  // For advanced mode, no quiz-assigned role; mark as custom
  data.assignedRoleId   = 'custom';
  data.assignedRoleName = data['adv-name'] || 'Custom Character';

  // Try to send to remote endpoint if configured
  if (SUBMIT_URL) {
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Server error ' + res.status);
    } catch(e) {
      alert('Could not submit to the server right now. Your data is saved locally. Please try again later.');
      return;
    }
  }

  // Lock locally
  try {
    localStorage.setItem('emergence_advanced_character', JSON.stringify(data));
    localStorage.setItem('emergence_submitted', 'true');
  } catch(e) {}

  setLocked(true);
  const ind = document.getElementById('saveIndicator');
  if (ind) { ind.textContent = 'Submitted ✅'; ind.classList.add('saved'); }
}

function setLocked(locked) {
  isLocked = locked;
  const banner = document.getElementById('lockedBanner');
  if (banner) banner.style.display = locked ? 'block' : 'none';
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) { submitBtn.disabled = locked; submitBtn.textContent = locked ? (CONTENT.advanced?.submittedBtn || '✅ SUBMITTED') : (CONTENT.advanced?.submitBtn || '✅  SUBMIT CHARACTER'); }
  // Disable all inputs
  ADV_FIELDS.forEach(id => { const el=document.getElementById(id); if(el) el.disabled = locked; });
  STAT_CONFIG.forEach(({key}) => { const el=document.getElementById(`adv-stat-${key}`); if(el) el.disabled = locked; });
  ADV_TRAITS.forEach(t => { const el=document.getElementById('adv-trait-'+t.replace(/[^a-zA-Z0-9]/g,'-')); if(el) el.disabled = locked; });
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) { clearBtn.style.opacity = '1'; clearBtn.disabled = false; }
}

function checkLocked() {
  try {
    if (localStorage.getItem('emergence_submitted') === 'true') setLocked(true);
  } catch(e) {}
}

// ── NAVIGATION ───────────────────────────────────────────────────
function showPage(id) {
  const prev = document.querySelector('.page.active');
  if (prev) lastPage = prev.id;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goBack() { if (lastPage) showPage(lastPage); else showPage('landing'); }
function goHome()  { showPage('landing'); }
function retakeQuiz() { startQuiz(); }

function startMode(mode) {
  currentMode = mode;
  if (mode === 'advanced') { showPage('advanced'); buildAdvancedPage(); }
  else startQuiz();
}

// Boot
init();