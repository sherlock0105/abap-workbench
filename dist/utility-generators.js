export const utilityKinds=[['selection-dynamic','Selection-screen · 동적 표시·필수값'],['sql-aggregate','Open SQL · GROUP BY / HAVING'],['sql-fae','Open SQL · FOR ALL ENTRIES'],['salv','SALV · 전체 화면 조회'],['itab-read','내부테이블 · HASHED 키 조회'],['itab-sort','내부테이블 · 정렬·중복 제거'],['message-log','BAPI RETURN · 메시지 집계'],['number-range','채번 · NUMBER_GET_NEXT']];
export function utilityExample(kind,o){switch(kind){
case 'selection-dynamic':return ['PA_USE 선택 후 USER-COMMAND로 화면을 다시 표시합니다. MODIF ID로 활성화하고 실행 시 조건부 필수값을 검사합니다. 숨겨진 필드의 필수검사를 피하려고 SCREEN-REQUIRED 대신 검증 이벤트를 사용합니다.',
`PARAMETERS pa_use AS CHECKBOX USER-COMMAND mode.\nPARAMETERS pa_bukrs TYPE t001-bukrs MODIF ID buk.`,
`AT SELECTION-SCREEN OUTPUT.\n  PERFORM modify_screen.\nAT SELECTION-SCREEN.\n  IF sy-ucomm = 'ONLI' AND pa_use = 'X' AND pa_bukrs IS INITIAL.\n    MESSAGE '회사코드를 입력하세요.' TYPE 'E'.\n  ENDIF.\nSTART-OF-SELECTION.\n  WRITE: / pa_use, pa_bukrs.`,
`FORM modify_screen.\n  LOOP AT SCREEN.\n    IF screen-group1 = 'BUK'.\n      IF pa_use = 'X'. screen-active = 1. ELSE. screen-active = 0. ENDIF.\n      MODIFY SCREEN.\n    ENDIF.\n  ENDLOOP.\nENDFORM.`];
case 'sql-aggregate':return ['T001의 회사코드 건수를 계정과목표별로 집계합니다. HAVING은 집계 후 필터입니다. 금액 합계 예제가 아닙니다.',
`TYPES: BEGIN OF ty_count, ktopl TYPE t001-ktopl, count TYPE i, END OF ty_count.\nDATA: gt_count TYPE STANDARD TABLE OF ty_count, gs_count TYPE ty_count.\nPARAMETERS pa_min TYPE i DEFAULT 1.`,
`AT SELECTION-SCREEN.\n  IF pa_min < 1. MESSAGE '최소 건수는 1 이상입니다.' TYPE 'E'. ENDIF.\nSTART-OF-SELECTION.\n  PERFORM count_companies.\n  LOOP AT gt_count INTO gs_count.\n    WRITE: / gs_count-ktopl, gs_count-count.\n  ENDLOOP.`,
`FORM count_companies.\n  SELECT ktopl, COUNT( * ) AS count FROM t001\n    GROUP BY ktopl HAVING COUNT( * ) >= @pa_min\n    ORDER BY ktopl INTO TABLE @gt_count.\nENDFORM.`];
case 'sql-fae':return ['FAE 드라이버가 비면 전체 조회가 될 수 있어 반드시 검사합니다. 드라이버 키를 중복 제거합니다. FAE 결과는 중복 제거된 집합입니다.',
`DATA: gt_company TYPE STANDARD TABLE OF t001,\n      gt_text TYPE STANDARD TABLE OF t004t, gs_text TYPE t004t.\nPARAMETERS pa_bukrs TYPE t001-bukrs OBLIGATORY.`,
`START-OF-SELECTION.\n  PERFORM get_texts.\n  LOOP AT gt_text INTO gs_text. WRITE: / gs_text-ktopl, gs_text-ktplt. ENDLOOP.`,
`FORM get_texts.\n  SELECT * FROM t001 INTO TABLE @gt_company WHERE bukrs = @pa_bukrs.\n  CLEAR gt_text.\n  IF gt_company IS INITIAL. RETURN. ENDIF.\n  SORT gt_company BY ktopl.\n  DELETE ADJACENT DUPLICATES FROM gt_company COMPARING ktopl.\n  SELECT * FROM t004t INTO TABLE @gt_text\n    FOR ALL ENTRIES IN @gt_company\n    WHERE ktopl = @gt_company-ktopl AND spras = @sy-langu.\nENDFORM.`];
case 'salv':return ['별도 화면·컨테이너 없는 조회 전용 전체 화면 SALV입니다. DDIC 테이블을 확인하세요. 편집은 ALV Grid 예제를 사용하세요.',
`DATA: gt_data TYPE STANDARD TABLE OF ${o.table.toLowerCase()},\n gcl_salv TYPE REF TO cl_salv_table, gcl_error TYPE REF TO cx_salv_msg.`,
`START-OF-SELECTION.\n  PERFORM show_salv.`,
`FORM show_salv.\n  SELECT * FROM ${o.table.toLowerCase()} ORDER BY PRIMARY KEY INTO TABLE @gt_data UP TO 500 ROWS.\n  IF gt_data IS INITIAL. MESSAGE '데이터가 없습니다.' TYPE 'I'. RETURN. ENDIF.\n  TRY.\n      cl_salv_table=>factory( IMPORTING r_salv_table = gcl_salv CHANGING t_table = gt_data ).\n      gcl_salv->get_functions( )->set_all( abap_true ).\n      gcl_salv->get_columns( )->set_optimize( abap_true ).\n      gcl_salv->display( ).\n    CATCH cx_salv_msg INTO gcl_error.\n      MESSAGE gcl_error->get_text( ) TYPE 'I'.\n  ENDTRY.\nENDFORM.`];
case 'itab-read':return ['HASHED TABLE은 전체 고유키로 조회합니다. READ 실패 시 이전 Work Area를 사용하지 않도록 즉시 SY-SUBRC를 확인합니다.',
`TYPES: BEGIN OF ty_row, id TYPE i, name TYPE string, END OF ty_row.\nDATA: gt_data TYPE HASHED TABLE OF ty_row WITH UNIQUE KEY id, gs_data TYPE ty_row.`,
`START-OF-SELECTION.\n  PERFORM lookup_row.`,
`FORM lookup_row.\n  gs_data-id = 1. gs_data-name = '예제'. INSERT gs_data INTO TABLE gt_data.\n  CLEAR gs_data.\n  READ TABLE gt_data INTO gs_data WITH TABLE KEY id = 1.\n  IF sy-subrc <> 0. MESSAGE '행이 없습니다.' TYPE 'I'. RETURN. ENDIF.\n  WRITE / gs_data-name.\nENDFORM.`];
case 'itab-sort':return ['원본 순서를 유지하려면 복사본을 정렬합니다. 비교키가 인접해야 DELETE ADJACENT DUPLICATES가 중복을 제거합니다. STABLE로 같은 키의 첫 원본 행을 남깁니다.',
`TYPES: BEGIN OF ty_row, id TYPE i, text TYPE string, END OF ty_row.\nDATA: gt_data TYPE STANDARD TABLE OF ty_row, gt_unique TYPE STANDARD TABLE OF ty_row, gs_data TYPE ty_row.`,
`START-OF-SELECTION.\n  PERFORM make_unique.`,
`FORM make_unique.\n  gs_data-id = 1. gs_data-text = 'A'. APPEND gs_data TO gt_data.\n  gs_data-text = 'B'. APPEND gs_data TO gt_data.\n  gt_unique = gt_data.\n  SORT gt_unique STABLE BY id.\n  DELETE ADJACENT DUPLICATES FROM gt_unique COMPARING id.\n  LOOP AT gt_unique INTO gs_data. WRITE: / gs_data-id, gs_data-text. ENDLOOP.\nENDFORM.`];
case 'message-log':return ['BAPIRET2 전체를 보관하고 A/E/X가 하나라도 있으면 실패입니다. 성공 메시지만 찾거나 마지막 메시지만 검사하지 않습니다.',
`DATA: gt_return TYPE STANDARD TABLE OF bapiret2, gs_return TYPE bapiret2, gv_error TYPE abap_bool.`,
`START-OF-SELECTION.\n  gs_return-type = 'E'. gs_return-message = '검증 오류 예시'.\n  APPEND gs_return TO gt_return.\n  PERFORM collect_messages CHANGING gv_error.\n  IF gv_error = abap_true. RETURN. ENDIF.\n  WRITE / '후속 처리 가능'.`,
`FORM collect_messages CHANGING pv_error TYPE abap_bool.\n  CLEAR pv_error.\n  LOOP AT gt_return INTO gs_return.\n    WRITE: / gs_return-type, gs_return-id, gs_return-number, gs_return-message.\n    IF gs_return-type CA 'AEX'. pv_error = abap_true. ENDIF.\n  ENDLOOP.\nENDFORM.`];
case 'number-range':return ['SNRO에서 ZWB_DEMO 번호범위 객체(숫자 길이 10), 내부 번호구간 01을 먼저 생성하세요. 이 코드는 실제 번호를 소비하며 롤백으로 번호가 복원되지 않을 수 있습니다. 서브오브젝트·연도 의존 객체는 해당 파라미터를 추가해야 합니다.',
`PARAMETERS pa_run AS CHECKBOX.\nDATA gv_number TYPE n LENGTH 10.`,
`START-OF-SELECTION.\n  IF pa_run IS INITIAL. WRITE / '채번 실행 체크 후 실행하세요.'. RETURN. ENDIF.\n  PERFORM get_number.`,
`FORM get_number.\n  CALL FUNCTION 'NUMBER_GET_NEXT'\n    EXPORTING nr_range_nr = '01' object = 'ZWB_DEMO'\n    IMPORTING number = gv_number\n    EXCEPTIONS interval_not_found = 1 number_range_not_intern = 2\n      object_not_found = 3 quantity_is_0 = 4 quantity_is_not_1 = 5\n      interval_overflow = 6 buffer_overflow = 7 OTHERS = 8.\n  IF sy-subrc <> 0. MESSAGE 'SNRO 객체·번호구간을 확인하세요.' TYPE 'I'. RETURN. ENDIF.\n  WRITE / gv_number.\nENDFORM.`];
}}
