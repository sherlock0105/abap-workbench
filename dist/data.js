import {filterMultiCode,filterTop,filterSnapshotCode} from './filter-docs.js';
import {extendedKinds} from './extended-generators.js';
import {generate} from './generators.js';
const notion=id=>'https://app.notion.com/p/'+id;
const gh=(repo,path,branch='master')=>`https://github.com/sherlock0105/${repo}/blob/${branch}/${path}`;
export const sources={
 alv:[{name:'Notion · 기초 조회화면 전체 틀',url:notion('3e8a6b8522df8155b6dcd1da6fddca9c')},{name:'ABAP-STUDY · ALV FORM 구현',url:gh('ABAP-STUDY','ZC505_SUB_01/zc505r0012/zc505r0012_f01.html')}],
 f4:[{name:'Notion · F4 검색 도움말',url:notion('3e8a6b8522df81b0b731d1639d4c5735')},{name:'Masterpack FI · F4 구현',url:gh('masterpack-project-fi','zre3fi0003/zre3fi0003_f01.html','main')}],
 bdc:[{name:'Notion · SHDB 녹화와 BDC',url:notion('3eca6b8522df810a9f09e6e2dc34c275')},{name:'ABAP-STUDY · BDC 구현',url:gh('ABAP-STUDY','ZC505_SUB_05/zsapmzc5050007/zsapmzc5050007_f01.html')}],
 rap:[{name:'Notion · RAP 구축 지도',url:notion('3aba6b8522df8067bc1fd95c92749e85')},{name:'SAP · RAP 구조와 개발 흐름',url:'https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-concept-and-architecture-of-rap'},{name:'SAP · Behavior Definition 문법',url:'https://github.com/SAP-samples/abap-cheat-sheets/blob/main/36_RAP_Behavior_Definition_Language.md'}],
 sql:[{name:'Notion · SELECT 조회와 GET_DATA',url:notion('2e2a6b8522df8035ab8df32072a3dfb5')},{name:'SAP · ALV 출력',url:'https://help.sap.com/docs/ABAP_PLATFORM_BW4HANA/b1c834a22d05483b8a75710743b5ff26/4ec2430b107868bae10000000a42189e.html'}]
};
export const guides={
 alv:{title:'ALV 조회 화면, 처음부터 끝까지',subtitle:'프로그램 생성부터 목록 조회·새로고침·종료까지',steps:[
 ['SE11 · 테이블 확인','조회할 DDIC 테이블과 키 필드를 확인하세요. 기본 예제는 SCARR / CARRID입니다. 테이블에 데이터가 없으면 목록이 표시되지 않습니다.'],
 ['SE38 · 프로그램과 Include 생성','코드 생성기에서 이름을 정한 뒤 실행 프로그램을 만드세요. Include 분리를 선택했다면 TOP → S01 → O01 → I01 → F01을 각각 생성하고 해당 탭의 소스를 붙여 넣습니다.'],
 ['SE80 · 화면 만들기','설정한 화면 번호(기본 0100)로 일반 화면을 생성하세요. 다음 화면은 같은 번호, OK Code 필드는 GV_OKCODE입니다. Docking Container 방식이라 Custom Control은 필요 없습니다.'],
 ['SE41 · 상태와 제목 만들기','GUI Status S0100, Titlebar T0100을 만드세요. BACK·EXIT·CANC는 기능 유형 E, REFRESH는 일반 기능으로 추가합니다. 화면 번호를 바꾸었다면 S/T 뒤 번호도 함께 바꿉니다.'],
 ['Flow Logic · 화면 이벤트 연결','screen_0100.flow.abap 탭의 코드만 해당 화면의 Flow Logic에 붙여 넣으세요. 프로그램 본문과 별도입니다. 텍스트 요소 T01에는 “조회 조건”을 입력합니다.'],
 ['활성화 · 전체 흐름 확인','Include·화면·상태·프로그램을 활성화한 뒤 F8로 실행합니다. 조회 → REFRESH → F3 → 재실행을 확인하세요. 권한 검사와 업무별 조회 제한은 실제 프로젝트에 맞게 추가합니다.']
 ]},
 rap:{title:'RAP, 테이블부터 서비스까지',subtitle:'객체마다 작성할 위치와 활성화 순서를 함께',steps:[
 ['ADT · 개발 환경 준비','RAP을 지원하는 ABAP 시스템에 연결하고 패키지와 전송 요청을 준비합니다. 생성기는 최신 CDS View Entity와 strict(2) 문법을 사용합니다. 실제 시스템의 지원 범위를 확인하세요.'],
 ['Table → Root View','생성된 .tabl.asddl로 Database Table을 먼저 생성·활성화합니다. UUID와 감사 필드를 확인한 다음 Root View Entity를 생성합니다. 예제는 Name 필드를 가진 신규 테이블용입니다.'],
 ['Behavior → Behavior Pool','Managed를 선택했다면 Root BDEF를 만들고 ADT Quick Fix로 Behavior Pool을 생성합니다. CREATE·UPDATE·DELETE는 프레임워크가 처리합니다. 운영 권한·검증 로직은 별도로 구현하세요.'],
 ['Projection → Projection Behavior','Projection으로 서비스에 보여줄 필드를 선택합니다. Managed의 경우 Projection BDEF의 use create/update/delete와 use etag를 함께 활성화하세요.'],
 ['Metadata → Service Definition','Metadata Extension으로 목록·상세 필드를 배치하고 Service Definition에서 Projection을 expose합니다. 생성기는 하나의 Metadata Extension을 제공합니다.'],
 ['Service Binding → Publish → 확인','읽기 전용은 OData V4 UI로 Preview합니다. Managed 생성물은 비 Draft CRUD 예제이므로 OData V4 Web API로 테스트합니다. Fiori 편집 UI가 필요하면 Draft 테이블·액션·구현을 별도로 추가하세요. Service Binding은 ADT에서 직접 생성합니다.']
 ]},
 f4:{title:'F4 Help, 선택값을 입력칸으로',subtitle:'후보 조회 → 값 도움말 → 화면 필드 반영',steps:[
 ['SE11 · 후보 테이블과 필드 확인','SCARR / CARRID 예제 또는 직접 사용할 DDIC 테이블·키를 확인합니다. retfield에는 후보 테이블의 실제 컬럼명이 들어갑니다.'],
 ['SE38 · 실행 프로그램 생성','생성기에서 F4 Help를 선택하고 코드 전체를 붙여 넣습니다. 이 생성물은 PARAMETERS의 Selection Screen용으로 별도 화면 생성이 필요 없습니다.'],
 ['ON VALUE-REQUEST · 이벤트 연결','PA_KEY에서 F4를 누르면 FORM f4_key가 실행됩니다. VALUE_ORG = S는 구조형 테이블을 의미하고 DYNPROFIELD = PA_KEY가 값을 받을 입력칸입니다.'],
 ['테스트 · 선택과 취소 확인','F8 실행 전 조회조건 화면의 PA_KEY에서 F4를 누르고 행을 선택합니다. 값이 입력칸에 반영되는지, 취소하면 기존 입력값을 유지하는지 확인하세요. Dynpro용 예제는 연결된 Notion 원문을 참고하세요.']
 ]},
 bdc:{title:'BDC, 녹화부터 메시지 확인까지',subtitle:'SHDB 결과를 내 FORM 패턴으로 연결',steps:[
 ['SHDB · 실제 업무 흐름 녹화','테스트 시스템에서 대상 T-code를 녹화합니다. 프로그램·화면 번호·입력 필드·BDC_OKCODE를 순서대로 확보하세요. 시스템마다 값이 달라 임의의 녹화를 넣지 않습니다.'],
 ['SE38 · BDC 골격 생성','BDC 생성물의 build_recording FORM에 녹화 내용을 make_bdcdata 호출로 채웁니다. 화면 시작은 X, 일반 필드는 공백을 전달합니다. 녹화가 비어 있으면 실행하지 않습니다.'],
 ['A 모드 · 한 건부터 테스트','기본 DISMODE는 A(모든 화면), UPDMODE는 S(동기)입니다. 입력한 T-code와 녹화 내용이 일치하는지 확인하고 한 건을 처리하세요.'],
 ['메시지 · 결과 검증','SY-SUBRC와 BDCMSGCOLL의 메시지 유형·텍스트를 확인합니다. 성공 메시지와 실제 업무 데이터 반영을 둘 다 확인한 뒤 대량 처리와 오류 재처리를 설계하세요.']
 ]}
};
const snippet=(name,code,where)=>[{name,code,where}];
export const templates=[
 {id:'alv-status-filter',title:'ALV 상태 필터 · FILTER_MULTI',category:'ALV',label:'기존 Grid 통합',description:'전체·완료·대기·오류 보기와 필터 저장·복원. 직접 조립 방식의 공식 사용 범위는 연결 문서를 확인하세요.',tags:['filter_multi','SET_FILTER_CRITERIA','VIEW_ALL VIEW_DONE VIEW_WAIT VIEW_ERROR'],level:'TOP/F01 통합 예제',icon:'table',sources:[{name:'적용 전제·정리 설명',url:'https://sherlock0105.github.io/abap-workbench/#docs/learn-alv-status-filter'}],files:[{name:'00_README.txt',where:'적용 전 확인',code:'이미 생성된 GCL_GRID/GT_MULTI에 연결하는 예제입니다. SAP 공식 문서는 LVC_T_FILT 직접 조립을 권장하지 않으며 GET_FILTER_CRITERIA 또는 레이아웃에서 얻은 조건을 다시 적용하도록 안내합니다. 사이트의 ALV 상태 필터 문서에서 필드 계약·편집 버퍼·체크박스/행 선택·다른 열 필터 대체 동작을 확인하세요. SAP 실컴파일·실행 미검증.'},{name:'TOP_contract.abap',where:'기존 TOP에 병합',code:filterTop},{name:'FILTER_MULTI.abap',where:'F01 · 기존 FORM 교체',code:filterMultiCode},{name:'FILTER_SNAPSHOT.abap',where:'F01 · 저장/복원 및 REFRESH_GRID',code:filterSnapshotCode}]},
 ...extendedKinds.map(([kind,title])=>({id:'gen-'+kind,title,category:kind.startsWith('f4-')?'F4 Help':kind.includes('alv')||kind==='make-fcat'?'ALV':'유틸리티',label:'완성 코드 묶음',description:'전제조건과 구역별 선언·호출·화면 연결을 함께 생성합니다.',tags:[kind,'TOP F01 I01 O01 Screen','전체 코드'],kind,options:['crud','db-create','db-update','db-delete'].includes(kind)?{table:'ZWB_DEMO',key:'ID'}:{},level:'코드 + 설정 안내',icon:'braces',sources:[],files:generate(kind,['crud','db-create','db-update','db-delete'].includes(kind)?{table:'ZWB_DEMO',key:'ID'}:{})})),
 {id:'alv-basic',title:'기본 ALV 조회 화면',category:'ALV',label:'ALV Grid',description:'조회조건부터 화면·레이아웃·새로고침까지, 익숙한 Include 구조로.',tags:['CL_GUI_ALV_GRID','TOP · F01','조회 화면'],kind:'alv',level:'전체 프로그램',featured:true,icon:'table',guide:'alv',sources:sources.alv,files:generate('alv')},
 {id:'rap-managed',title:'RAP Managed BO',category:'RAP',label:'RAP',description:'Table부터 Behavior·Projection·Service까지 한 번에 시작하세요.',tags:['CDS','CRUD','Behavior'],kind:'rap',level:'객체 세트',featured:true,icon:'layers',guide:'rap',sources:sources.rap,files:generate('rap')},
 {id:'f4-help',title:'F4 검색 도움말',category:'F4 Help',label:'F4 Help',description:'내부 테이블의 후보 목록을 띄우고 선택한 값을 입력칸에 반영.',tags:['VALUE-REQUEST','값 도움말'],kind:'f4',level:'전체 프로그램',icon:'search',guide:'f4',sources:sources.f4,files:generate('f4',{program:'ZF4_SCARR'})},
 {id:'bdc-recording',title:'BDC 실행 골격',category:'BDC',label:'BDC',description:'SHDB 녹화 연결, 동기 실행과 결과 메시지를 하나의 흐름으로.',tags:['SHDB','CALL TRANSACTION'],kind:'bdc',level:'녹화 매핑 필요',icon:'workflow',guide:'bdc',sources:sources.bdc,files:generate('bdc',{program:'ZBDC_TEMPLATE'})},
 {id:'sql-select',title:'SELECT + SALV 빠른 조회',category:'SQL',label:'Open SQL',description:'범위 조건과 최대 건수로 조회하고 SALV로 결과를 확인.',tags:['SELECT-OPTIONS','GET_DATA'],kind:'sql',level:'전체 프로그램',icon:'database',sources:sources.sql,files:generate('sql',{program:'ZSQL_SCARR'})},
 {id:'rap-read',title:'RAP 읽기 전용 서비스',category:'RAP',label:'RAP',description:'CDS와 Metadata를 연결해 Fiori Elements 조회 화면 만들기.',tags:['OData V4','Fiori','Metadata'],kind:'rap',options:{mode:'readonly'},level:'객체 세트',icon:'layers',guide:'rap',sources:sources.rap,files:generate('rap',{mode:'readonly'})},
 {id:'alv-refresh',title:'ALV 새로고침 · 위치 유지',category:'ALV',label:'ALV Grid',description:'데이터를 갱신해도 사용자가 보던 행과 열의 위치를 유지.',tags:['LVC_S_STBL','REFRESH'],level:'삽입 스니펫',icon:'refresh',sources:sources.alv,files:snippet('refresh_grid.abap',`" 전제: gcl_grid TYPE REF TO cl_gui_alv_grid 선언 및 생성
FORM refresh_grid .
  DATA ls_stable TYPE lvc_s_stbl.
  ls_stable-row = 'X'.
  ls_stable-col = 'X'.
  IF gcl_grid IS BOUND.
    gcl_grid->refresh_table_display(
      EXPORTING is_stable = ls_stable ).
  ENDIF.
ENDFORM.`, '기존 프로그램 · F01에 추가')},
 {id:'alv-layout',title:'Field Catalog · Layout',category:'ALV',label:'ALV Grid',description:'컬럼 속성, 줄무늬, 열 너비와 행 선택 방식을 설정.',tags:['FCAT','ZEBRA','LAYOUT'],level:'삽입 스니펫',icon:'sliders',sources:sources.alv,files:snippet('set_layout.abap',`" 전제: TOP에 gs_layout TYPE lvc_s_layo,
"       gs_variant TYPE disvariant 선언
FORM set_layout .
  CLEAR gs_layout.
  gs_layout-zebra      = 'X'.
  gs_layout-cwidth_opt = 'A'.
  gs_layout-sel_mode   = 'D'.
  gs_variant-report   = sy-repid.
ENDFORM.
" set_table_for_first_display의 is_layout/is_variant로 전달`, '기존 프로그램 · F01에 추가')},
 {id:'itab-lookup',title:'ITAB 읽기 · 존재 확인',category:'유틸리티',label:'ABAP',description:'키로 한 행을 찾고, 조회 실패까지 명확하게 처리.',tags:['READ TABLE','SY-SUBRC'],level:'전체 프로그램',icon:'braces',sources:[{name:'Notion · LOOP AT, READ TABLE',url:notion('2b7a6b8522df80438c12c4b95712c09b')}],files:snippet('zitab_lookup.abap',`REPORT zitab_lookup.
DATA : gt_scarr TYPE STANDARD TABLE OF scarr,
       gs_scarr TYPE scarr.
PARAMETERS pa_carr TYPE scarr-carrid DEFAULT 'LH'.

START-OF-SELECTION.
  SELECT * FROM scarr INTO TABLE @gt_scarr.
  READ TABLE gt_scarr INTO gs_scarr
    WITH KEY carrid = pa_carr.
  IF sy-subrc = 0.
    WRITE : / gs_scarr-carrid, gs_scarr-carrname.
  ELSE.
    MESSAGE '해당 항공사가 없습니다.' TYPE 'S'.
  ENDIF.`, 'SE38 · 실행 프로그램')},
 {id:'range',title:'RANGE 조회조건 만들기',category:'SQL',label:'Open SQL',description:'SIGN · OPTION · LOW · HIGH 조합으로 조건 테이블 만들기.',tags:['RANGE','WHERE IN'],level:'전체 프로그램',icon:'filter',sources:[{name:'Notion · RANGE 조건 생성',url:notion('303a6b8522df805eabd7cdab9557cd0b')}],files:snippet('zrange_demo.abap',`REPORT zrange_demo.
DATA : gr_carrid TYPE RANGE OF scarr-carrid,
       gt_scarr  TYPE STANDARD TABLE OF scarr.

START-OF-SELECTION.
  gr_carrid = VALUE #(
    ( sign = 'I' option = 'EQ' low = 'LH' )
    ( sign = 'I' option = 'EQ' low = 'AA' ) ).
  SELECT * FROM scarr
    WHERE carrid IN @gr_carrid
    INTO TABLE @gt_scarr.
  LOOP AT gt_scarr INTO DATA(ls_scarr).
    WRITE : / ls_scarr-carrid, ls_scarr-carrname.
  ENDLOOP.`, 'SE38 · 실행 프로그램')},
 {id:'confirm',title:'저장 전 확인 팝업',category:'유틸리티',label:'ABAP',description:'예·아니오·취소를 구분해 사용자의 다음 동작을 연결.',tags:['POPUP_TO_CONFIRM','확인'],level:'삽입 스니펫',icon:'message',sources:[{name:'Notion · 확인 팝업',url:notion('2f0a6b8522df80789347d289a6e67638')}],files:snippet('confirm_save.abap',`FORM confirm_save CHANGING pv_confirmed TYPE abap_bool.
  DATA lv_answer TYPE c LENGTH 1.
  pv_confirmed = abap_false.
  CALL FUNCTION 'POPUP_TO_CONFIRM'
    EXPORTING
      titlebar              = '저장 확인'
      text_question         = '변경 내용을 저장하시겠습니까?'
      text_button_1         = '예'
      text_button_2         = '아니오'
      default_button        = '2'
      display_cancel_button = 'X'
    IMPORTING
      answer = lv_answer
    EXCEPTIONS
      text_not_found = 1
      OTHERS         = 2.
  IF sy-subrc = 0 AND lv_answer = '1'.
    pv_confirmed = abap_true.
  ENDIF.
ENDFORM.`, '기존 프로그램 · F01에 추가')},
 {id:'alv-edited',title:'ALV 편집값 동기화',category:'ALV',label:'ALV Grid',description:'저장 전 check_changed_data로 화면의 마지막 수정값까지 반영.',tags:['CHECK_CHANGED_DATA','저장'],level:'삽입 스니펫',icon:'edit',sources:[{name:'ABAP-STUDY · 편집 ALV',url:gh('ABAP-STUDY','ZC505_SUB_04/zc505r0051/zc505r0051_f01.html')}],files:snippet('check_changes.abap',`" 전제: 편집 가능한 gcl_grid, 데이터 변경 검증 핸들러 연결
FORM check_changes CHANGING pv_valid TYPE abap_bool.
  CLEAR pv_valid.
  IF gcl_grid IS BOUND.
    gcl_grid->check_changed_data(
      IMPORTING e_valid = pv_valid ).
  ENDIF.
ENDFORM.
" pv_valid = abap_true 확인 후 업무 검증·잠금·DB 저장 구현`, '기존 프로그램 · F01에 추가')}
];
export const collections=[
 {name:'ABAP 실무 노트',type:'Notion',url:notion('2a8a6b8522df807292e6ccd2577cbe76'),description:'기능·코드·기초·개념을 작업별로 정리한 내 자료실'},
 {name:'RAP 심화과정 2기',type:'Notion',url:notion('3a3a6b8522df80cdb505c85b6e8ca52e'),description:'CDS부터 Behavior, Fiori와 서비스까지'},
 {name:'masterpack-project-fi',type:'GitHub',url:'https://github.com/sherlock0105/masterpack-project-fi',description:'FI 프로젝트의 화면 구조와 실무 구현 패턴'},
 {name:'ABAP-STUDY',type:'GitHub',url:'https://github.com/sherlock0105/ABAP-STUDY',description:'Include 구성, ALV·BDC·F4의 학습 코드'}
];

