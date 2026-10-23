// Original teaching notes, not a mirror of the linked blog.
const home='https://sherlock0105.github.io/abap-workbench/';
const fence=code=>'```abap\n'+code.trim()+'\n```';
const demo=body=>fence('REPORT zwb_lesson.\nSTART-OF-SELECTION.\n  PERFORM run_example.\nFORM run_example.\n'+body+'\nENDFORM.');
const keyword='https://github.com/SAP-samples/abap-cheat-sheets';
const loops='https://help.sap.com/saphelp_gbt10/helpdata/en/fc/eb381a358411d1829f0000e829fbfe/content.htm';
const sf='https://help.sap.com/docs/SAP_NETWEAVER_AS_ABAP_752/e0ef07e1f76b4370b1baa502eace5ece/4e569e191c3e4f4ae10000000a42189e.html';
const builtins='https://github.com/SAP-samples/abap-cheat-sheets/blob/main/24_Builtin_Functions.md';
const notes=[
 [2,'Simple Tree — 노드키와 업무키를 분리하기','ALV 표시·편집',
 '기존 트리 예제에 노드키 안정성과 이벤트 등록 순서를 보강합니다. 노드 텍스트가 같아도 키는 고유해야 합니다.',
 '노드 테이블을 부모 → 자식 순서로 만들고 RELATKEY가 실제 부모를 가리키는지 검사합니다. 표시 문구를 업무키로 사용하지 말고 노드키와 회사코드/문서키를 별도 매핑하세요. PBO에서 컨테이너와 CL_GUI_SIMPLE_TREE를 한 번만 생성합니다. SET_REGISTERED_EVENTS와 SET HANDLER는 역할이 다릅니다. 더블클릭 이벤트를 프런트엔드에 등록하고 수신 핸들러도 연결해야 합니다.\n\n노드 클릭 시 이벤트 NODE_KEY로 업무키를 찾은 뒤 오른쪽 Grid 조회 FORM을 호출합니다. 목록 정렬 때문에 업무키가 바뀌면 안 됩니다. 실제 전체 화면은 아래 기존 트리 예제에 병합하세요.',null,'notion-3e8a6b8522df8102ab0ad4bd5081f672'],
 [3,'필드심볼 — INTO 복사본과 ASSIGNING 원본 변경','반복·타입 심화',
 '필드심볼 자체에 값을 복사하는 것과 원본 행을 연결하는 것을 구분합니다.',
 'LOOP INTO의 작업영역을 변경하면 원본 테이블은 그대로입니다. LOOP ASSIGNING의 연결된 행을 변경하면 테이블에 반영됩니다. 따라서 후자에는 같은 변경을 위한 MODIFY가 필요하지 않습니다. 필드심볼은 C 포인터 연산과 동일한 기능이 아니며 연결 대상 타입·수명·키 제약을 지켜야 합니다.',
 demo(`  TYPES: BEGIN OF ty_item, id TYPE i, qty TYPE i, END OF ty_item.
  DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
  lt_items = VALUE #( ( id = 1 qty = 2 ) ( id = 2 qty = 3 ) ).
  LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<item>).
    <item>-qty = <item>-qty + 1.
  ENDLOOP.
  LOOP AT lt_items INTO DATA(ls_item).
    WRITE: / ls_item-id, ls_item-qty. " 1/3, 2/4
  ENDLOOP.`),'notion-2f6a6b8522df80468934da5c6564f187'],
 [4,'ASSIGN COMPONENT — 실패 시 이전 연결 재사용 막기','반복·타입 심화',
 '동적 열 매핑에서 SY-SUBRC와 IS ASSIGNED를 함께 확인합니다.',
 '잘못된 이름으로 동적 ASSIGN이 실패할 때 이전 연결을 사용하지 않도록 먼저 UNASSIGN합니다. 구조의 실제 필드명을 문자열로 지정하고 이름을 허용 목록과 대조하세요. 숫자 위치는 열 순서가 바뀌면 다른 필드를 가리킬 수 있습니다.',
 demo(`  TYPES: BEGIN OF ty_line, bukrs TYPE c LENGTH 4, amount TYPE i, END OF ty_line.
  DATA ls_line TYPE ty_line.
  DATA lv_name TYPE string VALUE 'AMOUNT'.
  FIELD-SYMBOLS <cell> TYPE any.
  UNASSIGN <cell>.
  ASSIGN COMPONENT lv_name OF STRUCTURE ls_line TO <cell>.
  IF sy-subrc = 0 AND <cell> IS ASSIGNED.
    <cell> = 25.
  ENDIF.
  WRITE / ls_line-amount.`),'notion-2f6a6b8522df80468934da5c6564f187'],
 [5,'데이터 참조 역참조 — IS BOUND와 IS ASSIGNED','반복·타입 심화',
 '참조가 연결됐는지와 필드심볼이 연결됐는지는 별도로 검사합니다.',
 'TYPE REF TO DATA는 데이터 참조를 보관합니다. 참조->*로 대상에 접근할 때 IS BOUND를 먼저 검사합니다. NEW i( )는 정적으로 알려진 타입을 만들며, 실행 중 타입 이름에 따라 만들려면 CREATE DATA와 타입 검증을 사용합니다. ALV ONF4의 M_DATA도 데이터 참조입니다.',
 demo(`  DATA lr_value TYPE REF TO i.
  FIELD-SYMBOLS <value> TYPE i.
  lr_value = NEW i( 17 ).
  IF lr_value IS BOUND.
    ASSIGN lr_value->* TO <value>.
    IF <value> IS ASSIGNED.
      <value> = <value> + 3.
      WRITE / lr_value->*. " 20
    ENDIF.
  ENDIF.`),'notion-2f6a6b8522df80468934da5c6564f187'],
 [6,'화면 F4 — 미전송 조직값과 VALUE_ORG 구분','F4·텍스트 매핑',
 'POV 시점의 화면 버퍼, 취소 처리, 구조형 값 목록을 구분합니다.',
 'POV에서 아직 Enter로 전송되지 않은 회사코드는 DYNP_VALUES_READ로 읽습니다. ALV 셀에는 Dynpro 필드명 기반 처리를 그대로 적용하지 말고 ONF4 경로를 사용하세요. VALUE_ORG의 S/C는 구조형/셀형 데이터 구성 차이이며 단일 선택/복수 선택 구분이 아닙니다. 복수선택 여부는 MULTIPLE_CHOICE와 RETURN_TAB으로 처리합니다. 반환 필드 FIELDVAL을 확인하고 취소했을 때 기존 값을 지우지 않습니다.\n\n완성 Dynpro 예제는 생성기의 F4_ACCOUNT, ALV는 NEWKO 유형을 사용하세요.',null,'build-f4-account'],
 [7,'ALV Toolbar — 버튼 표시와 실행 로직 나누기','이벤트',
 '툴바 이벤트에서 버튼을 만들고 USER_COMMAND에서 동작을 처리합니다.',
 'TOOLBAR는 다시 발생할 수 있습니다. 같은 사용자 버튼을 무조건 APPEND하면 중복되므로 FUNCTION 키를 확인합니다. STB_BUTTON의 FUNCTION은 화면 글자와 독립된 명령입니다. 실제 처리 LOOP는 USER_COMMAND가 호출한 FORM 안에 둡니다. 생성기의 ALV Toolbar 전체 코드에 아래 부분을 적용할 수 있습니다.',
 fence(`" TOOLBAR 이벤트 메서드 안. E_OBJECT는 CL_ALV_EVENT_TOOLBAR_SET 참조.
READ TABLE e_object->mt_toolbar WITH KEY function = 'ZCHECK'
  TRANSPORTING NO FIELDS.
IF sy-subrc <> 0.
  APPEND VALUE stb_button( function = 'ZCHECK' text = '검증'
                          quickinfo = '선택 행 검증' ) TO e_object->mt_toolbar.
ENDIF.`),'build-alv-toolbar'],
 [8,'ALV USER_COMMAND — E_UCOMM과 SENDER 사용','이벤트',
 '두 Grid가 같은 핸들러를 쓰면 발생시킨 객체를 SENDER로 구분합니다.',
 'ALV 사용자 툴바 명령은 E_UCOMM을 기준으로 CASE 분기합니다. 화면 PAI의 SY-UCOMM/GV_OKCODE와 섞지 않습니다. 공통 핸들러에서 SENDER를 IMPORTING으로 받으면 어떤 Grid에서 발생했는지 알 수 있습니다. 표준 버튼까지 USER_COMMAND가 모두 가로챈다고 가정하지 마세요. 선택행은 SENDER의 GET_SELECTED_ROWS에서 읽고 그 Grid의 데이터와 대응시킵니다.',null,'notion-35ca6b8522df80548cb4e3e1c5d4d601'],
 [9,'DATA_CHANGED — 현재 편집값으로 교차 필드 검증','이벤트',
 'GT_DATA에 반영되기 전 회사코드·전기키를 읽는 패턴을 보강합니다.',
 '한 번에 두 셀을 수정하면 GT_DATA에는 아직 예전 값이 있을 수 있습니다. GET_CELL_VALUE로 동일 행의 현재 편집값을 읽습니다. 오류는 ADD_PROTOCOL_ENTRY, 파생값은 MODIFY_CELL로 전달하세요. 이벤트마다 전체 Grid를 강제로 새로 그리지 말고 저장 버튼에서 CHECK_CHANGED_DATA를 호출합니다. 대량 붙여넣기에서 행마다 SELECT SINGLE하지 않도록 필요한 키를 모아 먼저 조회합니다.',null,'build-alv-newko'],
 [10,'DATA_CHANGED_FINISHED — 검증 뒤 후처리','이벤트',
 '완료 이벤트 등록과 내부테이블 반영을 혼동하지 않습니다.',
 'DATA_CHANGED는 입력 검증·보정, DATA_CHANGED_FINISHED는 완료 뒤 요약이나 관련 화면 갱신에 사용합니다. FINISHED 핸들러를 반드시 등록해야 GT_DATA에 값이 반영되는 것은 아닙니다. E_MODIFIED가 초기값이면 불필요한 후처리를 생략합니다. 잘못된 값은 변경 이벤트에서 오류로 표시하고, 저장 진입점은 CHECK_CHANGED_DATA의 E_VALID가 참일 때만 통과시키세요.',null,'notion-2e3a6b8522df80e79ab4f47d18f98d1d'],
 [11,'Hotspot — 표시값 대신 업무키로 상세 화면 열기','이벤트',
 'Parameter ID는 F1 기술정보에서 확인하고 모든 문서키를 전달합니다.',
 'FCAT-HOTSPOT 설정과 HOTSPOT_CLICK 핸들러를 함께 연결합니다. 이벤트 행 식별자로 원본 행을 읽고 회사코드·회계연도·전표번호 같은 완전한 업무키를 가져오세요. 화면의 몇 번째 줄인지로 전표번호를 추측하지 않습니다. SET PARAMETER ID는 메모리 기본값 전달이며 대상 화면의 모든 조건을 채워주는 보장은 없습니다. AND SKIP FIRST SCREEN도 필수값과 거래 동작에 따라 달라집니다.',null,'notion-2dea6b8522df807daf25d692a7d25c68'],
 [12,'Double click — 정렬·합계행과 잘못된 행 방어','이벤트',
 '더블클릭 이벤트의 행 식별자로 데이터 존재를 먼저 확인합니다.',
 '원본 테이블을 READ한 직후 SY-SUBRC를 확인하고 실패하면 상세 처리를 끝냅니다. 합계행·빈 영역·삭제 후 이벤트를 일반 데이터행으로 취급하지 마세요. 화면 정렬과 필터를 적용한 뒤에도 같은 업무키가 열리는지 시험합니다. HOTSPOT은 특정 열의 한 번 클릭이고 DOUBLE_CLICK은 별도의 사용자 동작입니다.',
 fence(`" DOUBLE_CLICK 핸들러에서 받은 ES_ROW_NO와 해당 Grid의 GT_DATA 사용.
CHECK es_row_no-row_id > 0.
READ TABLE gt_data INTO DATA(ls_clicked) INDEX es_row_no-row_id.
CHECK sy-subrc = 0.
" 이후 ls_clicked의 완전한 업무키로 상세조회 FORM을 호출한다.`),'build-alv-hotspot'],
 [13,'NEWKO ONF4 — BSCHL → TBSL-KOART 조건별 도움말','F4·텍스트 매핑',
 'G/L 하나로 고정하지 않고 고객·공급업체·G/L·자산을 구분하는 전체 예제입니다.',
 '전기키에서 KOART를 읽고 D/K/S/A에 따라 후보를 선택합니다. 회사코드, G/L 계정과목표·언어, 자산 주번호·보조번호를 보존합니다. BBSEG-NEWKO 참조만으로 FI 거래화면 문맥까지 자동 연결되지 않습니다. F4AVAILABL → 이벤트 클래스 → SET HANDLER → REGISTER_F4_FOR_FIELDS → ONF4 → M_DATA 변경표 순서입니다. 선택 취소와 조회모드에는 원본을 수정하지 않습니다.\n\n생성기에 TOP/C01/O01/I01/F01 및 SE51 Flow Logic을 모두 포함했습니다. 새 Z DDIC는 필요 없습니다. 후보 조회는 전기 가능 여부 전체 검증과 구분합니다.',null,'build-alv-newko'],
 [14,'DEFINE 매크로 — 반복 블록보다 FORM 인터페이스 우선','함수·클래스',
 '매크로는 텍스트 치환이고 FORM은 타입 있는 호출 경계를 가집니다.',
 'DEFINE의 &1…&9는 이름 있는 매개변수가 아니므로 호출 순서와 사용 문맥을 잘못 이해하기 쉽습니다. 필드카탈로그 한 줄을 줄이는 용도로 읽을 수는 있지만 검증·DB 조회·오류 처리를 숨기는 큰 매크로는 피하세요. 같은 작업 LOOP를 통째로 FORM에 두면 매개변수와 오류 반환이 보이고 디버깅하기 쉽습니다.',
 fence(`" 작은 반복 작업도 필요한 경우 타입 있는 FORM으로 표현할 수 있다.
FORM add_column USING pv_field TYPE lvc_fname pv_title TYPE lvc_txtcol
                CHANGING pt_fcat TYPE lvc_t_fcat.
  APPEND VALUE #( fieldname = pv_field coltext = pv_title
                  outputlen = 20 ) TO pt_fcat.
ENDFORM.`),'build-form'],
 [15,'ADD_PROTOCOL_ENTRY — 셀 오류와 저장 차단 연결','유효성 검사',
 '오류창 표시만으로 별도 저장 코드까지 자동 차단된다고 가정하지 않습니다.',
 '오류는 I_ROW_ID/I_FIELDNAME에 연결합니다. 메시지 ID·번호·변수도 함께 설정합니다. 저장 진입점은 CHECK_CHANGED_DATA 결과가 거짓이면 명시적으로 RETURN해야 합니다. 공백이 허용되지 않는 필드라면 지우는 동작도 다시 오류로 처리하세요. 대량 검증에는 회사별 마스터를 일괄 조회해 HASHED TABLE로 검사하고 같은 행의 여러 오류를 모두 남깁니다.',null,'validate-alv'],
 [16,'T-code — 오류 원인별 도구 고르기','운영·확장',
 '티코드 목록을 문제 진단 순서로 연결합니다.',
 'F4 연결: SE11 필드/데이터엘리먼트 → SE24 이벤트 시그니처 → SE37 F4 함수. 업로드 덤프: ST22의 예외명·소스행 → 입력 원본 행 → SE37 고전 예외. FI BDC: SHDB 녹화 → 실제 GT_MESSTAB → 갱신 문제는 SM13. 화면 버튼: SE41 함수코드 → SE51 Flow Logic → PAI/ALV 이벤트를 확인합니다. 버퍼 초기화 명령을 필드카탈로그 문제의 만능 해결책으로 쓰지 말고 참조·활성화·최초 표시/갱신 경로부터 점검하세요.',null,'notion-2b0a6b8522df80b5b88ede00c26be623'],
 [17,'Excel 업로드 — TRY/CATCH·대량 행 검증·원본 보존','파일·엑셀',
 '업로드, 문자열 매핑, 형변환, 업무 검증을 분리하고 모든 오류 행을 모읍니다.',
 'ALSM 함수의 고전 예외는 EXCEPTIONS/SY-SUBRC로 검사합니다. 숫자 변환의 클래스 기반 예외는 TRY/CATCH로 처리합니다. 모든 런타임 덤프를 CATCH로 막을 수는 없습니다. ROW/COL을 정렬하고 행이 바뀔 때 작업영역을 초기화합니다. 데이터를 처음부터 금액/날짜 타입에 대입하지 않고 원본 문자열·Excel 행번호를 유지하세요.\n\n생성기의 Excel 검증 예제는 필수·중복·형식·마스터·금액·날짜를 한 FORM에서 검사합니다. 레거시 ALSM의 길이/행 제한을 대용량 XLSX 지원으로 오해하지 마세요. 대형 마스터는 업로드 키 중복제거 → 비어 있지 않은 키 목록 일괄조회 → HASHED 조회로 확장합니다.',null,'build-excel-validate'],
 [18,'SMW0 양식 다운로드 — 취소·확장자·경로 길이','파일·엑셀',
 '원본 파일을 보존하는 다운로드와 Excel 자동 생성은 다른 작업입니다.',
 'SMW0에는 실제 양식의 바이너리를 등록하고 프로그램은 그 파일을 내려받습니다. XLSX 파일은 XLSX 확장자로 저장해야 하며 확장자만 바꿔 형식을 변환할 수 없습니다. FILE_SAVE_DIALOG의 DEFAULT_EXTENSION에는 xlsx 같은 확장자만, FILE_FILTER에는 필터 표현식을 넣습니다. USER_ACTION이 취소면 RETURN합니다. STRING 경로를 RLGRAP-FILENAME에 대입하기 전에 길이를 검사해 잘림을 막습니다. DOWNLOAD_WEB_OBJECT의 반환코드는 SE37 시그니처에 맞춰 검사하고 실패하면 파일 실행을 하지 않습니다.\n\n기존 양식 다운로드 전체 흐름에 이 검사를 적용하세요. 원문에서 소개한 별도 외부 첨부 실행파일은 가져오지 않았습니다.',null,'notion-3eca6b8522df81b2bfb2c98b1221a95c'],
 [19,'Smart Forms 다국어 — SE63 우회법을 진단과 분리','Smart Forms',
 '한국어·중국어 공백 현상을 번역으로 무조건 덮어쓰지 않습니다.',
 '원문은 SE63으로 복사·역복사한 개인 우회 사례입니다. 이를 모든 시스템의 원인 해결법으로 확정하지 않습니다. 원본/번역 텍스트를 보존하고 최소 텍스트로 편집기·언어·폰트·출력 장치 조합을 나누어 재현하세요. SE63은 번역 관리에 사용하고 승인된 수정만 전송합니다. 미리보기·PDF·실제 인쇄를 비교해 저장 단계 문제인지 출력 단계 문제인지 구분합니다. GUI 패치와 공식 SAP Note는 대상 버전에 맞춰 확인하세요.',null,null],
 [20,'Smart Forms 이미지 — SE78 그래픽·출력·전송','Smart Forms',
 '로고 등록부터 그래픽 노드와 운영 전송까지 연결합니다.',
 'SE78에서 회사가 허용한 이미지 형식을 가져오고 이름·OBJECT·ID·색상 구분을 기록합니다. Smart Form에 Graphic 노드를 만들고 그 키를 연결합니다. 지원 형식과 색상은 시스템 조건을 확인하세요. BMP 256색만 모든 환경의 유일한 선택이라고 일반화하지 않습니다. SAP 문서에는 TIF/BMP가 안내되어 있습니다.\n\n실제 크기와 해상도를 미리보기·PDF·인쇄에서 확인하고 그래픽 전송도 별도로 포함합니다. 큰 이미지는 출력 전송량을 늘리므로 용도에 맞는 크기를 사용합니다.',null,null],
 [21,'Smart Styles — 단락·문자 포맷을 따로 관리','Smart Forms',
 '정렬/간격과 글꼴/강조를 구분한 출력 스타일을 준비합니다.',
 '단락 포맷은 정렬·들여쓰기·줄간격·탭, 문자 포맷은 글꼴·크기·강조·바코드 같은 문자 단위 표현을 정의합니다. 기존 공통 스타일을 먼저 확인하고 필요한 경우에만 새 스타일을 만듭니다. 활성화 후 폼의 기본 스타일에 연결하고 특정 텍스트의 재정의가 있는지도 점검하세요.\n\n한국어 폰트는 출력 장치와 PDF 지원까지 확인합니다. Y는 연습용, Z는 운영용이라는 구분은 일반 규칙이 아닙니다. 둘 다 고객 네임스페이스이며 회사 규칙과 패키지/전송 설정을 따릅니다.',null,null],
 [22,'Smart Forms 바코드 — SE73 → 문자 포맷 → 스캔','Smart Forms',
 '보이는 바코드와 실제로 판독되는 바코드를 함께 시험합니다.',
 'SE73에서 사용할 System Barcode를 선택하거나 권한 내에서 정의합니다. Smart Style 문자 포맷에 연결하고 텍스트 노드의 값에 적용합니다. 바코드 표준이 허용하는 문자·길이와 체크디지트 규칙을 입력 단계에서 확인하세요.\n\n새 바코드 인쇄는 그래픽 기반으로 처리될 수 있으며 출력 장치/드라이버 조건을 확인해야 합니다. 최소/최대 길이, 선명도, 여백을 점검하고 PDF뿐 아니라 실제 프린터와 스캐너로 원래 문자열이 읽히는지 확인합니다.',null,null],
 [23,'Smart Forms 전체 흐름 — 인터페이스부터 동적 호출','Smart Forms',
 '폼 객체 설정과 ABAP 드라이버 코드를 연결하는 새 입문 문서입니다.',
 'SMARTFORMS에서 폼을 만들고 기존 스타일을 연결합니다. 페이지와 MAIN 윈도우, 고정 제목 영역, 반복 표의 헤더/본문/끝부분을 나눕니다. 다음 페이지와 반복 헤더를 설정하고 0행·1행·여러 페이지를 시험합니다. 인쇄 여백과 최소 행 높이는 프린터/폰트 조건이며 특정 cm/mm를 모든 환경의 규칙으로 고정하지 않습니다.\n\n입력 인터페이스는 실제 업무키와 금액/통화 타입을 유지하고 표시 문자열은 필요한 곳에서 변환합니다. 무조건 모든 값을 CHAR로 바꾸지 않습니다. 새 Z 구조는 재사용 계약에 필요한 경우만 만듭니다. 아래 드라이버는 사용자 정의 필수 매개변수가 없는 텍스트 폼용입니다. 화면에서 폼을 먼저 만들고 활성화한 후 실행하세요.',
 fence(`REPORT zwb_form_preview.
PARAMETERS pa_form TYPE tdsfname OBLIGATORY.
START-OF-SELECTION.
  PERFORM preview_form.
FORM preview_form.
  DATA: lv_fm TYPE rs38l_fnam, ls_control TYPE ssfctrlop.
  " 시스템마다 달라지는 생성 함수 이름을 하드코딩하지 않는다.
  CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
    EXPORTING formname = pa_form IMPORTING fm_name = lv_fm
    EXCEPTIONS no_form = 1 no_function_module = 2 OTHERS = 3.
  IF sy-subrc <> 0. MESSAGE '폼 이름과 활성화 상태를 확인하세요.' TYPE 'I'. RETURN. ENDIF.
  ls_control-preview = abap_true.
  CALL FUNCTION lv_fm
    EXPORTING control_parameters = ls_control user_settings = abap_true
    EXCEPTIONS formatting_error = 1 internal_error = 2 send_error = 3
               user_canceled = 4 OTHERS = 5.
  IF sy-subrc <> 0 AND sy-subrc <> 4.
    MESSAGE '출력 장치·폼 인터페이스를 확인하세요.' TYPE 'I'.
  ENDIF.
ENDFORM.`),null],
 [24,'AT NEW / END OF — 제어 수준과 LOOP 전체 FORM','반복·타입 심화',
 '정렬·앞 필드·INTO 작업영역·마지막 그룹 처리까지 연결합니다.',
 'AT NEW/END OF는 지정 필드 하나만 보는 것이 아니라 구조에서 그 왼쪽 필드도 제어 수준으로 사용합니다. 행번호 같은 매번 다른 필드가 왼쪽에 있으면 기대한 그룹이 나뉩니다. 그룹키를 앞에 두고 같은 순서로 정렬하세요. INTO 작업영역은 AT 블록 안에서 오른쪽 문자형 필드가 별표, 다른 필드가 초기값으로 바뀔 수 있습니다. 원본 행 데이터가 필요한 계산은 AT 밖에서 하거나 안전한 복사본을 쓰세요.\n\nASSIGNING에서는 같은 작업영역 치환을 하지 않지만 그룹 경계 규칙은 그대로입니다. ON CHANGE OF는 신규 코드의 기본 패턴으로 권하지 않습니다. 생성기에 AT 방식과 명시적 이전 키 비교 방식을 함께 넣었습니다. 빈 테이블에서는 FIRST/LAST도 실행되지 않습니다.',null,'build-control-break'],
 [25,'Offset — 0부터 시작·길이 생략·경계 검사','반복·타입 심화',
 '날짜와 파일 문자열을 자르기 전에 길이를 검증합니다.',
 '오프셋은 0부터 셉니다. 길이를 생략하면 시작점 이후 남은 부분을 읽는 문맥이지 원래 전체 길이를 추가로 읽는다는 뜻이 아닙니다. 문자열/고정길이/바이트열의 허용 범위와 단위를 구분하세요. 날짜의 월 두 글자를 잘랐다고 달력 유효성이 보장되지는 않습니다.',
 demo(`  DATA lv_text TYPE string VALUE '20261020'.
  DATA: lv_off TYPE i VALUE 4, lv_len TYPE i VALUE 2.
  IF lv_off >= 0 AND lv_len > 0 AND lv_off + lv_len <= strlen( lv_text ).
    DATA(lv_month) = lv_text+lv_off(lv_len).
    WRITE / lv_month. " 10
  ELSE.
    WRITE / '문자열 범위를 벗어났습니다.'.
  ENDIF.`),null],
 [26,'RANGE — BT 양끝 포함·빈 조건·헤더라인 교정','반복·타입 심화',
 'TYPE RANGE OF는 헤더라인이 없는 조건 테이블로 사용합니다.',
 'BT는 LOW 이상 HIGH 이하로 양끝을 포함합니다. TYPE RANGE OF로 선언한 변수에 헤더라인이 자동 생성되는 것은 아닙니다. 각 행은 SIGN/OPTION/LOW/HIGH이며 포함 조건의 합집합에서 제외 조건을 빼는 의미를 이해하세요. 빈 RANGE의 IN 조건은 제한이 없어 전체가 통과할 수 있습니다. 빈 입력이면 전체 조회할지 중단할지 업무 규칙으로 결정합니다.',
 demo(`  DATA lr_count TYPE RANGE OF i.
  lr_count = VALUE #( ( sign = 'I' option = 'BT' low = 10 high = 20 )
                      ( sign = 'E' option = 'EQ' low = 15 ) ).
  DO 3 TIMES.
    DATA(lv_value) = 5 + sy-index * 5.
    IF lv_value IN lr_count.
      WRITE: / lv_value, '포함'. " 10과 20, 15 제외
    ENDIF.
  ENDDO.`),'notion-303a6b8522df805eabd7cdab9557cd0b'],
 [27,'숫자 타입 — 금액·CEIL/FLOOR·반올림 경계','반복·타입 심화',
 '정수, 고정 소수, 이진 부동소수의 용도를 구분합니다.',
 'I는 정수, P는 지정한 소수 자릿수의 숫자, F는 이진 부동소수입니다. 금액은 통화별 소수와 입력/내부 표현까지 함께 설계하세요. CEIL은 입력 이상인 가장 작은 정수, FLOOR는 입력 이하인 가장 큰 정수입니다. 음수에서 TRUNC와 FLOOR가 다릅니다. P를 사용하는 클래식 프로그램은 고정소수점 연산 설정도 확인합니다.',
 demo(`  DATA lv_num TYPE decfloat34 VALUE '-2.7'.
  WRITE: / 'CEIL', ceil( lv_num ),     " -2
         / 'FLOOR', floor( lv_num ),   " -3
         / 'TRUNC', trunc( lv_num ),   " -2
         / 'FRAC', frac( lv_num ).     " -0.7`),null],
 [28,'문자 타입 — C/N 초기값·CONDENSE와 원본 보존','반복·타입 심화',
 'NUMC와 금액 숫자, 공백 정리와 데이터 손실을 구분합니다.',
 'C의 초기값은 공백이고 N의 초기값은 0 문자입니다. N은 정수 연산을 위한 I와 다른 숫자 텍스트입니다. CONDENSE는 앞뒤/연속 공백을 정리하고 NO-GAPS를 쓰면 내부 공백까지 제거합니다. 이름·주소의 내부 공백은 의미가 있으므로 원본 업로드 데이터에 무조건 NO-GAPS를 적용하지 않습니다. D/T의 길이와 실제 날짜·시간 유효성은 별도 검사합니다.',
 demo(`  DATA lv_raw TYPE string VALUE '  SAP   FI  '.
  DATA(lv_text) = lv_raw.
  CONDENSE lv_text.
  WRITE: / lv_raw, / lv_text. " SAP FI
  REPLACE ALL OCCURRENCES OF 'FI' IN lv_text WITH 'ABAP'.
  WRITE / lv_text.`),'notion-2f5a6b8522df8011bf6cc1828bbf1977'],
 [29,'DATA / VALUE BASE — 타입 추론과 기존 행 유지','반복·타입 심화',
 'VALUE로 테이블도 생성할 수 있으며 BASE가 없으면 대입 대상이 교체됩니다.',
 'DATA(변수)는 문맥에서 타입을 추론합니다. 문자 한 글자로 만든 C(1) 변수에 긴 설명을 나중에 넣으면 잘릴 수 있으므로 길이가 달라지는 텍스트는 STRING으로 명시하세요. VALUE의 #는 타입을 추론할 수 있을 때만 사용합니다. 기존 행을 유지하려면 BASE를 쓰거나 APPEND를 사용하세요. 필드 하나 수정에는 직접 대입이 더 읽기 쉽습니다.',
 demo(`  TYPES ty_values TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  DATA(lt_values) = VALUE ty_values( ( 4 ) ( 8 ) ).
  lt_values = VALUE #( BASE lt_values ( 12 ) ).
  LOOP AT lt_values INTO DATA(lv_value).
    WRITE / lv_value. " 4, 8, 12
  ENDLOOP.`),'notion-35ca6b8522df808cbc99c309c1855d28'],
 [30,'COND / SWITCH / NEW — 짧게 쓰되 문맥은 명확하게','반복·타입 심화',
 '분기식, 객체 생성, 문자열 템플릿을 FORM 코드에 필요한 만큼 씁니다.',
 'COND는 조건식 목록, SWITCH는 한 값을 비교합니다. 긴 업무 분기를 중첩식 하나로 압축하기보다 CASE/FORM으로 유지하세요. NEW는 타입에 따라 데이터 객체 또는 클래스 인스턴스를 만듭니다. 문자열 템플릿 |...|와 문자열 연결 &&를 구분합니다. ALPHA는 해당 변환 규칙이 필요한 키에만 적용하고 날짜·WBS 등에 임의 적용하지 않습니다.',
 demo(`  DATA lv_status TYPE c LENGTH 1 VALUE 'E'.
  DATA(lv_text) = SWITCH string( lv_status
    WHEN 'E' THEN '오류' WHEN 'S' THEN '확인' ELSE '대기' ).
  DATA(lv_can_continue) = COND abap_bool(
    WHEN lv_status = 'E' THEN abap_false ELSE abap_true ).
  WRITE / |상태: { lv_text }, 진행 가능: { lv_can_continue }|.`),'notion-35ca6b8522df8063a469f121e48242d2'],
 [31,'NMIN / NMAX — 여러 숫자 비교·빈 목록·날짜 주의','반복·타입 심화',
 '고정 개수의 숫자 비교와 임의 길이 테이블 집계를 구분합니다.',
 'NMIN/NMAX는 숫자 비교 함수입니다. VAL1부터 순서대로 최대 VAL9까지 사용하며 입력 타입에 따른 계산 타입을 확인하세요. 날짜/시간을 숫자로 변환한 결과를 사람이 보는 날짜 문자열과 혼동하지 않습니다. 날짜의 앞뒤 비교에는 타입이 맞는 IF를 쓰는 편이 명확합니다.\n\n아래 코드는 양수·음수·같은 값과 빈 테이블을 함께 시험할 수 있는 독립 예제입니다. 테이블 최대값의 초기값을 0으로 두면 모든 값이 음수인 경우 잘못될 수 있어 첫 행으로 초기화합니다.',
 demo(`  DATA(lv_top) = nmax( val1 = -7 val2 = -2 val3 = -11 ).
  DATA(lv_bottom) = nmin( val1 = 12 val2 = 4 val3 = 9 ).
  WRITE: / lv_top, lv_bottom. " -2, 4
  DATA lt_values TYPE STANDARD TABLE OF i WITH EMPTY KEY.
  DATA: lv_max TYPE i, lv_first TYPE abap_bool VALUE abap_true.
  lt_values = VALUE #( ( -7 ) ( -2 ) ( -11 ) ).
  LOOP AT lt_values INTO DATA(lv_value).
    IF lv_first = abap_true OR lv_value > lv_max.
      lv_max = lv_value.
    ENDIF.
    lv_first = abap_false.
  ENDLOOP.
  IF lv_first = abap_false. WRITE / lv_max. ELSE. WRITE / '빈 목록'. ENDIF.`),null]
];
const specialSources={20:'https://help.sap.com/saphelp_em700_ehp01/helpdata/de/27/1d0088dd4811d3969500a0c930660b/content.htm',22:'https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4e/5d5bd0719b4db0e10000000a42189b/content.htm',23:sf,24:loops,26:'https://help.sap.com/docs/abap-cloud/abap-keyword/ABAPDATA_RANGES.html',27:builtins,31:builtins};
export const blogDocuments=notes.map(([post,title,category,summary,explanation,code,existing])=>{
 const source='https://yulbaper.tistory.com/'+post;
 const body=`## 이번에 보강한 내용\n${summary}\n\n${explanation}\n\n${code?'## 자체 작성 예제\n'+code+'\n\n':''}${existing?'## 연결해서 읽기\n[기존 전체 예제·생성 코드]('+home+'#docs/'+existing+')\n\n':''}## 적용 조건과 출처\n주제 참고 글을 읽고 설명·예제를 새로 작성했습니다. 원문 코드·이미지의 재배포가 아닙니다. 예제는 Standard ABAP / SAP GUI 기준이며 SAP 시스템에서 컴파일·실행하지 않았습니다. ABAP 7.40 SP08 구문 검사를 사용하되 실제 릴리스의 함수·DDIC·화면 인터페이스는 확인해야 합니다.\n\n[율밥퍼 원문](${source})\n\n${specialSources[post]?'[SAP 공식 확인 자료]('+specialSources[post]+')':'[SAP 공식 ABAP 학습 자료]('+keyword+')'}${[13,15,9,10].includes(post)?'\n\nALV 이벤트 세부 시그니처와 처리 순서는 SE24 및 대상 시스템의 BCALV_EDIT_08 등 표준 예제에서 추가 확인하세요.':''}`;
 return {id:'blog-'+post,title,category,summary,body,text:body,source:'학습 문서',track:'ABAP',format:'markdown',recipe:!!code?.includes('REPORT '),url:source,path:'2026-10-19 실무 보강 / '+category,events:[],blogPost:post,search:(title+' '+summary+' '+body).normalize('NFKC').toLowerCase()};
});
export const blogIndexDocument={id:'blog-reading-map',title:'율밥퍼 30개 글 — 추가·보강 내용과 원문 지도',category:'실무 보강 안내',summary:'블로그 전체 30개 주제를 기존 자료와 대조하고 빠진 설명과 자체 예제를 추가했습니다.',source:'학습 문서',track:'ABAP',format:'markdown',recipe:false,path:'2026-10-19 실무 보강',url:home+'#docs/blog-reading-map',events:[]};
blogIndexDocument.body='## 읽기 순서\n급한 업무는 NEWKO ONF4 → Excel 검증 → FI BDC 로그 → AT NEW/END OF 순서로 읽으세요. 새로운 범위는 Smart Forms 5개 주제, Offset, NMIN/NMAX입니다. 기본 ALV·필드심볼·신문법은 기존 자료에 오류 방어와 주의점을 보강했습니다.\n\n카탈로그의 새 분류 또는 아래 문서명으로 검색하세요. 원본 30편은 모두 읽었으며 코드는 새 예제로 작성했습니다. 기존 Notion/GitHub 원문과 캡처는 유지합니다.\n\n'+blogDocuments.map(d=>'- ['+d.title+']('+home+'#docs/'+d.id+') · [원문]('+d.url+')').join('\n')+'\n\n## 완성 코드 생성기\n- [NEWKO ONF4 + 선택·필터]('+home+'#docs/build-alv-newko)\n- [Excel 원본 검증]('+home+'#docs/build-excel-validate)\n- [실제 FI BDC 메시지]('+home+'#docs/build-fi-bdc-log)\n- [AT 구문과 LOOP 전체 FORM]('+home+'#docs/build-control-break)\n\n## 10월 20일 적용 순서\n기존 Notion 할 일을 보강할 때 사용할 내용입니다. 이 사이트 변경 작업에서 Notion 항목을 새로 생성하지 않았습니다.\n- NEWKO 필드의 회사코드/전기키/KOART와 F4 등록 확인\n- 업로드 오류 원본 행과 ST22 예외 확인\n- GT_MESSTAB 전체 변수·반환값·실제 문서 생성 여부 확인\n- 정상/취소/잘못된 값/필터·선택/대량 입력 시험';
blogIndexDocument.text=blogIndexDocument.body;
blogIndexDocument.search=(blogIndexDocument.title+' '+blogIndexDocument.body).normalize('NFKC').toLowerCase();
blogDocuments.unshift(blogIndexDocument);
