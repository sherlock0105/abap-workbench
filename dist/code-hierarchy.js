import {extendedKinds} from './extended-generators.js';
import {initializationRecipes} from './initialization-recipes.js';
import {practiceDocuments} from './practice-docs.js';
import {styleRecipes} from './style-recipes.js';
import {fcatRecipes} from './style-alv.js';
export const majorGroups=[
 {id:'report',title:'Report · 선택화면',description:'INITIALIZATION · 기본값 · 조회조건 · 실행'},
 {id:'screen',title:'Dynpro · 입력 도움말',description:'PBO · PAI · POV · 계정·CO F4'},
 {id:'alv',title:'ALV · 목록·이벤트',description:'생성 · FCAT · 툴바 · 편집 · TOP-OF-PAGE'},
 {id:'read',title:'READ · 한 행 조회',description:'INDEX · KEY · BINARY SEARCH · 원본 수정 · 표현식'},
 {id:'loop',title:'LOOP · 반복·집계',description:'INTO · ASSIGNING · WHERE · 수정 · 그룹 처리'},
 {id:'modern',title:'신문법 · 실전 활용',description:'VALUE · COND · CORRESPONDING · FOR · REDUCE · FILTER'},
 {id:'data',title:'데이터 · 검증·CRUD',description:'SQL · 내부테이블 · 입력 검증 · DB 변경'},
 {id:'work',title:'업무 · 파일·구조',description:'FI · BDC · 업로드 · 변환 · FORM·클래스'},
 {id:'rap',title:'RAP · 서비스',description:'Managed · 읽기 전용 · 객체 세트'}
];
export const middleGroups={
 report:[['initialization','INITIALIZATION · SET_INIT'],['selection-output','AT SELECTION-SCREEN OUTPUT'],['selection-check','AT SELECTION-SCREEN · 검사'],['selection-f4','AT SELECTION-SCREEN ON VALUE-REQUEST'],['start','START-OF-SELECTION · 실행'],['list','TOP-OF-PAGE · 리스트']],
 screen:[['pov','POV · Dynpro F4'],['pbo','PBO · 화면 준비'],['pai','PAI · 명령·직접입력']],
 alv:[['display','목록 생성 · MAKE_FCAT'],['fcat','필드 카탈로그 · 속성별 예제'],['events','툴바·클릭 이벤트'],['edit','편집·F4·선택·필터'],['header','CREATE_TOP · 상단 요약']],
 read:[['basic','기본 · 위치·존재'],['key','키 · 정렬·해시'],['change','조회 후 원본 수정'],['expression','표현식 · 미존재 처리']],
 loop:[['basic','기본 · 읽기·원본 수정'],['condition','조건 · 구간·반복 제어'],['change','변경 · 수정·삭제'],['aggregate','집계 · 그룹 처리']],
 modern:[['construct','선언 · 구조·테이블 생성'],['lookup','조회 · 기본값'],['condition','조건 · 상태값'],['iteration','반복 · 추리기·집계'],['convert','변환 · 문자열']],
 data:[['sql','Open SQL · 조회'],['itab','내부테이블 · 조회·변경'],['validation','유효성 검사'],['crud','CREATE · UPDATE · DELETE']],
 work:[['file','파일 업로드·다운로드'],['fi','FI · 전표·BDC'],['convert','날짜·금액·키 변환'],['structure','FORM · 함수·클래스·운영']],
 rap:[['service','RAP 객체 세트']]
};
const map={
 alv:['alv','display'],rap:['rap','service'],f4:['report','selection-f4'],bdc:['work','fi'],sql:['data','sql'],
 'selection-dynamic':['report','selection-output'],'list-top':['report','list'],
 'make-fcat':['alv','display'],'alv-toolbar':['alv','events'],'alv-top':['alv','header'],'alv-edit':['alv','edit'],'alv-hotspot':['alv','events'],'alv-newko':['alv','edit'],
 'f4-account':['screen','pov'],'f4-costcenter':['screen','pov'],'f4-order':['screen','pov'],'f4-wbs':['screen','pov'],'f4-dynpro':['screen','pov'],
 validation:['report','selection-check'],date:['data','validation'],authority:['data','validation'],'fi-check':['work','fi'],
 crud:['data','crud'],'db-create':['data','crud'],'db-update':['data','crud'],'db-delete':['data','crud'],
 'itab-crud':['data','itab'],'itab-read':['data','itab'],'itab-sort':['data','itab'],'control-break':['data','itab'],
 join:['data','sql'],range:['data','sql'],'sql-fae':['data','sql'],'sql-aggregate':['data','sql'],salv:['alv','display'],
 upload:['work','file'],download:['work','file'],'excel-validate':['work','file'],
 amount:['work','convert'],alpha:['work','convert'],
 'fi-bdc-log':['work','fi'],shdb:['work','fi'],'message-log':['work','fi'],
 popup:['work','structure'],'local-class':['work','structure'],form:['work','structure'],function:['work','structure'],lock:['work','structure'],'number-range':['work','structure']
};
const descriptions={
 alv:'조회조건 → 조회 FORM → ALV 표시 순서입니다.\nTOP·F01·PBO·PAI·화면 Flow Logic을 함께 제공합니다.',
 'make-fcat':'GT_FCAT/GS_FCAT 선언과 MAKE_FCAT 전체 FORM입니다.\n최초 Grid 표시 호출까지 이어집니다.',
 'alv-top':'PBO에서 CREATE_TOP을 호출해 GCL_TOP에 상단 요약을 그립니다.\n사용자 코드처럼 CALL METHOD → NEW_LINE → DISPLAY_DOCUMENT 순서입니다.',
 'f4-account':'회사코드별 G/L 계정 후보를 조회해 화면에 반영합니다.\nF4 취소와 직접 Enter 입력 검증을 포함합니다.',
 'excel-validate':'업로드 원본 행 번호를 유지하며 행별 오류를 모읍니다.\n필수·조직·계정 검증과 결과 표시를 나눕니다.',
 'selection-dynamic':'선택 상태에 따라 입력칸을 표시하거나 숨깁니다.\n기본값을 반복해서 덮어쓰지 않습니다.',
 'sql-fae':'빈 드라이버를 막고 중복 키를 제거한 뒤 조회합니다.\n조회 결과와 반복 입력을 구분합니다.',
 'fi-bdc-log':'SHDB 기록을 연결하고 실제 BDC 메시지를 모읍니다.\n실행 결과와 실패 로그를 함께 확인합니다.'
};
export const generatorEntries=[...initializationRecipes,...styleRecipes,...fcatRecipes.filter(r=>r.kind!=='alv-top-event'),
 ...[['alv','ALV 조회 화면'],['rap','RAP 객체 세트'],['f4','Selection-screen F4'],['bdc','BDC 실행 골격'],['sql','SELECT + SALV'],...extendedKinds].map(([kind,title])=>{
  const [major,middle]=map[kind]||['work','structure'];
  return {id:kind,kind,title:kind==='alv-top'?'CREATE_TOP · 상단 요약 (직접 호출)':title,major,middle,description:descriptions[kind]||title+' 역할의 전체 코드를 생성합니다.\n선언·호출 위치와 필요한 화면·DDIC 조건을 함께 확인하세요.'};
 }),...fcatRecipes.filter(r=>r.kind==='alv-top-event')];
