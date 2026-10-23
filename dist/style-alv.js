import {argumentRows} from './code-tools.js';
const f=(name,code,where)=>({name,code:code.trim()+'\n',where});
export const fcatRecipes=[
 ['fcat-checkbox','체크박스 · 선택 행 처리','SEL에 CHECKBOX/EDIT를 지정하고 저장 전 CHECK_CHANGED_DATA로 값을 반영합니다.'],
 ['fcat-currency','금액·통화 · CFIELDNAME / 합계','AMOUNT와 WAERS를 연결합니다. 통화별 소수 자릿수와 ALV 통화별 합계를 확인하세요.'],
 ['fcat-hotspot','전표번호 · HOTSPOT 이벤트','BELNR 클릭 행을 읽습니다. 실제 FB03 이동에는 회사코드·회계연도까지 필요합니다.'],
 ['fcat-edit','편집 필드 · 입력 반영·검사','편집 버퍼를 반영하고 음수 금액을 검사합니다. 예제는 메모리 변경까지이며 DB 저장은 포함하지 않습니다.'],
 ['fcat-style','행별 편집 · STYLEFNAME','차변 행의 금액 편집을 막는 조건 예시입니다. 필드카탈로그 EDIT와 행별 STYLE을 함께 설정합니다.'],
 ['fcat-color','셀 색상 · CTAB_FNAME','음수 금액 셀에 색상을 넣습니다. CELLCOLOR는 LVC_T_SCOL 타입의 깊은 필드입니다.'],
 ['fcat-ddic','DDIC MERGE · 생성 후 LOOP 보정','활성 DDIC 구조에서 카탈로그를 만들고 텍스트·열 순서를 보정합니다. 수동 MAKE_FCAT과 별도 예제입니다.']
].map(([id,title,note])=>({id,kind:id,title,major:'alv',middle:'fcat',description:note+'\n핵심 코드가 기본입니다. 선언·화면 연결은 별도 탭에서 확인하세요.'}));
fcatRecipes.push({id:'alv-top-event',kind:'alv-top-event',title:'Grid TOP_OF_PAGE · 이벤트 연결 방식',major:'alv',middle:'header',description:'기존 Grid TOP_OF_PAGE 이벤트 예제도 따로 제공합니다.\n직접 CREATE_TOP을 호출하는 기본 예제와 비교하세요.'});
export function generateStyleAlv(kind,o){
 if(kind==='alv-top-event')return null;
 if(!['make-fcat','alv-top',...fcatRecipes.map(x=>x.kind)].includes(kind))return null;
 const p=o.program.toLowerCase(),s=o.screen,ctrl=o.container.toUpperCase();
 const header=kind==='alv-top',ddic=kind==='make-fcat'||kind==='fcat-ddic',merge=kind==='fcat-ddic';
 const t=o.table.toLowerCase(),k=o.key.toLowerCase();
 const cols={SCARR:[['CARRID','항공사'],['CARRNAME','항공사명'],['CURRCODE','통화'],['URL','홈페이지']],T001:[['BUKRS','회사코드'],['BUTXT','회사명'],['WAERS','통화'],['KTOPL','계정과목표']]};
 const selected=cols[o.table]||[[o.key,'키 필드']];
 const rows=argumentRows(selected.map(([field,text],i)=>[i===0?'X':' ',field,text,o.table,field]));
 const demoRows=argumentRows([
  [' ','SEL','선택',' ',' '],[' ','ICON','상태',' ',' '],['X','BELNR','전표번호','BKPF','BELNR'],
  [' ','AMOUNT','금액','BSEG','WRBTR'],[' ','WAERS','통화','TCURC','WAERS'],[' ','TEXT','처리내용',' ',' ']
 ]);
 const spec=fcatRecipes.find(r=>r.kind===kind);
 const forms=`*&---------------------------------------------------------------------*
*& Form SET_INIT
*&---------------------------------------------------------------------*
FORM set_init .

${ddic?`  SELECT *
    FROM ${t}
    ORDER BY PRIMARY KEY
    INTO TABLE @gt_data
    UP TO 100 ROWS.`:`  SELECT SINGLE waers
    FROM bkpf
    WHERE bukrs = @pa_bukrs
      AND belnr = @pa_belnr
      AND gjahr = @pa_gjahr
    INTO @DATA(lv_waers).

  IF sy-subrc <> 0.
    MESSAGE '회사코드·전표번호·회계연도를 확인하세요.' TYPE 'I'.
    RETURN.
  ENDIF.

  SELECT belnr, shkzg, wrbtr, sgtxt
    FROM bseg
    WHERE bukrs = @pa_bukrs
      AND belnr = @pa_belnr
      AND gjahr = @pa_gjahr
    INTO TABLE @DATA(lt_bseg).

  CLEAR gt_data.

  LOOP AT lt_bseg INTO DATA(ls_bseg).
    CLEAR gs_data.

    gs_data-belnr  = ls_bseg-belnr.
    gs_data-shkzg  = ls_bseg-shkzg.
    gs_data-amount = ls_bseg-wrbtr.
    gs_data-waers  = lv_waers.
    gs_data-text   = ls_bseg-sgtxt.
    gs_data-icon   = COND #( WHEN ls_bseg-shkzg = 'S' THEN icon_led_green
                            ELSE icon_led_inactive ).

