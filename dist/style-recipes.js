import {standardSnippets,snippetParameters} from './standard-snippets.js';
const recipes=[
 {
  "id": "read-index",
  "kind": "read-index",
  "major": "read",
  "middle": "basic"
 },
 {
  "id": "read-key",
  "kind": "read-key",
  "major": "read",
  "middle": "basic"
 },
 {
  "id": "read-exists",
  "kind": "read-exists",
  "major": "read",
  "middle": "basic"
 },
 {
  "id": "read-assign",
  "kind": "read-assign",
  "major": "read",
  "middle": "change"
 },
 {
  "id": "read-binary",
  "kind": "read-binary",
  "major": "read",
  "middle": "key"
 },
 {
  "id": "read-sorted",
  "kind": "read-sorted",
  "major": "read",
  "middle": "key"
 },
 {
  "id": "read-hashed",
  "kind": "read-hashed",
  "major": "read",
  "middle": "key"
 },
 {
  "id": "read-tabix",
  "kind": "read-tabix",
  "major": "read",
  "middle": "change"
 },
 {
  "id": "read-optional",
  "kind": "read-optional",
  "major": "read",
  "middle": "expression"
 },
 {
  "id": "read-exception",
  "kind": "read-exception",
  "major": "read",
  "middle": "expression"
 },
 {
  "id": "read-reference",
  "kind": "read-reference",
  "major": "read",
  "middle": "change"
 },
 {
  "id": "read-line-index",
  "kind": "read-line-index",
  "major": "read",
  "middle": "expression"
 },
 {
  "id": "loop-into",
  "kind": "loop-into",
  "major": "loop",
  "middle": "basic"
 },
 {
  "id": "loop-assign",
  "kind": "loop-assign",
  "major": "loop",
  "middle": "basic"
 },
 {
  "id": "loop-where",
  "kind": "loop-where",
  "major": "loop",
  "middle": "condition"
 },
 {
  "id": "loop-control",
  "kind": "loop-control",
  "major": "loop",
  "middle": "condition"
 },
 {
  "id": "loop-range",
  "kind": "loop-range",
  "major": "loop",
  "middle": "condition"
 },
 {
  "id": "loop-sum",
  "kind": "loop-sum",
  "major": "loop",
  "middle": "aggregate"
 },
 {
  "id": "loop-delete",
  "kind": "loop-delete",
  "major": "loop",
  "middle": "change"
 },
 {
  "id": "loop-modify",
  "kind": "loop-modify",
  "major": "loop",
  "middle": "change"
 },
 {
  "id": "loop-group",
  "kind": "loop-group",
  "major": "loop",
  "middle": "aggregate"
 },
 {
  "id": "loop-control-break",
  "kind": "loop-control-break",
  "major": "loop",
  "middle": "aggregate"
 },
 {
  "id": "loop-join",
  "kind": "loop-join",
  "major": "loop",
  "middle": "condition"
 },
 {
  "id": "loop-no-fields",
  "kind": "loop-no-fields",
  "major": "loop",
  "middle": "condition"
 },
 {
  "id": "modern-inline",
  "kind": "modern-inline",
  "major": "modern",
  "middle": "construct"
 },
 {
  "id": "modern-value",
  "kind": "modern-value",
  "major": "modern",
  "middle": "construct"
 },
 {
  "id": "modern-base",
  "kind": "modern-base",
  "major": "modern",
  "middle": "construct"
 },
 {
  "id": "modern-corresponding",
  "kind": "modern-corresponding",
  "major": "modern",
  "middle": "construct"
 },
 {
  "id": "modern-mapping",
  "kind": "modern-mapping",
  "major": "modern",
  "middle": "construct"
 },
 {
  "id": "modern-cond",
  "kind": "modern-cond",
  "major": "modern",
  "middle": "condition"
 },
 {
  "id": "modern-switch",
  "kind": "modern-switch",
  "major": "modern",
  "middle": "condition"
 },
 {
  "id": "modern-conv",
  "kind": "modern-conv",
  "major": "modern",
  "middle": "convert"
 },
 {
  "id": "modern-exact",
  "kind": "modern-exact",
  "major": "modern",
  "middle": "convert"
 },
 {
  "id": "modern-template",
  "kind": "modern-template",
  "major": "modern",
  "middle": "convert"
 },
 {
  "id": "modern-for",
  "kind": "modern-for",
  "major": "modern",
  "middle": "iteration"
 },
 {
  "id": "modern-for-where",
  "kind": "modern-for-where",
  "major": "modern",
  "middle": "iteration"
 },
 {
  "id": "modern-reduce",
  "kind": "modern-reduce",
  "major": "modern",
  "middle": "iteration"
 },
 {
  "id": "modern-filter",
  "kind": "modern-filter",
  "major": "modern",
  "middle": "iteration"
 },
 {
  "id": "modern-let",
  "kind": "modern-let",
  "major": "modern",
  "middle": "iteration"
 },
 {
  "id": "modern-default",
  "kind": "modern-default",
  "major": "modern",
  "middle": "lookup"
 },
 {
  "id": "modern-xsdbool",
  "kind": "modern-xsdbool",
  "major": "modern",
  "middle": "condition"
 },
 {
  "id": "modern-ref",
  "kind": "modern-ref",
  "major": "modern",
  "middle": "construct"
 }
];
export const styleRecipes=recipes.map(r=>({...r,...standardSnippets[r.kind],body:standardSnippets[r.kind].core,extra:''}));
export function generateStyleRecipe(kind,o){
 const item=styleRecipes.find(r=>r.kind===kind);if(!item)return null;
 const p=o.program.toLowerCase();
 const f=(name,code,where)=>({name,code:code.trim()+'\n',where});
 return [
  f(p+'.abap',`REPORT ${p}.
INCLUDE ${p}_top.

START-OF-SELECTION.
  PERFORM run_example.

INCLUDE ${p}_f01.`,'SE38 · 실행 프로그램'),
  f(p+'_top.abap',snippetParameters(item.core)||'* 별도 조회조건 선언 없음.','TOP · 필요한 조회조건'),
  f(p+'_f01.abap',`FORM run_example .

${item.core}

ENDFORM.`,'F01 · 표준 테이블 조회·처리'),
  f('00_README.txt',`Standard ABAP 7.40 SP08 이상 / SAP GUI.
${item.description}
입력값은 TOP의 PARAMETERS에서 지정합니다. 직접 입력한 전표·계정이 대상 회사코드에 존재해야 합니다.
실제 SAP 표준 테이블을 조회하며 샘플 행을 만들지 않습니다. 메모리 수정 예제는 DB를 변경하지 않습니다.
SKB1 예제는 최대 200건으로 제한합니다. 전표 예제는 BUKRS/BELNR/GJAHR 전체 키로 조회합니다.
화면에서는 핵심 코드가 기본입니다. 조회조건과 전체 실행 프로그램은 필요할 때 펼치세요.
SAP 실제 활성화·실행 미검증. SAP DDIC/FI 테이블·권한은 대상 시스템에서 확인하세요.`,'환경·조회조건')
 ];
}
