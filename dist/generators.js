import {generateInitialization,initializationRecipes} from './initialization-recipes.js';
import {dataStyleFiles} from './code-tools.js';
import {generateStyleRecipe} from './style-recipes.js';
import {generateStyleAlv,fcatRecipes} from './style-alv.js';
import {isExtended,generateExtended} from './extended-generators.js';
const file = (name, code, where) => ({name,code:code.trim()+ '\n',where});
export const defaults = {program:'ZALV_SCARR',table:'SCARR',key:'CARRID',screen:'0100',entity:'Travel',prefix:'Z',split:true,mode:'managed',objectPrefix:'gcl_',screenField:'GV_VALUE',container:'CC_ALV'};
export function validate(o, kind){
  const errors=[];
  if(fcatRecipes.some(r=>r.kind===kind)){
    if(!/^\d{4}$/.test(o.screen))errors.push('화면 번호는 숫자 4자리입니다.');
    if(!/^[A-Z][A-Z0-9_]{0,29}$/i.test(o.container))errors.push('컨테이너 이름을 확인하세요.');
    if(!/^[A-Z][A-Z0-9_]{0,15}$/i.test(o.table)||!/^[A-Z][A-Z0-9_]{0,29}$/i.test(o.key))errors.push('DDIC 테이블·키 이름을 확인하세요.');
  }
  if(kind==='rap'){
    if(!/^[A-Za-z][A-Za-z0-9_]{0,12}$/.test(o.entity)) errors.push('엔티티는 영문으로 시작하는 1~13자의 영문·숫자·밑줄로 입력하세요. (테이블명 길이 제한)');
    if(!/^[ZY]$/.test(o.prefix)) errors.push('네임스페이스는 Z 또는 Y를 사용하세요.');
  } else {
    if(!/^[ZY][A-Z0-9_]{0,33}$/i.test(o.program)) errors.push('프로그램은 Z/Y로 시작하는 1~34자의 영문·숫자·밑줄로 입력하세요.');
    if(['alv','f4','sql'].includes(kind) && !/^[A-Z][A-Z0-9_]{0,15}$/i.test(o.table)) errors.push('테이블명은 영문으로 시작하는 1~16자의 영문·숫자·밑줄로 입력하세요.');
    if(['alv','f4','sql'].includes(kind) && !/^[A-Z][A-Z0-9_]{0,29}$/i.test(o.key)) errors.push('키 필드명은 영문으로 시작하는 1~30자의 영문·숫자·밑줄로 입력하세요.');
    if((kind==='alv'||isExtended(kind))&&!/^\d{4}$/.test(o.screen)) errors.push('화면 번호는 숫자 4자리로 입력하세요.');
  }
  if(isExtended(kind)){
    if(!/^[A-Z][A-Z0-9_]{0,15}$/i.test(o.table)) errors.push('DDIC 테이블명은 1~16자입니다.');
    if(!/^[A-Z][A-Z0-9_]{0,29}$/i.test(o.key)) errors.push('필드명을 확인하세요.');
    if(!/^[A-Z][A-Z0-9_]{0,29}(?:-[A-Z][A-Z0-9_]{0,29})?$/i.test(o.screenField)||/^(GV_(BUKRS|KOKRS|OKCODE)|GC_SCREEN)(?:-|$)/i.test(o.screenField)) errors.push('화면 필드는 GV_VALUE 등 다른 변수와 겹치지 않는 이름을 사용하세요.');
    if(!/^[A-Z][A-Z0-9_]{0,29}$/i.test(o.container)) errors.push('컨테이너 이름을 확인하세요.');
    if(['crud','db-create','db-update','db-delete'].includes(kind)&&/^(MANDT|DESCRIPTION)$/i.test(o.key)) errors.push('업무키는 MANDT / DESCRIPTION과 다른 이름이어야 합니다.');
  }
  return errors;
}
export function generate(kind,input={}){
 const o={...defaults,...input};
 for(const key of ['program','table','key','screenField','container']) o[key]=String(o[key]).toUpperCase();
 const errors=validate(o,kind);if(errors.length)throw new Error(errors.join('\n'));
 let files=generateStyleRecipe(kind,o)||generateStyleAlv(kind,o)||(kind==='alv-top-event'?generateExtended('alv-top',o):initializationRecipes.some(r=>r.kind===kind)?generateInitialization(kind,o):isExtended(kind)?generateExtended(kind,o):kind==='rap'?rap(o):kind==='bdc'?bdc(o):kind==='f4'?f4(o):kind==='sql'?sql(o):alv(o));
 if(o.objectPrefix==='go_') files=files.map(f=>({...f,code:f.code.replace(/\bgcl_/g,'go_')}));
 return dataStyleFiles(files).sort((a,b)=>Number(/\.txt$/i.test(a.name))-Number(/\.txt$/i.test(b.name)));
}
function alv(o){
 const p=o.program.toLowerCase(),t=o.table.toLowerCase(),k=o.key.toLowerCase(),s=o.screen;
 const top=`*&---------------------------------------------------------------------*
*& TOP : 전역 데이터 / ALV 객체
*&---------------------------------------------------------------------*
TABLES : ${t}.
DATA : gt_data   TYPE STANDARD TABLE OF ${t},
       gs_data   TYPE ${t},
       gv_okcode TYPE sy-ucomm.
DATA : gcl_container TYPE REF TO cl_gui_docking_container,
       gcl_grid      TYPE REF TO cl_gui_alv_grid.
DATA : gt_fcat    TYPE lvc_t_fcat,
       gs_layout  TYPE lvc_s_layo,
       gs_variant TYPE disvariant,
       gs_stable  TYPE lvc_s_stbl.`;
 const selection=`*& 조회조건 (TEXT-t01: 조회 조건)
SELECTION-SCREEN BEGIN OF BLOCK bl1 WITH FRAME TITLE TEXT-t01.
  SELECT-OPTIONS : so_key FOR ${t}-${k}.
  PARAMETERS : pa_max TYPE i DEFAULT 500 OBLIGATORY.
SELECTION-SCREEN END OF BLOCK bl1.`;
 const events=`AT SELECTION-SCREEN.
  IF pa_max < 1 OR pa_max > 10000.
    MESSAGE '조회 건수는 1~10,000으로 입력하세요.' TYPE 'E'.
  ENDIF.

START-OF-SELECTION.
  PERFORM get_data.
  IF gt_data IS INITIAL.
    MESSAGE '조회된 데이터가 없습니다.' TYPE 'S'.
    RETURN.
  ENDIF.
  CALL SCREEN '${s}'.`;
 const output=`MODULE status_${s} OUTPUT.
  SET PF-STATUS 'S${s}'.
  SET TITLEBAR  'T${s}'.
  IF gcl_container IS NOT BOUND.
    PERFORM set_fcat_layout.
    PERFORM display_list.
  ENDIF.
ENDMODULE.`;
 const input=`MODULE exit_${s} INPUT.
  CLEAR gv_okcode.
  IF gcl_grid IS BOUND.
    gcl_grid->free( ).
  ENDIF.
  IF gcl_container IS BOUND.
    gcl_container->free( ).
  ENDIF.
  CLEAR : gcl_grid, gcl_container.
  LEAVE TO SCREEN 0.
ENDMODULE.

MODULE user_command_${s} INPUT.
  DATA lv_ucomm TYPE sy-ucomm.
  lv_ucomm = gv_okcode.
  CLEAR gv_okcode.
  CASE lv_ucomm.
    WHEN 'REFRESH'.
      PERFORM get_data.
      PERFORM refresh_grid.
  ENDCASE.
ENDMODULE.`;
 const forms=`*&---------------------------------------------------------------------*
*& FORM get_data : 조회조건에 맞는 데이터 가져오기
*&---------------------------------------------------------------------*
FORM get_data .
  SELECT * FROM ${t}
    WHERE ${k} IN @so_key
    ORDER BY PRIMARY KEY
    INTO TABLE @gt_data
    UP TO @pa_max ROWS.
ENDFORM.

FORM set_fcat_layout .
  CLEAR : gt_fcat, gs_layout.
  CALL FUNCTION 'LVC_FIELDCATALOG_MERGE'
    EXPORTING
      i_structure_name = '${o.table.toUpperCase()}'
    CHANGING
      ct_fieldcat      = gt_fcat
    EXCEPTIONS
      inconsistent_interface = 1
      program_error          = 2
      OTHERS                 = 3.
  IF sy-subrc <> 0.
    MESSAGE '필드 카탈로그 생성 실패: DDIC 구조를 확인하세요.' TYPE 'A'.
  ENDIF.
  gs_layout-zebra      = 'X'.
  gs_layout-cwidth_opt = 'A'.
  gs_layout-sel_mode   = 'D'.
  gs_variant-report   = sy-repid.
  gs_stable-row       = 'X'.
  gs_stable-col       = 'X'.
ENDFORM.

FORM display_list .
  CREATE OBJECT gcl_container
    EXPORTING
      repid     = sy-repid
      dynnr     = sy-dynnr
      side      = cl_gui_docking_container=>dock_at_left
      extension = 5000.
  CREATE OBJECT gcl_grid
    EXPORTING i_parent = gcl_container.

  gcl_grid->set_table_for_first_display(
    EXPORTING
      is_layout       = gs_layout
      is_variant      = gs_variant
      i_save          = 'A'
    CHANGING
      it_outtab       = gt_data
      it_fieldcatalog = gt_fcat ).
ENDFORM.

FORM refresh_grid .
  IF gcl_grid IS BOUND.
    gcl_grid->refresh_table_display(
      EXPORTING is_stable = gs_stable ).
  ENDIF.
ENDFORM.`;
 const flow=`PROCESS BEFORE OUTPUT.
  MODULE status_${s}.

PROCESS AFTER INPUT.
  MODULE exit_${s} AT EXIT-COMMAND.
  MODULE user_command_${s}.`;
 return o.split ? [
  file(p+'.abap',`REPORT ${p}.\n\nINCLUDE ${p}_top.\nINCLUDE ${p}_s01.\n\n${events}\n\nINCLUDE ${p}_o01.\nINCLUDE ${p}_i01.\nINCLUDE ${p}_f01.`,'SE38 · 실행 프로그램'),
  file(p+'_top.abap',top,'SE38 · Include'),file(p+'_s01.abap',selection,'SE38 · Include'),file(p+'_o01.abap',output,'SE38 · Include'),file(p+'_i01.abap',input,'SE38 · Include'),file(p+'_f01.abap',forms,'SE38 · Include'),file('screen_'+s+'.flow.abap',flow,'SE80 · 화면 Flow Logic')
 ]:[file(p+'.abap',`REPORT ${p}.\n\n${top}\n\n${selection}\n\n${events}\n\n${output}\n\n${input}\n\n${forms}`,'SE38 · 실행 프로그램'),file('screen_'+s+'.flow.abap',flow,'SE80 · 화면 Flow Logic')];
}
function f4(o){const t=o.table.toLowerCase(),k=o.key.toLowerCase();return [file(o.program.toLowerCase()+'.abap',`REPORT ${o.program.toLowerCase()}.

PARAMETERS pa_key TYPE ${t}-${k}.

AT SELECTION-SCREEN ON VALUE-REQUEST FOR pa_key.
  PERFORM f4_key.

FORM f4_key .
  DATA : lt_values TYPE STANDARD TABLE OF ${t}.

  SELECT * FROM ${t}
    ORDER BY PRIMARY KEY
    INTO TABLE @lt_values
    UP TO 500 ROWS.

  IF lt_values IS INITIAL.
    MESSAGE '선택할 데이터가 없습니다.' TYPE 'I'.
    RETURN.
  ENDIF.

  CALL FUNCTION 'F4IF_INT_TABLE_VALUE_REQUEST'
    EXPORTING
      retfield    = '${o.key.toUpperCase()}'
      dynpprog    = sy-repid
      dynpnr      = sy-dynnr
      dynprofield = 'PA_KEY'
      value_org   = 'S'
    TABLES
      value_tab   = lt_values
    EXCEPTIONS
      parameter_error = 1
      no_values_found = 2
      OTHERS          = 3.
  IF sy-subrc <> 0.
    MESSAGE 'F4 호출 실패: 반환 필드와 화면 필드를 확인하세요.' TYPE 'I'.
  ENDIF.
ENDFORM.`,'SE38 · 실행 프로그램')];}
function sql(o){const t=o.table.toLowerCase(),k=o.key.toLowerCase();return [file(o.program.toLowerCase()+'.abap',`REPORT ${o.program.toLowerCase()}.
TABLES : ${t}.
DATA : gt_data TYPE STANDARD TABLE OF ${t},
       gcl_salv TYPE REF TO cl_salv_table.
SELECT-OPTIONS : so_key FOR ${t}-${k}.

START-OF-SELECTION.
  PERFORM get_data.
  IF gt_data IS INITIAL.
    MESSAGE '조회된 데이터가 없습니다.' TYPE 'S'.
    RETURN.
  ENDIF.
  TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = gcl_salv
        CHANGING t_table = gt_data ).
      gcl_salv->display( ).
    CATCH cx_salv_msg INTO DATA(lx_error).
      MESSAGE lx_error->get_text( ) TYPE 'I'.
  ENDTRY.

FORM get_data .
  SELECT * FROM ${t}
    WHERE ${k} IN @so_key
    ORDER BY PRIMARY KEY
    INTO TABLE @gt_data
    UP TO 500 ROWS.
ENDFORM.`,'SE38 · 실행 프로그램')];}
function bdc(o){return [file(o.program.toLowerCase()+'.abap',`REPORT ${o.program.toLowerCase()}.
*& SHDB 녹화 내용을 build_recording에 추가한 뒤 테스트하세요.
DATA : gt_bdcdata TYPE STANDARD TABLE OF bdcdata,
       gs_bdcdata TYPE bdcdata,
       gt_messtab TYPE STANDARD TABLE OF bdcmsgcoll,
       gs_messtab TYPE bdcmsgcoll,
       gs_param   TYPE ctu_params.
PARAMETERS : pa_tcode TYPE sy-tcode OBLIGATORY.

START-OF-SELECTION.
  PERFORM build_recording.
  IF gt_bdcdata IS INITIAL.
    MESSAGE 'SHDB 녹화 화면과 필드 매핑을 먼저 추가하세요.' TYPE 'I'.
    RETURN.
  ENDIF.
  gs_param-dismode = 'A'. " 모든 화면 표시: 테스트 후 변경
  gs_param-updmode = 'S'. " 동기 업데이트
  gs_param-defsize = 'X'.
  CALL TRANSACTION pa_tcode WITH AUTHORITY-CHECK
    USING gt_bdcdata
    OPTIONS FROM gs_param
    MESSAGES INTO gt_messtab.
  DATA(lv_subrc) = sy-subrc.
  WRITE : / 'CALL TRANSACTION 결과:', lv_subrc.
  LOOP AT gt_messtab INTO gs_messtab.
    MESSAGE ID gs_messtab-msgid TYPE 'S'
      NUMBER gs_messtab-msgnr
      WITH gs_messtab-msgv1 gs_messtab-msgv2
           gs_messtab-msgv3 gs_messtab-msgv4
      INTO DATA(lv_message).
    WRITE : / gs_messtab-msgtyp, lv_message.
  ENDLOOP.

FORM build_recording .
  CLEAR gt_bdcdata.
  " TODO: SHDB에서 복사한 프로그램/화면/필드 순서대로 작성
  " PERFORM make_bdcdata USING 'X' 'SAP_PROGRAM' '0100'.
  " PERFORM make_bdcdata USING ' ' 'FIELD_NAME'  'VALUE'.
  " PERFORM make_bdcdata USING ' ' 'BDC_OKCODE' '=SAVE'.
ENDFORM.

FORM make_bdcdata USING pv_begin pv_fnam pv_fval.
  CLEAR gs_bdcdata.
  IF pv_begin = 'X'.
    gs_bdcdata-dynbegin = 'X'.
    gs_bdcdata-program  = pv_fnam.
    gs_bdcdata-dynpro   = pv_fval.
  ELSE.
    gs_bdcdata-fnam = pv_fnam.
    gs_bdcdata-fval = pv_fval.
  ENDIF.
  APPEND gs_bdcdata TO gt_bdcdata.
ENDFORM.`,'SE38 · 실행 프로그램 (녹화 매핑 필요)')];}
function rap(o){
 const n=o.entity.toUpperCase(),z=o.prefix,t=`${z.toLowerCase()}t_${n.toLowerCase()}`,r=`${z}R_${n}`,c=`${z}C_${n}`,bp=`${z.toLowerCase()}bp_r_${n.toLowerCase()}`,sd=`${z}UI_${n}`,managed=o.mode==='managed';
 const fields=`  key uuid as Uuid,
      name as Name,
      @Semantics.user.createdBy: true
      created_by as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by as LastChangedBy,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt`;
 const files=[file(t+'.tabl.asddl',`@EndUserText.label: '${o.entity} 데이터'
@AbapCatalog.enhancement.category: #NOT_EXTENSIBLE
@AbapCatalog.tableCategory: #TRANSPARENT
@AbapCatalog.deliveryClass: #A
@AbapCatalog.dataMaintenance: #RESTRICTED
define table ${t} {
  key client            : abap.clnt not null;
  key uuid              : sysuuid_x16 not null;
  name                  : abap.char(80);
  created_by            : abp_creation_user;
  created_at            : abp_creation_tstmpl;
  last_changed_by       : abp_locinst_lastchange_user;
  local_last_changed_at : abp_locinst_lastchange_tstmpl;
}`,'ADT · Database Table'),file(r+'.ddls',`@EndUserText.label: '${o.entity} Root'
@AccessControl.authorizationCheck: #NOT_REQUIRED
// 학습용: 운영 적용 시 DCL과 권한 검사를 설계하세요.
define root view entity ${r}
  as select from ${t}
{
${fields}
}`,'ADT · Data Definition')];
 if(managed) files.push(file(r+'.bdef',`managed implementation in class ${bp} unique;
strict ( 2 );

define behavior for ${r} alias ${o.entity}
persistent table ${t}
lock master
authorization master ( none ) // 학습용. 운영 시 권한 구현 필요
etag master LocalLastChangedAt
{
  create;
  update;
  delete;
  field ( numbering : managed, readonly ) Uuid;
  field ( mandatory ) Name;
  field ( readonly ) CreatedBy, CreatedAt,
                     LastChangedBy, LocalLastChangedAt;
  mapping for ${t}
  {
    Uuid = uuid;
    Name = name;
    CreatedBy = created_by;
    CreatedAt = created_at;
    LastChangedBy = last_changed_by;
    LocalLastChangedAt = local_last_changed_at;
  }
}`,'ADT · Root Behavior Definition'),file(bp+'.clas.abap',`CLASS ${bp} DEFINITION PUBLIC ABSTRACT FINAL
  FOR BEHAVIOR OF ${r}.
ENDCLASS.

CLASS ${bp} IMPLEMENTATION.
ENDCLASS.`,'ADT · Behavior Pool (BDEF Quick Fix로 생성)'));
 files.push(file(c+'.ddls',`@EndUserText.label: '${o.entity} Projection'
@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
define root view entity ${c}
  provider contract transactional_query
  as projection on ${r}
{
  key Uuid,
      Name,
      CreatedBy,
      CreatedAt,
      LastChangedBy,
      LocalLastChangedAt
}`,'ADT · Data Definition'));
 if(managed)files.push(file(c+'.bdef',`projection;
strict ( 2 );

define behavior for ${c} alias ${o.entity}
use etag
{
  use create;
  use update;
  use delete;
}`,'ADT · Projection Behavior Definition'));
 files.push(file(c+'.ddlx',`@Metadata.layer: #CORE
@UI.headerInfo: {
  typeName: '${o.entity}',
  typeNamePlural: '${o.entity} 목록',
  title: { type: #STANDARD, value: 'Name' }
}
annotate entity ${c} with
{
  @UI.facet: [{ id: 'General', type: #IDENTIFICATION_REFERENCE,
                label: '기본 정보', position: 10 }]
  @UI.hidden: true
  Uuid;

  @UI.lineItem: [{ position: 10, label: '이름' }]
  @UI.identification: [{ position: 10, label: '이름' }]
  @UI.selectionField: [{ position: 10 }]
  Name;

  @UI.hidden: true
  CreatedBy;
  @UI.hidden: true
  CreatedAt;
  @UI.hidden: true
  LastChangedBy;
  @UI.hidden: true
  LocalLastChangedAt;
}`,'ADT · Metadata Extension'),file(sd+'.srvd',`@EndUserText.label: '${o.entity} 서비스'
define service ${sd} {
  expose ${c} as ${o.entity};
}`,'ADT · Service Definition'),file('ACTIVATION_ORDER.txt',`대상: 최신 ABAP Platform / SAP BTP ABAP Environment의 ADT

1. ${t} (Database Table) 생성·활성화
2. ${r} (Root View Entity) 생성·활성화
${managed?`3. ${r} BDEF 작성 → Quick Fix로 ${bp} Behavior Pool 생성 → 둘 다 활성화
4. ${c} Projection → Projection BDEF 순서로 활성화`:`3. ${c} Projection 활성화`}
5. ${c} Metadata Extension 활성화
6. ${sd} Service Definition 활성화
7. ADT에서 Service Binding 생성 (코드 파일이 아닌 Repository Object)
   ${managed?'OData V4 - Web API: 비 Draft CRUD API로 테스트. Fiori 편집 UI는 별도 Draft 모델 구성이 필요합니다.':'OData V4 - UI: Publish → 엔티티 선택 → Fiori Elements Preview.'}
8. Publish하고 조회${managed?'·생성·수정·삭제':''} 확인

학습용 골격입니다. 운영 권한, 업무 검증, Draft 및 기존 DB 필드 매핑은 포함하지 않습니다.
SAP 시스템의 릴리스·사용 가능한 타입·CDS 문법을 ADT에서 확인하세요.
읽기 전용은 데이터가 있어야 목록이 보입니다. SAP 컴파일·실행은 미검증입니다.`,'적용 가이드 · ADT'));
 return files;
}
