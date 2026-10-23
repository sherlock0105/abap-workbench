export const filterMultiCode=`FORM filter_multi USING pv_ucomm TYPE sy-ucomm.

  DATA lt_filter TYPE lvc_t_filt.

  CHECK pa_multi = abap_true.
  CHECK gcl_grid IS BOUND.

  CASE pv_ucomm.
    WHEN 'VIEW_ALL'.
      CLEAR lt_filter.

    WHEN 'VIEW_DONE'.
      lt_filter = VALUE #( fieldname = 'ICON' sign = 'I' option = 'EQ'
                           ( low = icon_led_green ) ).

    WHEN 'VIEW_WAIT'.
      lt_filter = VALUE #( fieldname = 'ICON' sign = 'I' option = 'EQ'
                           ( low = icon_led_inactive )
                           ( low = space ) ).

    WHEN 'VIEW_ERROR'.
      lt_filter = VALUE #( fieldname = 'ICON' sign = 'I' option = 'EQ'
                           ( low = icon_led_red )
                           ( low = icon_led_yellow ) ).

    WHEN OTHERS.
      RETURN.
  ENDCASE.

* 인식한 보기 명령에서만 체크 표시 해제
  LOOP AT gt_multi ASSIGNING FIELD-SYMBOL(<fs_multi>).
    CLEAR <fs_multi>-sel.
  ENDLOOP.

  gcl_grid->set_filter_criteria( it_filter = lt_filter ).
  PERFORM refresh_grid.

ENDFORM.`;
export const filterTop=`TYPE-POOLS icon.

* 기존 프로그램에 이미 있다면 중복 선언하지 않음
PARAMETERS pa_multi AS CHECKBOX DEFAULT 'X'.
TYPES: BEGIN OF ty_multi,
         sel  TYPE abap_bool,
         icon TYPE icon_d,
         text TYPE c LENGTH 40,
       END OF ty_multi.
DATA gt_multi TYPE STANDARD TABLE OF ty_multi WITH DEFAULT KEY.
DATA gcl_grid TYPE REF TO cl_gui_alv_grid.

* 표준 필터 저장·복원 예제에만 필요
DATA: gt_saved_filter TYPE lvc_t_filt,
      gv_filter_saved TYPE abap_bool.`;
export const filterSnapshotCode=`FORM save_grid_filter.
  CHECK gcl_grid IS BOUND.

  gcl_grid->get_filter_criteria(
    IMPORTING et_filter = gt_saved_filter ).
  gv_filter_saved = abap_true.
ENDFORM.

FORM restore_grid_filter.
  CHECK gcl_grid IS BOUND.
  CHECK gv_filter_saved = abap_true.

  gcl_grid->set_filter_criteria( it_filter = gt_saved_filter ).
  PERFORM refresh_grid.
ENDFORM.

FORM refresh_grid.
  DATA ls_stable TYPE lvc_s_stbl.

  CHECK gcl_grid IS BOUND.
  ls_stable-row = abap_true.
  ls_stable-col = abap_true.

  gcl_grid->refresh_table_display( is_stable = ls_stable ).
ENDFORM.`;
const fence=code=>'```abap\n'+code+'\n```';
const body=`## 적용 위치·버전
Standard ABAP 7.40 SP08 이상 / SAP GUI CL_GUI_ALV_GRID 기준입니다. 이미 생성·표시된 GCL_GRID와 실제 출력 테이블 GT_MULTI에 연결하는 통합 예제입니다. 아래 TOP 선언은 구조 계약을 보여주며, 기존 선언과 중복해서 추가하지 마세요. Grid 생성부터 필요한 경우 생성기의 MAKE_FCAT 또는 ALV Toolbar 전체 예제를 먼저 사용하세요. 이 문서는 단독 실행 리포트가 아닙니다.

## 먼저 구분할 점 · SAP 공식 사용 범위
보내주신 LVC_T_FILT 직접 조립 패턴의 반복 부분을 정리한 코드입니다. SAP 공식 문서는 필터 테이블을 직접 조립하지 말고 GET_FILTER_CRITERIA 또는 레이아웃에서 얻은 조건을 SET_FILTER_CRITERIA로 적용하도록 안내합니다. 따라서 아래 직접 조립판을 표준 권장 방식으로 분류하지 않습니다. 실제 릴리스와 필드카탈로그에서 결과를 확인하거나 아래 저장·복원 방식을 사용하세요.

[SAP SET_FILTER_CRITERIA 공식 문서](https://help.sap.com/saphelp_autoid2007/helpdata/en/0a/b5532ad30911d2b467006094192fe3/content.htm?no_cache=true)

## 보기 조건 · 사용자 패턴의 의도
- VIEW_ALL: 필터 전체 해제. 사용자가 다른 열에 걸어둔 필터도 해제합니다.
- VIEW_DONE: 녹색 아이콘.
- VIEW_WAIT: 비활성 아이콘 또는 공백.
- VIEW_ERROR: 빨강 또는 노랑. 노랑을 별도 경고 상태로 관리한다면 버튼명을 오류·경고로 표시하세요.
- ICON은 출력 테이블의 실제 필드명입니다. ICON_D 값과 필드카탈로그 ICON 표시 설정을 확인하세요. 임의 문자열·가공된 표시 텍스트를 아이콘 내부값 대신 사용하지 않습니다.

## TOP · 선언과 필드 계약
${fence(filterTop)}

## F01 · FILTER_MULTI 정리판
같은 행의 FIELDNAME/SIGN/OPTION은 VALUE의 기본 구성요소로 묶었습니다. WHEN OTHERS의 RETURN을 선택 초기화보다 먼저 두어, 관련 없는 명령으로 필터와 체크가 지워지는 일을 막습니다. PA_MULTI 미선택 또는 Grid 미생성 상태에서는 처리하지 않습니다.

${fence(filterMultiCode)}

## Toolbar USER_COMMAND에서 연결
아래는 기존 LCL_EVENTS의 메서드 본문에 넣을 내용입니다. 선언과 SET HANDLER는 ALV Toolbar 전체 예제에 있습니다. SE41 일반 버튼이라면 I01의 OK Code 처리 CASE에서 같은 PERFORM을 호출합니다. PARAMETER 화면에서 PA_MULTI를 변경할 때는 프로그램 재실행 흐름을 사용합니다.

${fence(`METHOD on_command.
  CASE e_ucomm.
    WHEN 'VIEW_ALL' OR 'VIEW_DONE' OR 'VIEW_WAIT' OR 'VIEW_ERROR'.
      PERFORM filter_multi USING e_ucomm.
  ENDCASE.