${kind==='fcat-style'?`    IF ls_bseg-shkzg = 'S'.
* 행별 편집 제한의 조건 예시입니다. 실제 업무 조건으로 바꾸세요.
      gs_data-style = VALUE #( ( fieldname = 'AMOUNT'
                                style = cl_gui_alv_grid=>mc_style_disabled ) ).
    ENDIF.`:kind==='fcat-color'?`    IF ls_bseg-wrbtr < 0.
      gs_data-cellcolor = VALUE #( ( fname = 'AMOUNT'
                                    color-col = 6
                                    color-int = 1
                                    color-inv = 0 ) ).
    ENDIF.`:''}
    APPEND gs_data TO gt_data.
  ENDLOOP.`}

ENDFORM.

*&---------------------------------------------------------------------*
*& Form SET_FCAT
*&---------------------------------------------------------------------*
FORM set_fcat .

  REFRESH gt_fcat.

${merge?`  CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
    EXPORTING
      i_structure_name = '${o.table}'
    CHANGING
      ct_fieldcat      = gt_fcat
    EXCEPTIONS
      inconsistent_interface = 1
      program_error          = 2
      OTHERS                 = 3.

  IF sy-subrc <> 0.
    MESSAGE '필드카탈로그 생성 실패' TYPE 'A'.
  ENDIF.

  LOOP AT gt_fcat ASSIGNING FIELD-SYMBOL(<fs_fcat>).
    IF <fs_fcat>-fieldname = '${o.key}'.
      <fs_fcat>-col_pos = 1.
      <fs_fcat>-key = 'X'.
      <fs_fcat>-coltext = '조회 키'.
    ENDIF.
  ENDLOOP.`:`* KEY / FIELD / TEXT / REF_TABLE / REF_FIELD 순서
  PERFORM make_fcat USING :
${ddic?rows:demoRows}`}

ENDFORM.

*&---------------------------------------------------------------------*
*& Form MAKE_FCAT
*&---------------------------------------------------------------------*
FORM make_fcat USING pv_key
                     pv_field
                     pv_text
                     pv_ref_table
                     pv_ref_field.

  gs_fcat = VALUE #( key       = pv_key
                     fieldname = pv_field
                     coltext   = pv_text
                     ref_table = pv_ref_table
                     ref_field = pv_ref_field ).

${ddic?`  IF pv_field = '${o.key}'.
    gs_fcat-col_pos = 1.
  ENDIF.`:`  CASE pv_field.
    WHEN 'SEL'.
      gs_fcat-checkbox = 'X'.
      gs_fcat-edit     = 'X'.

    WHEN 'ICON'.
      gs_fcat-icon = 'X'.

    WHEN 'BELNR'.
      gs_fcat-hotspot = 'X'.

    WHEN 'AMOUNT'.
      gs_fcat-cfieldname = 'WAERS'.
      gs_fcat-do_sum     = 'X'.
