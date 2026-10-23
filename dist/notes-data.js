import {additionalNotes} from './notes-extra.js';
const notion = id => `https://app.notion.com/p/${id}`;
const github = 'https://github.com/sherlock0105/ABAP-STUDY';
const source = (name,url) => ({name,url});
const n = (id,category,title,summary,tags,sections,links=[]) => ({id,category,title,summary,tags,sections,links});
const p = (title,text,extra={}) => ({title,text,...extra});
const code = (title,text,value,where) => p(title,text,{code:value,where});
const table = (title,text,headers,rows) => p(title,text,{table:{headers,rows}});
export const workNotes = [
n('fi-document','FI 전표','전표 헤더·항목과 조회 키','BKPF/BSEG를 연결할 때 전표번호 하나만으로 찾으면 안 되는 이유.',['BKPF','BSEG','BUKRS','BELNR','GJAHR','전표키'],[
 p('어떤 데이터를 나누는가','헤더는 전표 전체에 공통인 회사코드·증빙일·전기일·통화 등이다. 항목은 계정과 차대변·금액·거래처·세금·귀속 정보를 가진다. 화면의 gs_header와 gt_item도 이 구분을 따라 구성한다.'),
 table('필드 빠른 찾기','한 클라이언트 안에서 전표는 회사코드+전표번호+회계연도로 식별한다. 항목에는 BUZEI가 추가된다. Open SQL의 클라이언트 처리는 일반적으로 자동이다.',['위치','주요 필드','확인할 의미'],[['헤더 키','BUKRS / BELNR / GJAHR','회사코드 / 전표번호 / 회계연도'],['항목 키','위 헤더 키 + BUZEI','전표 안의 항목 번호'],['날짜','BLDAT / BUDAT','증빙에 적힌 날짜 / 장부에 반영하는 날짜'],['텍스트','BKTXT / XBLNR / SGTXT','헤더 적요 / 참조번호 / 항목 적요'],['금액','WRBTR / DMBTR','전표통화 금액 / 회사코드 현지통화 금액']]),
 code('세 개 키를 함께 전달','기존 화면 변수에 전표 키가 들어 있다는 전제다. FB03의 파라미터 ID는 시스템에서 F1 기술정보로 확인한다.',`" 전제: gs_header에 bukrs / belnr / gjahr 존재
SET PARAMETER ID 'BUK' FIELD gs_header-bukrs.
SET PARAMETER ID 'BLN' FIELD gs_header-belnr.
SET PARAMETER ID 'GJR' FIELD gs_header-gjahr.
CALL TRANSACTION 'FB03' AND SKIP FIRST SCREEN.`, 'PAI 또는 ALV 더블클릭 핸들러 · 세 필드 확정 후'),
 table('지급·세금·귀속 필드','표준 필드의 의미를 확인한 뒤 화면 변수와 연결한다. 필수 여부·입력 가능 여부는 계정·전기키·업무 설정에 따라 달라진다.',['용도','대표 필드','의미'],[['지급조건','BSEG-ZTERM','지급기한·할인 조건'],['지급 기준일','BSEG-ZFBDT','만기 산정의 기준 날짜'],['지급방법 / 보류','BSEG-ZLSCH / ZLSPR','지급 방식 / 지급 차단'],['세금 / 사업장','BSEG-MWSKZ / BUPLA','세금코드 / 사업장'],['원가 귀속','BSEG-KOSTL / AUFNR','코스트센터 / 오더'],['손익 / 사업영역','BSEG-PRCTR / GSBER','손익센터 / 사업영역']]),
 p('조회와 전기는 다르게 접근','조회 예제와 전표 생성은 구분한다. 표준 회계 테이블을 직접 INSERT/MODIFY하지 않고 지정된 표준 트랜잭션·전기 인터페이스를 거친다. S/4HANA에서는 ACDOCA도 함께 이해하되 BSEG의 단순 대체로 간주하지 않는다.')
],[source('Notion · ABAP 실무 노트',notion('2a8a6b8522df807292e6ccd2577cbe76')),source('SAP · 회계 전표 항목', 'https://help.sap.com/docs/BI_CONTENT_707/8283ab99b2f540c18afbe5cbb34501e3/67ad8953b97a3d58e10000000a174cb4.html')]),
n('fi-account','FI 전표','G/L·고객·공급업체와 차대변','계정유형, 계정번호, 전기키가 각각 무엇을 결정하는지.',['KOART','SHKZG','BSCHL','NEWKO','HKONT','KUNNR','LIFNR','채권','채무'],[
 table('계정유형부터 결정','KOART는 어떤 종류의 계정인가를 뜻한다. 화면 라디오버튼 1·2·3과 도메인 값은 같지 않으므로 별도로 매핑한다.',['구분','KOART','저장·조회 필드'],[['G/L','S','BSEG-HKONT'],['고객·채권','D','BSEG-KUNNR'],['공급업체·채무','K','BSEG-LIFNR'],['자산','A','자산번호·보조번호 등 자산 필드']]),
 table('차대변과 전기키','SHKZG의 S/H는 차변/대변이다. BSCHL 전기키는 계정유형·차대변·필드 제어 등에 영향을 준다. 아래 값은 대표적인 표준 예시이며 실제 설정을 확인한다.',['상황','차변 예시','대변 예시'],[['G/L','40','50'],['고객','01','11'],['공급업체','21','31']]),
 p('NEWKO는 입력 화면의 계정 칸','BBSEG-NEWKO 같은 입력 구조는 G/L·고객·공급업체 번호를 받을 수 있다. 실제 전표 결과의 계정 필드와 혼동하지 않는다. FB01 BDC 필드명은 SHDB 녹화 결과로 결정한다.'),
 p('두 줄 분개로 연습','외상 매입을 단순화하면 비용 100 차변 / 공급업체 채무 100 대변이다. 지급하면 공급업체 채무 100 차변 / 예금 100 대변이다. 세금과 통화 조건이 추가되면 항목과 검증도 늘어난다.')
],[source('SAP · 일반 전표 입력','https://help.sap.com/docs/SAP_ERP_SPV/c587d5cadece40a285ce9a6d4a2a4908/0111d153c9684608e10000000a174cb4.html')]),
n('bdc-flow','BDC·업로드','개별전표 → SHDB → 대량전표','한 건을 성공시킨 다음 화면 입력과 엑셀로 확장하는 개발 순서.',['FB01','SHDB','BDC','CALL TRANSACTION','대량전표'],[
 p('1. 수동 입력으로 한 건 성공','테스트 회사코드에서 헤더와 최소 두 항목으로 FB01을 끝까지 입력한다. 계정·전기키·세금·필수 귀속값을 먼저 확인해야 녹화 오류와 업무 오류를 구분할 수 있다.'),
 p('2. 고정값 녹화를 먼저 재현','SHDB로 실제 화면을 녹화하고 프로그램명·화면번호·필드명·OKCODE 순서를 그대로 재현한다. 임의의 화면번호나 다른 시스템의 녹화 결과를 그대로 사용하지 않는다.'),
 p('3. 고정값을 화면 변수로 치환','성공한 녹화의 헤더 값은 gs_header, 항목 값은 gt_item으로 교체한다. 먼저 2개 항목으로 검증하고 항목 추가·스크롤·추가 화면 분기를 늘린다.'),
 p('4. 엑셀은 전표 단위로 호출','업로드 SEQ를 전표 묶음 키로 사용하고 같은 SEQ 안에서 헤더 일치·차대변 합계·필수값을 검증한다. BDCDATA와 메시지 테이블은 전표 한 건이 끝날 때마다 비운다. 행마다 전표를 생성하면 한 전표가 여러 건으로 쪼개진다.'),
 table('점검할 결과','호출 성공 코드 하나로 업무 완료를 판단하지 않는다.',['단계','확인'],[['BDC 실행','호출 직후 sy-subrc와 메시지 전체 확보'],['전표 결과','회사코드 / 전표번호 / 회계연도'],['FB03','입력했던 계정·금액·통화·세금과 실제 결과 비교'],['재실행','이미 성공한 업로드 묶음의 중복 전기 방지']])
],[source('Notion · BDC',notion('3eca6b8522df810a9f09e6e2dc34c275')),source('GitHub · BDC 실습',github+'/tree/master/ZC505_SUB_05/zsapmzc5050007')]),
n('bdc-messages','BDC·업로드','BDC 모드·메시지·성공 판정','A/E/N, 동기 갱신과 메시지 수집을 따로 이해하기.',['CTU_PARAMS','BDCMSGCOLL','DISMODE','UPDMODE','메시지'],[
 table('모드 선택','개발할 때는 화면을 보면서 실패 위치를 찾는다.',['설정','값','의미'],[['DISMODE','A','모든 화면 표시'],['DISMODE','E','오류가 발생한 화면 표시'],['DISMODE','N','화면 표시 없이 처리'],['UPDMODE','S','동기 갱신: 갱신 결과를 기다림']]),
 code('호출 결과를 바로 보관','녹화 데이터 gt_bdcdata와 T-code 변수 gv_tcode가 준비됐다는 전제다. OPTIONS FROM과 MODE/UPDATE를 동시에 중복 지정하지 않는다.',`DATA: ls_option TYPE ctu_params,
      lt_message TYPE STANDARD TABLE OF bdcmsgcoll,
      lv_subrc TYPE sy-subrc.
ls_option = VALUE #( dismode = 'A' updmode = 'S' ).
CALL TRANSACTION gv_tcode USING gt_bdcdata
  OPTIONS FROM ls_option
  MESSAGES INTO lt_message.
lv_subrc = sy-subrc. " 다른 문장이 바꾸기 전에 보관`, 'BDC 실행 FORM · 실제 SHDB 데이터 필요'),
 p('메시지를 모두 남기기','MSGTYP, MSGID, MSGNR, MSGV1~4를 원본과 함께 저장하고 필요하면 MESSAGE_TEXT_BUILD 등으로 표시 문구를 만든다. E/A/X만 보는 것에 더해 해당 트랜잭션의 성공 메시지와 결과 키를 확인한다.'),
 p('COMMIT을 뒤에 붙이면 끝인가?','CALL TRANSACTION 내부에서 이미 커밋한 전표는 외부 ROLLBACK WORK로 취소되지 않는다. 대량 처리에서는 성공한 전표와 실패한 전표를 각각 기록하고 재처리 범위를 결정한다.')
],[source('SAP · CALL TRANSACTION USING','https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCALL_TRANSACTION_USING.html')]),
n('excel-map','BDC·업로드','엑셀 셀 → 구조체 → 전표 묶음','ALSMEX_TABLINE의 ROW·COL·VALUE를 업무 데이터로 바꾸는 위치.',['ALSM_EXCEL_TO_INTERNAL_TABLE','ALSMEX_TABLINE','SEQ','엑셀','동적 매핑'],[
 p('셀 목록과 업무 행은 다르다','ALSM_EXCEL_TO_INTERNAL_TABLE의 결과 한 줄은 셀 하나다. ROW는 엑셀 행, COL은 열, VALUE는 문자열이다. 한 엑셀 행의 셀들을 모아야 gt_multi 한 행이 된다.'),
 code('행이 바뀌는 시점에 한 번만 APPEND','lt_excel, gs_multi, gt_multi는 기존 업로드 프로그램에 선언돼 있다고 가정한다. 마지막 행 APPEND도 빠뜨리지 않는다.',`DATA lv_row TYPE alsmex_tabline-row.
SORT lt_excel BY row col.
CLEAR: lv_row, gs_multi.
LOOP AT lt_excel INTO DATA(ls_excel).
  IF lv_row <> ls_excel-row.
    IF lv_row IS NOT INITIAL.
      APPEND gs_multi TO gt_multi.
    ENDIF.
    CLEAR gs_multi.
    lv_row = ls_excel-row.
  ENDIF.
  CASE ls_excel-col.
    WHEN 1. gs_multi-seq = ls_excel-value.
    " 나머지 열: 실제 양식의 필드로 매핑
  ENDCASE.
ENDLOOP.
IF lv_row IS NOT INITIAL.
  APPEND gs_multi TO gt_multi.
ENDIF.`, 'F01 업로드 FORM · 양식에 맞춰 CASE 및 변환 추가'),
 p('정적·동적 매핑의 선택','고정 양식이면 CASE 열번호가 읽기 쉽다. 양식 변경이 잦을 때만 열번호↔필드명 매핑표와 ASSIGN COMPONENT를 도입한다. 동적 매핑에서도 날짜·금액 검증은 별도다.'),
 p('업로드 방식의 적용 범위','ALSM 방식은 SAP GUI·프런트엔드 Excel 환경 등 제약을 가진다. 백그라운드 또는 서버 처리와 동일하게 간주하지 않는다. 템플릿 버전·헤더명·열 개수를 읽기 전에 검증한다.')
],[source('Notion · 엑셀 업로드 전체 흐름',notion('3eca6b8522df81b2bfb2c98b1221a95c'))]),
n('excel-validation','BDC·업로드','엑셀 검증을 세 단계로 나누기','형식 오류, 마스터 오류, 전표 전체 오류를 구분하면 재처리가 쉽다.',['금액변환','날짜변환','검증','차대변','통화','업로드 오류'],[
 table('입력 검증 순서','오류 위치를 엑셀 행·열과 함께 남긴다.',['단계','검증 예시','처리'],[['형식','빈 필수칸 / 날짜 / 숫자 / 열 개수','변환 전 원문 보존'],['마스터','회사코드 / 계정 / 고객 / 공급업체','회사코드별 사용 가능 여부'],['전표 묶음','동일 SEQ의 헤더 일치 / 차대변 / 통화','한 묶음에 한 결과 상태']]),
 p('금액에서 쉼표만 지우면 되는가?','1,234.56과 1.234,56은 표기 규칙이 다르다. 양식의 소수점·천 단위 규칙을 정해 검증한 뒤 변환한다. 0, 음수, 과도한 소수 자릿수도 업무 기준으로 확인한다.'),
 p('날짜는 구분자와 실제 유효성을 둘 다 확인','2026-10-15를 20261015로 바꾸는 것과 20260230을 거절하는 것은 별도다. 길이·패턴·달력 유효성을 검사하고, 전기기간 사용 가능 여부는 전기 단계에서도 검증한다.'),
 p('성공한 묶음은 재처리 대상에서 제외','검증 오류 행을 표시하는 것과 이미 전기된 전표를 다시 생성하는 것은 다르다. 업로드 원본 식별자+묶음 키, 결과 키, 상태, 오류 메시지를 연결한다. 실패 건을 수정해서 다시 실행할 범위를 명시한다.')
],[source('Notion · 엑셀 템플릿·업로드',notion('3eca6b8522df81b2bfb2c98b1221a95c'))]),
n('alv-rows','ALV·화면','ALV 전체선택·삭제·복사','선택된 행과 체크박스 필드를 섞지 않고 한 가지 방식으로 처리한다.',['get_selected_rows','set_selected_rows','삭제','전체선택','라인복사'],[
 p('선택 방식부터 고정','ALV 행 선택은 get_selected_rows로 읽는다. SEL 같은 체크박스 컬럼은 ITAB 필드이므로 check_changed_data 후 SEL 조건으로 읽는다. 두 방식을 혼용하면 화면 선택과 실제 대상이 달라질 수 있다.'),
 code('행 선택 삭제의 최소 흐름','gcl_grid와 gt_item이 기존에 생성돼 있다는 전제다. 소계 등 데이터가 아닌 행은 제외하고, 뒤에서부터 삭제해 인덱스 이동을 막는다.',`DATA lt_rows TYPE lvc_t_row.
gcl_grid->get_selected_rows(
  IMPORTING et_index_rows = lt_rows ).
DELETE lt_rows WHERE index <= 0.
SORT lt_rows BY index DESCENDING.
LOOP AT lt_rows INTO DATA(ls_row).
  DELETE gt_item INDEX ls_row-index.
ENDLOOP.
gcl_grid->refresh_table_display( ).`, 'F01 삭제 FORM · 화면 선택 방식 사용'),
 p('왜 set_selected_rows를 다시 호출하나?','set_selected_rows는 선택 상태를 화면에 지정하는 메서드다. 전체선택·해제를 구현할 때 호출한다. 삭제 대상 읽기, 값 변경, 복사 같은 모든 처리 끝에 반복해서 호출할 필요는 없다.'),
 p('복사할 때 초기화할 필드','선택 행을 복사하되 새 항목의 영속 키·성공 전표번호·오류 메시지·상태를 그대로 가져가지 않는다. 금액·계정·귀속값 중 어떤 항목을 유지할지는 업무 요구로 정한다. ITAB 삭제와 DB 삭제는 별도 단계다.')
],[source('GitHub · ALV 행 삭제·변경',github+'/blob/master/ZC505_SUB_10/zc505rexam02/zc505rexam02_f01.html')]),
n('alv-edit','ALV·화면','저장했는데 마지막 수정값이 빠질 때','화면 셀 → ITAB → 업무 검증 → 저장 순서로 확인한다.',['CHECK_CHANGED_DATA','DATA_CHANGED','DATA_CHANGED_FINISHED','저장','편집'],[
 code('저장 직전에 화면 값을 동기화','입력 중인 마지막 셀 값도 반영한 뒤 업무 검증을 시작한다. E_VALID는 ALV 입력 검증의 결과이며 업무 전체 성공을 뜻하지 않는다.',`DATA lv_valid TYPE abap_bool.
gcl_grid->check_changed_data(
  IMPORTING e_valid = lv_valid ).
IF lv_valid = abap_false.
  RETURN.
ENDIF.
" 이후: 필수값·차대변·마스터 검증
" 검증 성공 후에만 업무 저장 로직 호출`, 'PAI 저장 분기 또는 save_data FORM 시작'),
 table('두 변경 이벤트의 차이','이벤트를 많이 달기 전에 담당 역할을 나눈다.',['이벤트','주로 할 일'],[['DATA_CHANGED','변경 셀 값 검증 / 프로토콜 오류 등록 / 연관 셀 값 제어'],['DATA_CHANGED_FINISHED','정상 반영된 셀을 바탕으로 변경 표시 / 후속 화면 갱신'],['USER_COMMAND','툴바 버튼의 CREATE·DELETE·SAVE 등을 분기']]),
 p('유효성 메시지만 띄우고 저장하는 실수','오류를 알렸더라도 저장 경로가 계속 실행되면 잘못된 데이터가 저장될 수 있다. 전체 저장인지 정상 행만 저장인지 정책을 정하고, 검증 결과로 저장 진입을 제어한다.')
],[source('Notion · ALV 입력 변경 검증',notion('2e1a6b8522df8023bc1ad84db1548ca0')),source('SAP · ALV 변경 이벤트','https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353523611.html?locale=en-US')]),
n('screen-flow','ALV·화면','TOP·INITIALIZATION·PBO·PAI 위치 찾기','선언과 실행 이벤트, 화면 입출력 처리를 한 흐름으로 연결한다.',['PBO','PAI','OKCODE','INITIALIZATION','START-OF-SELECTION','MODULE'],[
 table('코드를 둘 위치','REPORT에 CALL SCREEN을 사용하는 전통 ABAP 화면을 기준으로 정리했다.',['위치','역할'],[['TOP Include','전역 변수 / 구조체 / 객체 참조 / 이벤트 클래스 선언'],['INITIALIZATION','선택화면 기본값'],['AT SELECTION-SCREEN OUTPUT','선택화면 입력 가능 여부·표시 제어'],['START-OF-SELECTION','조회·초기 업무 처리 후 CALL SCREEN'],['PBO / OUTPUT','Status·Title·최초 ALV 생성'],['PAI / INPUT','사용자 OKCODE에 따른 저장·뒤로·취소']]),
 code('OKCODE는 먼저 복사하고 비운다','커맨드가 다음 화면 처리까지 남지 않게 한다. 예제는 일반 PAI 처리이며 종료 명령의 AT EXIT-COMMAND 설계는 별도로 구성한다.',`MODULE user_command_0200 INPUT.
  DATA lv_ucomm TYPE sy-ucomm.
  lv_ucomm = gv_okcode.
  CLEAR gv_okcode.
  CASE lv_ucomm.
    WHEN 'BACK' OR 'EXIT' OR 'CANC'.
      LEAVE TO SCREEN 0.
    WHEN 'SAVE'.
      PERFORM save_data.
  ENDCASE.
ENDMODULE.`, 'I01 · 0200 화면 Flow Logic에서 MODULE 연결'),
 p('PBO는 한 번만 실행되는가?','사용자 동작 후 화면을 다시 그릴 때마다 실행된다. 객체 생성과 최초 표시를 IS NOT BOUND로 보호하고, 변경 데이터 갱신은 refresh_table_display로 처리한다.')
],[source('Notion · PBO·PAI 흐름',notion('2caa6b8522df80989308ca60e2f19b42'))]),
n('containers','ALV·화면','Custom Container 2개와 Splitter 선택','상단 요약·하단 ALV를 배치하는 방법을 구분한다.',['TOP OF PAGE','Custom Container','Splitter','gcl_top','컨테이너'],[
 table('어떻게 배치할까?','도구 선택은 화면 요구에 맞춘다. 두 방법 모두 가능하지만 생성 방식이 다르다.',['방법','화면 정의','사용할 때'],[['Custom Container 2개','Screen Painter에 서로 다른 Custom Control 이름 2개','상단·하단 영역을 화면에서 직접 배치'],['Splitter','부모 Container 안에 행·열 분할 생성','분할 비율·여러 목록 연동을 코드로 구성'],['Docking Container','화면 가장자리에 붙는 부모 영역','간단한 전체 화면 ALV 등']]),
 p('현재 전표 화면에 적용','상단 헤더 요약용 컨트롤과 하단 Grid 컨트롤을 따로 배치했다면 Splitter를 다시 만들 필요가 없다. 컨트롤 이름, 부모 객체, 생성 여부를 각각 확인한다.'),
 p('TOP-OF-PAGE는 이름만으로 뜨지 않는다','ALV 이벤트·HTML 문서·상단 컨테이너 연결 등 실제 출력 경로가 필요하다. 헤더 입력 필드 영역을 직접 배치하는 경우와 출력 요약 문서를 보여주는 경우도 구분한다.')
],[source('Notion · TOP OF PAGE',notion('3e8a6b8522df810f9018d3a4b5882c59')),source('Notion · Splitter',notion('2efa6b8522df80308f2ece82f7a98319'))]),
n('field-catalog','ALV·화면','필드라벨 자동 적용과 가상 컬럼','DDIC 참조와 ICON·SEL·STYLE 같은 화면 필드를 연결하는 법.',['MAKE_FCAT','LVC_FIELDCATALOG_MERGE','REF_FIELD','REF_TABLE','CFIELDNAME','ICON'],[
 p('라벨을 DDIC에서 가져오려면','FIELDNAME은 출력 ITAB 필드명, REF_TABLE/REF_FIELD는 의미와 형식을 참조할 DDIC 필드다. COLTEXT를 임의로 채우면 자동 라벨 대신 그 텍스트가 사용될 수 있다.'),
 code('출력 필드와 참조 필드가 다를 때','TOTAL_AMT는 출력 ITAB에 있는 필드라는 전제다. CFIELDNAME은 통화 코드가 담긴 출력 필드명이다.',`DATA: gs_fcat TYPE lvc_s_fcat,
      gt_fcat TYPE lvc_t_fcat.
gs_fcat = VALUE #(
  fieldname  = 'TOTAL_AMT'
  ref_table  = 'BSEG'
  ref_field  = 'WRBTR'
  cfieldname = 'WAERS' ).
APPEND gs_fcat TO gt_fcat.`, 'TOP/F01 · 출력 구조에 TOTAL_AMT와 WAERS 필요'),
 p('REUSE와 LVC는 같은 카탈로그인가?','REUSE_ALV 계열에서 주로 쓰는 SLIS 카탈로그와 CL_GUI_ALV_GRID의 LVC 카탈로그를 구분한다. 함수 이름만 바꾸는 것이 아니라 받는 구조·테이블 타입과 호출하는 ALV 방식이 맞아야 한다.'),
 p('MERGE가 못 만드는 필드','DDIC 구조 기반 MERGE 후에도 로컬 구조에만 있는 ICON·SEL은 수동 FCAT가 필요하다. ICON은 아이콘 표시, SEL은 체크박스·편집 속성, STYLE 테이블은 LAYOUT의 STYLEFNAME 연결을 따로 확인한다.'),
 p('통화·수량이 이상하게 보이면','금액은 CFIELDNAME으로 통화 필드, 수량은 QFIELDNAME으로 단위 필드에 연결한다. 표시 자릿수를 고치는 것과 원본 금액을 올바르게 환산하는 것은 다른 문제다.')
],[source('Notion · 필드 매핑',notion('2daa6b8522df803d8f8fc17de4454cab')),source('SAP · Field Catalog','https://help.sap.com/docs/ABAP_PLATFORM_NEW/70396d7dec4c4f19b9ca3b2e47559d12/4ebaa38d251e56a4e10000000a421937.html')]),
n('f4-account','ALV·화면','F4에서 회사코드별 계정 찾기','후보 조회와 선택값의 화면 반영은 서로 다른 단계다.',['F4IF_INT_TABLE_VALUE_REQUEST','SKB1','SKAT','KNB1','LFB1','F4'],[
 table('후보 테이블을 고르는 기준','회계 계정 후보를 전역 마스터 전체에서만 찾으면 회사코드 확장 여부를 놓칠 수 있다.',['대상','후보 기준','이름'],[['G/L','SKB1 + T001의 KTOPL','SKAT: KTOPL + SAKNR + SPRAS'],['고객','KNB1: BUKRS','KNA1: KUNNR'],['공급업체','LFB1: BUKRS','LFA1: LIFNR']]),
 p('후보 조회 순서','계정유형 → 회사코드별 후보 → 설명값 조인 → 정렬 → F4 함수 호출 → 선택값 반영 순서로 만든다. 설명 테이블은 언어 키를 포함하고 이름이 없는 후보도 보여줄지 결정한다.'),
 p('필드가 다르면 선택값이 안 들어간다','RETFIELD는 후보 구조의 컬럼명, DYNPROFIELD는 화면 필드명이다. Dynpro 프로그램·화면번호와 VALUE_ORG를 함께 확인한다. F4에서 선택했다고 후속 업무 검증까지 완료된 것은 아니다.')
],[source('Notion · F4 검색 도움말',notion('2e7a6b8522df801ba244c8b17b057e67'))]),
n('fm-class','설계·운영','FORM·Function Module·Class 언제 나눌까?','전표 생성 코드를 분리할 때 파일 크기보다 책임과 재사용 범위를 본다.',['PERFORM','FORM','Function Module','Class','전역','로컬','전표생성'],[
 table('선택 기준','신문법을 쓴다고 모든 코드를 클래스로 바꿔야 하는 것은 아니다.',['방식','알맞은 범위','주의점'],[['FORM/PERFORM','한 리포트 안의 조회·검증·화면 처리','전역 변수 의존을 줄이고 인자를 명확히'],['Local Class','한 프로그램 안의 이벤트·상태·역할 분리','인스턴스와 정적 메서드 구분'],['Function Module','여러 프로그램에서 공유하는 함수 인터페이스','DDIC 인자 타입과 Function Group 전역 상태'],['Global Class','공유 업무 서비스·검증·전표 생성 책임','화면 객체를 업무 로직에 넘기지 않기']]),
 table('호출자와 함수의 인자 방향','이름이 반대로 보여 헷갈릴 때는 어느 쪽에서 보는지 확인한다.',['호출 프로그램','함수 인터페이스','의미'],[['EXPORTING','IMPORTING','호출자가 값을 보내고 함수가 받음'],['IMPORTING','EXPORTING','함수가 결과를 보내고 호출자가 받음'],['CHANGING','CHANGING','입력과 출력에 함께 사용'],['TABLES','TABLES','전통적인 테이블 인자; 정확한 행 타입 확인']]),
 p('전표 생성만 꺼낸다면','입력은 헤더+항목, 출력은 성공 여부+회사코드/전표번호/회계연도+메시지 목록으로 정한다. ALV 색상 변경·팝업·전역 OKCODE 처리는 호출 프로그램에 둔다.'),
 p('작게 옮기는 순서','먼저 기존 FORM의 입력·출력을 분명히 하고 한 건 테스트를 고정한다. 공유가 실제로 필요할 때 FM 또는 전역 클래스로 옮긴다. 전기와 COMMIT의 책임은 인터페이스 설명에 적는다.')
],[source('Notion · Function Module을 Class로',notion('2d9a6b8522df80e5a513fe65f2fbdea0'))]),
n('conflict-type','오류 해결','CALL_FUNCTION_CONFLICT_TYPE','필드 이름이 같아도 함수가 요구하는 실제 타입이 다를 수 있다.',['덤프','ST22','CALL_FUNCTION_CONFLICT_TYPE','테이블타입','DDIC'],[
 p('오류 메시지가 뜻하는 것','함수 호출 경계에서 실제 전달한 인자와 인터페이스가 기대하는 타입이 호환되지 않는다는 뜻이다. 정확한 원인은 ST22의 오류 인자명과 형식/실제 타입을 보고 판단한다.'),
 table('확인 순서','선언부터 바꾸지 말고 어디서 다르게 전달됐는지 좁힌다.',['순서','확인'],[['1 · ST22','호출 위치 / 오류 인자 / 기대 타입 / 전달 타입'],['2 · SE37','IMPORTING·EXPORTING·CHANGING·TABLES와 참조 타입'],['3 · SE11','구조체 필드 순서·타입·길이 및 Table Type의 행 타입·키'],['4 · 호출부','실제로 전달한 변수의 선언과 값'],['5 · 활성화','구조·Table Type·FM·호출 프로그램의 일관된 활성화']]),
 p('안전한 수정 방향','함수 인터페이스가 정한 DDIC Table Type으로 임시 테이블을 선언하고, 화면 전용 ICON·STYLE·MESSAGE 필드를 제외해 명시적으로 매핑한다. 이름만 같다는 이유로 로컬 구조가 동일하다고 판단하지 않는다.'),
 p('피할 처리','타입 덤프를 없애려고 임의로 TYPE ANY로 바꾸거나 화면 구조를 업무 인터페이스로 통째로 넘기지 않는다. 오늘 오류의 특정 원인은 실제 ST22·함수 정의를 확인해야 확정할 수 있다.')
],[source('SAP · CALL FUNCTION과 런타임 오류','https://help.sap.com/docs/abap-cloud/abap-keyword/call-function-func')]),
n('sql-loop','설계·운영','LOOP 안 SELECT SINGLE 줄이기','DB 조회와 ITAB 매핑을 나눠 반복 왕복을 줄인다.',['SELECT SINGLE','FOR ALL ENTRIES','JOIN @ITAB','HASHED','SORTED','성능'],[
 p('기본 순서','필요 키를 모은다 → 중복 키를 제거한다 → JOIN 또는 일괄 조회한다 → 조회한 ITAB을 키로 찾으며 원본을 채운다. 설명값·계정명·회사명처럼 반복 사용되는 값이 좋은 대상이다.'),
 p('어떤 JOIN을 쓸까?','모두 DB 테이블이면 DB JOIN부터 검토한다. 이미 가진 키 목록과 DB를 연결해야 하면 지원 버전의 JOIN @itab을 검토한다. 업무 규칙이 FAE를 제한한다면 그 규칙에 맞는 조회 구조로 설계한다.'),
 p('키를 먼저 확인','SKAT 설명은 계정번호만이 아니라 계정과목표·언어를 함께 맞춘다. 헤더/항목은 전표번호만이 아니라 회사코드·회계연도를 함께 연결한다. JOIN으로 행이 늘어나는 이유부터 확인한다.'),
 p('정렬과 검색의 관계','STANDARD TABLE에 SORT를 했다고 테이블 표현식이 자동 이진 검색되는 것은 아니다. 기존 BINARY SEARCH는 정렬 조건이 전제이며, 반복 키 조회에는 적절한 SORTED/HASHED 키를 검토한다.')
],[source('구문법 ↔ 신문법 · JOIN @itab','#syntax/itab-join'),source('GitHub · 신문법 수업',github+'/blob/master/ZC505_SUB_10/zc505rlect13/zc505rlect13.html')]),
n('currency','FI 전표','환율·통화·금액 자릿수','TCURR의 숫자 하나를 그대로 곱하면 안 되는 이유.',['TCURR','TCURF','TCURX','KURSF','WRBTR','DMBTR','환율'],[
 table('확인할 대상','환율은 날짜·환율유형·통화쌍·환산비율과 함께 해석한다.',['대상','용도'],[['TCURR','환율 데이터'],['TCURF','통화 환산비율'],['TCURX','통화별 소수 자릿수의 예외 설정'],['BKPF-KURSF','전표에 사용한 환율'],['WRBTR / DMBTR','전표통화 금액 / 현지통화 금액']]),
 p('조회 기준을 정한다','어떤 날짜, 어떤 환율유형, 어떤 통화에서 어떤 통화로 바꾸는지 먼저 정한다. 직접/간접 표시와 환산비율 때문에 TCURR-UKURS만 읽어 곱하는 코드는 오해를 만들 수 있다.'),
 p('표준 환산 경로를 사용한다','시스템에서 허용하는 표준 환율·금액 환산 함수 또는 공개 API를 확인한다. SE37에서 READ_EXCHANGE_RATE 등의 인터페이스를 확인하고 실패·미등록 환율을 처리한다.'),
 p('ALV 표시와 값 변환은 구분','CFIELDNAME을 WAERS에 연결하는 것은 표시 형식의 기준이다. 이미 잘못 계산된 금액 자체를 고쳐주지는 않는다. 업로드 원문·내부 값·표시 값의 단위를 함께 비교한다.')
],[source('SAP · 환율 조회','https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e4375c1cad104b2eb7d027369bd76638/0d23e8f7433011db2b24000f20dac9ef.html')]),
n('draft','설계·운영','최근 한 건 임시저장 설계','RAP Draft, 표준 임시전표, 자체 입력 초안을 구분한다.',['임시저장','Draft','CBO','최근 한건','임시전표'],[
 table('서로 다른 세 가지','화면 입력값을 나중에 이어 쓰려는 목적부터 명확히 한다.',['종류','저장·관리 주체','핵심'],[['자체 입력 초안','내 프로그램의 CBO Header/Item','아직 표준 전표가 아님'],['표준 임시전표','SAP 표준 FI 프로세스','표준 권한·상태·전기 흐름에 따름'],['RAP Draft','RAP 런타임과 Draft BO','활성 데이터와 초안 수명주기 관리']]),
 p('한 사람의 최근 한 건이라면','사용자+회사코드+업무 종류를 초안 소유 범위로 정한다. 초안 ID로 Header/Item을 연결하고 저장 시각·양식 버전·상태를 저장한다. 기존 최근 초안을 덮어쓸지 새 버전을 남길지 결정한다.'),
 p('저장과 복원에 필요한 값','계정·금액·날짜 등 입력값을 저장한다. 컨테이너 참조·STYLE 테이블 같은 UI 실행 객체는 저장하지 않고 복원 시 다시 만든다. 조회는 정한 소유 범위 안에서 저장 시각 역순으로 한 건을 고른다.'),
 p('정식 전기 후 처리','정식 전기에 성공한 결과 키를 기록한 뒤 초안을 완료로 바꾸거나 제거한다. 전기 성공과 초안 정리 실패를 구분하고 중복 전기 방지 규칙을 둔다. 사용자 잠금과 초안 보존 기간도 정한다.')
],[source('Notion · ABAP 실무 노트',notion('2a8a6b8522df807292e6ccd2577cbe76'))]),
n('commit-lock','설계·운영','검증·잠금·COMMIT의 책임','저장 로직을 분리해도 트랜잭션 경계는 한눈에 보이게 만든다.',['COMMIT WORK','ROLLBACK WORK','ENQUEUE','DEQUEUE','SM12','LUW'],[
 p('먼저 검증하고, 잠금 후 다시 확인','동시에 같은 대상을 바꾸는 경우 Lock Object를 사용한다. 잠금을 잡은 후 상태와 데이터를 다시 확인한 뒤 저장한다. 잠금 실패를 무시한 채 다음 단계로 넘어가지 않는다.'),
 table('책임을 정해놓기','한 업무 저장의 경계와 표준 호출 내부의 커밋을 구분한다.',['처리','기억할 점'],[['검증','표시 메시지와 저장 가능 여부를 분리'],['CBO 저장','성공 여부와 변경 건수·예외를 함께 처리'],['COMMIT WORK','SAP LUW 종료와 등록된 갱신 처리'],['AND WAIT','동기 갱신의 완료를 기다림'],['ROLLBACK WORK','현재 범위의 미확정 변경 취소; 이미 커밋한 전표는 되돌리지 못함'],['잠금 해제','Lock Object의 _SCOPE·업무 흐름에 맞게 설계']]),
 p('하위 함수마다 COMMIT을 넣지 않는다','호출자가 묶어 저장해야 하는 업무에서 하위 함수가 먼저 COMMIT하면 전체 실패 시 원복하기 어렵다. 반대로 표준 호출이 자체 커밋하는지도 확인해야 한다.'),
 p('sy-subrc만 보면 충분한가?','바로 직전 명령의 결과인지 확인한다. DB 변경은 명령별 sy-subrc·sy-dbcnt·예외 의미를 확인하고, 전표 생성은 업무 메시지와 결과 키까지 확인한다.')
],[source('Notion · 트랜잭션·COMMIT',notion('2dca6b8522df80169c8bfa23f01d8d15')),source('SAP · COMMIT WORK','https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcommit.htm')]),
n('itab-choice','설계·운영','READ·line_exists·OPTIONAL 선택표','존재 여부, 값 조회, 원본 수정을 구분해서 고른다.',['READ TABLE','OPTIONAL','LINE_EXISTS','ASSIGNING','sy-subrc'],[
 table('목적에 따라 한 번만 찾기','무조건 신문법으로 치환하기보다 실패했을 때의 동작을 먼저 정한다.',['목적','선택','행이 없으면'],[['있는지만 확인','line_exists( itab[ ... ] )','false'],['행과 성공 여부를 구분','READ TABLE ... INTO ...','sy-subrc 확인'],['행 없음 = 초기값으로 처리','VALUE #( itab[ ... ] OPTIONAL )','초기값'],['반드시 있어야 하는 행 읽기','itab[ ... ] + 필요한 예외 처리','CX_SY_ITAB_LINE_NOT_FOUND'],['원본 행 수정','READ TABLE ... ASSIGNING','sy-subrc 확인']]),
 p('흔한 실수','line_exists를 실행한 뒤 sy-subrc를 검사하지 않는다. OPTIONAL의 INITIAL 결과를 무조건 미조회라고 판단하지 않는다. 값을 읽을 목적인데 존재 확인과 조회로 같은 테이블을 두 번 검색하지 않는다.'),
 p('형태를 직접 비교하기','구문법 ↔ 신문법 메뉴에는 각 방식의 준비 코드, 이전 코드, 바꾼 코드와 예외 처리가 나란히 있다. 실무 노트에서 목적을 고른 다음 비교 메뉴에서 코드를 확인하면 된다.')
],[source('구문법 ↔ 신문법 · READ','#syntax/read'),source('Notion · LINE_EXISTS',notion('354a6b8522df8029b934f100ea3ceb53'))]),
n('tmg','설계·운영','VIEW_MAINTENANCE_CALL은 무엇인가?','SM30에서 쓰는 유지보수 화면을 프로그램에서 호출한다.',['VIEW_MAINTENANCE_CALL','SM30','SE11','TMG','Maintenance View'],[
 p('먼저 필요한 객체','대상 테이블 또는 Maintenance View와 생성된 Table Maintenance Generator(TMG)가 필요하다. 함수만 호출한다고 새 유지보수 화면이 만들어지지는 않는다.'),
 code('표시 모드 호출 예시','ZMY_CONFIG는 예시 이름이며 실제 생성된 유지보수 객체명으로 바꿔야 한다. 전표 입력 프로그램을 TMG로 대체하는 예제가 아니다.',`CALL FUNCTION 'VIEW_MAINTENANCE_CALL'
  EXPORTING
    action    = 'S'           " 표시 모드
    view_name = 'ZMY_CONFIG'  " 실제 유지보수 객체명
  EXCEPTIONS
    OTHERS = 1.
IF sy-subrc <> 0.
  " 권한·유지보수 객체·생성 상태 확인
ENDIF.`, '호출 프로그램 · SE11/SE54에서 TMG 사전 생성'),
 p('표시와 수정 권한','S는 표시, U는 유지보수 모드다. 수정 권한·클라이언트 설정·전송 기록 방식과 테이블 성격을 확인한다. 업무 검증이 복잡한 전표 화면은 별도 업무 프로그램으로 설계한다.')
],[source('Notion · ABAP 실무 노트',notion('2a8a6b8522df807292e6ccd2577cbe76'))]),
n('rap-path','RAP·연계','CDS·Gateway·RAP의 역할 정리','조회 모델, 서비스 노출, 트랜잭션 처리가 어느 층에 있는지.',['CDS','OData','Gateway','RAP','RV','PV','Behavior','Fiori'],[
 table('내가 만드는 객체의 역할','화면에서 보인다고 저장 동작이 자동으로 생기는 것은 아니다.',['역할','기존 Gateway','RAP 중심 흐름'],[['데이터 조회','DPC_EXT GET_ENTITYSET 등','CDS View Entity·Projection'],['변경 처리','CREATE/UPDATE/DELETE 메서드 구현','Behavior Definition·Implementation'],['노출','서비스 등록·활성화','Service Definition·Binding'],['소비 화면','UI5 앱 등','Fiori Elements·UI5 등']]),
 p('RAP 객체 생성 순서','테이블 → Root View Entity → Behavior → Projection → Projection Behavior → Metadata → Service Definition → Service Binding 순서로 의존성을 확인한다. Managed/Unmanaged·Draft 여부에 따라 필요한 구현이 달라진다.'),
 p('입력값 검증은 어디에 둘까?','화면 검증만으로 업무 정합성을 맡기지 않는다. BO의 검증·권한·잠금과 저장 동작을 함께 설계한다. CDS의 readonly·필수 표시와 실제 저장 시 검증 책임도 구분한다.'),
 p('기존 프로그램과 연결해 생각하기','리포트의 GET_DATA 역할은 조회 모델, 저장 FORM의 업무 검증은 BO 동작, 화면에 내보내는 필드 선택은 Projection과 연결해서 이해할 수 있다. 문법이나 트랜잭션 방식까지 동일하다는 뜻은 아니다.')
],[source('SAP · RAP 구조','https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-concept-and-architecture-of-rap')]),
n('debug-order','오류 해결','덤프·조회 누락·화면 미갱신 진단 순서','어디까지 맞고 어디서 틀어졌는지 한 단계씩 좁힌다.',['ST22','디버깅','BREAK-POINT','sy-subrc','ALV 오류','조회 안됨'],[
 table('증상별 첫 확인','같은 오류처럼 보여도 고칠 층이 다르다.',['증상','먼저 볼 것'],[['덤프','ST22: 오류명·소스 위치·인자 타입'],['조회 0건','선택조건 실제 값·회사코드·회계연도·권한·키'],['JOIN 결과 증가','조인 키 누락·설명 언어·중복 키'],['ITAB은 맞고 화면은 이전 값','바인딩한 ITAB·refresh 호출·최초 표시 재호출 여부'],['수정값이 저장 안 됨','check_changed_data와 이벤트 검증'],['BDC 실패','A 모드 화면 위치·실제 필드값·메시지 전체']]),
 p('브레이크포인트를 둘 위치','입력값 확정 직후, SELECT 직후, 매핑 직후, 저장 또는 BDC 호출 직전·직후를 차례대로 본다. 현재 행의 키·조건·메시지를 함께 기록한다.'),
 p('나중에 다시 찾을 기록','증상 → 재현 입력 → 오류 위치 → 원인 → 바꾼 코드 → 검증 결과 순서로 짧게 남긴다. 오류 메시지 하나만 저장하면 같은 문제를 다음에도 처음부터 추적하게 된다.')
],[source('Notion · 디버깅',notion('2b5a6b8522df80198358f3ccee2e9894'))]),
n('mm-fi','FI 전표','구매·입고·송장과 FI 연결','업무 문서 번호와 회계 문서 번호를 한 필드에 섞지 않는다.',['EKKO','EKPO','MIGO','MIRO','GR/IR','EBELN','EBELP','MM FI'],[
 table('업무 흐름과 문서','표준 평가 입고의 전형적인 예시다. 비평가 입고·서비스·설정에 따라 회계 발생은 달라진다.',['단계','업무 문서','대표 회계 의미'],[['구매발주','PO: EBELN / EBELP','발주 자체는 보통 FI 전표를 만들지 않음'],['평가 입고','자재문서','재고 차변 / GR·IR 대변'],['송장검증','송장문서','GR·IR 차변 / 공급업체 채무 대변; 세금 등 추가'],['지급','지급·반제 전표','공급업체 채무 차변 / 예금 대변']]),
 p('CBO에서 저장할 참조','원본 PO 항목과 입고·송장·회계 결과를 구분한다. FI 문서 키는 회사코드+전표번호+회계연도, PO는 발주번호+항목번호다. 같은 BELNR 이름도 업무 문서 종류를 구분해 의미를 명시한다.'),
 p('문서 추적은 결과에서 원본으로도','회계 전표가 맞지 않으면 계정·세금코드·참조 원본을 확인하고 입고·송장·청구 조건으로 거슬러 올라간다. 서로 다른 모듈의 참조 번호를 일률적인 한 키로 조인하지 않는다.')
],[source('Notion · MM 업무 흐름',notion('31ba6b8522df80ae9e50e171fd8fd52c'))]),
n('agent-log','RAP·연계','학습 로그와 AI Agent Tool Calling','검색·읽기·저장 도구가 실제로 이어지는 과정을 이해한다.',['AI Agent','tool calling','Python','학습로그','search_logs','read_log','save_log'],[
 table('최소 도구 세 개','이 페이지는 설계 학습 자료다. 현재 사이트에 외부 AI 모델이 연결돼 있는 것은 아니다.',['도구','입력','결과'],[['search_logs','검색어·태그','관련 기록 ID·제목·요약'],['read_log','기록 ID','원문·날짜·태그·연결 기록'],['save_log','제목·내용·태그','저장 ID와 상태']]),
 p('한 번의 질문이 처리되는 흐름','사용자 질문 → 모델이 search_logs 호출 요청 → Python 코드가 실제 검색 → 검색 결과를 모델에 반환 → 필요한 read_log 실행 → 원문을 근거로 답변한다. 모델이 도구 이름을 말하는 것과 실제 함수 실행은 다르다.'),
 p('처음부터 DB가 필요한가?','개인 학습 실험은 Markdown 파일+제목/태그 검색으로 시작할 수 있다. 기록 수·필터·동시 접근 요구가 늘면 SQLite 등을 검토한다. 검색 도구의 결과에는 원문 위치를 남겨 답변을 확인할 수 있게 한다.'),
 p('저장 도구의 입력을 검증','파일 경로는 서버가 관리하고 허용된 저장 범위만 사용한다. 사용자의 질문과 검색된 문서를 구분해, 문서 속 지시문이 도구 실행 권한이 되지 않게 한다. 이 사이트의 저장 글·최근 본 글은 브라우저 안에서만 관리된다.')
],[source('내 ABAP 실무 자료',notion('2a8a6b8522df807292e6ccd2577cbe76'))])
];