ENDMETHOD.`)}

## 공식 문서에 맞춘 필터 저장·복원 + 스크롤 유지
사용자가 표준 ALV 필터 대화상자에서 조건을 설정한 뒤 SAVE_FILTER 버튼에서 PERFORM SAVE_GRID_FILTER를 호출하고, 복원 버튼에서 RESTORE_GRID_FILTER를 호출합니다. 빈 필터도 유효한 저장 상태이므로 별도 플래그로 저장 여부를 구분합니다. 상태별 프리셋은 각 레이아웃 또는 별도 저장본으로 관리하며 사용자별 레이아웃 저장 설정과 구분하세요. 기존 REFRESH_GRID가 있으면 아래 FORM을 중복 추가하지 말고 IS_STABLE 처리를 병합합니다.

${fence(filterSnapshotCode)}

## 선택·편집·다른 열 필터 주의
GT_MULTI-SEL을 지우는 것은 업무 체크박스 값 초기화입니다. ALV에서 파랗게 선택한 행의 선택 해제와는 다릅니다. 실제 행 선택도 지우려면 아래 호출을 FILTER_MULTI의 LOOP 뒤에 추가하세요.

${fence(`DATA lt_row_no TYPE lvc_t_roid.
gcl_grid->set_selected_rows( it_row_no = lt_row_no ).`)}

편집 가능한 Grid는 이 FORM을 호출하기 전에 CHECK_CHANGED_DATA로 편집 버퍼를 반영하고 E_VALID를 검사하세요. 그렇지 않으면 아직 화면 버퍼에 남은 체크박스 값이 재반영될 수 있습니다. DATA_CHANGED 안에서 재귀 호출하지 않습니다. 현재 코드는 기존 동작처럼 다른 열 필터까지 교체하며, 다른 열을 보존하는 기능은 포함하지 않습니다. 실제 오류 재처리는 표시 중인 행 번호만 믿지 말고 고유키로 대상 행을 확인해야 합니다.

## 검증 순서
정상 상태별 행과 공백 상태를 준비한 뒤 4개 버튼의 표시 행을 비교합니다. 알 수 없는 명령에서는 필터·SEL이 유지되어야 합니다. PA_MULTI 미선택·Grid 미생성·빈 목록도 확인합니다. 다른 열에 필터를 설정한 후 VIEW_ALL로 모두 해제되는지 확인합니다. UI 행 선택과 SEL 체크박스를 각각 테스트합니다. SAP 실컴파일·실행은 미검증입니다.
`;
export const filterDocument={id:'learn-alv-status-filter',title:'ALV 상태 필터 — FILTER_MULTI · 전체·완료·대기·오류',summary:'VIEW_ALL/DONE/WAIT/ERROR 정리, 선택 해제·스크롤 유지, GET_FILTER_CRITERIA 저장·복원과 공식 사용 범위.',body,text:body,category:'ALV 표시·편집',source:'학습 문서',track:'ABAP',format:'markdown',recipe:false,path:'실무 통합 예제 / ALV 상태 필터',url:'https://sherlock0105.github.io/abap-workbench/#docs/learn-alv-status-filter',events:['USER_COMMAND','TOOLBAR'],search:(body+' ALV 필터 filter_multi VIEW_ALL VIEW_DONE VIEW_WAIT VIEW_ERROR get_filter_criteria set_filter_criteria').normalize('NFKC').toLowerCase()};