export function generatorPicker(kind){
 const selected=generatorEntries.find(e=>e.kind===kind)||generatorEntries[0];
 const mids=middleGroups[selected.major].filter(([id])=>generatorEntries.some(e=>e.major===selected.major&&e.middle===id));
 return {selected,majors:majorGroups.filter(g=>generatorEntries.some(e=>e.major===g.id)),middles:mids,leaves:generatorEntries.filter(e=>e.major===selected.major&&e.middle===selected.middle)};
}
export const libraryEntries=[...generatorEntries.filter(e=>!['shdb','lock'].includes(e.kind)),
 ...practiceDocuments.filter(d=>d.category==='유효성 검사'||d.id==='learn-alv-status-filter').map(d=>({id:d.id,docId:d.id,kind:'document-'+d.id,title:d.title.replace('유효성 검사 — ',''),major:d.id==='learn-alv-status-filter'?'alv':'data',middle:d.id==='learn-alv-status-filter'?'edit':'validation',description:d.summary.split(/(?<=\.)\s+/).slice(0,2).join('\n')})),
 {id:'start-query',kind:'sql',title:'GET_DATA → 조회 후 목록 표시',major:'report',middle:'start',description:'실행 버튼을 누른 뒤 조회 FORM을 호출합니다.\n조회된 데이터의 표시와 예외 처리를 함께 봅니다.'},
 {id:'start-alv',kind:'alv',title:'GET_DATA → CALL SCREEN',major:'report',middle:'start',description:'조회 결과를 채운 뒤 ALV 화면으로 이동합니다.\n선택화면 검사는 실행 이벤트 이전에 처리합니다.'},
 {id:'pbo-grid',kind:'make-fcat',title:'STATUS → Grid 최초 생성',major:'screen',middle:'pbo',description:'PBO에서는 상태를 설정하고 최초 한 번 Grid를 만듭니다.\n화면을 다시 표시할 때마다 객체를 중복 생성하지 않습니다.'},
 {id:'pai-check',kind:'f4-account',title:'FIELD / CHAIN → 직접 Enter 검증',major:'screen',middle:'pai',description:'입력 필드를 전송한 뒤 PAI 검증 MODULE에서 FORM을 호출합니다.\nF4를 거치지 않은 직접 입력도 확인합니다.'}
];
export const roleDocuments=Object.fromEntries(practiceDocuments.map(d=>[d.id,d]));
export function generatorPickerHTML(kind){
 const p=generatorPicker(kind),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<label>생성 유형 검색<input id="generator-search" type="search" placeholder="INITIALIZATION, SET_INIT, TOP, CRUD, F4…" autocomplete="off"></label>
 <label>1. 대분류<select id="generator-major" aria-label="생성기 대분류">${p.majors.map(g=>`<option value="${g.id}" ${p.selected.major===g.id?'selected':''}>${esc(g.title)}</option>`).join('')}</select></label>
 <label>2. 중분류 · 역할<select id="generator-middle" aria-label="생성기 중분류">${p.middles.map(([id,title])=>`<option value="${id}" ${p.selected.middle===id?'selected':''}>${esc(title)}</option>`).join('')}</select></label>
 <label>3. 소분류 · 만들 코드<select name="kind" id="generator-kind" aria-label="생성기 소분류">${p.leaves.map(r=>`<option value="${r.kind}" ${kind===r.kind?'selected':''}>${esc(r.title)}</option>`).join('')}</select></label><div id="generator-search-results" class="generator-search-results"></div>`;
}