export const workPaths = [
 {title:'전표 한 건부터 성공시키기',description:'헤더·계정 이해 → 수동 전기 → SHDB → 메시지 확인',ids:['fi-document','fi-account','bdc-flow','bdc-messages']},
 {title:'엑셀 대량 처리로 확장하기',description:'셀 매핑 → 형식·마스터 검증 → 전표 묶음 처리',ids:['excel-map','excel-validation','bdc-flow']},
 {title:'ALV 화면과 저장 다듬기',description:'PBO·PAI → 영역 배치 → 편집값 → 행 처리',ids:['screen-flow','containers','alv-edit','alv-rows']},
 {title:'오류를 줄이는 업무 설계',description:'타입 경계 → 역할 분리 → 잠금·저장 → 진단',ids:['conflict-type','fm-class','commit-lock','debug-order']}
];

workNotes.push(...additionalNotes);

// Canonical source links verified against the user's Notion on 2026-10-18.
const originalLinks=[
 ['screen-flow','3eea6b8522df81c486b4e6c3346e9052','TOP 선언·GS/GT·RANGE'],
 ['screen-flow','3eea6b8522df815b96d4e144b8cbe770','SET_LAYOUT·FCAT 위치'],
 ['screen-flow','3eea6b8522df81bface3c94094dc4e62','S01·PARAMETERS·SELECT-OPTIONS'],
 ['screen-flow','3eea6b8522df811da77fdfc7e9841556','INITIALIZATION 기본값'],
 ['screen-flow','3eea6b8522df81f8af4cde32c7405c89','조회조건 OUTPUT·필드 제어'],
 ['screen-flow','3eea6b8522df817baea9f75a1eeca585','CALL SCREEN·PBO·PAI 연결'],
 ['field-catalog','3eea6b8522df815b96d4e144b8cbe770','Layout·FCAT 선언부터 표시까지'],
 ['alv-edit','3eea6b8522df81c48148fdec82a694e7','조회조건·PAI·저장 검증'],
 ['excel-validation','3eea6b8522df81c48148fdec82a694e7','유효성 검사 원문'],
 ['debug-order','3eea6b8522df812b91a8fad71f7f4800','화면 없는 배치·SM36·SM37'],
 ['fm-class','3eea6b8522df812cafcbc601ae96e7a4','6개 프로그램·Include·FORM 지도'],
 ['bdc-flow','3f1a6b8522df813c951bd906497f3873','BDC 전표 입력 전체 프로그램'],
 ['rap-path','3aba6b8522df8067bc1fd95c92749e85','RAP 객체 구축 지도'],
 ['rap-path','3dda6b8522df80199896e13be8201d76','RAP 전체 프로젝트 코드']
];
for(const [note,id,name] of originalLinks){const n=workNotes.find(n=>n.id===note);if(n)n.links.push({name,url:'#docs/notion-'+id});}
