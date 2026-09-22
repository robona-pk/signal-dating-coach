const profiles = [
  {
    name:"Maya", age:27, job:"Brand strategist", mbti:"ENFP",
    interests:["Live music","Travel","Photography"],
    prompts:[
      ["A perfect Sunday","Coffee, a long walk, then finding a tiny gig nobody told us about."],
      ["Green flag","Someone who is genuinely curious about things."]
    ]
  },
  {
    name:"Rhea", age:26, job:"Product designer", mbti:"INFJ",
    interests:["Design","Cooking","Books"],
    prompts:[
      ["Two truths and a lie","I can make excellent ramen. I hate cilantro. I've never owned a plant."],
      ["I'll fall for you if","You notice the small things."]
    ]
  },
  {
    name:"Anika", age:28, job:"Researcher", mbti:"INTP",
    interests:["Drums","Science","Indie music"],
    prompts:[
      ["A niche thing I love","Watching someone learn a song on drums from scratch."],
      ["Most controversial opinion","The best conversations start with an oddly specific question."]
    ]
  }
];

const seededChats = {
  Anika: {
    messages:[
      ["them","Okay, serious question: what's the last song you learned?"],
      ["me","Everlong. Took me way too long to get the fills clean."],
      ["them","That's a respectable answer ðŸ˜‚"]
    ]
  },
  Rhea: {
    messages:[
      ["them","What's your go-to comfort food?"],
      ["me","Honestly I rotate through a few things depending on how lazy I am."],
      ["them","Haha fair, I'm obsessed with making ramen lately."]
    ]
  }
};

const state = {
  tab: localStorage.getItem("tab") || "discover",
  idx: Number(localStorage.getItem("idx") || 0),
  onboarded: localStorage.getItem("onboarded") === "1",
  coach: localStorage.getItem("coach") === "1",
  profile: JSON.parse(localStorage.getItem("profile") || "null"),
  likes: JSON.parse(localStorage.getItem("likes") || "[]")
};

function save(){
  localStorage.setItem("tab",state.tab);
  localStorage.setItem("idx",state.idx);
  localStorage.setItem("onboarded",state.onboarded?"1":"0");
  localStorage.setItem("coach",state.coach?"1":"0");
  localStorage.setItem("profile",JSON.stringify(state.profile));
  localStorage.setItem("likes",JSON.stringify(state.likes));
}

function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function initials(name){ return name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(); }

function shell(content){
  return `<div class="app">
    <div class="topbar"><div class="brand">Signal</div><div class="small">dating, with better signal</div></div>
    <main class="screen">${content}</main>
    ${nav()}
  </div>`;
}

function nav(){
  const items=[["discover","Discover","â™¡"],["chats","Chats","â—Œ"],["insights","Insights","â—ˆ"],["profile","Profile","â—‹"]];
  return `<nav class="nav">${items.map(([id,label,icon])=>
    `<button class="${state.tab===id?"active":""}" onclick="setTab('${id}')"><div>${icon}</div>${label}</button>`
  ).join("")}</nav>`;
}

function setTab(tab){ state.tab=tab; save(); render(); }

function render(){
  if(!state.onboarded) return renderOnboarding();
  if(state.tab==="discover") return renderDiscover();
  if(state.tab==="chats") return renderChats();
  if(state.tab==="insights") return renderInsights();
  return renderProfile();
}

/* =====================================================================
   ONBOARDING â€” multi-step wizard
   Steps: basics -> photos -> prompts -> mbti -> review -> (modal) -> done
   ===================================================================== */

const PROMPT_BANK = [
  "A perfect Sunday looks like",
  "I'll know it's a date if",
  "My most controversial opinion is",
  "The way to win me over is",
  "I geek out on",
  "Together we could",
  "My love language, decoded",
  "Two truths and a lie",
  "A life goal of mine",
  "I'm overly competitive about",
  "The best way to ask me out is",
  "My simple pleasures",
  "I'll never shut up about",
  "A shower thought I recently had",
  "My friends would describe me as",
  "Green flag I look for",
  "I'm weirdly good at",
  "The last thing I got way too invested in"
];

