const r=(id,title,description,top,form)=>({id,title,description,top,form,major:'report',middle:'initialization',kind:'init-'+id});
export const initializationRecipes=[
 r('date','오늘 날짜 넣기','조회 기준일을 오늘 날짜로 시작합니다.\n사용자가 바꾼 값은 다음 화면 표시 때 덮어쓰지 않습니다.',
 `PARAMETERS pa_date TYPE sy-datum.`, `pa_date = sy-datum.`),
 r('month','이번 달 시작일·말일 넣기','시작일은 이번 달 1일, 종료일은 실제 말일로 설정합니다.\n윤년과 12월도 날짜 연산으로 처리합니다.',
 `PARAMETERS: pa_from TYPE sy-datum,\n            pa_to   TYPE sy-datum.`,
 `DATA lv_next TYPE sy-datum.\n\npa_from = sy-datum.\npa_from+6(2) = '01'.\n\nlv_next = pa_from + 31.\nlv_next+6(2) = '01'.\npa_to = lv_next - 1.`),
 r('year','올해 시작일·종료일 넣기','달력 기준으로 올해 1월 1일~12월 31일을 넣습니다.\n회사별 회계연도 변형의 시작일·종료일과는 구분합니다.',
 `PARAMETERS: pa_from TYPE sy-datum,\n            pa_to   TYPE sy-datum.`,
 `pa_from = sy-datum.\npa_to = sy-datum.\npa_from+4(4) = '0101'.\npa_to+4(4) = '1231'.`),
 r('bukrs','사용자 기본 회사코드 가져오기','사용자 파라미터 BUK의 값을 회사코드 입력칸에 넣습니다.\n등록이 없으면 공백으로 두고 실행 전 별도로 존재·권한을 검사합니다.',
 `PARAMETERS pa_bukrs TYPE t001-bukrs.`, `GET PARAMETER ID 'BUK' FIELD pa_bukrs.`),
 r('range','SELECT-OPTIONS 기본 조건 넣기','회사코드 범위에 사용자 기본값을 한 행 추가합니다.\n초기값 설정이므로 기존 입력을 반복해서 지우는 OUTPUT에 넣지 않습니다.',
 `TABLES t001.\nSELECT-OPTIONS so_bukrs FOR t001-bukrs.`,
 `DATA: lv_bukrs TYPE t001-bukrs,\n      ls_range LIKE LINE OF so_bukrs.\n\nGET PARAMETER ID 'BUK' FIELD lv_bukrs.\nCHECK lv_bukrs IS NOT INITIAL.\n\nCLEAR so_bukrs[].\nCLEAR ls_range.\nls_range-sign = 'I'.\nls_range-option = 'EQ'.\nls_range-low = lv_bukrs.\nAPPEND ls_range TO so_bukrs.`),
 r('radio','단건·대량 라디오 기본 선택','단건 모드를 처음 선택하고 대량 모드는 해제합니다.\n화면 입력 제어는 AT SELECTION-SCREEN OUTPUT에서 따로 처리합니다.',
 `PARAMETERS: pa_one   RADIOBUTTON GROUP mode,\n            pa_multi RADIOBUTTON GROUP mode.`,
 `pa_one = abap_true.\npa_multi = abap_false.`),
 r('max','최대 조회 건수 기본값 넣기','조회 제한을 500건으로 시작하는 예제입니다.\n입력 범위 검사는 AT SELECTION-SCREEN에서 처리합니다.',
 `PARAMETERS pa_max TYPE i.`, `pa_max = 500.`),
 r('title','조회조건 블록 제목 넣기','전역 제목 변수에 선택화면 블록 제목을 넣습니다.\n다국어가 필요하면 문자열 대신 TEXT-T01을 등록해 사용합니다.',
 `DATA gv_title TYPE c LENGTH 70.\n\nSELECTION-SCREEN BEGIN OF BLOCK bl1 WITH FRAME TITLE gv_title.\n  PARAMETERS pa_bukrs TYPE t001-bukrs.\nSELECTION-SCREEN END OF BLOCK bl1.`,
 `gv_title = '조회 조건'.`)
];
export function generateInitialization(kind,o){
 const recipe=initializationRecipes.find(r=>r.kind===kind);if(!recipe)return null;
 const p=o.program.toLowerCase();return [
 {name:p+'.abap',where:'SE38 · 실행 프로그램',code:`REPORT ${p}.\n\nINCLUDE ${p}_top.\n\nINITIALIZATION.\n  PERFORM set_init.\n\nSTART-OF-SELECTION.\n  WRITE / '초기값 설정 완료'.\n\nINCLUDE ${p}_f01.\n`},
 {name:p+'_top.abap',where:'TOP · 전역 선언',code:recipe.top+'\n'},
 {name:p+'_f01.abap',where:'F01 · SET_INIT 전체',code:'FORM set_init.\n\n'+recipe.form.split('\n').map(l=>l?'  '+l:'').join('\n')+'\n\nENDFORM.\n'},
 {name:'00_README.txt',where:'적용 조건',code:recipe.description+'\nStandard ABAP / SAP GUI 7.40 SP08+. SE38 실행 프로그램과 TOP/F01 Include를 만드세요. SAP 실컴파일·실행 미검증. 사용자 기본값은 유효성·권한 검사와 별도입니다.'}
 ];
}
