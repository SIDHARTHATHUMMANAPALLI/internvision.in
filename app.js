(async function(){
  const user = window.AICP?.loadUser?.() || null;
  const degreeSelect = document.getElementById('degree');
  const specSelect = document.getElementById('specialization');
  const domainSelect = document.getElementById('domain');
  const gradYearInput = document.getElementById('gradYear');
  const genderSelect = document.getElementById('gender');
  const $iResults = document.getElementById('internshipResults');
  const $sResults = document.getElementById('scholarshipResults');
  const $iFilters = document.getElementById('internshipFilters');
  const $sFilters = document.getElementById('scholarshipFilters');

  // populate specialization choices on home based on degree
  function populateHomeBranches(){
    if(!degreeSelect || !specSelect){ return; }
    const allMap = window.AICP?.DEGREE_TO_BRANCHES || {};
    const selected = degreeSelect.value;
    let branches = allMap[selected] || [];
    if(!branches.length){
      // Fallback: show all known branches if degree not set
      branches = Object.values(allMap).flat();
    }
    const anyOpt = '<option value="">Any</option>';
    specSelect.innerHTML = anyOpt + (branches||[]).map(b=>`<option value="${b}">${b}</option>`).join('');
  }
  degreeSelect?.addEventListener('change', populateHomeBranches);
  // Prefill from saved profile (better defaults)
  if(user && degreeSelect){ degreeSelect.value = user.degree || degreeSelect.value; }
  populateHomeBranches();
  if(user && specSelect){ specSelect.value = user.branch || specSelect.value; }
  if(user && gradYearInput && user.gradYear){ gradYearInput.value = user.gradYear; }
  if(user && genderSelect && user.gender){ genderSelect.value = user.gender; }

  // Load datasets (fallback to embedded data for file://)
  async function loadDatasets(){
    try{
      const r1 = await fetch('data/internships.json');
      const r2 = await fetch('data/scholarships.json');
      const j1 = await r1.json();
      const j2 = await r2.json();
      return [j1, j2];
    }catch(e){
      const embeddedI = window.AICP_DATA?.internships || [];
      const embeddedS = window.AICP_DATA?.scholarships || [];
      return [embeddedI, embeddedS];
    }
  }
  const [internships, scholarships] = await loadDatasets();

  // Render helpers

  function card(item){
    return `<article class="card-item">
      <h3>${item.title}</h3>
      <p class="muted">${item.company ? item.company+' · ' : ''}${item.location || item.provider || ''}</p>
      <p>${item.description || ''}</p>
      <p class="muted">Degree: ${item.degree}${item.branch? ' · '+item.branch:''}</p>
      <div class="filters">${(item.tags||[]).map(t=>`<span class='chip'>${t}</span>`).join('')}</div>
      <a class="btn" href="${item.link||'#'}">Details</a>
    </article>`;
  }

  function renderInternships(list){ if($iResults) $iResults.innerHTML = list.map(card).join(''); }
  function renderScholarships(list){ if($sResults) $sResults.innerHTML = list.map(card).join(''); }

  function setLoading(kind, isLoading){
    const target = kind==='internship' ? $iResults : $sResults;
    if(!target) return;
    target.innerHTML = isLoading ? '<div class="spinner"></div>' : target.innerHTML;
  }

  function showEmpty(kind){
    const target = kind==='internship' ? $iResults : $sResults;
    if(!target) return;
    target.innerHTML = '<p class="empty">No results found. Try "Any" specialization or another degree.</p>';
  }

  function updateCount(kind, count, selected){
    const box = kind==='internship' ? $iFilters : $sFilters;
    if(!box) return;
    const chips = [
      `<span class='chip'>${count} results</span>`,
      selected.degree ? `<span class='chip'>Degree: ${selected.degree}</span>` : '',
      selected.branch ? `<span class='chip'>Branch: ${selected.branch||'Any'}</span>` : `<span class='chip'>Branch: Any</span>`
    ].filter(Boolean).join(' ');
    box.innerHTML = chips;
  }

  // Simple text search
  function searchByText(list, q){
    if(!q) return list;
    q = q.toLowerCase();
    return list.filter(x => [x.title,x.company,x.description,(x.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));
  }

  // AI-like filter logic: weight matches by profile and selections
  function scoreInternship(x, selected){
    let score = 0;
    if(x.degree === selected.degree) score += 5;
    if(x.branch === selected.branch) score += 5;
    if(user){
      if(user.degree === x.degree) score += 2;
      if(user.branch === x.branch) score += 2;
      if(user.gradYear) score += 1;
    }
    return score;
  }
  function scoreScholarship(x, selected){
    let score = 0;
    if(x.degree === selected.degree) score += 5;
    if(x.branch === selected.branch) score += 5;
    const gy = Number(selected.gradYear||0);
    if(gy && gy>= (x.minGradYear||0) && gy <= (x.maxGradYear||9999)) score += 3;
    if(x.gender && selected.gender && x.gender === selected.gender) score += 2;
    if(user){ if(user.degree===x.degree) score += 1; if(user.branch===x.branch) score += 1; }
    return score;
  }

  function onAISearch(e){
    e?.preventDefault?.();
    const selected = {
      domain: domainSelect?.value||'internship',
      degree: degreeSelect?.value,
      branch: specSelect?.value,
      gradYear: gradYearInput?.value,
      gender: genderSelect?.value
    };
    if(selected.domain==='internship'){
      setLoading('internship', true);
      const filtered = internships
        .filter(x => x.degree===selected.degree)
        .map(x => ({x, s: scoreInternship(x, selected)}))
        .sort((a,b)=>b.s-a.s)
        .map(o=>o.x);
      if(filtered.length===0){ showEmpty('internship'); } else { renderInternships(filtered); }
      updateCount('internship', filtered.length, selected);
    } else {
      setLoading('scholarship', true);
      const filtered = scholarships
        .filter(x => x.degree===selected.degree)
        .map(x => ({x, s: scoreScholarship(x, selected)}))
        .sort((a,b)=>b.s-a.s)
        .map(o=>o.x);
      if(filtered.length===0){ showEmpty('scholarship'); } else { renderScholarships(filtered); }
      updateCount('scholarship', filtered.length, selected);
    }
  }

  document.getElementById('aiSearchForm')?.addEventListener('submit', onAISearch);
  // Hide results initially until user searches
  if($iResults) $iResults.innerHTML = '';
  if($sResults) $sResults.innerHTML = '';

  // Text search for each section
  document.getElementById('internshipSearch')?.addEventListener('input', (e)=>{
    const q = e.target.value;
    const selected = { degree: degreeSelect?.value, branch: specSelect?.value };
    const list = internships.filter(x => x.degree===selected.degree);
    renderInternships(searchByText(list, q));
  });
  document.getElementById('scholarshipSearch')?.addEventListener('input', (e)=>{
    const q = e.target.value;
    const selected = { degree: degreeSelect?.value, branch: specSelect?.value, gradYear: gradYearInput?.value, gender: genderSelect?.value };
    const list = scholarships.filter(x => x.degree===selected.degree);
    renderScholarships(searchByText(list, q));
  });
})();

