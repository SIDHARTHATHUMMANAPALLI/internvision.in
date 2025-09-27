/* Basic client-side auth and profile storage (localStorage for demo) */
(function(){
  const DEGREE_TO_BRANCHES = {
    BTECH:["CSE","ECE","EEE","MEC","CIVIL","VLSI DESIGNING"],
    DEGREE:["BA","B.Com","B.SC","BBA","BCA","B.Pharm"],
    MBBS:["MBBS","Veterinary","pharmacy","B.Sc"]
  };

  function $(id){ return document.getElementById(id); }

  function hydrateYear(){
    const y = document.getElementById('year');
    if(y) y.textContent = new Date().getFullYear();
  }

  function populateBranches(degreeSelectId, branchSelectId){
    const degEl = $(degreeSelectId);
    const brEl = $(branchSelectId);
    if(!degEl || !brEl) return;
    const apply = () => {
      const deg = degEl.value;
      const options = (DEGREE_TO_BRANCHES[deg]||[]).map(v=>`<option value="${v}">${v}</option>`).join('');
      brEl.innerHTML = options;
    };
    apply();
    degEl.addEventListener('change', apply);
  }

  function readFormProfile(){
    const degreeEl = document.querySelector('#degree');
    const branchEl = document.querySelector('#branch');
    return {
      firstName: $('#firstName')?.value?.trim(),
      surname: $('#surname')?.value?.trim(),
      dob: $('#dob')?.value,
      gender: $('#gender')?.value,
      email: $('#email')?.value?.trim(),
      contact: $('#contact')?.value?.trim(),
      gradYear: Number($('#gradYear')?.value || 0),
      degree: degreeEl?.value,
      branch: branchEl?.value
    };
  }

  function saveUser(user){
    localStorage.setItem('aicp_user', JSON.stringify(user));
  }
  function loadUser(){
    try{ return JSON.parse(localStorage.getItem('aicp_user')||'null'); }catch(e){ return null; }
  }
  function ensureDemoUser(){
    const existing = loadUser();
    if(existing) return existing;
    const demo = {
      firstName: 'Demo',
      surname: 'User',
      dob: '2000-01-01',
      gender: 'other',
      email: 'demo@local.test',
      contact: '+0000000000',
      gradYear: 2026,
      degree: 'BTECH',
      branch: 'CSE',
      password: 'Demo@1234!'
    };
    saveUser(demo);
    return demo;
  }

  function handleSignup(){
    const form = document.getElementById('signupForm');
    if(!form) return;
    populateBranches('degree','branch');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const pass = $('#password').value;
      const confirm = $('#confirmPassword').value;
      if(pass !== confirm){ alert('Passwords do not match'); return; }
      // Strong password check (already via pattern, double-check here)
      const strong = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(pass);
      if(!strong){ alert('Password must be stronger.'); return; }

      const user = readFormProfile();
      user.password = pass; // demo only; never store plain text in production
      saveUser(user);
      alert('Account created. You can login now.');
      window.location.href = 'login.html';
    });
  }

  function handleLogin(){
    const form = document.getElementById('loginForm');
    if(!form) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      const user = loadUser();
      if(!user || user.email !== email || user.password !== password){
        alert('Invalid credentials');
        return;
      }
      localStorage.setItem('aicp_session','1');
      alert('Logged in successfully');
      window.location.href = 'index.html';
    });
  }

  hydrateYear();
  ensureDemoUser();
  handleSignup();
  handleLogin();

  // expose for app.js
  window.AICP = { loadUser, DEGREE_TO_BRANCHES };
})();