const MBTI_QUESTIONS = [
  // Energy: Extraversion (A) vs Introversion (B)
  {axis:"EI", section:"How you recharge", a:"After a long week, I recharge by going out and being around people.", b:"After a long week, I recharge with quiet time alone."},
  {axis:"EI", section:"How you recharge", a:"I think out loud and talk through ideas as I have them.", b:"I think things through privately before I share them."},
  {axis:"EI", section:"How you recharge", a:"A party full of strangers sounds energizing.", b:"A party full of strangers sounds draining."},
  {axis:"EI", section:"How you recharge", a:"In a group, I usually have a lot to say.", b:"In a group, I usually listen more than I speak."},
  {axis:"EI", section:"How you recharge", a:"I make new friends easily and often.", b:"I keep a smaller, closer circle of people."},
  {axis:"EI", section:"How you recharge", a:"Silence in a conversation feels a little awkward.", b:"Silence in a conversation feels comfortable."},
  {axis:"EI", section:"How you recharge", a:"I'd rather reply right away.", b:"I'd rather take my time before responding."},

  // Perspective: Sensing (A) vs Intuition (B)
  {axis:"SN", section:"How you take in the world", a:"I trust what I can see, touch, and verify.", b:"I trust my gut sense of where things are headed."},
  {axis:"SN", section:"How you take in the world", a:"I focus on the details right in front of me.", b:"I focus on the big picture and what it could become."},
  {axis:"SN", section:"How you take in the world", a:"I like instructions that are clear and step-by-step.", b:"I like room to improvise and figure it out myself."},
  {axis:"SN", section:"How you take in the world", a:"I'd rather talk about real events and facts.", b:"I'd rather talk about ideas and possibilities."},
  {axis:"SN", section:"How you take in the world", a:"I notice when something is practical.", b:"I notice when something is original."},
  {axis:"SN", section:"How you take in the world", a:"I'm drawn to what's tried and true.", b:"I'm drawn to what's new and unconventional."},
  {axis:"SN", section:"How you take in the world", a:"I tend to describe things literally.", b:"I tend to describe things in metaphors and analogies."},

  // Decisions: Thinking (A) vs Feeling (B)
  {axis:"TF", section:"How you decide", a:"I make decisions with logic first.", b:"I make decisions with my values and feelings first."},
  {axis:"TF", section:"How you decide", a:"Being fair matters more to me than being kind.", b:"Being kind matters more to me than being fair."},
  {axis:"TF", section:"How you decide", a:"I give feedback straight, even if it stings.", b:"I soften feedback so it lands gently."},
  {axis:"TF", section:"How you decide", a:"In a disagreement, I want to understand the problem.", b:"In a disagreement, I want to understand how people feel."},
  {axis:"TF", section:"How you decide", a:"I stay calm and objective during conflict.", b:"I stay attuned to everyone's feelings during conflict."},
  {axis:"TF", section:"How you decide", a:"I value being right.", b:"I value being understanding."},
  {axis:"TF", section:"How you decide", a:"Criticism doesn't stick with me for long.", b:"Criticism stays with me for a while."},

  // Structure: Judging (A) vs Perceiving (B)
  {axis:"JP", section:"How you like your days structured", a:"I like having a plan and sticking to it.", b:"I like keeping my options open."},
  {axis:"JP", section:"How you like your days structured", a:"I feel best once a decision is made.", b:"I feel best keeping a decision open a little longer."},
  {axis:"JP", section:"How you like your days structured", a:"My space is usually organized.", b:"My space is usually a little chaotic, and I like it that way."},
  {axis:"JP", section:"How you like your days structured", a:"I finish things well before the deadline.", b:"I do my best work right up against the deadline."},
  {axis:"JP", section:"How you like your days structured", a:"Spontaneous plans stress me out a little.", b:"Spontaneous plans excite me."},
  {axis:"JP", section:"How you like your days structured", a:"I like a clear schedule for the day.", b:"I like to see where the day takes me."},
  {axis:"JP", section:"How you like your days structured", a:"Loose ends bother me.", b:"Loose ends don't bother me much."}
];

