const notion=id=>'https://app.notion.com/p/'+id;
export const additionalNotes=[
{id:'alv-tree',category:'ALV·화면',title:'ALV Tree 왼쪽 탐색·오른쪽 상세',summary:'노드 키와 업무 키를 연결하고 클릭한 범위만 상세 조회한다.',tags:['ALV Tree','NODE_DOUBLE_CLICK','노드','트리','CL_GUI_ALV_TREE'],sections:[
{title:'트리는 조회 범위를 선택하는 화면',text:'왼쪽을 전체 → 계정유형 → 통화 → 거래처처럼 묶고, 오른쪽 Grid에는 선택 범위의 전표를 보여준다. 그룹 제목과 실제 조회 조건은 구분해서 관리한다.'},
{title:'노드 키와 업무 키를 매핑',text:'노드 키는 화면 안에서 노드를 식별하는 값이다. 고객번호나 전표번호를 문자열로 잘라 업무 키를 추측하지 말고, 노드 키와 회사코드·통화·거래처·전표 키를 별도 ITAB으로 연결한다.',table:{headers:['연결 정보','예시 역할'],rows:[['NODE_KEY','트리 노드 식별'],['PARENT_KEY','상위 노드 연결'],['NODE_KIND','전체 / 통화 / 거래처 / 전표 구분'],['업무 키 필드','선택 노드에 대응하는 조회 조건']]}},
{title:'클릭 이벤트의 처리 순서',text:'NODE_DOUBLE_CLICK에서 노드 키를 받는다 → 매핑 ITAB을 READ한다 → 노드 종류에 맞는 조건을 만든다 → 상세 ITAB을 조회한다 → 오른쪽 Grid를 새로고침한다. 조회할 때마다 전체 트리를 다시 생성하지 않는다.'},
{title:'먼저 최소 두 단계로 만든다',text:'처음부터 5단계로 늘리지 말고 전체 → 통화 두 단계와 오른쪽 조회부터 연결한다. 이후 거래처·전표 노드를 추가한다. 노드 생성과 클릭 이벤트의 정확한 인자는 SE24와 BCALV_TREE_DEMO 등 시스템 예제에서 확인한다.'}
],links:[{name:'Notion · ALV Tree',url:notion('3e8a6b8522df81758684da7464d9560b')}]},
{id:'header-item',category:'ALV·화면',title:'Header–Item 두 목록 연결',summary:'위 목록의 한 행을 읽고 전체 헤더 키로 하단 상세를 조회한다.',tags:['Header Item','더블클릭','DOUBLE_CLICK','BKPF','BSEG','SPLITTER'],sections:[
{title:'클릭 위치에서 업무 키를 얻는다',text:'이벤트의 행 번호는 선택한 출력 ITAB을 읽는 데 쓴다. 그 행에서 회사코드·전표번호·회계연도를 꺼내 상세를 조회한다. 화면 행 번호 자체를 DB 키로 쓰지 않는다.'},
{title:'세 개 헤더 키를 함께 전달',text:'gs_header/gt_header에 전표 키 세 필드가 있고, gt_detail이 BSEG 행 타입인 기존 프로그램의 이벤트 연결 예제다.',code:`READ TABLE gt_header INTO gs_header INDEX e_row-index.
IF sy-subrc <> 0.
  RETURN.
ENDIF.
SELECT * FROM bseg
  WHERE bukrs = @gs_header-bukrs
    AND belnr = @gs_header-belnr
    AND gjahr = @gs_header-gjahr
  INTO TABLE @gt_detail.
gcl_detail_grid->refresh_table_display( ).`,where:'DOUBLE_CLICK 핸들러 · 기존 헤더/상세 Grid와 ITAB 필요'},
{title:'조회 결과가 없을 때도 갱신',text:'상세 조회가 0건이어도 빈 상세 ITAB으로 하단을 새로고침한다. 이전 헤더의 상세가 계속 보이면 사용자가 잘못된 전표 항목으로 오해할 수 있다.'},
{title:'두 Grid의 출력 테이블을 구분',text:'상단은 gt_header, 하단은 gt_detail처럼 데이터와 Grid 이름을 분명히 둔다. 조회 FORM에서 채운 테이블과 최초 표시의 IT_OUTTAB이 같은지 확인한다.'}
],links:[{name:'Notion · Header–Item',url:notion('3e8a6b8522df81d68bdef23cbbe850a3')}]},
{id:'splitter-code',category:'ALV·화면',title:'Splitter 생성 순서만 짧게 보기',summary:'부모 Container → Splitter → 셀 Container → Grid 순서로 만든다.',tags:['CL_GUI_SPLITTER_CONTAINER','Splitter','get_container','분할'],sections:[
{title:'객체마다 부모가 있다',text:'Splitter는 ALV 자체가 아니라 영역을 나누는 컨테이너다. 분할한 각 셀의 컨테이너를 얻고, 그 컨테이너를 부모로 Grid 또는 다른 컨트롤을 생성한다.'},
{title:'2행 1열의 최소 생성 흐름',text:'gcl_parent는 기존 화면에서 생성한 부모 컨테이너다. 선언은 TOP, 생성은 PBO 최초 생성 분기에 둔다.',code:`" TOP
DATA gcl_splitter TYPE REF TO cl_gui_splitter_container.
DATA gcl_header_grid TYPE REF TO cl_gui_alv_grid.
DATA gcl_detail_grid TYPE REF TO cl_gui_alv_grid.

" PBO 최초 생성 분기
IF gcl_splitter IS NOT BOUND.
  gcl_splitter = NEW #(
    parent = gcl_parent rows = 2 columns = 1 ).
  DATA(gcl_top_cell) = gcl_splitter->get_container(
    row = 1 column = 1 ).
  DATA(gcl_bottom_cell) = gcl_splitter->get_container(
    row = 2 column = 1 ).
  gcl_header_grid = NEW #( i_parent = gcl_top_cell ).
  gcl_detail_grid = NEW #( i_parent = gcl_bottom_cell ).
ENDIF.`,where:'TOP 선언 / O01 또는 생성 FORM · gcl_parent 사전 생성'},
{title:'표시는 각 Grid에 한 번씩',text:'각 Grid에 필드카탈로그·레이아웃·IT_OUTTAB을 전달해 최초 표시한다. 이후 조회 결과가 바뀌면 해당 Grid만 refresh_table_display한다. 이벤트 핸들러도 처리할 Grid에 연결한다.'}
],links:[{name:'Notion · Splitter',url:notion('2efa6b8522df80308f2ece82f7a98319')}]},
{id:'excel-download',category:'BDC·업로드',title:'SMW0 엑셀 템플릿 다운로드',summary:'서버에 등록한 양식을 사용자가 고른 PC 경로에 내려받는다.',tags:['SMW0','DOWNLOAD_WEB_OBJECT','WWWDATA','EXCEL_TEM','템플릿 다운로드'],sections:[
{title:'SMW0에 원본 파일 등록',text:'바이너리 객체로 템플릿을 등록하고 객체 ID를 정한다. 업로드 프로그램이 기대하는 열 순서와 파일 형식을 맞춘다. 파일 이름만 .xlsx로 바꾼다고 실제 형식이 변하지는 않는다.'},
{title:'핵심 흐름만 보기',text:'ZMY_EXCEL은 실제 등록한 객체 ID로 바꾼다. 사용자가 저장을 취소하면 다운로드를 호출하지 않는다.',code:`DATA: ls_key TYPE wwwdatatab,
      lv_name TYPE string,
      lv_path TYPE string,
      lv_full TYPE string,
      lv_action TYPE i,
      lv_rc TYPE sy-subrc.
SELECT SINGLE relid, objid
  FROM wwwdata
  WHERE relid = 'MI' AND objid = 'ZMY_EXCEL'
  INTO CORRESPONDING FIELDS OF @ls_key.
IF sy-subrc <> 0.
  RETURN.
ENDIF.
cl_gui_frontend_services=>file_save_dialog(
  EXPORTING default_extension = 'xlsx'
            default_file_name = 'upload_template.xlsx'
  CHANGING filename = lv_name path = lv_path
           fullpath = lv_full user_action = lv_action ).
IF lv_action = cl_gui_frontend_services=>action_cancel.
  RETURN.
ENDIF.
CALL FUNCTION 'DOWNLOAD_WEB_OBJECT'
  EXPORTING key = ls_key
            destination = CONV rlgrap-filename( lv_full )
  IMPORTING rc = lv_rc.
" lv_rc로 다운로드 결과 표시`,where:'F01 다운로드 FORM · SAP GUI 프런트엔드 및 SMW0 객체 필요'},
{title:'버튼이 실행되지 않으면',text:'PF-STATUS에 등록한 기능 코드, gv_okcode, PAI CASE, PERFORM 호출이 연결돼 있는지 본다. 원본 양식은 SMW0, 사용자의 파일 저장 위치는 PC 경로라는 점도 구분한다.'}
],links:[{name:'Notion · 엑셀 양식 다운로드',url:notion('3eca6b8522df81b2bfb2c98b1221a95c')}]},
{id:'clearing-reversal',category:'FI 전표',title:'반제·역분개·반제취소의 차이',summary:'미결을 정리하는 동작과 잘못 전기한 문서를 취소하는 동작을 나눈다.',tags:['반제','역분개','FB08','FBRA','AUGBL','AUGDT','STBLG'],sections:[
{title:'세 가지 동작 비교',text:'어떤 결과를 되돌리려는지부터 정한다. 미결 관리 대상 계정과 실제 전표 상태가 전제다.',table:{headers:['동작','목적','대표 트랜잭션'],rows:[['반제','송장·입금·지급 등의 미결 항목을 연결해 정리','F-03 / F-32 / F-44'],['역분개','원전표의 회계 효과를 취소','FB08'],['반제취소','이미 연결된 반제 관계를 해제','FBRA']]}},
{title:'전표에서 볼 필드',text:'반제전표·반제일은 항목 단위의 AUGBL·AUGDT, 역분개 참조는 헤더의 STBLG 등을 확인한다. 상태를 임의의 FLAG 하나로만 판단하지 말고 실제 전표와 연결 문서를 함께 본다.'},
{title:'이미 반제된 문서를 취소하려면',text:'반제 상태 때문에 바로 역분개할 수 없는 경우가 있다. 표준 반제취소 절차와 반제전표의 역분개 필요 여부를 확인한다. FBRA에는 반제 관계 해제와 관련 전표 취소를 구분하는 선택이 있으며, 적용 가능한 동작은 문서 상태와 설정에 따른다.'},
{title:'CBO 화면에서도 결과를 구분',text:'정식 전표번호를 지우는 것만으로 표준 전표가 취소되지는 않는다. 표준 처리 결과 키와 메시지를 받은 뒤 CBO에 반제취소·역분개 상태를 기록한다. 이 노트는 트랜잭션을 실행하지 않는다.'}
],links:[{name:'SAP · Clearing Process',url:'https://help.sap.com/docs/SAP_S4HANA_CLOUD/918bca53037f408f91a2295d04ac16bc/a21af993466648b994144cdd15ab1a39.html'},{name:'SAP · Reversing Accounting Documents',url:'https://help.sap.com/docs/SAP_ERP/8be65bb2cd0d42f3b5d12724a7714b0c/c15b8cebbbe34b95b73376beabf73c29.html'}]},
{id:'global-fm',category:'설계·운영',title:'전역 Function Module 만들기 순서',summary:'Function Group·DDIC 타입·함수 인터페이스·호출부를 차례로 연결한다.',tags:['SE37','SE80','Function Group','Function Module','전역함수','TABLES'],sections:[
{title:'공유할 입력과 출력부터 적기',text:'전표 생성이라면 입력은 헤더와 항목, 출력은 결과 키와 메시지다. ALV 객체나 화면 전용 STYLE·ICON 필드는 인터페이스에 섞지 않는다.'},
{title:'객체 생성 순서',text:'SE11에서 공유 Structure·Table Type을 준비한다 → SE80에서 Function Group을 만든다 → SE37에서 그 그룹에 Function Module을 만든다 → 인터페이스 타입을 지정한다 → 구현과 호출부를 연결한다. 새로 만든 객체는 의존성 순으로 활성화한다.'},
{title:'호출 방향 다시 확인',text:'호출 프로그램의 EXPORTING은 함수의 IMPORTING으로 들어간다. 함수의 EXPORTING 결과는 호출 프로그램의 IMPORTING으로 받는다. 필드명뿐 아니라 DDIC 행 타입과 테이블 종류도 맞춘다.'},
{title:'분리할 때 유지할 것',text:'처음에는 기존의 성공한 한 건 처리 흐름을 그대로 옮기고 인터페이스만 분명히 한다. Function Group 전역 데이터가 다음 호출에 남지 않게 하고, COMMIT을 함수가 할지 호출자가 할지 정해 둔다. 파일을 짧게 만들기 위해 무조건 전역 함수로 쪼갤 필요는 없다.'}
],links:[{name:'Notion · Function Group·Function Module',url:notion('2d2a6b8522df80bbbb32e0c6856d8428')},{name:'함수·클래스 선택 기준',url:'#notes/fm-class'}]}
];
