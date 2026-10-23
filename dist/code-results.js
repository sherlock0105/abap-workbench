import {documents} from './archive-store.js';
import {codeInfo,codeBlocks,bestBlock,codePreview,resultBlocks} from './code-index.js';
import {documentTitle} from './plain-language.js';
import {highlightCode} from './abap-highlight.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function markText(text,query){
 const words=String(query).trim().split(/\s+/).filter(Boolean);if(!words.length)return esc(text);
 const re=new RegExp('('+words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','ig');
 return String(text).split(re).map((part,i)=>i%2?'<mark>'+esc(part)+'</mark>':esc(part)).join('');
}
function previewHTML(code,lang,query=''){
 const html=/^(?:abap|sql|cds|ddl|asddl|bdef)$/i.test(lang)?highlightCode(code):esc(code);
 if(!query.trim())return html;
 return html.replace(/(^|>)([^<]+)(?=<|$)/g,(_,prefix,text)=>prefix+text.split(/(&#?\w+;)/g).map((part,i)=>i%2?part:markText(part,query)).join(''));
}
export function resultCard(d,query=''){
 const info=codeInfo(d),choices=resultBlocks(d,query),best=bestBlock(d,query),b=choices.find(b=>b.procedure)||choices.find(b=>b.index===best?.index);
 return `<article class="code-result compact-result" data-result-id="${esc(d.id)}" data-result-query="${esc(query)}"><header><div class="result-meta"><span>${esc(d.source)}${d.repo?' · '+esc(d.repo):''}${d.track==='RAP'?' · RAP':''}</span></div><button class="result-title" data-archive-open="${esc(d.id)}">${markText(documentTitle(d),query)}</button></header>${b?`<div class="result-code-picker"><label><span class="sr-label">복사할 코드</span><select data-result-block="${esc(d.id)}" aria-label="복사할 코드">${choices.map(x=>`<option value="${esc(x.key)}" ${x.key===b.key?'selected':''}>${esc(x.label)} · ${x.code.split('\n').length}줄</option>`).join('')}</select></label></div><footer><button class="result-copy" data-result-copy="${esc(d.id)}">복사</button><button data-result-expand="${esc(d.id)}" aria-expanded="false">코드 보기</button><button data-archive-open="${esc(d.id)}">적용 설명 →</button></footer><div class="result-preview" hidden></div>`:`<footer><span>${esc(info.label)}</span><button data-archive-open="${esc(d.id)}">원문 →</button></footer>`}</article>`;
}

export function referenceResults(list){
 const refs=list.filter(d=>!d.codeInfo?.hasCode&&d.codeInfo?.kind!=='empty');
 return refs.length?`<details class="reference-results"><summary>코드 없는 설명·캡처·목차 ${refs.length}개 따로 보기</summary><p>구현 코드와 분리한 원본 참고 자료입니다.</p>${refs.slice(0,60).map(d=>`<button data-archive-open="${esc(d.id)}"><span>${esc(d.codeInfo?.label)} · ${esc(d.source)}</span><strong>${esc(documentTitle(d))}</strong></button>`).join('')}${refs.length>60?'<p>상위 60개 표시 · 원본 자료에서 검색어를 좁혀 확인하세요.</p>':''}</details>`:'';
}
export function bindCodeResults(deps){
 function selected(el,id){const d=documents.find(d=>d.id===id),card=el.closest('.code-result'),key=card?.querySelector('[data-result-block]')?.value;return {d,card,b:d&&resultBlocks(d,card?.dataset.resultQuery||'').find(b=>b.key===key)};}
 document.addEventListener('change',e=>{
  if(!e.target.dataset?.resultBlock)return;
  const {b,card}=selected(e.target,e.target.dataset.resultBlock);if(!b)return;
  const preview=card.querySelector('.result-preview');preview.hidden=true;preview.innerHTML='';
  const expand=card.querySelector('[data-result-expand]');expand.textContent='코드 보기';expand.setAttribute('aria-expanded','false');
 });
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-result-copy],[data-result-expand]');if(!button)return;
  const id=button.dataset.resultCopy||button.dataset.resultExpand,{d,b,card}=selected(button,id);if(!b)return;
  if(button.dataset.resultCopy){deps.copy(b.code,d.title+' · '+b.label);return;}
  const preview=card.querySelector('.result-preview'),open=preview.hidden;
  preview.hidden=!open;
  if(open)preview.innerHTML=`<pre tabindex="0"><code>${previewHTML(b.code,b.lang,card.dataset.resultQuery||'')}</code></pre>${b.procedure?'<span>선택한 처리 본문 · 전역 선언은 적용 설명에서 확인</span>':''}`;
  else preview.innerHTML='';
  button.textContent=open?'코드 접기':'코드 보기';button.setAttribute('aria-expanded',String(open));
 });
}