${['fcat-edit','fcat-style'].includes(kind)?"      gs_fcat-edit       = 'X'.\n":''}
    WHEN 'WAERS'.
      gs_fcat-no_out = 'X'.

    WHEN 'TEXT'.
      gs_fcat-outputlen = 30.
  ENDCASE.`}

  APPEND gs_fcat TO gt_fcat.

ENDFORM.

*&---------------------------------------------------------------------*
*& Form CREATE_ALV_${s}
*&---------------------------------------------------------------------*
FORM create_alv_${s} .

  PERFORM set_fcat.

  gs_layout = VALUE #( zebra      = 'X'
                       cwidth_opt = 'X'
                       sel_mode   = 'D'${ddic?'':"\n                       stylefname = 'STYLE'\n                       ctab_fname = 'CELLCOLOR'"} ).

  CREATE OBJECT gcl_container
    EXPORTING
      container_name = '${ctrl}'.

  CREATE OBJECT gcl_grid
    EXPORTING
      i_parent = gcl_container.

${ddic?'':`  SET HANDLER lcl_event_handler=>handle_hotspot FOR gcl_grid.
  CALL METHOD gcl_grid->register_edit_event
    EXPORTING
      i_event_id = cl_gui_alv_grid=>mc_evt_modified.

` }  CALL METHOD gcl_grid->set_table_for_first_display
    EXPORTING
      is_layout       = gs_layout
    CHANGING
      it_outtab       = gt_data
      it_fieldcatalog = gt_fcat
    EXCEPTIONS
      invalid_parameter_combination = 1
      program_error                 = 2
      too_many_lines                = 3
      OTHERS                        = 4.

  IF sy-subrc <> 0.
    MESSAGE 'ALV 표시 실패' TYPE 'A'.
  ENDIF.
${header?`
  CREATE OBJECT gcl_top
    EXPORTING
      container_name = 'GCL_TOP'.
`:''}
ENDFORM.

FORM refresh_grid .

  CHECK gcl_grid IS BOUND.

  gs_stable = VALUE #( row = 'X'
                       col = 'X' ).

  CALL METHOD gcl_grid->refresh_table_display
    EXPORTING
      is_stable = gs_stable.
${header?`  PERFORM create_top_${s}.\n`:''}
ENDFORM.

${ddic?'':`FORM check_input .

  DATA lv_valid TYPE c LENGTH 1.

* 화면에서 편집 중인 값을 GT_DATA로 먼저 반영
  CALL METHOD gcl_grid->check_changed_data
    IMPORTING
      e_valid = lv_valid.

  CHECK lv_valid = 'X'.

  LOOP AT gt_data INTO gs_data WHERE sel = 'X'.
    IF gs_data-amount < 0.
      MESSAGE '선택 행의 금액을 확인하세요.' TYPE 'S' DISPLAY LIKE 'E'.
      RETURN.
    ENDIF.
  ENDLOOP.

  MESSAGE '선택 행 검사 완료' TYPE 'S'.
  PERFORM refresh_grid.

ENDFORM.

FORM handle_hotspot USING ps_row TYPE lvc_s_roid.

  READ TABLE gt_data INTO gs_data INDEX ps_row-row_id.

  IF sy-subrc = 0.
    MESSAGE |전표번호: { gs_data-belnr }| TYPE 'I'.
  ENDIF.

ENDFORM.
`}
${header?`*&---------------------------------------------------------------------*
*& Form CREATE_TOP_${s}
*&---------------------------------------------------------------------*
FORM create_top_${s} .

  DATA : lv_total TYPE i,
         lv_debit  TYPE i,
         lv_credit TYPE i.

  IF gcl_document IS NOT BOUND.
    CREATE OBJECT gcl_document.
  ENDIF.