const AXIS_META = {
  EI: {aLetter:"E", bLetter:"I", aFrag:"outgoing and socially energized", bFrag:"reflective and inward-focused"},
  SN: {aLetter:"S", bLetter:"N", aFrag:"grounded in facts and details", bFrag:"drawn to ideas and possibilities"},
  TF: {aLetter:"T", bLetter:"F", aFrag:"guided by logic", bFrag:"guided by values and feelings"},
  JP: {aLetter:"J", bLetter:"P", aFrag:"structured and decisive", bFrag:"flexible and open-ended"}
};

const OB_STEP_ORDER = ["basics","photos","prompts","mbti","review"];
let obStep = "basics";
let obDragSrc = null;
const ob = {
  name:"", birthday:"", gender:"", interested:"",
  photos:[],
  prompts:[{prompt:"",answer:""},{prompt:"",answer:""},{prompt:"",answer:""}],
  mbtiAnswers:{},
  mbtiResult:null
};

function ageFromDate(dateStr){
  if(!dateStr) return 0;
  const b=new Date(dateStr), t=new Date();
  let a=t.getFullYear()-b.getFullYear();
  const m=t.getMonth()-b.getMonth();
  if(m<0 || (m===0 && t.getDate()<b.getDate())) a--;
  return a;
}

function obProgressBar(){
  const filled = obStep==="review" ? OB_STEP_ORDER.length : OB_STEP_ORDER.indexOf(obStep)+1;
  return `<div class="ob-progressbar">${OB_STEP_ORDER.map((_,i)=>
    `<span class="ob-seg${i<filled?" on":""}"></span>`).join("")}</div>`;
}

function obShell(inner){
  return `<div class="app"><main class="screen">
    ${obProgressBar()}
    ${inner}
  </main></div>`;
}

function renderOnboarding(){
  if(obStep==="basics") return renderObBasics();
  if(obStep==="photos") return renderObPhotos();
  if(obStep==="prompts") return renderObPrompts();
  if(obStep==="mbti") return renderObMbti();
  return renderObReview();
}

function obBack(){
  const idx = OB_STEP_ORDER.indexOf(obStep);
  if(idx>0){ obStep = OB_STEP_ORDER[idx-1]; renderOnboarding(); }
}

function obPick(field,val,el){
  ob[field]=val;
  el.parentElement.querySelectorAll(".select").forEach(x=>x.classList.remove("selected"));
  el.classList.add("selected");
}

/* ---- Step 1: basics ---- */
function renderObBasics(){
  document.getElementById("app").innerHTML = obShell(`
    <div class="eyebrow">Step 1 of 4</div>
    <h1>Let's start with the basics.</h1>
    <p>This is what people see first. Keep it honest â€” the rest of your profile will do the interesting work.</p>
    <div class="card">
      <div class="field"><label>First name</label>
        <input id="ob-name" value="${esc(ob.name)}" placeholder="What should we call you?">
      </div>
      <div class="field"><label>Birthday</label>
        <input id="ob-birthday" type="date" value="${ob.birthday}">
      </div>
      <div class="field"><label>I am</label>
        <div class="select-grid">${["Woman","Man","Nonbinary","Self-describe"].map(g=>
          `<button class="select${ob.gender===g?" selected":""}" onclick="obPick('gender','${g}',this)">${g}</button>`).join("")}</div>
      </div>
      <div class="field"><label>Show me</label>
        <div class="select-grid">${["Women","Men","Everyone"].map(g=>
          `<button class="select${ob.interested===g?" selected":""}" onclick="obPick('interested','${g}',this)">${g}</button>`).join("")}</div>
      </div>
      <div class="small ob-error" id="ob-basics-error">Add your name, birthday (18+), and both selections to continue.</div>
      <button class="btn primary full" onclick="obNextBasics()">Continue</button>
    </div>
  `);
}

