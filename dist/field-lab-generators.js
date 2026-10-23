// Independently authored examples. Source links and prerequisites ship with every bundle.
export const labKinds = [
  ['alv-newko', 'FI NEWKO · ONF4 + 선택·필터 전체 화면'],
  ['excel-validate', 'Excel · 원본 행 보존 + 대량 유효성 검사'],
  ['fi-bdc-log', 'FI BDC · SHDB 입력 + 실제 GT_MESSTAB 로그'],
  ['control-break', 'AT NEW / END OF · LOOP 전체 FORM 예제']
];
const file=(name,code,where)=>({name,code:code.trim()+'\n',where});
const intro='Standard ABAP 7.40 SP08+ / SAP GUI 기준. SAP 시스템 컴파일·실행은 미검증입니다. 새 Z DDIC·전역 클래스는 만들지 않습니다.\n';
function report(o,top,events,forms,guide){const p=o.program.toLowerCase();return [file('00_README.txt',intro+guide,'적용 조건과 확인 순서'),file(p+'.abap',`REPORT ${p}.\nINCLUDE ${p}_top.\n${events}\nINCLUDE ${p}_f01.`,'SE38 · 실행 프로그램'),file(p+'_top.abap',top,'SE38 · TOP'),file(p+'_f01.abap',forms,'SE38 · F01')];}
export function generateLab(kind,o){
  if(kind==='alv-newko')return newko(o);
  if(kind==='excel-validate')return excel(o);
  if(kind==='fi-bdc-log')return bdc(o);
  if(kind==='control-break')return breaks(o);
  return null;
}
function breaks(o){return report(o,`TYPES: BEGIN OF ty_item,
         bukrs TYPE c LENGTH 4, docid TYPE c LENGTH 10,
         item TYPE i, amount TYPE p LENGTH 8 DECIMALS 2,
       END OF ty_item.
TYPES ty_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA gt_items TYPE ty_items.`, `START-OF-SELECTION.
  gt_items = VALUE #( ( bukrs = '1000' docid = 'B' item = 1 amount = 30 )
                      ( bukrs = '1000' docid = 'A' item = 1 amount = 10 )
                      ( bukrs = '1000' docid = 'A' item = 2 amount = 20 ) ).
  PERFORM print_groups USING gt_items.
  PERFORM print_explicit USING gt_items.`, `" LOOP 전체를 하나의 FORM으로 추출. 원본 순서를 바꾸지 않는다.
FORM print_groups USING pt_items TYPE ty_items.
  DATA: lt_items TYPE ty_items, ls_item TYPE ty_item,
        lv_sum TYPE p LENGTH 8 DECIMALS 2.
  lt_items = pt_items.
  SORT lt_items BY bukrs docid item.
  LOOP AT lt_items INTO ls_item.
    AT FIRST.
      WRITE / '회사/문서별 합계'.
    ENDAT.
    " DOCID 앞 BUKRS도 제어 수준에 포함된다.
    AT NEW docid.
      CLEAR lv_sum.
    ENDAT.
    " AT 안에서는 뒤 필드의 값이 바뀌므로 본문에서 누적한다.
    lv_sum = lv_sum + ls_item-amount.
    AT END OF docid.
      WRITE: / ls_item-bukrs, ls_item-docid, lv_sum.
    ENDAT.
    AT LAST.
      WRITE / '끝'.
    ENDAT.
  ENDLOOP.
ENDFORM.

" ON CHANGE OF 대신 명시적인 이전 키 비교. 종료 그룹도 빠뜨리지 않는다.
FORM print_explicit USING pt_items TYPE ty_items.
  DATA: lt_items TYPE ty_items, ls_item TYPE ty_item,
        ls_previous TYPE ty_item, lv_first TYPE abap_bool,
        lv_sum TYPE p LENGTH 8 DECIMALS 2.
  lt_items = pt_items.
  SORT lt_items BY bukrs docid item.
  lv_first = abap_true.
  LOOP AT lt_items INTO ls_item.
    IF lv_first = abap_false AND
       ( ls_previous-bukrs <> ls_item-bukrs OR
         ls_previous-docid <> ls_item-docid ).
      WRITE: / ls_previous-bukrs, ls_previous-docid, lv_sum.
      CLEAR lv_sum.
    ENDIF.
    lv_sum = lv_sum + ls_item-amount.
    ls_previous = ls_item.
    lv_first = abap_false.
  ENDLOOP.
  IF lv_first = abap_false.
    WRITE: / ls_previous-bukrs, ls_previous-docid, lv_sum.
  ENDIF.
ENDFORM.`, 'SE38 프로그램과 TOP/F01 Include만 생성. 화면 객체 불필요. 두 방식 모두 A=30, B=30 출력. 빈 목록은 그룹을 출력하지 않음. AT NEW/END OF는 지정 필드와 그 왼쪽 필드를 함께 비교. INTO 작업영역의 오른쪽 문자 필드는 AT 블록 안에서 별표, 다른 필드는 초기값으로 바뀔 수 있음. ASSIGNING은 같은 작업영역 치환을 하지 않지만 그룹 경계 규칙은 유지. ON CHANGE OF는 오래된 구문이므로 새 예제에서는 이전 키 비교 사용.\n주제 참고: https://yulbaper.tistory.com/24\n공식: https://help.sap.com/saphelp_gbt10/helpdata/en/fc/eb381a358411d1829f0000e829fbfe/content.htm');}

