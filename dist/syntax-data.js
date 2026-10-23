const notion = id => `https://app.notion.com/p/${id}`;
const lecture = 'https://github.com/sherlock0105/ABAP-STUDY/blob/master/ZC505_SUB_10/zc505rlect13/zc505rlect13.html';
const exam = 'https://github.com/sherlock0105/ABAP-STUDY/blob/master/ZC505_SUB_10/zc505rexam02/zc505rexam02_f01.html';
const official = 'https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md';
const scarr = `DATA: ls_scarr TYPE scarr,
      lt_scarr TYPE STANDARD TABLE OF scarr WITH DEFAULT KEY.
SELECT * FROM scarr INTO TABLE lt_scarr.`;
const rows = `DATA: BEGIN OF ls_item,
        bukrs TYPE bkpf-bukrs,
        shkzg TYPE bseg-shkzg,
        wrbtr TYPE bseg-wrbtr,
        waers TYPE bkpf-waers,
      END OF ls_item,
      lt_item LIKE TABLE OF ls_item,
      lt_selected LIKE TABLE OF ls_item.
lt_item = VALUE #(
  ( bukrs = '1000' shkzg = 'S' wrbtr = 100 waers = 'KRW' )
  ( bukrs = '1000' shkzg = 'H' wrbtr = 100 waers = 'KRW' ) ).`;