function obNextBasics(){
  ob.name = document.getElementById("ob-name").value.trim();
  ob.birthday = document.getElementById("ob-birthday").value;
  const ok = ob.name.length>0 && ob.birthday && ageFromDate(ob.birthday)>=18 && ob.gender && ob.interested;
  document.getElementById("ob-basics-error").classList.toggle("show", !ok);
  if(!ok) return;
  obStep="photos";
  renderOnboarding();
}

/* ---- Step 2: photos ---- */
const OB_MAX_PHOTOS = 6, OB_MIN_PHOTOS = 2;

function renderObPhotos(){
  document.getElementById("app").innerHTML = obShell(`
    <div class="eyebrow">Step 2 of 4</div>
    <h1>Add your photos.</h1>
    <p>Add 2â€“6 photos. Drag to reorder â€” your first photo is what people see first in the stack.</p>
    <div class="card">
      <div class="ob-photo-grid" id="ob-photo-grid"></div>
      <div class="small">Tap an empty tile to upload. Drag a filled tile to reorder.</div>
      <input type="file" id="ob-photo-input" accept="image/*" multiple style="display:none;">
      <div class="small ob-error" id="ob-photos-error">Add at least 2 photos to continue.</div>
    </div>
    <div class="actions">
      <button class="btn" onclick="obBack()">Back</button>
      <button class="btn primary" onclick="obNextPhotos()">Continue</button>
    </div>
  `);
  renderObPhotoGrid();
  document.getElementById("ob-photo-input").addEventListener("change", obHandlePhotoFiles);
}

function renderObPhotoGrid(){
  const grid = document.getElementById("ob-photo-grid");
  let html = "";
  for(let i=0;i<OB_MAX_PHOTOS;i++){
    if(ob.photos[i]){
      html += `<div class="ob-photo-slot filled" draggable="true" data-index="${i}">
        <img src="${ob.photos[i]}">
        ${i===0?'<span class="ob-photo-tag">Primary</span>':""}
        <button type="button" class="ob-photo-remove" onclick="obRemovePhoto(${i},event)">&times;</button>
      </div>`;
    } else {
      html += `<div class="ob-photo-slot" onclick="document.getElementById('ob-photo-input').click()">
        <span class="ob-photo-add">+</span>
      </div>`;
    }
  }
  grid.innerHTML = html;
  grid.querySelectorAll(".ob-photo-slot.filled").forEach(slot=>{
    slot.addEventListener("dragstart", ()=>{ obDragSrc = Number(slot.dataset.index); });
    slot.addEventListener("dragover", e=>{ e.preventDefault(); slot.classList.add("dragover"); });
    slot.addEventListener("dragleave", ()=> slot.classList.remove("dragover"));
    slot.addEventListener("drop", e=>{
      e.preventDefault();
      slot.classList.remove("dragover");
      const dest = Number(slot.dataset.index);
      if(obDragSrc===null || obDragSrc===dest) return;
      const moved = ob.photos.splice(obDragSrc,1)[0];
      ob.photos.splice(dest,0,moved);
      obDragSrc = null;
      renderObPhotoGrid();
    });
  });
}

function obRemovePhoto(i,e){
  e.stopPropagation();
  ob.photos.splice(i,1);
  renderObPhotoGrid();
}