function newko(o){const p=o.program.toLowerCase(),s=o.screen;const top=`" 행 상태와 Grid 수명에 필요한 데이터만 전역으로 둔다.
TYPES: BEGIN OF ty_row,
         bukrs TYPE t001-bukrs, bschl TYPE tbsl-bschl,
         newko TYPE bbseg-newko, anln2 TYPE anla-anln2,
       END OF ty_row.
TYPES: BEGIN OF ty_choice,
         pick TYPE n LENGTH 6, account TYPE bbseg-newko,
         subno TYPE anla-anln2, label TYPE c LENGTH 50,
       END OF ty_choice.
TYPES ty_choices TYPE STANDARD TABLE OF ty_choice WITH EMPTY KEY.
DATA: gt_data TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY,
      gt_fcat TYPE lvc_t_fcat, gv_okcode TYPE sy-ucomm.
DATA: gcl_container TYPE REF TO cl_gui_custom_container,
      gcl_grid TYPE REF TO cl_gui_alv_grid.
CLASS lcl_events DEFINITION DEFERRED.
DATA gcl_events TYPE REF TO lcl_events.
PARAMETERS pa_bukrs TYPE t001-bukrs OBLIGATORY.`;
const cls=`" 이벤트 시그니처를 받는 클래스 하나만 두고 로직은 FORM으로 넘긴다.
CLASS lcl_events DEFINITION.
  PUBLIC SECTION.
    METHODS on_f4 FOR EVENT onf4 OF cl_gui_alv_grid
      IMPORTING e_fieldname es_row_no er_event_data e_display.
    METHODS on_changed FOR EVENT data_changed OF cl_gui_alv_grid
      IMPORTING er_data_changed e_onf4 e_onf4_before e_onf4_after.
ENDCLASS.
CLASS lcl_events IMPLEMENTATION.
  METHOD on_f4.
    PERFORM account_f4 USING e_fieldname es_row_no er_event_data e_display.
  ENDMETHOD.
  METHOD on_changed.
    PERFORM check_changes USING er_data_changed.
  ENDMETHOD.
ENDCLASS.`;
const forms=`FORM make_fcat.
  DATA ls_fcat TYPE lvc_s_fcat.
  CLEAR gt_fcat.
  ls_fcat-fieldname = 'BUKRS'. ls_fcat-coltext = '회사코드'.
  ls_fcat-ref_table = 'T001'. ls_fcat-ref_field = 'BUKRS'.
  ls_fcat-edit = abap_true. APPEND ls_fcat TO gt_fcat.
  CLEAR ls_fcat.
  ls_fcat-fieldname = 'BSCHL'. ls_fcat-coltext = '전기키'.
  ls_fcat-ref_table = 'TBSL'. ls_fcat-ref_field = 'BSCHL'.
  ls_fcat-edit = abap_true. APPEND ls_fcat TO gt_fcat.
  CLEAR ls_fcat.
  ls_fcat-fieldname = 'NEWKO'. ls_fcat-coltext = '계정 / 자산 주번호'.
  ls_fcat-ref_table = 'BBSEG'. ls_fcat-ref_field = 'NEWKO'.
  ls_fcat-edit = abap_true. ls_fcat-f4availabl = abap_true.
  APPEND ls_fcat TO gt_fcat.
  CLEAR ls_fcat.
  ls_fcat-fieldname = 'ANLN2'. ls_fcat-coltext = '자산 보조번호'.
  ls_fcat-ref_table = 'ANLA'. ls_fcat-ref_field = 'ANLN2'.
  ls_fcat-edit = abap_true. APPEND ls_fcat TO gt_fcat.
ENDFORM.

FORM display_grid.
  DATA: ls_layout TYPE lvc_s_layo, lt_f4 TYPE lvc_t_f4.
  PERFORM make_fcat.
  CREATE OBJECT gcl_container EXPORTING container_name = '${o.container}'.
  CREATE OBJECT gcl_grid EXPORTING i_parent = gcl_container.
  CREATE OBJECT gcl_events.
  SET HANDLER gcl_events->on_f4 gcl_events->on_changed FOR gcl_grid.
  " F4 직전 미확정 편집값 전달, F4 뒤 선택값 검증 경로 연결.
  lt_f4 = VALUE #( ( fieldname = 'NEWKO' register = abap_true
                    getbefore = abap_true chngeafter = abap_true ) ).
  gcl_grid->register_f4_for_fields( it_f4 = lt_f4 ).
  gcl_grid->register_edit_event( i_event_id = cl_gui_alv_grid=>mc_evt_enter ).
  gcl_grid->register_edit_event( i_event_id = cl_gui_alv_grid=>mc_evt_modified ).
  ls_layout-zebra = abap_true. ls_layout-cwidth_opt = abap_true.
  ls_layout-sel_mode = 'A'.
  gcl_grid->set_table_for_first_display(
    EXPORTING is_layout = ls_layout
    CHANGING it_outtab = gt_data it_fieldcatalog = gt_fcat
    EXCEPTIONS invalid_parameter_combination = 1 program_error = 2
               too_many_lines = 3 OTHERS = 4 ).
  IF sy-subrc <> 0. MESSAGE 'ALV를 표시하지 못했습니다.' TYPE 'I'. ENDIF.
ENDFORM.

FORM check_changes USING po_changed TYPE REF TO cl_alv_changed_data_protocol.
  DATA: ls_cell TYPE lvc_s_modi, lv_bukrs TYPE t001-bukrs,
        lv_bschl TYPE tbsl-bschl, lv_found TYPE abap_bool.
  " 셀별 처리 전체를 한 FORM 안에 둔다. 이 화면은 소량 편집용이다.
  LOOP AT po_changed->mt_mod_cells INTO ls_cell.
    IF ls_cell-fieldname = 'BUKRS' OR ls_cell-fieldname = 'BSCHL'.
      " GT_DATA만 읽으면 아직 반영되지 않은 동시 수정값을 놓친다.
      po_changed->get_cell_value( EXPORTING i_row_id = ls_cell-row_id
        i_fieldname = 'BUKRS' IMPORTING e_value = lv_bukrs ).
      po_changed->get_cell_value( EXPORTING i_row_id = ls_cell-row_id
        i_fieldname = 'BSCHL' IMPORTING e_value = lv_bschl ).
      CLEAR lv_found.
      SELECT SINGLE @abap_true FROM t001 WHERE bukrs = @lv_bukrs INTO @lv_found.
      IF sy-subrc <> 0.
        po_changed->add_protocol_entry( i_msgid = '00' i_msgno = '001'
          i_msgty = 'E' i_msgv1 = '회사코드를 확인하세요.'
          i_fieldname = 'BUKRS' i_row_id = ls_cell-row_id ).
      ENDIF.
      SELECT SINGLE @abap_true FROM tbsl WHERE bschl = @lv_bschl INTO @lv_found.
      IF sy-subrc <> 0.
        po_changed->add_protocol_entry( i_msgid = '00' i_msgno = '001'
          i_msgty = 'E' i_msgv1 = '전기키를 확인하세요.'
          i_fieldname = 'BSCHL' i_row_id = ls_cell-row_id ).
      ENDIF.
      " 조직/유형이 바뀌면 이전 계정을 다시 선택하도록 한다.
      po_changed->modify_cell( i_row_id = ls_cell-row_id
        i_fieldname = 'NEWKO' i_value = space ).
      po_changed->modify_cell( i_row_id = ls_cell-row_id
        i_fieldname = 'ANLN2' i_value = space ).
    ENDIF.
  ENDLOOP.
ENDFORM.

FORM account_f4 USING pv_field TYPE lvc_fname ps_row TYPE lvc_s_roid
                     po_event TYPE REF TO cl_alv_event_data pv_display TYPE c.
  DATA: ls_row TYPE ty_row, lt_choices TYPE ty_choices, ls_choice TYPE ty_choice,
        lt_fields TYPE STANDARD TABLE OF dfies, ls_field TYPE dfies,
        lt_return TYPE STANDARD TABLE OF ddshretval, ls_return TYPE ddshretval,
        lv_offset TYPE i, lv_pick TYPE n LENGTH 6, lv_no TYPE i.
  FIELD-SYMBOLS: <changes> TYPE lvc_t_modi, <value> TYPE any.
  CHECK pv_field = 'NEWKO'.
  po_event->m_event_handled = abap_true.
  READ TABLE gt_data INTO ls_row INDEX ps_row-row_id.
  CHECK sy-subrc = 0.
  PERFORM account_choices USING ls_row CHANGING lt_choices.
  CHECK lt_choices IS NOT INITIAL.
  " 로컬 구조의 F0001 반환 혼동 방지: FIELD_TAB에 이름/길이/offset 명시.
  LOOP AT lt_choices ASSIGNING FIELD-SYMBOL(<choice>).
    <choice>-pick = sy-tabix.
  ENDLOOP.
  DO 4 TIMES.
    lv_no = sy-index.
    CLEAR ls_field.
    CASE lv_no.
      WHEN 1. ls_field-fieldname = 'PICK'. ls_field-fieldtext = '선택번호'.
      WHEN 2. ls_field-fieldname = 'ACCOUNT'. ls_field-fieldtext = '계정/주번호'.
      WHEN 3. ls_field-fieldname = 'SUBNO'. ls_field-fieldtext = '보조번호'.
      WHEN 4. ls_field-fieldname = 'LABEL'. ls_field-fieldtext = '설명'.
    ENDCASE.
    ASSIGN COMPONENT lv_no OF STRUCTURE ls_choice TO <value>.
    CHECK sy-subrc = 0.
    DESCRIBE FIELD <value> TYPE ls_field-inttype
      LENGTH ls_field-intlen IN BYTE MODE.
    DESCRIBE FIELD <value> LENGTH ls_field-leng IN CHARACTER MODE.
    ls_field-offset = lv_offset. ls_field-position = lv_no.
    ls_field-outputlen = ls_field-leng. ls_field-scrtext_l = ls_field-fieldtext.
    ls_field-datatype = 'CHAR'.
    IF lv_no = 1. ls_field-datatype = 'NUMC'. ENDIF.
    lv_offset = lv_offset + ls_field-intlen.
    APPEND ls_field TO lt_fields.
  ENDDO.
  CALL FUNCTION 'F4IF_INT_TABLE_VALUE_REQUEST'
    EXPORTING retfield = 'PICK' value_org = 'S' display = pv_display
      window_title = '회사코드·전기키별 후보 (최대 500건)'
    TABLES value_tab = lt_choices field_tab = lt_fields return_tab = lt_return
    EXCEPTIONS parameter_error = 1 no_values_found = 2 OTHERS = 3.
  IF sy-subrc <> 0. MESSAGE 'F4 호출 실패: SE37 인터페이스 확인' TYPE 'I'. RETURN. ENDIF.
  CHECK pv_display IS INITIAL.
  READ TABLE lt_return INTO ls_return INDEX 1.
  CHECK sy-subrc = 0 AND ls_return-fieldval IS NOT INITIAL.
  lv_pick = ls_return-fieldval.
  READ TABLE lt_choices INTO ls_choice WITH KEY pick = lv_pick.
  CHECK sy-subrc = 0 AND po_event->m_data IS BOUND.
  ASSIGN po_event->m_data->* TO <changes>.
  CHECK <changes> IS ASSIGNED.
  APPEND VALUE #( row_id = ps_row-row_id fieldname = 'NEWKO'
                  value = ls_choice-account ) TO <changes>.
  APPEND VALUE #( row_id = ps_row-row_id fieldname = 'ANLN2'
                  value = ls_choice-subno ) TO <changes>.
ENDFORM.

FORM account_choices USING ps_row TYPE ty_row CHANGING pt_choices TYPE ty_choices.
  DATA lv_koart TYPE tbsl-koart.
  CLEAR pt_choices.
  IF ps_row-bukrs IS INITIAL OR ps_row-bschl IS INITIAL.
    MESSAGE '회사코드와 전기키를 먼저 입력하세요.' TYPE 'I'. RETURN.
  ENDIF.
  SELECT SINGLE koart FROM tbsl WHERE bschl = @ps_row-bschl INTO @lv_koart.
  IF sy-subrc <> 0. MESSAGE '등록되지 않은 전기키입니다.' TYPE 'I'. RETURN. ENDIF.
  CASE lv_koart.
    WHEN 'D'.
      SELECT a~kunnr AS account, b~name1 AS label
        FROM knb1 AS a INNER JOIN kna1 AS b ON b~kunnr = a~kunnr
        WHERE a~bukrs = @ps_row-bukrs
        ORDER BY a~kunnr INTO CORRESPONDING FIELDS OF TABLE @pt_choices UP TO 500 ROWS.
    WHEN 'K'.
      SELECT a~lifnr AS account, b~name1 AS label
        FROM lfb1 AS a INNER JOIN lfa1 AS b ON b~lifnr = a~lifnr
        WHERE a~bukrs = @ps_row-bukrs
        ORDER BY a~lifnr INTO CORRESPONDING FIELDS OF TABLE @pt_choices UP TO 500 ROWS.
    WHEN 'S'.
      SELECT a~saknr AS account, c~txt50 AS label
        FROM skb1 AS a INNER JOIN t001 AS b ON b~bukrs = a~bukrs
        LEFT OUTER JOIN skat AS c ON c~ktopl = b~ktopl
          AND c~saknr = a~saknr AND c~spras = @sy-langu
        WHERE a~bukrs = @ps_row-bukrs
        ORDER BY a~saknr INTO CORRESPONDING FIELDS OF TABLE @pt_choices UP TO 500 ROWS.
    WHEN 'A'.
      SELECT anln1 AS account, anln2 AS subno, txt50 AS label FROM anla
        WHERE bukrs = @ps_row-bukrs ORDER BY anln1, anln2
        INTO CORRESPONDING FIELDS OF TABLE @pt_choices UP TO 500 ROWS.
    WHEN OTHERS.
      MESSAGE '이 예제는 D/K/S/A 계정유형을 지원합니다.' TYPE 'I'. RETURN.
  ENDCASE.
  IF pt_choices IS INITIAL. MESSAGE '해당 회사에 후보가 없습니다.' TYPE 'I'. ENDIF.
ENDFORM.

FORM inspect_rows USING pv_command TYPE sy-ucomm.
  DATA: lv_valid TYPE c LENGTH 1, lt_selected TYPE lvc_t_roid,
        lt_hidden TYPE lvc_t_fidx, ls_selected TYPE lvc_s_roid,
        lv_index TYPE i, lv_count TYPE i, ls_row TYPE ty_row.
  CHECK gcl_grid IS BOUND.
  gcl_grid->check_changed_data( IMPORTING e_valid = lv_valid ).
  CHECK lv_valid = abap_true.
  gcl_grid->get_filtered_entries( IMPORTING et_filtered_entries = lt_hidden ).
  CASE pv_command.
    WHEN 'SELECTED'.
      gcl_grid->get_selected_rows( IMPORTING et_row_no = lt_selected ).
      IF lt_selected IS INITIAL.
        MESSAGE '행 선택자를 선택하세요. 셀 선택과 다릅니다.' TYPE 'I'. RETURN.
      ENDIF.
      LOOP AT lt_selected INTO ls_selected.
        CHECK ls_selected-row_id > 0.
        READ TABLE lt_hidden WITH KEY table_line = ls_selected-row_id TRANSPORTING NO FIELDS.
        CHECK sy-subrc <> 0.
        READ TABLE gt_data INTO ls_row INDEX ls_selected-row_id.
        IF sy-subrc = 0. lv_count = lv_count + 1. ENDIF.
      ENDLOOP.
    WHEN 'VISIBLE'.
      " GET_FILTERED_ENTRIES = 숨겨진 행. 반환 목록을 제외한다.
      LOOP AT gt_data INTO ls_row.
        lv_index = sy-tabix.
        READ TABLE lt_hidden WITH KEY table_line = lv_index TRANSPORTING NO FIELDS.
        IF sy-subrc <> 0. lv_count = lv_count + 1. ENDIF.
      ENDLOOP.
    WHEN OTHERS. RETURN.
  ENDCASE.
  MESSAGE |처리 대상 { lv_count }행 (조회 시연, 전기 없음)| TYPE 'I'.
ENDFORM.`;
return [file('00_README.txt',intro+`SE38 프로그램 + TOP/C01/O01/I01/F01 생성. SE51 일반 화면 ${s}, 다음 화면 ${s}, OK Code GV_OKCODE, Custom Control ${o.container}. SE41 S${s}: BACK/EXIT/CANC 기능유형 E, SELECTED/VISIBLE 일반 버튼. Flow Logic은 SE51에만 붙여 넣기.\nF8: 기본 전기키 40행 3개 → 회사코드/전기키 수정 → NEWKO F4. 40은 시스템 TBSL에서 확인. D/K/S/A에 따라 회사별 고객/공급업체/G/L/자산 후보를 조회. 자산은 NEWKO 주번호와 ANLN2를 함께 보존; 실제 BDC 필드 형식은 SHDB로 확인. 미지원 유형을 G/L로 대체하지 않음.\n필드카탈로그 참조만으로 FI 표준 화면 문맥이 자동 재현되지 않음. ONF4 + F4AVAILABL + SET HANDLER + REGISTER_F4_FOR_FIELDS 모두 연결. SE24와 표준 BCALV_EDIT_08에서 GETBEFORE/CHNGEAFTER/이벤트 시그니처 확인.\n이 예제는 후보 선택/표 편집 학습용. 직접 입력한 계정 존재·차단·삭제·권한·전기 가능 여부는 저장 전 별도 재검증. 실제 저장/전기 없음. 500건은 조회 상한이며 전체 후보가 아님; 대량 마스터에는 검색조건/표준 Search Help를 적용.\n필터는 ALV 표준 필터 버튼 사용. SELECTED는 보이는 선택행, VISIBLE은 필터 후 보이는 모든 행. 선택이 비면 전체로 확대하지 않음.\n시험: BSCHL 수정 직후 Enter 없이 F4, 회사별 후보, 취소, 자산 보조번호, 직접 입력, 필터+정렬+행 선택, 빈 선택.\n주제 참고: https://yulbaper.tistory.com/13 및 https://yulbaper.tistory.com/15\n공식 계정유형: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/3cb1182b4a184bdd93f8d62e3f1f0741/12f6c353fad0b44ce10000000a174cb4.html`,'설정·제약·실행 순서'),
file(p+'.abap',`REPORT ${p}.\nINCLUDE ${p}_top.\nINCLUDE ${p}_c01.\nSTART-OF-SELECTION.\n  gt_data = VALUE #( ( bukrs = pa_bukrs bschl = '40' )\n                    ( bukrs = pa_bukrs bschl = '40' )\n                    ( bukrs = pa_bukrs bschl = '40' ) ).\n  CALL SCREEN '${s}'.\nINCLUDE ${p}_o01.\nINCLUDE ${p}_i01.\nINCLUDE ${p}_f01.`,'SE38 · 실행 프로그램'),file(p+'_top.abap',top,'SE38 · TOP'),file(p+'_c01.abap',cls,'SE38 · C01'),
file(p+'_o01.abap',`MODULE status_${s} OUTPUT.\n  SET PF-STATUS 'S${s}'.\n  IF gcl_grid IS NOT BOUND. PERFORM display_grid. ENDIF.\nENDMODULE.`,'SE38 · O01'),
file(p+'_i01.abap',`MODULE exit_${s} INPUT.\n  IF gcl_grid IS BOUND. gcl_grid->free( ). ENDIF.\n  IF gcl_container IS BOUND. gcl_container->free( ). ENDIF.\n  CLEAR: gcl_grid, gcl_container, gcl_events, gv_okcode.\n  LEAVE TO SCREEN 0.\nENDMODULE.\nMODULE command_${s} INPUT.\n  PERFORM inspect_rows USING gv_okcode.\n  CLEAR gv_okcode.\nENDMODULE.`,'SE38 · I01'),file(p+'_f01.abap',forms,'SE38 · F01'),file('screen_'+s+'.flow.abap',`PROCESS BEFORE OUTPUT.\n  MODULE status_${s}.\nPROCESS AFTER INPUT.\n  MODULE exit_${s} AT EXIT-COMMAND.\n  MODULE command_${s}.`,'SE51 · Flow Logic')];}

