import {getCodeSize,setCodeSize} from './reading.js';
import {syntaxTopics, practiceNotes} from './syntax-data.js';
let selected = location.hash.startsWith('#syntax/') ? location.hash.slice(8) : 'read';
let query = '', group = '전체';
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#syntax/'))selectSyntax(location.hash.slice(8));});
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function searchSyntax(value) {
  const words = value.toLowerCase().trim().split(/\s+/);
  return syntaxTopics.filter(t => words.every(w => [t.title,t.group,t.summary,t.oldCode,t.newCode,...t.notes].join(' ').toLowerCase().includes(w)));
}
export function selectSyntax(id) { if(syntaxTopics.some(t=>t.id===id)) selected=id; }
export function syntaxPage() {
  return `<div class="page-heading"><div><div class="eyebrow">SAME INTENT, CLEARER CODE</div><h1>구문법 ↔ 신문법</h1><p>익숙한 코드에서 시작해서, 무엇이 달라지는지 한눈에 비교하세요.</p></div><span class="syntax-total">${syntaxTopics.length}개 비교 · D2Coding</span></div>
  <div class="syntax-full-links"><a href="#docs/code/modern/construct">신문법 · 선언부터 전체 예제 →</a><a href="#docs/code/read/basic">READ 역할별 예제 →</a><a href="#docs/code/loop/basic">LOOP 역할별 예제 →</a></div><div class="syntax-intro"><strong>READ로 한 행 읽기 → FOR IN으로 새 테이블 만들기</strong><p>선언·생성부터 조회·반복·집계까지. 준비 코드와 구문법 또는 신문법 중 하나를 복사해 연습하세요. 예제마다 변수는 독립적입니다.</p><small>대부분 ABAP 7.40 계열 이후 문법입니다. 기능별 최소 SP가 다르며, JOIN @itab은 7.52+ 및 DB 지원이 필요합니다. SAP 시스템 컴파일·실행은 미검증입니다.</small></div>
  <div class="syntax-controls"><label class="syntax-search">문법 찾기<input id="syntax-search" type="search" placeholder="READ, FOR IN, OPTIONAL, 원본 수정…" value="${esc(query)}"></label><label>분류<select id="syntax-group">${['전체',...new Set(syntaxTopics.map(t=>t.group))].map(g=>`<option ${g===group?'selected':''}>${g}</option>`).join('')}</select></label><div class="syntax-font" role="group" aria-label="코드 글자 크기"><span>D2Coding <output id="syntax-font-size">${getCodeSize()}px</output></span><button data-syntax-size="-1" aria-label="코드 글자 작게">A−</button><button data-syntax-size="1" aria-label="코드 글자 크게">A+</button></div></div>
  <div class="syntax-layout"><nav id="syntax-list" class="syntax-list" aria-label="문법 비교 목록"></nav><section id="syntax-detail" class="syntax-detail" aria-label="선택한 문법 비교"></section></div>
  <section class="syntax-practice"><h2>내 코드에 적용할 때</h2><div class="syntax-practice-grid">${practiceNotes.map(p=>`<article><h3>${p.title}</h3><p>${esc(p.text)}</p><div>${p.topics.map(id=>`<button data-syntax-topic="${id}">${esc(syntaxTopics.find(t=>t.id===id).title.split(' → ')[0])} ↗</button>`).join('')}</div></article>`).join('')}</div></section>`;
}
export function renderSyntax(highlight) {
  const list=document.querySelector('#syntax-list');
  if(!list)return;
  const items=searchSyntax(query).filter(t=>group==='전체'||t.group===group);
  if(items.length && !items.some(t=>t.id===selected))selected=items[0].id;
  list.innerHTML=`<div class="syntax-list-count" role="status">${items.length}개 문법</div>`+(items.length?items.map(t=>`<button data-syntax-topic="${t.id}" aria-current="${t.id===selected?'true':'false'}" class="syntax-topic ${t.id===selected?'active':''}"><small>${esc(t.group)}</small><strong>${esc(t.title)}</strong></button>`).join(''):'<p class="syntax-empty">검색 결과가 없어요.<br>다른 키워드를 입력하세요.</p>');
  const detail=document.querySelector('#syntax-detail');
  const t=items.find(t=>t.id===selected);
  if(!t){detail.innerHTML='<div class="syntax-empty">검색어 또는 분류를 바꿔보세요.</div>';return;}
  const pane=(label,code,part,cls='')=>`<section class="syntax-code ${cls}"><header><h3>${label}</h3><button data-syntax-copy="${part}">코드 복사</button></header><pre class="code-view" tabindex="0" aria-label="${label} 코드"><code>${highlight(code)}</code></pre></section>`;
  detail.innerHTML=`<header class="syntax-detail-head"><span class="tag">${esc(t.group)}</span><h2 tabindex="-1" id="syntax-title">${esc(t.title)}</h2><p>${esc(t.summary)}</p></header>${t.setup?`<details class="syntax-setup"><summary>먼저 준비할 공통 코드 <span>선언·샘플 데이터</span></summary>${pane('공통 준비',t.setup,'setup')}</details>`:''}<div class="syntax-comparison">${pane('구문법',t.oldCode,'old')}${pane('신문법',t.newCode,'new','modern')}</div><div class="syntax-notes"><h3>어떻게 달라질까?</h3><ul>${t.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div><div class="syntax-sources"><strong>이어서 보기</strong>${t.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`).join('')}</div>`;
}
export function bindSyntax({highlight,copy,navigate}) {
  document.addEventListener('input',e=>{
    if(e.target.id==='syntax-search'){query=e.target.value;renderSyntax(highlight);}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='syntax-group'){group=e.target.value;renderSyntax(highlight);}
  });
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.syntaxJump){selected=b.dataset.syntaxJump;query='';group='전체';navigate('syntax');return;}
    if(b.dataset.syntaxTopic){selected=b.dataset.syntaxTopic;query='';group='전체';const input=document.querySelector('#syntax-search');if(input)input.value='';const filter=document.querySelector('#syntax-group');if(filter)filter.value='전체';renderSyntax(highlight);history.replaceState(null,'',`#syntax/${selected}`);if(matchMedia('(max-width: 900px)').matches)document.querySelector('#syntax-title')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    if(b.dataset.syntaxSize){setCodeSize(getCodeSize()+Number(b.dataset.syntaxSize));return;}
    if(b.dataset.syntaxCopy){const t=syntaxTopics.find(t=>t.id===selected);const part=b.dataset.syntaxCopy;await copy(part==='setup'?t.setup:part==='old'?t.oldCode:t.newCode,`${t.title} · ${part==='old'?'구문법':part==='new'?'신문법':'준비 코드'}`);}
  });
}