function obHandlePhotoFiles(e){
  const files = Array.from(e.target.files||[]);
  const room = OB_MAX_PHOTOS - ob.photos.length;
  files.slice(0,room).forEach(file=>{
    if(!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ev=>{ ob.photos.push(ev.target.result); renderObPhotoGrid(); };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
}

function obNextPhotos(){
  const ok = ob.photos.length >= OB_MIN_PHOTOS;
  document.getElementById("ob-photos-error").classList.toggle("show", !ok);
  if(!ok) return;
  obStep="prompts";
  renderOnboarding();
}

/* ---- Step 3: prompts ---- */
function renderObPrompts(){
  document.getElementById("app").innerHTML = obShell(`
    <div class="eyebrow">Step 3 of 4</div>
    <h1>Answer three prompts.</h1>
    <p>Prompts say more than a bio ever could. Pick three and answer like you're texting a friend.</p>
    <div id="ob-prompt-cards"></div>
    <div class="small ob-error" id="ob-prompts-error">Pick three different prompts and write an answer for each (under 150 characters).</div>
    <div class="actions">
      <button class="btn" onclick="obBack()">Back</button>
      <button class="btn primary" onclick="obNextPrompts()">Continue</button>
    </div>
  `);
  renderObPromptCards();
}

function obUsedPrompts(exceptIdx){
  return ob.prompts.map((p,i)=> i===exceptIdx ? null : p.prompt).filter(Boolean);
}

function renderObPromptCards(){
  const wrap = document.getElementById("ob-prompt-cards");
  wrap.innerHTML = ob.prompts.map((p,i)=>{
    const used = obUsedPrompts(i);
    const options = PROMPT_BANK.filter(o=> used.indexOf(o)===-1);
    return `<div class="card ob-prompt-card">
      <select onchange="obSetPromptChoice(${i},this.value)">
        <option value="">Choose a prompt</option>
        ${options.map(o=>`<option value="${esc(o)}"${o===p.prompt?" selected":""}>${esc(o)}</option>`).join("")}
      </select>
      <textarea maxlength="150" placeholder="Your answer" oninput="obSetPromptAnswer(${i},this.value)">${esc(p.answer)}</textarea>
      <div class="small ob-charcount" data-index="${i}">${p.answer.length} / 150</div>
    </div>`;
  }).join("");
}

function obSetPromptChoice(i,val){
  ob.prompts[i].prompt = val;
  renderObPromptCards();
}

function obSetPromptAnswer(i,val){
  ob.prompts[i].answer = val;
  document.querySelector(`.ob-charcount[data-index="${i}"]`).textContent = val.length + " / 150";
}

function obNextPrompts(){
  const chosen = ob.prompts.map(p=>p.prompt);
  const uniqueChosen = chosen.filter((v,i,a)=> v && a.indexOf(v)===i);
  const allAnswered = ob.prompts.every(p=> p.prompt && p.answer.trim().length>0 && p.answer.length<=150);
  const ok = uniqueChosen.length===3 && allAnswered;
  document.getElementById("ob-prompts-error").classList.toggle("show", !ok);
  if(!ok) return;
  obStep="mbti";
  renderOnboarding();
}

/* ---- Step 4: MBTI assessment ---- */
function renderObMbti(){
  document.getElementById("app").innerHTML = obShell(`
    <div class="eyebrow">Step 4 of 4</div>
    <h1>Take the personality assessment.</h1>
    <p>28 quick questions. For each pair, slide toward whichever statement sounds more like you â€” there's no right answer.</p>
    <div class="small" id="ob-mbti-progress">${Object.keys(ob.mbtiAnswers).length} of ${MBTI_QUESTIONS.length} answered</div>
    <div id="ob-mbti-questions"></div>
    <div class="small ob-error" id="ob-mbti-error">Answer every question to see your result â€” a few are still blank.</div>
    <div class="actions">
      <button class="btn" onclick="obBack()">Back</button>
      <button class="btn primary" onclick="obNextMbti()">See my result</button>
    </div>
  `);
  renderObMbtiQuestions();
}

function renderObMbtiQuestions(){
  const wrap = document.getElementById("ob-mbti-questions");
  let html = ""; let lastSection = null;
  MBTI_QUESTIONS.forEach((q,i)=>{
    if(q.section!==lastSection){
      html += `<div class="ob-mbti-section">${q.section}</div>`;
      lastSection = q.section;
    }
    html += `<div class="ob-mbti-q">
      <div class="ob-mbti-stmts"><span>${esc(q.a)}</span><span class="right">${esc(q.b)}</span></div>
      <div class="ob-mbti-scale">${[1,2,3,4,5].map(v=>
        `<label class="ob-pip${ob.mbtiAnswers[i]===v?" on":""}">
          <input type="radio" name="ob-q${i}" value="${v}" ${ob.mbtiAnswers[i]===v?"checked":""} onchange="obSetMbtiAnswer(${i},${v})">
        </label>`).join("")}</div>
    </div>`;
  });
  wrap.innerHTML = html;
}

function obSetMbtiAnswer(i,v){
  ob.mbtiAnswers[i] = v;
  document.getElementById("ob-mbti-progress").textContent = Object.keys(ob.mbtiAnswers).length + " of " + MBTI_QUESTIONS.length + " answered";
  const scale = document.querySelectorAll(".ob-mbti-q")[i].querySelectorAll(".ob-pip");
  scale.forEach((pip,idx)=> pip.classList.toggle("on", idx+1===v));
}

function computeMbti(){
  const totals={EI:0,SN:0,TF:0,JP:0}, counts={EI:0,SN:0,TF:0,JP:0};
  MBTI_QUESTIONS.forEach((q,i)=>{ totals[q.axis]+=ob.mbtiAnswers[i]; counts[q.axis]++; });
  const axes={}; let code="";
  Object.keys(totals).forEach(axis=>{
    const min=counts[axis]*1, max=counts[axis]*5;
    const bPct=Math.round(((totals[axis]-min)/(max-min))*100);
    const aPct=100-bPct;
    const meta=AXIS_META[axis];
    const letter = bPct>50 ? meta.bLetter : meta.aLetter;
    code += letter;
    axes[axis] = {aPct,bPct,letter,meta};
  });
  return {code, axes};
}

function obNextMbti(){
  const ok = Object.keys(ob.mbtiAnswers).length === MBTI_QUESTIONS.length;
  document.getElementById("ob-mbti-error").classList.toggle("show", !ok);
  if(!ok) return;
  ob.mbtiResult = computeMbti();
  obStep="review";
  renderOnboarding();
}

/* ---- Step 5: review ---- */
function renderObReview(){
  document.getElementById("app").innerHTML = obShell(`
    <div class="eyebrow">Almost there</div>
    <h1>Here's your profile.</h1>
    <p>This is what people will see when you match. You can change photos, prompts, or retake the assessment later.</p>
    <div class="card profile-card">
      <div class="ob-review-photo">
        ${ob.photos[0] ? `<img src="${ob.photos[0]}">` : `<div class="avatar">${initials(ob.name||"You")}</div>`}
      </div>
      <div class="name">${esc(ob.name)}${ob.birthday ? ", "+ageFromDate(ob.birthday) : ""}</div>
      ${ob.prompts.map(p=>`<div class="prompt"><b>${esc(p.prompt)}</b><p>${esc(p.answer)}</p></div>`).join("")}
    </div>
    <div class="actions">
      <button class="btn" onclick="obBack()">Back</button>
      <button class="btn primary full" onclick="obFinish()">Finish &amp; save profile</button>
    </div>
  `);
}

function obTypeHeadline(){
  const frags = ["EI","SN","TF","JP"].map(axis=>{
    const ax = ob.mbtiResult.axes[axis];
    return ax.bPct>50 ? ax.meta.bFrag : ax.meta.aFrag;
  });
  return `You tend to be ${frags[0]}, ${frags[1]}, ${frags[2]} when you decide, and ${frags[3]} about structure.`;
}

/* ---- Finish popup + handoff to the main app ---- */
function obFinish(){
  const overlay = document.createElement("div");
  overlay.className = "ob-modal-overlay";
  overlay.innerHTML = `<div class="ob-modal-card">
    <div class="ob-modal-check">âœ“</div>
    <div class="ob-modal-eyebrow">Profile saved</div>
    <div class="ob-modal-type">${ob.mbtiResult.code}</div>
    <p class="ob-modal-headline">${esc(obTypeHeadline())}</p>
    <button class="btn primary full" id="ob-modal-done">Go to Signal</button>
  </div>`;
  document.body.appendChild(overlay);
  document.getElementById("ob-modal-done").addEventListener("click", ()=>{
    overlay.remove();
    completeOnboarding();
  });
}

function completeOnboarding(){
  state.profile = {
    name: ob.name,
    birthday: ob.birthday,
    gender: ob.gender,
    interested: ob.interested,
    interests: [],
    photos: ob.photos,
    prompts: ob.prompts,
    mbti: ob.mbtiResult.code,
    mbtiAxes: ob.mbtiResult.axes
  };
  state.onboarded = true;
  state.tab = "discover"; // lands the person on the main app â€” Discover, with Chats/Insights/Profile in the nav
  save();
  render();
}

/* =====================================================================
   DISCOVER / CHATS / INSIGHTS / PROFILE  (unchanged from before)
   ===================================================================== */

function renderDiscover(){
  const p=profiles[state.idx % profiles.length];
  document.getElementById("app").innerHTML=shell(`
    <div class="eyebrow">Discover</div>
    <div class="profile-card card">
      <div class="avatar">${initials(p.name)}</div>
      <div class="name">${esc(p.name)}, ${p.age}</div>
      <div class="meta">${esc(p.job)} Â· ${p.mbti}</div>
      <div class="chips">${p.interests.map(i=>`<span class="chip">${esc(i)}</span>`).join("")}</div>
      ${p.prompts.map(([q,a])=>`<div class="prompt"><b>${esc(q)}</b><p>${esc(a)}</p></div>`).join("")}
    </div>
    <div class="actions">
      <button class="btn danger" onclick="reject()">Pass</button>
      <button class="btn primary" onclick="like()">Like</button>
    </div>
    <div class="small" style="margin-top:12px;text-align:center">Signal will learn which topics actually create energy in your conversations.</div>
  `);
}

function nextProfile(){
  state.idx=(state.idx+1)%profiles.length; save(); render();
}

function reject(){ nextProfile(); }
function like(){
  const p=profiles[state.idx % profiles.length];
  if(!state.likes.includes(p.name)) state.likes.push(p.name);
  save(); nextProfile();
}

function renderChats(){
  const names=["Anika","Rhea"];
  document.getElementById("app").innerHTML=shell(`
    <div class="eyebrow">Matches</div>
    <div class="list-title">Your conversations</div>
    ${names.map(n=>{
      const c=seededChats[n];
      const last=c.messages[c.messages.length-1][1];
      return `<div class="chat-row" onclick="openChat('${n}')">
        <div class="mini-avatar">${initials(n)}</div>
        <div class="chat-copy"><div class="chat-title">${n}</div><div class="preview">${esc(last)}</div></div>
      </div>`;
    }).join("")}
    <div class="card">
      <div class="eyebrow">Coach</div>
      <div style="font-weight:800">Consent-based, match-specific help</div>
      <p class="muted">Signal only analyzes a conversation after you turn coaching on for that match.</p>
    </div>
  `);
}

let activeChat="Anika";

function openChat(name){ activeChat=name; renderChat(); }

function renderChat(){
  const messages=seededChats[activeChat].messages;
  const coachCard=activeChat==="Anika"
    ? `<div class="coach">
        <div class="eyebrow">Signal noticed</div>
        <div class="coach-title">A thread worth following</div>
        <p>You tend to have more engaged conversations around music. This is already a strong thread â€” you could make it more specific.</p>
        <div class="coach-actions">
          <button class="btn" onclick="useSuggestion()">Try suggestion</button>
          <button class="btn" onclick="dismissCoach()">Not now</button>
        </div>
      </div>`
    : `<div class="coach">
        <div class="eyebrow">Signal noticed</div>
        <div class="coach-title">Conversation is cooling</div>
        <p>Cooking hasn't given you much to work with so far. Consider shifting toward a topic you actually enjoy.</p>
        <div class="coach-actions">
          <button class="btn" onclick="useSuggestion()">Try suggestion</button>
          <button class="btn" onclick="dismissCoach()">Not now</button>
        </div>
      </div>`;

  document.getElementById("app").innerHTML=shell(`
    <button class="btn" onclick="setTab('chats')">â† Chats</button>
    <div class="list-title">${activeChat}</div>
    <div>${messages.map(([who,msg])=>`<div class="bubble ${who==="me"?"me":""}">${esc(msg)}</div>`).join("")}</div>
    ${state.coach?coachCard:""}
    <div class="toggle">
      <div><b>Dating coach</b><div class="small">Analyze this chat and help me communicate better</div></div>
      <button class="switch ${state.coach?"on":""}" onclick="toggleCoach()"><div class="knob"></div></button>
    </div>
    <div class="chat-input"><input id="draft" placeholder="Write a messageâ€¦"><button class="btn primary" onclick="sendDraft()">Send</button></div>
  `);
}

function toggleCoach(){ state.coach=!state.coach; save(); renderChat(); }
function dismissCoach(){ state.coach=false; save(); renderChat(); }

function useSuggestion(){
  const d=document.getElementById("draft");
  d.value=activeChat==="Anika"
    ? "What song would you pick if you had to convince someone to start listening to your taste?"
    : "Okay, enough food talk â€” what are you currently weirdly obsessed with?";
  d.focus();
}

function sendDraft(){
  const d=document.getElementById("draft");
  const value=d.value.trim();
  if(!value)return;
  seededChats[activeChat].messages.push(["me",value]);
  d.value="";
  renderChat();
}

function renderInsights(){
  document.getElementById("app").innerHTML=shell(`
    <div class="eyebrow">Insights</div>
    <div class="hero"><h1>Your dating<br>signal.</h1><p>These are behavior-based observations from your conversations, not personality labels.</p></div>
    <div class="card">
      <div class="stat"><span>Topic energy</span><b>Music â†‘</b></div>
      <div class="bar"><span style="width:82%"></span></div>
      <div class="stat"><span>Conversation style</span><b>Curious, then selective</b></div>
      <div class="stat"><span>One thing to try</span><b>Share before the next question</b></div>
    </div>
    <div class="card">
      <div class="eyebrow">What Signal is learning</div>
      <p class="muted">You engage more when a conversation gives you something concrete to react to. Specific topics appear to create more momentum than broad small talk.</p>
      <p class="small">This insight is based on interaction patterns, not a diagnosis or a fixed personality trait.</p>
    </div>
  `);
}

function renderProfile(){
  const p=state.profile||{name:"You",interests:[],mbti:"ENFP",photos:[],prompts:[]};
  document.getElementById("app").innerHTML=shell(`
    <div class="eyebrow">Profile</div>
    <div class="card">
      ${p.photos && p.photos[0] ? `<img class="avatar-photo" src="${p.photos[0]}">` : `<div class="avatar">${initials(p.name)}</div>`}
      <div class="name">${esc(p.name)}</div>
      <div class="meta">${esc(p.mbti)}</div>
      ${p.interests && p.interests.length ? `<div class="chips">${p.interests.map(i=>`<span class="chip">${esc(i)}</span>`).join("")}</div>` : ""}
      ${(p.prompts||[]).filter(pr=>pr.prompt).map(pr=>`<div class="prompt"><b>${esc(pr.prompt)}</b><p>${esc(pr.answer)}</p></div>`).join("")}
    </div>
    <div class="card">
      <div class="toggle">
        <div><b>Default coaching</b><div class="small">Ask before analyzing individual conversations</div></div>
        <button class="switch ${state.coach?"on":""}" onclick="toggleCoach()"><div class="knob"></div></button>
      </div>
      <div class="small">Signal uses personality frameworks as context, but prioritizes your real behavior over type stereotypes.</div>
    </div>
    <div class="card">
      <div class="eyebrow">Demo</div>
      <button class="btn full" onclick="resetDemo()">Reset demo data</button>
    </div>
  `);
}

function resetDemo(){
  localStorage.clear();
  location.reload();
}

render();