function excel(o){return report(o,`TYPES: BEGIN OF ty_raw,
         rowno TYPE i, docid TYPE string, item TYPE string,
         bukrs TYPE string, bschl TYPE string, account TYPE string,
         amount TYPE string, postdate TYPE string, currency TYPE string,
       END OF ty_raw.
TYPES: BEGIN OF ty_error,
         rowno TYPE i, field TYPE c LENGTH 15, rule TYPE c LENGTH 20,
         original TYPE string, detail TYPE string,
       END OF ty_error.
TYPES: BEGIN OF ty_seen, docid TYPE string, item TYPE string, END OF ty_seen.
DATA: gt_raw TYPE STANDARD TABLE OF ty_raw WITH EMPTY KEY,
      gt_errors TYPE STANDARD TABLE OF ty_error WITH EMPTY KEY.
PARAMETERS: pa_file TYPE rlgrap-filename OBLIGATORY,
            pa_last TYPE i DEFAULT 5000.`, `AT SELECTION-SCREEN ON VALUE-REQUEST FOR pa_file.
  CALL FUNCTION 'F4_FILENAME' IMPORTING file_name = pa_file.
AT SELECTION-SCREEN.
  IF pa_last < 2 OR pa_last > 9999.
    MESSAGE '이 레거시 예제의 마지막 행은 2~9999입니다.' TYPE 'E'.
  ENDIF.
START-OF-SELECTION.
  PERFORM upload_cells.
  IF gt_errors IS INITIAL. PERFORM validate_rows. ENDIF.
  PERFORM display_errors.`, `FORM add_error USING pv_row TYPE i pv_field TYPE csequence
                     pv_rule TYPE csequence pv_original TYPE csequence
                     pv_detail TYPE csequence.
  APPEND VALUE #( rowno = pv_row field = pv_field rule = pv_rule
    original = pv_original detail = pv_detail ) TO gt_errors.
ENDFORM.

FORM upload_cells.
  DATA: lt_cells TYPE STANDARD TABLE OF alsmex_tabline,
        ls_cell TYPE alsmex_tabline, ls_raw TYPE ty_raw,
        lv_row TYPE i, lv_previous TYPE i, lv_subrc TYPE sy-subrc.
  CLEAR: gt_raw, gt_errors.
  " 고전 함수 예외는 CATCH 대신 EXCEPTIONS + SY-SUBRC로 검사한다.
  CALL FUNCTION 'ALSM_EXCEL_TO_INTERNAL_TABLE'
    EXPORTING filename = pa_file i_begin_col = 1 i_begin_row = 2
      i_end_col = 8 i_end_row = pa_last
    TABLES intern = lt_cells
    EXCEPTIONS inconsistent_parameters = 1 upload_ole = 2 OTHERS = 3.
  lv_subrc = sy-subrc.
  IF lv_subrc <> 0.
    PERFORM add_error USING 0 'FILE' 'UPLOAD' pa_file
      '파일/Excel 설치/OLE/SE37 예외 코드를 확인하세요.'.
    RETURN.
  ENDIF.
  SORT lt_cells BY row col.
  LOOP AT lt_cells INTO ls_cell.
    lv_row = ls_cell-row.
    " 상한 행에 데이터가 있으면 뒤 행 누락 가능성을 사용자에게 알린다.
    IF lv_row >= pa_last.
      PERFORM add_error USING lv_row 'ROW' 'LIMIT' ls_cell-value
        '읽기 상한에 도달했습니다. 파일을 나누거나 업로드 방식을 바꾸세요.'.
      RETURN.
    ENDIF.
    IF lv_previous <> 0 AND lv_previous <> lv_row.
      APPEND ls_raw TO gt_raw.
      CLEAR ls_raw.
    ENDIF.
    ls_raw-rowno = lv_row. lv_previous = lv_row.
    " 원본 문자열을 먼저 보존. 동적 ASSIGN 실패나 조기 형변환을 피한다.
    CASE ls_cell-col.
      WHEN 1. ls_raw-docid = ls_cell-value.
      WHEN 2. ls_raw-item = ls_cell-value.
      WHEN 3. ls_raw-bukrs = ls_cell-value.
      WHEN 4. ls_raw-bschl = ls_cell-value.
      WHEN 5. ls_raw-account = ls_cell-value.
      WHEN 6. ls_raw-amount = ls_cell-value.
      WHEN 7. ls_raw-postdate = ls_cell-value.
      WHEN 8. ls_raw-currency = ls_cell-value.
      WHEN OTHERS.
        PERFORM add_error USING lv_row 'COLUMN' 'MAPPING' ls_cell-value
          '템플릿에 없는 열입니다.'.
    ENDCASE.
  ENDLOOP.
  IF lv_previous <> 0. APPEND ls_raw TO gt_raw. ENDIF.
ENDFORM.

FORM validate_rows.
  DATA: lt_company TYPE HASHED TABLE OF t001 WITH UNIQUE KEY bukrs,
        lt_keys TYPE HASHED TABLE OF tbsl WITH UNIQUE KEY bschl,
        lt_currency TYPE HASHED TABLE OF tcurc WITH UNIQUE KEY waers,
        lt_seen TYPE HASHED TABLE OF ty_seen WITH UNIQUE KEY docid item,
        ls_raw TYPE ty_raw, ls_seen TYPE ty_seen,
        lv_amount TYPE p LENGTH 16 DECIMALS 2, lv_date TYPE sy-datum,
        lv_company TYPE t001-bukrs, lv_key TYPE tbsl-bschl,
        lv_currency TYPE tcurc-waers, lv_message TYPE string.
  IF gt_raw IS INITIAL.
    PERFORM add_error USING 0 'FILE' 'EMPTY' space '읽을 데이터가 없습니다.'.
    RETURN.
  ENDIF.
  " 작은 설정 테이블만 한 번씩 읽는다. 대형 마스터는 키별 일괄조회로 확장.
  SELECT * FROM t001 INTO TABLE @lt_company.
  SELECT * FROM tbsl INTO TABLE @lt_keys.
  SELECT * FROM tcurc INTO TABLE @lt_currency.
  " 전체 검증 LOOP가 이 FORM 하나에 있다. 오류 후 다음 행도 계속 검사.
  LOOP AT gt_raw INTO ls_raw.
    IF ls_raw-docid IS INITIAL OR ls_raw-item IS INITIAL.
      PERFORM add_error USING ls_raw-rowno 'DOCID/ITEM' 'REQUIRED'
        ls_raw-docid '문서키와 항목키가 필요합니다.'.
    ELSE.
      ls_seen-docid = ls_raw-docid. ls_seen-item = ls_raw-item.
      INSERT ls_seen INTO TABLE lt_seen.
      IF sy-subrc <> 0.
        PERFORM add_error USING ls_raw-rowno 'DOCID/ITEM' 'DUPLICATE'
          ls_raw-item '같은 문서의 항목키가 중복됩니다.'.
      ENDIF.
    ENDIF.
    IF strlen( ls_raw-bukrs ) <> 4.
      PERFORM add_error USING ls_raw-rowno 'BUKRS' 'LENGTH'
        ls_raw-bukrs '회사코드는 텍스트 네 자리로 입력하세요.'.
    ELSE.
      lv_company = ls_raw-bukrs.
      READ TABLE lt_company WITH TABLE KEY bukrs = lv_company TRANSPORTING NO FIELDS.
      IF sy-subrc <> 0.
        PERFORM add_error USING ls_raw-rowno 'BUKRS' 'MASTER'
          ls_raw-bukrs '등록된 회사코드가 아닙니다.'.
      ENDIF.
    ENDIF.
    IF strlen( ls_raw-bschl ) <> 2 OR ls_raw-bschl CN '0123456789'.
      PERFORM add_error USING ls_raw-rowno 'BSCHL' 'FORMAT'
        ls_raw-bschl '전기키는 텍스트 두 자리로 입력하세요.'.
    ELSE.
      lv_key = ls_raw-bschl.
      READ TABLE lt_keys WITH TABLE KEY bschl = lv_key TRANSPORTING NO FIELDS.
      IF sy-subrc <> 0.
        PERFORM add_error USING ls_raw-rowno 'BSCHL' 'MASTER'
          ls_raw-bschl 'TBSL에 없는 전기키입니다.'.
      ENDIF.
    ENDIF.
    IF ls_raw-account IS INITIAL OR strlen( ls_raw-account ) > 17.
      PERFORM add_error USING ls_raw-rowno 'NEWKO' 'LENGTH'
        ls_raw-account '계정은 필수이며 최대 17자리입니다. 유형별 존재검사는 별도입니다.'.
    ENDIF.
    " 이 입력 계약은 부호 없는 양수, 점 소수점, 최대 소수 2자리이다.
    FIND REGEX '^[0-9]+([.][0-9]{1,2})?$' IN ls_raw-amount.
    IF sy-subrc <> 0.
      PERFORM add_error USING ls_raw-rowno 'AMOUNT' 'FORMAT'
        ls_raw-amount '양수 숫자와 점 소수점만 허용합니다. 쉼표를 임의 삭제하지 마세요.'.
    ELSE.
      TRY.
          lv_amount = ls_raw-amount.
          IF lv_amount <= 0.
            PERFORM add_error USING ls_raw-rowno 'AMOUNT' 'RANGE'
              ls_raw-amount '금액은 0보다 커야 합니다.'.
          ENDIF.
        CATCH cx_sy_conversion_no_number cx_sy_conversion_overflow INTO DATA(lx_convert).
          lv_message = lx_convert->get_text( ).
          PERFORM add_error USING ls_raw-rowno 'AMOUNT' 'CONVERSION'
            ls_raw-amount lv_message.
      ENDTRY.
    ENDIF.
    IF strlen( ls_raw-postdate ) <> 8 OR ls_raw-postdate CN '0123456789'.
      PERFORM add_error USING ls_raw-rowno 'POSTDATE' 'FORMAT'
        ls_raw-postdate '날짜는 YYYYMMDD 여덟 자리입니다.'.
    ELSE.
      lv_date = ls_raw-postdate.
      CALL FUNCTION 'DATE_CHECK_PLAUSIBILITY' EXPORTING date = lv_date
        EXCEPTIONS plausibility_check_failed = 1 OTHERS = 2.
      IF sy-subrc <> 0.
        PERFORM add_error USING ls_raw-rowno 'POSTDATE' 'CALENDAR'
          ls_raw-postdate '달력에 없는 날짜입니다.'.
      ENDIF.
    ENDIF.
    IF ls_raw-currency IS INITIAL OR strlen( ls_raw-currency ) > 5.
      PERFORM add_error USING ls_raw-rowno 'CURRENCY' 'FORMAT'
        ls_raw-currency '통화코드 길이를 확인하세요.'.
    ELSE.
      lv_currency = ls_raw-currency.
      READ TABLE lt_currency WITH TABLE KEY waers = lv_currency TRANSPORTING NO FIELDS.
      IF sy-subrc <> 0.
        PERFORM add_error USING ls_raw-rowno 'CURRENCY' 'MASTER'
          ls_raw-currency '등록된 통화코드가 아닙니다.'.
      ENDIF.
    ENDIF.
  ENDLOOP.
ENDFORM.

FORM display_errors.
  DATA lo_salv TYPE REF TO cl_salv_table.
  IF gt_errors IS INITIAL.
    WRITE: / '입력 계약 검사 통과:', lines( gt_raw ), '행'.
    WRITE / '계정·권한·필드상태·전기기간·문서균형 검증과 실제 전기는 별도입니다.'.
    RETURN.
  ENDIF.
  TRY.
      cl_salv_table=>factory( IMPORTING r_salv_table = lo_salv
        CHANGING t_table = gt_errors ).
      lo_salv->get_functions( )->set_all( abap_true ).
      lo_salv->get_columns( )->set_optimize( abap_true ).
      lo_salv->display( ).
    CATCH cx_salv_msg INTO DATA(lx_salv).
      MESSAGE lx_salv->get_text( ) TYPE 'I'.
  ENDTRY.
ENDFORM.`, 'SE38 프로그램/TOP/F01 생성. 별도 화면 불필요. Excel A:H = 문서키, 항목키, 회사코드, 전기키, 계정, 금액, YYYYMMDD, 통화. 첫 행은 헤더. 코드/날짜 열은 텍스트로 유지.\nALSM은 Windows SAP GUI + 로컬 Excel/OLE 전제의 레거시 경로. XLSX 대량 지원이나 65,000행 보장을 의미하지 않음. 예제 상한 9999 및 ALSMEX_TABLINE-VALUE 길이 제한을 SE11에서 확인. 상한 행 도달은 검증 실패로 중단. 긴 문자열/대용량 XLSX는 검증된 서버 파서 또는 패키지 분할을 사용.\n두 번째 행부터 원본 행번호와 원본 문자열을 보존. 전체 LOOP를 validate_rows 하나로 추출, 설정 테이블은 HASHED 캐시로 조회. 필수/중복/형식/마스터/숫자변환/달력 검증. 금액은 이 예제의 양수·소수 2자리 입력 계약이며 BSEG 내부 금액 변환이 아님. TCURX/외부통화 변환은 실제 전기 전에 별도 적용.\nTRY/CATCH는 잡을 수 있는 클래스 기반 예외만 처리. OLE 오류는 고전 예외, 덤프 전체 방지 보장 불가. ST22에서 실제 원인 확인.\n시험: 정상, 빈 파일, 두 번째 행의 누락, 잘못된 전기키, 중복 항목, 20260230, 1,000/1.234/큰 금액, 상한 도달.\n주제 참고: https://yulbaper.tistory.com/17\n공식 예외: https://help.sap.com/docs/abap-cloud/abap-keywords-standard-abap/abenabap_exceptions.html');}