function topic(id, group, title, summary, oldCode, newCode, setup, notes, source = lecture, sourceName = 'GitHub · 신문법 수업') {
  return {id, group, title, summary, oldCode, newCode, setup, notes, sources:[{name:sourceName,url:source},{name:'SAP · 공식 문법 참고',url:official}]};
}
export const syntaxTopics = [
  topic('inline','선언·생성','DATA → DATA( ) 인라인 선언','타입이 정해지는 위치에서 선언과 대입을 함께 한다.',
`DATA ls_airline TYPE scarr.
READ TABLE lt_scarr INTO ls_airline INDEX 1.
IF sy-subrc = 0.
  WRITE / ls_airline-carrname.
ENDIF.`,
`READ TABLE lt_scarr INTO DATA(ls_airline) INDEX 1.
IF sy-subrc = 0.
  WRITE / ls_airline-carrname.
ENDIF.`,scarr,
['READ 자체의 성공 여부는 여전히 sy-subrc로 판단한다. DATA( )만 붙여도 인라인 선언이다.','DATA(lv_text) = VALUE #( ... )처럼 추론할 타입이 없으면 #을 쓸 수 없다. 명시적인 타입이나 이미 선언된 대상을 사용한다.','인라인 DATA는 일반적인 IF 블록 전용 변수가 아니다. 같은 FORM·메서드에서 같은 이름을 다시 선언하지 않는다.']),
  topic('read','행 읽기','READ TABLE → 테이블 표현식 [ ]','한 행이나 필드를 표현식 안에서 직접 읽는다.',
`READ TABLE lt_scarr INTO ls_scarr
  WITH KEY carrid = 'AA'.
IF sy-subrc = 0.
  WRITE / ls_scarr-carrname.
ELSE.
  WRITE / '항공사 없음'.
ENDIF.`,
`TRY.
    DATA(lv_name) = lt_scarr[ carrid = 'AA' ]-carrname.
    WRITE / lv_name.
  CATCH cx_sy_itab_line_not_found.
    WRITE / '항공사 없음'.
ENDTRY.`,scarr,
['[ ]로 읽을 때 행이 없으면 CX_SY_ITAB_LINE_NOT_FOUND 예외가 발생한다.','표현식은 sy-subrc를 설정하지 않는다. 직전 문장의 sy-subrc로 성공 여부를 판단하면 안 된다.','정렬한 STANDARD TABLE을 [ ]로 읽는다고 자동 이진 검색되지 않는다. 성능을 위해 SORTED·HASHED 키를 설계한다.'],notion('354a6b8522df8029b934f100ea3ceb53'),'Notion · LINE_EXISTS·테이블 표현식'),
  topic('exists','행 읽기','TRANSPORTING NO FIELDS → line_exists','값은 필요 없고 존재 여부만 확인할 때 사용한다.',
`READ TABLE lt_scarr WITH KEY carrid = 'AA'
  TRANSPORTING NO FIELDS.
IF sy-subrc = 0.
  WRITE / '존재함'.
ENDIF.`,
`IF line_exists( lt_scarr[ carrid = 'AA' ] ).
  WRITE / '존재함'.
ENDIF.`,scarr,
['line_exists는 존재 여부만 반환한다. 행을 반환하거나 sy-subrc·sy-tabix를 설정하지 않는다.','행의 내용까지 필요하면 READ TABLE ASSIGNING 또는 VALUE ... OPTIONAL을 검토한다. 존재 확인 후 다시 읽으면 검색을 두 번 한다.'],notion('354a6b8522df8029b934f100ea3ceb53'),'Notion · 존재 확인'),
  topic('optional','행 읽기','READ + CLEAR → VALUE ... OPTIONAL','행이 없을 때 초기값을 받아 예외 없이 읽는다.',
`CLEAR ls_scarr.
READ TABLE lt_scarr INTO ls_scarr
  WITH KEY carrid = 'AA'.
IF sy-subrc <> 0.
  CLEAR ls_scarr.
ENDIF.`,
`ls_scarr = VALUE #(
  lt_scarr[ carrid = 'AA' ] OPTIONAL ).`,scarr,
['행이 없으면 결과는 해당 타입의 초기값이다. 기존 ls_scarr 값도 덮어쓴다.','OPTIONAL 결과가 INITIAL이라고 항상 미조회는 아니다. 실제 행 자체가 초기값일 수 있다. 존재와 내용을 구분해야 하면 READ 또는 line_exists를 쓴다.','값이 없을 때 별도 기본값이 필요하면 OPTIONAL 대신 DEFAULT를 사용할 수 있다.']),
  topic('index','행 읽기','READ INDEX → [ index ]','선택한 행 번호로 읽는 방식도 표현식으로 바꿀 수 있다.',
`DATA lv_index TYPE i VALUE 1.
CLEAR ls_scarr.
READ TABLE lt_scarr INTO ls_scarr INDEX lv_index.
IF sy-subrc <> 0.
  CLEAR ls_scarr.
ENDIF.`,
`DATA(lv_index) = 1.
ls_scarr = VALUE #( lt_scarr[ lv_index ] OPTIONAL ).`,scarr,
['STANDARD·SORTED TABLE의 테이블 인덱스 예제다. HASHED TABLE에는 기본 테이블 인덱스가 없다.','ALV에서 전달받은 행 번호를 사용할 때는 소계 행 등을 제외하고 원본 ITAB의 올바른 인덱스인지 확인한다.']),
  topic('value','선언·생성','CLEAR + 필드 대입 → VALUE','구조체에 넣을 값을 한 번에 보여준다.',
`CLEAR ls_scarr.
ls_scarr-carrid = 'ZZ'.
ls_scarr-carrname = 'Training Air'.
ls_scarr-currcode = 'KRW'.`,
`ls_scarr = VALUE #(
  carrid   = 'ZZ'
  carrname = 'Training Air'
  currcode = 'KRW' ).`,scarr,
['BASE가 없으면 지정하지 않은 필드는 초기화된다. 단순한 일부 필드 수정과는 동작이 다르다.','ALV의 gs_layout, gs_stable, gs_fcat 설정에도 같은 방식으로 적용할 수 있다.']),
  topic('base','선언·생성','APPEND → VALUE #( BASE ... )','기존 테이블의 행을 유지하면서 새 행을 추가한다.',
`CLEAR ls_scarr.
ls_scarr-carrid = 'ZZ'.
ls_scarr-carrname = 'Training Air'.
APPEND ls_scarr TO lt_scarr.`,
`lt_scarr = VALUE #( BASE lt_scarr
  ( carrid = 'ZZ' carrname = 'Training Air' ) ).`,scarr,
['BASE를 빼면 새 결과로 테이블 전체를 교체한다. 기존 행 추가와 구분한다.','APPEND VALUE #( ... ) TO lt_scarr.도 가능하다. 반복문에서 한 행씩 추가할 때는 APPEND가 더 읽기 쉬울 수 있다.','SORTED·HASHED TABLE의 유일 키가 중복되면 키 관련 예외를 고려해야 한다.']),
  topic('corresponding','매핑·변환','MOVE-CORRESPONDING → CORRESPONDING','같은 이름의 필드를 매핑하되 기존 값 유지 여부를 명시한다.',
`" 나머지 대상 필드는 유지
MOVE-CORRESPONDING ls_source TO ls_target.`,
`" MOVE-CORRESPONDING처럼 나머지 대상 값 유지
ls_target = CORRESPONDING #(
  BASE ( ls_target ) ls_source ).

" 새 결과 구성: 나머지 대상 필드는 초기화
" ls_target = CORRESPONDING #( ls_source ).`,
`DATA: BEGIN OF ls_source,
        carrid TYPE scarr-carrid,
      END OF ls_source,
      ls_target TYPE scarr.
ls_source-carrid = 'AA'.
ls_target-carrname = '유지할 이름'.`,
['구조체 MOVE-CORRESPONDING은 겹치지 않는 대상 필드를 유지한다. 기본 CORRESPONDING 표현식은 새 결과를 만들어 초기화한다.','이름이 다른 필드는 MAPPING target = source로 연결한다. 원하는 필드만 옮기는 목적을 먼저 정한다.'],notion('2c2a6b8522df80859c9fc7f53e77a8cf'),'Notion · MOVE-CORRESPONDING'),
  topic('for','반복·집계','LOOP + APPEND → FOR ... IN','원본을 순회해서 새로운 테이블을 만든다.',
`CLEAR lt_selected.
LOOP AT lt_item INTO ls_item.
  IF ls_item-shkzg = 'S'.
    APPEND ls_item TO lt_selected.
  ENDIF.
ENDLOOP.`,
`lt_selected = VALUE #(
  FOR ls_row IN lt_item
  WHERE ( shkzg = 'S' )
  ( ls_row ) ).`,rows,
['FOR는 VALUE·REDUCE 같은 표현식 안에서 쓴다. 단독 반복 명령문이 아니다.','새 테이블 생성에 적합하다. 메시지·검증·메서드 호출 등 처리 흐름이 복잡하면 LOOP가 명확하다.','새 테이블에 복사하므로 원본 lt_item은 바뀌지 않는다. FOR ... IN은 JavaScript의 for-in과 다른 ABAP 문법이다.'],lecture,'GitHub 수업 기반 · FOR IN 보완 예제'),
  topic('for-mapping','반복·집계','LOOP 매핑 → FOR + CORRESPONDING','선택·변환·매핑을 한 흐름으로 읽는다.',
`CLEAR lt_selected.
LOOP AT lt_item INTO ls_item WHERE shkzg = 'S'.
  ls_item-bukrs = '2000'.
  APPEND ls_item TO lt_selected.
ENDLOOP.`,
`lt_selected = VALUE #(
  FOR ls_row IN lt_item WHERE ( shkzg = 'S' )
  ( VALUE #( BASE ls_row bukrs = '2000' ) ) ).`,rows,
['한 행을 그대로 복사한 다음 회사코드만 바꾼다. 원본은 유지된다.','다른 구조로 옮길 때는 행 표현식에 CORRESPONDING 대상타입( ls_row )를 사용할 수 있다.','길게 중첩되면 중간 변수 또는 LOOP로 나눈다. 짧아진 코드가 항상 읽기 쉬운 코드는 아니다.']),
  topic('assigning','반복·집계','LOOP INTO + MODIFY → ASSIGNING','원본 행을 수정할 목적이라면 Field Symbol이 직접적이다.',
`LOOP AT lt_item INTO ls_item.
  ls_item-bukrs = '2000'.
  MODIFY lt_item FROM ls_item
    INDEX sy-tabix TRANSPORTING bukrs.
ENDLOOP.`,
`LOOP AT lt_item ASSIGNING FIELD-SYMBOL(<ls_item>).
  <ls_item>-bukrs = '2000'.
ENDLOOP.`,rows,
['ASSIGNING 자체는 인라인 선언 이전부터 있던 기능이다. FIELD-SYMBOL( ) 인라인 선언을 함께 비교했다.','필드 심볼은 원본 행을 가리킨다. MODIFY가 필요 없다. SORTED·HASHED TABLE의 기본 키 필드는 직접 수정하지 않는다.','원본 수정은 ASSIGNING, 새 결과 생성은 FOR IN으로 구분하면 선택이 쉽다.'],exam,'GitHub · 신문법 ALV 실습'),
  topic('reduce','반복·집계','누적 LOOP → REDUCE','여러 행을 하나의 합계로 줄인다.',
`DATA lv_total TYPE decfloat34.
CLEAR lv_total.
LOOP AT lt_item INTO ls_item WHERE shkzg = 'S'.
  lv_total = lv_total + ls_item-wrbtr.
ENDLOOP.`,
`DATA(lv_total) = REDUCE decfloat34(
  INIT lv_sum = CONV decfloat34( 0 )
  FOR ls_row IN lt_item WHERE ( shkzg = 'S' )
  NEXT lv_sum = lv_sum + ls_row-wrbtr ).`,rows,
['INIT은 누적 변수의 시작값, FOR는 대상 순회, NEXT는 매 반복의 계산식이다.','예제는 동일 통화 KRW만 더한다. 실제 전표 금액은 회사코드·통화 등 합산 기준을 먼저 나눈다.','집계 후 사용 목적에 맞는 금액 타입으로 변환한다. DB 집계가 가능하면 SQL SUM도 검토한다.'],lecture,'GitHub 학습 흐름 기반 · REDUCE 보완 예제'),
  topic('cond','조건·문자열','IF 대입 → COND','조건에 따라 하나의 값을 결정한다.',
`DATA lv_text TYPE string.
IF ls_item-shkzg = 'S'.
  lv_text = '차변'.
ELSEIF ls_item-shkzg = 'H'.
  lv_text = '대변'.
ELSE.
  lv_text = '미정'.
ENDIF.`,
`DATA(lv_text) = COND string(
  WHEN ls_item-shkzg = 'S' THEN '차변'
  WHEN ls_item-shkzg = 'H' THEN '대변'
  ELSE '미정' ).`,rows,
['값 하나를 산출하는 조건에 적합하다. 여러 문장을 실행해야 하면 IF를 유지한다.','ELSE를 생략하면 어떤 조건도 맞지 않을 때 결과 타입의 초기값이 된다.']),
  topic('switch','조건·문자열','CASE 대입 → SWITCH','한 기준값을 여러 고정값과 비교한다.',
`DATA lv_text TYPE string.
CASE ls_item-shkzg.
  WHEN 'S'. lv_text = '차변'.
  WHEN 'H'. lv_text = '대변'.
  WHEN OTHERS. lv_text = '미정'.
ENDCASE.`,
`DATA(lv_text) = SWITCH string( ls_item-shkzg
  WHEN 'S' THEN '차변'
  WHEN 'H' THEN '대변'
  ELSE '미정' ).`,rows,
['같은 기준값의 동등 비교는 SWITCH, 범위·복합 조건은 COND를 사용한다.','필드 값을 바꾸는 것이 아니라 새 결과를 계산하는 표현식이다.']),
  topic('string','조건·문자열','CONCATENATE → | 문자열 템플릿 |','문자와 변수, 형식 변환을 한 문장에 작성한다.',
`DATA: lv_text TYPE string,
      lv_bukrs TYPE bkpf-bukrs VALUE '1000',
      lv_belnr TYPE bkpf-belnr VALUE '0000000123'.
CONCATENATE '회사코드' lv_bukrs '전표' lv_belnr
  INTO lv_text SEPARATED BY space.`,
`DATA: lv_bukrs TYPE bkpf-bukrs VALUE '1000',
      lv_belnr TYPE bkpf-belnr VALUE '0000000123'.
DATA(lv_text) = |회사코드 { lv_bukrs } 전표 { lv_belnr }|.
" 표시할 때 앞의 0 제거
DATA(lv_display) = |전표 { lv_belnr ALPHA = OUT }|.`, '',
['중괄호 안의 공백을 포함해 { 변수 } 형태로 쓴다. 템플릿 안 일반 공백은 출력 문자열에 반영된다.','ALPHA = OUT은 표시 형식 변환이다. DDIC 내부 키 값 자체를 바꿔 저장하는 용도로 혼동하지 않는다.'],notion('2f5a6b8522df8011bf6cc1828bbf1977'),'Notion · 문자열 결합·변환'),
  topic('sql','SQL·객체','SELECT → @DATA + 쉼표','호스트 변수와 SQL 필드를 분명히 구분한다.',
`DATA: lt_airline TYPE STANDARD TABLE OF scarr,
      lv_id TYPE scarr-carrid VALUE 'AA'.
SELECT * FROM scarr INTO TABLE lt_airline
  WHERE carrid = lv_id.`,
`DATA lv_id TYPE scarr-carrid VALUE 'AA'.
SELECT carrid, carrname, currcode
  FROM scarr
  WHERE carrid = @lv_id
  INTO TABLE @DATA(lt_airline).`, '',
['@는 ABAP 호스트 변수 표기, DATA( )는 인라인 선언이다. 역할이 서로 다르다.','신 예제는 필요한 필드만 조회하므로 결과 행의 구조는 SELECT *와 다르다. 비교할 때 조회 컬럼도 확인한다.','ABAP 7.40 계열부터 기능별 SP에 따라 도입됐다. 전체 예제를 같은 최소 버전으로 간주하지 않는다.']),
  topic('itab-join','SQL·객체','FOR ALL ENTRIES → JOIN @itab','선택 키 목록을 SQL의 데이터 소스로 연결한다.',
`IF lt_key IS NOT INITIAL.
  SELECT * FROM scarr INTO TABLE lt_result
    FOR ALL ENTRIES IN lt_key
    WHERE carrid = lt_key-carrid.
ENDIF.`,
`SELECT a~carrid, a~carrname, a~currcode, a~url, a~mandt
  FROM scarr AS a
  INNER JOIN @lt_key AS k ON k~carrid = a~carrid
  INTO CORRESPONDING FIELDS OF TABLE @lt_result.`,
`DATA: BEGIN OF ls_key,
        carrid TYPE scarr-carrid,
      END OF ls_key,
      lt_key LIKE TABLE OF ls_key,
      lt_result TYPE STANDARD TABLE OF scarr.
lt_key = VALUE #( ( carrid = 'AA' ) ( carrid = 'DL' ) ).
SORT lt_key BY carrid.
DELETE ADJACENT DUPLICATES FROM lt_key COMPARING carrid.
CLEAR lt_result.`,
['FROM @itab은 ABAP 7.52+ 기능이다. DB로 내부 테이블을 전달하는 JOIN은 DB·FDA 지원 등 시스템 조건을 확인한다.','FAE에서 키 테이블이 비면 WHERE가 무시될 수 있다. INITIAL 방어가 필수다. INNER JOIN은 키가 비면 결과도 비게 된다.','JOIN은 중복 키로 결과가 늘 수 있다. FAE의 중복 제거와 결과가 같도록 키와 조회 컬럼을 설계한다.','현업 시스템 버전과 개발 규칙이 허용할 때 적용한다. 모든 FAE를 기계적으로 바꾸지 않는다.']),
  topic('new','SQL·객체','CREATE OBJECT → NEW','객체 생성도 대입 표현식으로 작성한다.',
`DATA gcl_grid TYPE REF TO cl_gui_alv_grid.
CREATE OBJECT gcl_grid
  EXPORTING i_parent = cl_gui_container=>screen0.`,
`DATA(gcl_grid) = NEW cl_gui_alv_grid(
  i_parent = cl_gui_container=>screen0 ).`, '',
['컨테이너 생성과 화면 수명 관리는 그대로 필요하다. 이 코드는 객체 생성 방식의 비교이며 독립 ALV 전체 프로그램은 아니다.','PBO에서 매번 NEW로 재생성하지 않는다. IF gcl_grid IS NOT BOUND.로 최초 생성 여부를 제어한다.','기존 gcl_ 네이밍과 FORM/PERFORM 구성에서도 신문법을 부분 적용할 수 있다.'],exam,'GitHub · ALV 객체 생성 실습')
];

export const practiceNotes = [
 {title:'원본 행을 바꿀까, 새 테이블을 만들까?',text:'ALV 편집 행에 표시를 남기는 작업은 LOOP ASSIGNING. 선택한 행만 별도 저장 테이블로 구성하는 작업은 VALUE + FOR IN. 결과를 어디에 반영하는지부터 결정한다.',topics:['assigning','for','for-mapping']},
 {title:'마스터가 없을 수 있다면?',text:'존재만 확인하면 line_exists. 값이 필요하고 미조회는 초기값으로 처리하면 OPTIONAL. 미조회와 초기값인 실제 행을 구분해야 하면 READ TABLE의 sy-subrc를 확인한다.',topics:['exists','optional','read']},
 {title:'FCAT·Layout부터 바꿔보기',text:'gs_layout = VALUE #( zebra = abap_true cwidth_opt = abap_true ).처럼 필드 대입부터 바꿔본다. 기존 일부 필드를 유지할 때는 BASE를 넣는다. 조건 검증이 긴 LOOP까지 한 번에 줄일 필요는 없다.',topics:['value','base','cond']}
];