* 이전 안내 내용을 초기화
  CALL METHOD gcl_document->initialize_document.

  lv_total = lines( gt_data ).

  LOOP AT gt_data INTO gs_data.
    CASE gs_data-shkzg.
      WHEN 'S'.
        lv_debit = lv_debit + 1.
      WHEN 'H'.
        lv_credit = lv_credit + 1.
    ENDCASE.
  ENDLOOP.

* 제목 · 날짜
  CALL METHOD gcl_document->add_text
    EXPORTING
      text         = |조회 결과 / { sy-datum DATE = ISO }|
      sap_emphasis = cl_dd_document=>strong.

  CALL METHOD gcl_document->new_line.

* 조회 결과 요약
  CALL METHOD gcl_document->add_text
    EXPORTING
      text = |전체: { lv_total }건 / 차변: { lv_debit }건 / 대변: { lv_credit }건|.

  CALL METHOD gcl_document->display_document
    EXPORTING
      reuse_control = 'X'
      parent        = gcl_top
    EXCEPTIONS
      html_display_error = 1
      OTHERS             = 2.

  IF sy-subrc <> 0.
    MESSAGE '상단 요약 표시 실패' TYPE 'I'.
  ENDIF.

ENDFORM.`:''}`;
 return [
 f(p+'.abap',`REPORT ${p}.
INCLUDE ${p}_top.
${ddic?'':`INCLUDE ${p}_c01.`}

START-OF-SELECTION.
  PERFORM set_init.
  CALL SCREEN '${s}'.

INCLUDE ${p}_o01.
INCLUDE ${p}_i01.
INCLUDE ${p}_f01.`,'SE38 · 실행 프로그램'),
 f(p+'_top.abap',`${ddic?`DATA : gt_data TYPE STANDARD TABLE OF ${t},
       gs_data TYPE ${t}.`:`TYPE-POOLS icon.

PARAMETERS : pa_bukrs TYPE bkpf-bukrs OBLIGATORY,
             pa_belnr TYPE bkpf-belnr OBLIGATORY,
             pa_gjahr TYPE bkpf-gjahr OBLIGATORY.

DATA : BEGIN OF gs_data,
         sel       TYPE c LENGTH 1,
         icon      TYPE icon_d,
         belnr     TYPE bkpf-belnr,
         shkzg     TYPE bseg-shkzg,
         amount    TYPE bseg-wrbtr,
         waers     TYPE tcurc-waers,
         text      TYPE c LENGTH 30,
         style     TYPE lvc_t_styl,
         cellcolor TYPE lvc_t_scol,
       END OF gs_data,
       gt_data LIKE TABLE OF gs_data.`}

DATA : gt_fcat    TYPE lvc_t_fcat,
       gs_fcat    TYPE lvc_s_fcat,
       gs_layout  TYPE lvc_s_layo,
       gs_stable  TYPE lvc_s_stbl,
       gv_okcode  TYPE sy-ucomm,
       gv_ucomm   TYPE sy-ucomm.

DATA : gcl_grid      TYPE REF TO cl_gui_alv_grid,
       gcl_container TYPE REF TO cl_gui_custom_container${header?',':'.'}
${header?`       gcl_top       TYPE REF TO cl_gui_custom_container,
       gcl_document  TYPE REF TO cl_dd_document.`:''}`,'TOP · DATA/LIKE 선언'),
 ...(!ddic?[f(p+'_c01.abap',`CLASS lcl_event_handler DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS handle_hotspot
      FOR EVENT hotspot_click OF cl_gui_alv_grid
      IMPORTING e_row_id e_column_id es_row_no.
ENDCLASS.

CLASS lcl_event_handler IMPLEMENTATION.
  METHOD handle_hotspot.
    CHECK e_column_id-fieldname = 'BELNR'.
    PERFORM handle_hotspot USING es_row_no.
  ENDMETHOD.
ENDCLASS.`,'C01 · 이벤트 → FORM')]:[]),
 f(p+'_o01.abap',`MODULE status_${s} OUTPUT.

  SET PF-STATUS 'S${s}'.

  IF gcl_grid IS NOT BOUND.
    PERFORM create_alv_${s}.
  ENDIF.
${header?`  PERFORM create_top_${s}.\n`:''}
ENDMODULE.`,'O01 · PBO'),
 f(p+'_i01.abap',`MODULE exit_${s} INPUT.

  IF gcl_grid IS BOUND.
    CALL METHOD gcl_grid->free.
  ENDIF.

  IF gcl_container IS BOUND.
    CALL METHOD gcl_container->free.
  ENDIF.
${header?`
  IF gcl_top IS BOUND.
    CALL METHOD gcl_top->free.
  ENDIF.

  CLEAR : gcl_top, gcl_document.
`:''}
  CLEAR : gcl_grid, gcl_container, gv_okcode.
  LEAVE TO SCREEN 0.

ENDMODULE.

MODULE user_command_${s} INPUT.

  gv_ucomm = gv_okcode.
  CLEAR gv_okcode.

  CASE gv_ucomm.
    WHEN 'REFRESH'.
      PERFORM refresh_grid.
${ddic?'':`    WHEN 'CHECK'.
      PERFORM check_input.`}
  ENDCASE.

ENDMODULE.`,'I01 · PAI'),
 f(p+'_f01.abap',forms,'F01 · MAKE_FCAT / CREATE_ALV'+(header?' / CREATE_TOP':'')),
 f('screen_'+s+'.flow.abap',`PROCESS BEFORE OUTPUT.
  MODULE status_${s}.

PROCESS AFTER INPUT.
  MODULE exit_${s} AT EXIT-COMMAND.
  MODULE user_command_${s}.`,'SE51 · Flow Logic'),
 f('00_README.txt',`Standard ABAP 7.40 SP08 이상 / SAP GUI / SAP 실컴파일·실행 미검증.
${spec?.description|| (header?'사용자 CREATE_TOP 패턴: CL_DD_DOCUMENT를 직접 채워 GCL_TOP에 표시합니다. Grid 이벤트 TOP_OF_PAGE나 클래식 리스트 TOP-OF-PAGE와 별개입니다.':'사용자 MAKE_FCAT 패턴: SET_FCAT에서 5개 인자를 넘기고 MAKE_FCAT에서 VALUE + CASE로 열 속성을 지정합니다.')}
SE38: 실행 프로그램 및 TOP/F01/O01/I01${ddic?'':'/C01'} Include 활성화.
SE51: 화면 ${s}, 다음 화면 ${s}, OK Code 필드 GV_OKCODE. Custom Control ${ctrl}${header?' 및 별도의 상단 Custom Control GCL_TOP':''} 생성. 두 컨트롤은 겹치지 않게 배치.
SE41: GUI Status S${s}. BACK/EXIT/CANC는 기능 유형 E. REFRESH${ddic?'':', CHECK'}는 일반 기능으로 추가.
${ddic?`SE11: 활성 테이블 ${o.table}, 실제 키 ${o.key} 확인. 수동 카탈로그는 SCARR/T001의 대표 필드를 제공하며 다른 테이블은 지정한 키부터 시작합니다. 필요한 필드는 SET_FCAT의 PERFORM 목록에 추가하세요.`:'SE11: 표준 ICON_D, BKPF-BELNR, BSEG-WRBTR, TCURC-WAERS, LVC_T_STYL, LVC_T_SCOL 사용. 사용자 DDIC 생성은 필요 없습니다. 입력한 전표를 BKPF/BSEG 전체 키로 조회합니다. 메모리 편집 예제이며 DB는 변경하지 않습니다.'}
F8 → 화면 표시 → 체크박스/금액 편집 → CHECK → REFRESH → F3.
전체 프로그램 탭은 Include만 펼칩니다. SE51 Flow Logic은 별도 화면에 넣으세요.`,'Screen·DDIC·적용 순서')
 ];
}