function bdc(o){return report(o,`TYPES: BEGIN OF ty_log,
         group_id TYPE c LENGTH 20, source_row TYPE i,
         call_subrc TYPE sy-subrc, msgtyp TYPE bdcmsgcoll-msgtyp,
         msgid TYPE bdcmsgcoll-msgid, msgnr TYPE bdcmsgcoll-msgnr,
         msgv1 TYPE bdcmsgcoll-msgv1, msgv2 TYPE bdcmsgcoll-msgv2,
         msgv3 TYPE bdcmsgcoll-msgv3, msgv4 TYPE bdcmsgcoll-msgv4,
         text TYPE string,
       END OF ty_log.
DATA: gt_bdc TYPE STANDARD TABLE OF bdcdata WITH EMPTY KEY,
      gt_messtab TYPE STANDARD TABLE OF bdcmsgcoll WITH EMPTY KEY,
      gt_log TYPE STANDARD TABLE OF ty_log WITH EMPTY KEY.
PARAMETERS: pa_file TYPE rlgrap-filename OBLIGATORY,
            pa_group TYPE c LENGTH 20 DEFAULT 'DOCUMENT_001',
            pa_run AS CHECKBOX.`, `AT SELECTION-SCREEN ON VALUE-REQUEST FOR pa_file.
  CALL FUNCTION 'F4_FILENAME' IMPORTING file_name = pa_file.
START-OF-SELECTION.
  PERFORM post_documents.
  PERFORM display_log.`, `" 한 파일 = 한 FI 전표의 SHDB 녹화 데이터. 실제 FB01 실행은 PA_RUN 체크 시만.
FORM post_documents.
  DATA: lt_lines TYPE STANDARD TABLE OF string, lt_columns TYPE STANDARD TABLE OF string,
        lv_line TYPE string, ls_bdc TYPE bdcdata, lv_filename TYPE string,
        lv_source_row TYPE i, lv_tabs TYPE i, lv_subrc TYPE sy-subrc, lv_error TYPE abap_bool,
        lv_program TYPE string, lv_dynpro TYPE string, lv_begin TYPE string,
        lv_name TYPE string, lv_value TYPE string, ls_options TYPE ctu_params.
  lv_filename = pa_file.
  cl_gui_frontend_services=>gui_upload(
    EXPORTING filename = lv_filename filetype = 'ASC' codepage = '4110'
    CHANGING data_tab = lt_lines EXCEPTIONS OTHERS = 1 ).
  IF sy-subrc <> 0. MESSAGE 'UTF-8 녹화 파일을 읽지 못했습니다.' TYPE 'I'. RETURN. ENDIF.
  CLEAR: gt_bdc, gt_log.
  " 파싱 LOOP 전체를 하나의 FORM 안에 둔다. 잘못된 줄은 CALL 전 중단.
  LOOP AT lt_lines INTO lv_line.
    lv_source_row = sy-tabix.
    IF lv_source_row = 1. CONTINUE. ENDIF.
    CLEAR: ls_bdc, lt_columns.
    FIND ALL OCCURRENCES OF cl_abap_char_utilities=>horizontal_tab
      IN lv_line MATCH COUNT lv_tabs.
    IF lv_tabs <> 4.
      MESSAGE |{ lv_source_row }행: 탭으로 분리한 5열이 필요합니다.| TYPE 'I'. RETURN.
    ENDIF.
    SPLIT lv_line AT cl_abap_char_utilities=>horizontal_tab
      INTO lv_program lv_dynpro lv_begin lv_name lv_value.
    IF strlen( lv_program ) > 40 OR strlen( lv_dynpro ) > 4 OR
       strlen( lv_begin ) > 1 OR strlen( lv_name ) > 132 OR strlen( lv_value ) > 132.
      MESSAGE |{ lv_source_row }행: BDCDATA 필드 길이 초과| TYPE 'I'. RETURN.
    ENDIF.
    IF lv_begin = 'X'.
      IF lv_program IS INITIAL OR strlen( lv_dynpro ) <> 4 OR lv_dynpro CN '0123456789'.
        MESSAGE |{ lv_source_row }행: 화면 프로그램/4자리 번호 확인| TYPE 'I'. RETURN.
      ENDIF.
    ELSEIF lv_begin IS NOT INITIAL OR lv_name IS INITIAL OR gt_bdc IS INITIAL.
      MESSAGE |{ lv_source_row }행: 화면 시작 또는 필드명 누락| TYPE 'I'. RETURN.
    ENDIF.
    ls_bdc-program = lv_program. ls_bdc-dynpro = lv_dynpro.
    ls_bdc-dynbegin = lv_begin. ls_bdc-fnam = lv_name. ls_bdc-fval = lv_value.
    APPEND ls_bdc TO gt_bdc.
  ENDLOOP.
  IF gt_bdc IS INITIAL. MESSAGE '녹화 데이터가 없습니다.' TYPE 'I'. RETURN. ENDIF.
  IF pa_run IS INITIAL.
    MESSAGE |녹화 { lines( gt_bdc ) }줄 준비. 실제 호출은 실행 체크 후 가능합니다.| TYPE 'I'. RETURN.
  ENDIF.
  AUTHORITY-CHECK OBJECT 'S_TCODE' ID 'TCD' FIELD 'FB01'.
  IF sy-subrc <> 0. MESSAGE 'FB01 실행 권한이 없습니다.' TYPE 'I'. RETURN. ENDIF.
  " FI 업무 권한/필드상태는 거래 자체 검사도 거친다.
  ls_options-dismode = 'E'. ls_options-updmode = 'S'. ls_options-defsize = abap_true.
  CLEAR gt_messtab.
  CALL TRANSACTION 'FB01' USING gt_bdc OPTIONS FROM ls_options MESSAGES INTO gt_messtab.
  lv_subrc = sy-subrc. " 다른 READ/FUNCTION 호출보다 먼저 보존
  PERFORM collect_messages USING lv_subrc CHANGING lv_error.
  IF lv_error = abap_true.
    MESSAGE '실제 메시지 로그를 확인하세요. 일괄 재실행 전 전기 여부를 확인하세요.' TYPE 'I'.
  ELSE.
    MESSAGE '오류 로그 없음. 실제 성공 메시지와 생성 문서 확인 전 성공으로 확정하지 마세요.' TYPE 'I'.
  ENDIF.
ENDFORM.

FORM collect_messages USING pv_subrc TYPE sy-subrc CHANGING pv_error TYPE abap_bool.
  DATA: ls_message TYPE bdcmsgcoll, ls_log TYPE ty_log, lv_text TYPE string.
  pv_error = abap_false.
  IF pv_subrc <> 0. pv_error = abap_true. ENDIF.
  LOOP AT gt_messtab INTO ls_message.
    " SAP가 반환한 ID/번호/변수 네 개를 그대로 해석한다.
    MESSAGE ID ls_message-msgid TYPE 'S' NUMBER ls_message-msgnr
      WITH ls_message-msgv1 ls_message-msgv2 ls_message-msgv3 ls_message-msgv4
      INTO lv_text.
    CLEAR ls_log.
    ls_log-group_id = pa_group. ls_log-source_row = 2.
    ls_log-call_subrc = pv_subrc. ls_log-msgtyp = ls_message-msgtyp.
    ls_log-msgid = ls_message-msgid. ls_log-msgnr = ls_message-msgnr.
    ls_log-msgv1 = ls_message-msgv1. ls_log-msgv2 = ls_message-msgv2.
    ls_log-msgv3 = ls_message-msgv3. ls_log-msgv4 = ls_message-msgv4.
    ls_log-text = lv_text. APPEND ls_log TO gt_log.
    IF ls_message-msgtyp CA 'AEX'. pv_error = abap_true. ENDIF.
  ENDLOOP.
  IF gt_messtab IS INITIAL.
    APPEND VALUE #( group_id = pa_group source_row = 2 call_subrc = pv_subrc
      text = '호출 메시지가 없습니다. 전기 성공을 의미하지 않습니다.' ) TO gt_log.
  ENDIF.
ENDFORM.

FORM display_log.
  DATA lo_salv TYPE REF TO cl_salv_table.
  CHECK gt_log IS NOT INITIAL.
  TRY.
      cl_salv_table=>factory( IMPORTING r_salv_table = lo_salv CHANGING t_table = gt_log ).
      lo_salv->get_functions( )->set_all( abap_true ).
      lo_salv->get_columns( )->set_optimize( abap_true ).
      lo_salv->display( ).
    CATCH cx_salv_msg INTO DATA(lx_salv).
      MESSAGE lx_salv->get_text( ) TYPE 'I'.
  ENDTRY.
ENDFORM.`, '실제 SAP가 반환한 메시지를 수집하는 실행 프로그램. SE38 + TOP/F01만 필요. 가상의 오류 문자열을 실제 SAP 오류로 표시하지 않음.\n입력 UTF-8 TSV: 첫 줄 헤더 PROGRAM, DYNPRO, DYNBEGIN, FNAM, FVAL (정확히 5열, 빈 열도 탭 유지). SHDB에서 자기 시스템의 FB01 녹화 후 이 열 순서로 내보낼 것. 한 파일은 한 문서이며 PA_GROUP으로 입력 문서키를 보존. SOURCE_ROW=2는 문서 데이터 시작 행이지 오류 셀을 뜻하지 않음. 메시지에서 항목/화면을 추가 매핑하려면 DYNAME/DYNUMB/FLDNAME도 로그에 추가.\nPA_RUN 초기값은 공백. 읽기/형식 점검 후 체크하면 실제 FB01을 호출함. 화면/필드/OKCODE를 추측해서 채우지 않음. A/E 모드에서 /n 취소가 SY-SUBRC=0일 수 있으므로 반환값 0 또는 S 메시지 존재만으로 성공 판정 금지. 생성 문서키와 해당 거래의 실제 전기 성공 메시지를 확인하고 그룹별 재처리/중복방지를 설계.\nCALL TRANSACTION 내부 COMMIT은 호출자 ROLLBACK으로 취소되지 않을 수 있음. 실패 후 무조건 전체 재실행 금지. 대량은 검증 완료 데이터부터 문서 그룹별 호출/로그 저장.\n공식: https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCALL_TRANSACTION_USING.html\n성공 판정 주의: https://help.sap.com/saphelp_em900/helpdata/en/4a/64207566e41b00e10000000a42189b/content.htm');}
