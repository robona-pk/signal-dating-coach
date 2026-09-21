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
      ["them","That's a respectable answer 😂"]
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
  const items=[["discover","Discover","♡"],["chats","Chats","◌"],["insights","Insights","◈"],["profile","Profile","○"]];
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

function renderOnboarding(){
  document.getElementById("app").innerHTML=`<div class="app"><main class="screen">
    <div class="hero">
      <div class="eyebrow">Signal</div>
      <h1>Date better.<br>Know yourself better.</h1>
      <p>A dating app that learns how you communicate — and gives you useful coaching while you're actually dating.</p>
    </div>
    <div class="card">
      <div class="field"><label>Your name</label><input id="name" placeholder="e.g. Prerna"></div>
      <div class="field"><label>Interests</label><input id="interests" placeholder="e.g. drums, travel, techno"></div>
      <div class="field"><label>Personality type</label>
        <div class="select-grid" id="types">
          ${["ENFP","INFJ","INTP","ENTJ"].map(t=>`<button class="select" onclick="pickType('${t}',this)">${t}</button>`).join("")}
        </div>
      </div>
      <button class="btn primary full" onclick="finishOnboarding()">Create profile</button>
      <p class="small">Your personality type is one input, not a verdict. Signal also learns from your actual conversations.</p>
    </div>
  </main></div>`;
}

let selectedType="";

function pickType(type,el){
  selectedType=type;
  document.querySelectorAll("#types .select").forEach(x=>x.classList.remove("selected"));
  el.classList.add("selected");
}

function finishOnboarding(){
  const name=document.getElementById("name").value.trim() || "You";
  const interests=document.getElementById("interests").value.split(",").map(x=>x.trim()).filter(Boolean);
  state.profile={name,interests,mbti:selectedType||"ENFP"};
  state.onboarded=true;
  save(); render();
}

function renderDiscover(){
  const p=profiles[state.idx % profiles.length];
  document.getElementById("app").innerHTML=shell(`
    <div class="eyebrow">Discover</div>
    <div class="profile-card card">
      <div class="avatar">${initials(p.name)}</div>
      <div class="name">${esc(p.name)}, ${p.age}</div>
      <div class="meta">${esc(p.job)} · ${p.mbti}</div>
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
        <p>You tend to have more engaged conversations around music. This is already a strong thread — you could make it more specific.</p>
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
    <button class="btn" onclick="setTab('chats')">← Chats</button>
    <div class="list-title">${activeChat}</div>
    <div>${messages.map(([who,msg])=>`<div class="bubble ${who==="me"?"me":""}">${esc(msg)}</div>`).join("")}</div>
    ${state.coach?coachCard:""}
    <div class="toggle">
      <div><b>Dating coach</b><div class="small">Analyze this chat and help me communicate better</div></div>
      <button class="switch ${state.coach?"on":""}" onclick="toggleCoach()"><div class="knob"></div></button>
    </div>
    <div class="chat-input"><input id="draft" placeholder="Write a message…"><button class="btn primary" onclick="sendDraft()">Send</button></div>
  `);
}

function toggleCoach(){ state.coach=!state.coach; save(); renderChat(); }
function dismissCoach(){ state.coach=false; save(); renderChat(); }

function useSuggestion(){
  const d=document.getElementById("draft");
  d.value=activeChat==="Anika"
    ? "What song would you pick if you had to convince someone to start listening to your taste?"
    : "Okay, enough food talk — what are you currently weirdly obsessed with?";
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
      <div class="stat"><span>Topic energy</span><b>Music ↑</b></div>
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
  const p=state.profile||{name:"You",interests:[],mbti:"ENFP"};
  document.getElementById("app").innerHTML=shell(`
    <div class="eyebrow">Profile</div>
    <div class="card">
      <div class="avatar">${initials(p.name)}</div>
      <div class="name">${esc(p.name)}</div>
      <div class="meta">${esc(p.mbti)}</div>
      <div class="chips">${p.interests.map(i=>`<span class="chip">${esc(i)}</span>`).join("")}</div>
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