// 2026-10-15: GitHub 신문법 실습에서 학습용으로 재구성
const syntaxSource=[{name:'GitHub · ZC505REXAM02_F01',url:'https://github.com/sherlock0105/ABAP-STUDY/blob/master/ZC505_SUB_10/zc505rexam02/zc505rexam02_f01.html'}];
templates.push(
 {id:'alv-layout-value',title:'신문법으로 ALV Layout 설정',category:'ALV',label:'VALUE',description:'gs_layout과 스크롤 고정 설정을 VALUE로 구성. 비교 메뉴의 VALUE·BASE와 함께 연습하세요.',tags:['VALUE','LAYOUT','신문법'],level:'삽입 스니펫',icon:'sliders',sources:syntaxSource,files:snippet('set_layout_value.abap',`DATA: gs_layout TYPE lvc_s_layo,
      gs_stable TYPE lvc_s_stbl.

FORM set_layout_value.
  gs_layout = VALUE #(
    zebra      = abap_true
    cwidth_opt = abap_true
    sel_mode   = 'D' ).
  gs_stable = VALUE #( row = abap_true col = abap_true ).
ENDFORM.
" gs_layout은 최초 표시의 is_layout으로 전달
" gs_stable은 refresh_table_display의 is_stable로 전달`, 'TOP 선언 및 F01 · 기존 동일 변수 중복 선언 제외')},
 {id:'toolbar-base',title:'기존 툴바에 버튼 추가 · BASE',category:'ALV',label:'VALUE + BASE',description:'TOOLBAR 이벤트의 기존 버튼을 유지하면서 CREATE·DELETE 버튼을 추가합니다.',tags:['BASE','TOOLBAR','신문법'],level:'삽입 스니펫',icon:'plus',sources:syntaxSource,files:snippet('extend_toolbar.abap',`FORM extend_toolbar CHANGING ct_toolbar TYPE ttb_button.
  ct_toolbar = VALUE #( BASE ct_toolbar
    ( function = 'CREATE' butn_type = 0
      text = '추가' quickinfo = '행 추가' )
    ( function = 'DELETE' butn_type = 0
      text = '삭제' quickinfo = '선택 행 삭제' ) ).
ENDFORM.
" TOOLBAR 이벤트에서 호출
" PERFORM extend_toolbar CHANGING e_object->mt_toolbar.
" USER_COMMAND 이벤트의 CREATE/DELETE 처리도 별도 연결`, 'F01 · TOOLBAR 핸들러에서 호출')},
 {id:'mark-assigned',title:'수정된 ALV 행에 변경 표시',category:'ALV',label:'ASSIGNING',description:'DATA_CHANGED_FINISHED의 정상 변경 셀만 읽어 원본 ITAB에 MARK를 설정합니다.',tags:['READ TABLE','ASSIGNING','DATA_CHANGED_FINISHED'],level:'삽입 스니펫',icon:'edit',sources:syntaxSource,files:snippet('mark_changed_rows.abap',`" TOP: 실제 업무 구조와 함께 MARK 필드 선언
DATA: BEGIN OF gs_data,
        mark TYPE abap_bool,
        carrid TYPE scarr-carrid,
        carrname TYPE scarr-carrname,
      END OF gs_data,
      gt_data LIKE TABLE OF gs_data.

FORM mark_changed_rows USING it_good_cells TYPE lvc_t_modi.
  LOOP AT it_good_cells INTO DATA(ls_cell).
    READ TABLE gt_data ASSIGNING FIELD-SYMBOL(<ls_data>)
      INDEX ls_cell-row_id.
    IF sy-subrc = 0.
      <ls_data>-mark = abap_true.
    ENDIF.
  ENDLOOP.
ENDFORM.
" DATA_CHANGED_FINISHED 핸들러: e_modified 확인 후
" PERFORM mark_changed_rows USING et_good_cells.
" 기존 gt_data를 쓰면 예제 TOP 선언은 중복 추가하지 않음`, 'TOP/F01 · 편집 이벤트 핸들러 연결 필요')}
);
