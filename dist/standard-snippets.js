// Standard-table examples: no invented rows; SELECT is executed in the user's SAP system.
const company=`SELECT bukrs, butxt, waers
  FROM t001
  INTO TABLE @DATA(lt_t001).`;
const oneCompany=`SELECT SINGLE bukrs, butxt, waers
  FROM t001
  WHERE bukrs = @pa_bukrs
  INTO @DATA(ls_t001).

IF sy-subrc <> 0.
  MESSAGE '회사코드를 확인하세요.' TYPE 'I'.
  RETURN.
ENDIF.`;
const accounts=`SELECT bukrs, saknr, xspeb, xloeb
  FROM skb1
  WHERE bukrs = @pa_bukrs
  ORDER BY PRIMARY KEY
  INTO TABLE @DATA(lt_skb1)
  UP TO 200 ROWS.`;
const document=`SELECT SINGLE waers
  FROM bkpf
  WHERE bukrs = @pa_bukrs
    AND belnr = @pa_belnr
    AND gjahr = @pa_gjahr
  INTO @DATA(lv_waers).

IF sy-subrc <> 0.
  MESSAGE '회사코드·전표번호·회계연도를 확인하세요.' TYPE 'I'.
  RETURN.
ENDIF.

SELECT buzei, hkont, shkzg, wrbtr
  FROM bseg
  WHERE bukrs = @pa_bukrs
    AND belnr = @pa_belnr
    AND gjahr = @pa_gjahr
  INTO TABLE @DATA(lt_bseg).`;
const entries=[];
function add(kind,title,description,query,body){entries.push({kind,title,description,core:[query,body].filter(Boolean).join('\n\n')});}
const r=(id,title,desc,q,b)=>add('read-'+id,title,desc,q,b);
const l=(id,title,desc,q,b)=>add('loop-'+id,title,desc,q,b);
const n=(id,title,desc,q,b)=>add('modern-'+id,title,desc,q,b);

r('index','INDEX · 조회 결과의 첫 행','T001 회사코드 목록에서 첫 행을 읽습니다.\nSTANDARD/SORTED TABLE용입니다. 조회 순서가 필요하면 ORDER BY를 지정하세요.',company,`READ TABLE lt_t001 INTO DATA(ls_t001) INDEX 1.

IF sy-subrc = 0.
  WRITE: / ls_t001-bukrs, ls_t001-butxt.
ENDIF.`);
r('key','WITH KEY · 회사코드로 찾기','T001 조회 결과에서 입력한 회사코드를 찾습니다.\nPA_BUKRS는 회사코드 입력값입니다. READ 직후 SY-SUBRC를 확인합니다.',company,`READ TABLE lt_t001 INTO DATA(ls_t001)
  WITH KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  WRITE: / ls_t001-butxt, ls_t001-waers.
ELSE.
  MESSAGE '회사코드가 없습니다.' TYPE 'I'.
ENDIF.`);
r('exists','TRANSPORTING NO FIELDS · 회사코드 존재 확인','이미 조회한 회사코드 목록에서 존재 여부만 검사합니다.\nPA_BUKRS는 입력값입니다. 값 복사 없이 READ 직후 SY-SUBRC로 판단합니다.',company,`READ TABLE lt_t001 TRANSPORTING NO FIELDS
  WITH KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  MESSAGE '등록된 회사코드입니다.' TYPE 'S'.
ELSE.
  MESSAGE '회사코드를 확인하세요.' TYPE 'I'.
ENDIF.`);
r('assign','ASSIGNING · 회사명 표시 형식 변경','조회한 회사코드 행을 직접 참조해 회사명을 대문자로 바꿉니다.\n메모리의 조회 결과만 변경합니다. DB 변경은 별도 UPDATE가 필요합니다.',company,`READ TABLE lt_t001 ASSIGNING FIELD-SYMBOL(<fs_t001>)
  WITH KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  TRANSLATE <fs_t001>-butxt TO UPPER CASE.
ENDIF.`);
r('binary','BINARY SEARCH · G/L 계정 찾기','회사코드별 SKB1 계정 목록에서 입력한 계정을 찾습니다.\nBUKRS → SAKNR 오름차순 정렬이 필수입니다. 예제 조회는 최대 200건입니다.',accounts,`SORT lt_skb1 BY bukrs saknr.

READ TABLE lt_skb1 INTO DATA(ls_skb1)
  WITH KEY bukrs = pa_bukrs
           saknr = pa_saknr
  BINARY SEARCH.

IF sy-subrc = 0.
  WRITE: / ls_skb1-saknr, ls_skb1-xspeb.
ENDIF.`);
r('sorted','SORTED TABLE · 회사코드 키 조회','T001을 BUKRS 키로 정렬 관리하는 테이블에 조회합니다.\n정렬 테이블의 키를 직접 바꾸지 마세요. 별도 SORT 없이 키 조회가 가능합니다.',`DATA lt_t001 TYPE SORTED TABLE OF t001 WITH UNIQUE KEY bukrs.

SELECT * FROM t001 INTO TABLE @lt_t001.`,`READ TABLE lt_t001 INTO DATA(ls_t001)
  WITH TABLE KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  WRITE / ls_t001-butxt.
ENDIF.`);
r('hashed','HASHED TABLE · 회사코드 캐시','여러 곳에서 반복 조회할 회사코드 목록을 해시 테이블로 만듭니다.\n유일 키 전체를 지정합니다. HASHED TABLE은 INDEX로 읽을 수 없습니다.',`DATA lt_t001 TYPE HASHED TABLE OF t001 WITH UNIQUE KEY bukrs.

SELECT * FROM t001 INTO TABLE @lt_t001.`,`READ TABLE lt_t001 INTO DATA(ls_t001)
  WITH TABLE KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  WRITE / ls_t001-waers.
ENDIF.`);
r('tabix','SY-TABIX → MODIFY · 회사명 반영','INTO로 읽은 작업영역을 바꾼 뒤 같은 인덱스에 반영합니다.\n다른 READ/LOOP 전에 SY-TABIX를 보관합니다. DB 변경은 수행하지 않습니다.',company,`READ TABLE lt_t001 INTO DATA(ls_t001) WITH KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  DATA(lv_index) = sy-tabix.
  TRANSLATE ls_t001-butxt TO UPPER CASE.

  MODIFY lt_t001 FROM ls_t001 INDEX lv_index
    TRANSPORTING butxt.
ENDIF.`);
r('optional','VALUE OPTIONAL · 회사코드 조회','회사코드가 없어도 예외 없이 초기 구조를 받습니다.\nABAP 7.40 SP08+. 초기값과 미존재를 구별해야 하면 READ를 사용하세요.',company,`DATA ls_t001 LIKE LINE OF lt_t001.

ls_t001 = VALUE #( lt_t001[ bukrs = pa_bukrs ] OPTIONAL ).
WRITE: / ls_t001-bukrs, ls_t001-butxt.`);
r('exception','[ ] · 회사코드 미존재 예외','회사코드가 반드시 있어야 하는 처리에서 누락을 분기합니다.\n테이블 표현식은 SY-SUBRC를 설정하지 않습니다. 미존재 예외를 처리하세요.',company,`TRY.
    DATA(ls_t001) = lt_t001[ bukrs = pa_bukrs ].
    WRITE / ls_t001-butxt.

  CATCH cx_sy_itab_line_not_found.
    MESSAGE '회사코드가 없습니다.' TYPE 'I'.
ENDTRY.`);
r('reference','REFERENCE INTO · 회사코드 행 참조','회사코드 행을 데이터 참조로 받아 표시용 값을 수정합니다.\n행 삭제 후 참조를 사용하지 마세요. 메모리 결과에만 반영됩니다.',company,`READ TABLE lt_t001 REFERENCE INTO DATA(lr_t001)
  WITH KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  TRANSLATE lr_t001->butxt TO UPPER CASE.
ENDIF.`);
r('line-index','LINE_EXISTS / LINE_INDEX · 존재·위치','회사코드의 존재 여부와 내부테이블 위치를 표현식으로 확인합니다.\nSY-SUBRC/SY-TABIX를 바꾸지 않습니다. HASH 키의 LINE_INDEX는 -1입니다.',company,`IF line_exists( lt_t001[ bukrs = pa_bukrs ] ).
  DATA(lv_index) = line_index( lt_t001[ bukrs = pa_bukrs ] ).
  WRITE: / '회사코드 위치:', lv_index.
ENDIF.`);

l('into','LOOP INTO · 회사코드 목록 출력','T001에서 조회한 회사코드·회사명·통화를 순서대로 읽습니다.\nINTO 작업영역을 변경해도 원본 테이블에는 자동 반영되지 않습니다.',company,`LOOP AT lt_t001 INTO DATA(ls_t001).
  WRITE: / ls_t001-bukrs, ls_t001-butxt, ls_t001-waers.
ENDLOOP.`);
l('assign','LOOP ASSIGNING · 회사명 일괄 정리','조회 결과의 회사명을 대문자로 일괄 변환합니다.\nASSIGNING은 원본 행을 바꾸므로 MODIFY가 필요 없습니다. DB는 변경하지 않습니다.',company,`LOOP AT lt_t001 ASSIGNING FIELD-SYMBOL(<fs_t001>).
  TRANSLATE <fs_t001>-butxt TO UPPER CASE.
ENDLOOP.`);
l('where','WHERE · 같은 통화의 회사코드','조회 결과 중 입력한 통화를 쓰는 회사코드만 처리합니다.\nPA_WAERS는 통화 입력값입니다. 데이터 조회 자체를 줄이려면 SELECT WHERE를 쓰세요.',company,`LOOP AT lt_t001 INTO DATA(ls_t001) WHERE waers = pa_waers.
  WRITE: / ls_t001-bukrs, ls_t001-butxt.
ENDLOOP.`);
l('control','CHECK / CONTINUE / EXIT · 사용 가능 계정','조회한 SKB1 중 삭제·전기차단 표시가 없는 첫 계정을 찾습니다.\n최대 200건 범위의 예제입니다. 이 두 플래그만으로 실제 전기 가능 여부가 확정되지는 않습니다.',accounts,`LOOP AT lt_skb1 INTO DATA(ls_skb1).
  CHECK ls_skb1-xloeb IS INITIAL.

  IF ls_skb1-xspeb = 'X'.
    CONTINUE.
  ENDIF.

  WRITE: / '차단 표시 없는 계정:', ls_skb1-saknr.
  EXIT.
ENDLOOP.`);
l('range','FROM / TO · 정렬된 회사코드 일부','회사코드를 정렬하고 2~10번째 행만 처리합니다.\n내부테이블 인덱스 기준입니다. ALV 화면에서 다시 정렬한 표시 순서와 구분하세요.',company,`SORT lt_t001 BY bukrs.

LOOP AT lt_t001 INTO DATA(ls_t001) FROM 2 TO 10.
  WRITE: / sy-tabix, ls_t001-bukrs, ls_t001-butxt.
ENDLOOP.`);
l('sum','누계 · 실제 전표의 차변 금액 합계','BKPF/BSEG에서 한 전표를 조회하고 차변 항목을 합산합니다.\n회사코드·전표번호·회계연도 입력이 필요합니다. 한 전표의 동일 통화 금액만 더합니다.',document,`DATA lv_total TYPE bseg-wrbtr.
DATA lv_count TYPE i.

LOOP AT lt_bseg INTO DATA(ls_bseg) WHERE shkzg = 'S'.
  lv_total = lv_total + ls_bseg-wrbtr.
  lv_count = lv_count + 1.
ENDLOOP.

WRITE: / '차변 건수:', lv_count,
       / '차변 합계:', lv_total CURRENCY lv_waers, lv_waers.`);
l('delete','DELETE INDEX · 차단 계정 제외','SKB1 조회 결과에서 전기차단된 계정을 메모리 목록에서 지웁니다.\n루프 시작 시 인덱스를 보관합니다. 단순 조건이면 DELETE WHERE가 더 간단합니다.',accounts,`LOOP AT lt_skb1 INTO DATA(ls_skb1).
  DATA(lv_index) = sy-tabix.

  IF ls_skb1-xspeb = 'X'.
    DELETE lt_skb1 INDEX lv_index.
  ENDIF.
ENDLOOP.`);
l('modify','MODIFY TRANSPORTING · 회사명만 변경','INTO로 받은 회사명을 정리하고 그 필드만 결과에 반영합니다.\n다른 키·통화 필드를 덮어쓰지 않습니다. DB UPDATE와는 별개입니다.',company,`LOOP AT lt_t001 INTO DATA(ls_t001).
  DATA(lv_index) = sy-tabix.
  TRANSLATE ls_t001-butxt TO UPPER CASE.

  MODIFY lt_t001 FROM ls_t001 INDEX lv_index
    TRANSPORTING butxt.
ENDLOOP.`);
l('group','GROUP BY · 통화별 회사코드 수','회사코드 목록을 통화별로 묶고 각 그룹의 건수를 셉니다.\nABAP 7.40 SP08+. 그룹 순회 중 원본 테이블을 변경하지 않습니다.',company,`LOOP AT lt_t001 INTO DATA(ls_t001)
  GROUP BY ls_t001-waers INTO DATA(lv_waers).

  DATA(lv_count) = 0.

  LOOP AT GROUP lv_waers INTO DATA(ls_member).
    lv_count = lv_count + 1.
  ENDLOOP.

  WRITE: / lv_waers, lv_count.
ENDLOOP.`);
l('control-break','AT NEW / AT END OF · 통화별 그룹','T001 결과를 통화별로 정렬해 그룹 시작과 끝을 처리합니다.\nSELECT 필드 순서에서 WAERS를 첫 필드로 둡니다. 제어수준은 구조의 왼쪽 필드에도 영향을 받습니다.',`SELECT waers, bukrs, butxt
  FROM t001
  ORDER BY waers, bukrs
  INTO TABLE @DATA(lt_t001).`,`DATA lv_count TYPE i.

LOOP AT lt_t001 INTO DATA(ls_t001).
  AT NEW waers.
    CLEAR lv_count.
  ENDAT.

  lv_count = lv_count + 1.

  AT END OF waers.
    WRITE: / ls_t001-waers, lv_count.
  ENDAT.
ENDLOOP.`);
l('join','중첩 LOOP · 회사코드별 플랜트','T001W와 T001K를 평가영역으로 연결해 회사코드별 플랜트를 읽습니다.\n플랜트의 회사코드를 T001W-BUKRS로 가정하지 않습니다. 대량 처리에서는 정렬 키를 설계하세요.',`${company}

SELECT a~werks, a~name1, b~bukrs
  FROM t001w AS a
  INNER JOIN t001k AS b ON b~bwkey = a~bwkey
  INTO TABLE @DATA(lt_plant).`,`LOOP AT lt_t001 INTO DATA(ls_t001).
  LOOP AT lt_plant INTO DATA(ls_plant) WHERE bukrs = ls_t001-bukrs.
    WRITE: / ls_t001-bukrs, ls_plant-werks, ls_plant-name1.
  ENDLOOP.
ENDLOOP.`);
l('no-fields','TRANSPORTING NO FIELDS · 차단 계정 수','계정 값을 복사하지 않고 차단된 행의 개수만 셉니다.\n최대 200건으로 조회한 결과에 대한 건수입니다. 전체 DB 건수는 SELECT COUNT로 조회하세요.',accounts,`DATA lv_count TYPE i.

LOOP AT lt_skb1 TRANSPORTING NO FIELDS WHERE xspeb = 'X'.
  lv_count = lv_count + 1.
ENDLOOP.

WRITE: / '조회 결과 중 전기차단:', lv_count.`);

n('inline','DATA( ) / FIELD-SYMBOL( ) · 조회·수정','SELECT/READ/LOOP에서 타입이 정해지는 위치에 인라인 선언합니다.\n같은 FORM에서 같은 변수 이름을 다시 선언하지 마세요. 회사명 변경은 메모리에만 반영됩니다.',company,`READ TABLE lt_t001 INTO DATA(ls_t001) WITH KEY bukrs = pa_bukrs.

IF sy-subrc = 0.
  WRITE / ls_t001-butxt.
ENDIF.

LOOP AT lt_t001 ASSIGNING FIELD-SYMBOL(<fs_t001>).
  TRANSLATE <fs_t001>-butxt TO UPPER CASE.
ENDLOOP.`);
n('value','VALUE · 조회 결과를 출력 구조에 담기','T001에서 읽은 값을 표시용 구조에 필요한 필드만 담습니다.\n대상 DATA의 타입에서 #을 추론합니다. 지정하지 않은 필드는 초기화됩니다.',oneCompany,`DATA ls_display LIKE ls_t001.

ls_display = VALUE #( bukrs = ls_t001-bukrs
                      butxt = ls_t001-butxt
                      waers = ls_t001-waers ).

WRITE: / ls_display-bukrs, ls_display-butxt, ls_display-waers.`);
n('base','VALUE BASE · 회사명 표시값만 변경','조회한 회사코드·통화를 유지하면서 회사명 표시 형식만 바꿉니다.\nBASE가 없으면 지정하지 않은 필드가 초기화됩니다. DB 변경은 수행하지 않습니다.',oneCompany,`DATA ls_display LIKE ls_t001.

ls_display = VALUE #( BASE ls_t001
                     butxt = to_upper( ls_t001-butxt ) ).

WRITE: / ls_display-bukrs, ls_display-butxt, ls_display-waers.`);
n('corresponding','CORRESPONDING · 회사코드 출력 필드 매핑','표준 테이블 조회 결과에서 같은 이름의 출력 필드를 복사합니다.\n대상 구조에 없는 원본 필드는 복사하지 않습니다.',oneCompany,`DATA : BEGIN OF ls_display,
         bukrs TYPE t001-bukrs,
         butxt TYPE t001-butxt,
       END OF ls_display.

ls_display = CORRESPONDING #( ls_t001 ).
WRITE: / ls_display-bukrs, ls_display-butxt.`);
n('mapping','MAPPING / EXCEPT · 다른 필드명 연결','조회한 BUKRS/BUTXT를 화면용 CODE/NAME으로 연결합니다.\nMAPPING은 대상 = 원본 순서입니다. EXCEPT는 대상 필드명을 지정합니다.',oneCompany,`DATA : BEGIN OF ls_display,
         code  TYPE t001-bukrs,
         name  TYPE t001-butxt,
         waers TYPE t001-waers,
       END OF ls_display.

ls_display = CORRESPONDING #( ls_t001
                            MAPPING code = bukrs
                                    name = butxt
                            EXCEPT waers ).

WRITE: / ls_display-code, ls_display-name.`);
n('cond','COND · 계정의 전기차단 표시','실제 SKB1 계정을 읽어 전기차단 플래그를 문구로 바꿉니다.\n회사코드·계정이 필요합니다. 표시 플래그만 확인하며 전기 가능 여부의 전체 검증은 아닙니다.',`SELECT SINGLE xspeb
  FROM skb1
  WHERE bukrs = @pa_bukrs AND saknr = @pa_saknr
  INTO @DATA(lv_xspeb).

IF sy-subrc <> 0.
  MESSAGE '회사코드별 계정을 확인하세요.' TYPE 'I'.
  RETURN.
ENDIF.`,`DATA(lv_text) = COND string( WHEN lv_xspeb = 'X' THEN '전기차단'
                            ELSE '전기차단 표시 없음' ).
WRITE / lv_text.`);
n('switch','SWITCH · 전기키의 계정유형 명칭','TBSL의 실제 전기키를 읽고 KOART를 명칭으로 바꿉니다.\nPA_BSCHL은 전기키 입력값입니다. 미정의 유형도 ELSE에서 처리합니다.',`SELECT SINGLE koart
  FROM tbsl
  WHERE bschl = @pa_bschl
  INTO @DATA(lv_koart).

IF sy-subrc <> 0.
  MESSAGE '전기키를 확인하세요.' TYPE 'I'.
  RETURN.
ENDIF.`,`DATA(lv_text) = SWITCH string( lv_koart
                              WHEN 'S' THEN 'G/L 계정'
                              WHEN 'D' THEN '고객'
                              WHEN 'K' THEN '공급업체'
                              WHEN 'A' THEN '자산'
                              WHEN 'M' THEN '자재'
                              ELSE '기타 계정유형' ).
WRITE / lv_text.`);
n('conv','CONV · 전표 금액의 계산 타입 변환','BSEG의 실제 첫 항목 금액을 DECFLOAT34로 변환합니다.\n내부 금액의 계산 타입 변환입니다. 외부 Excel 금액이나 통화 소수 자릿수 변환을 대신하지 않습니다.',document,`READ TABLE lt_bseg INTO DATA(ls_bseg) INDEX 1.

IF sy-subrc = 0.
  DATA(lv_amount) = CONV decfloat34( ls_bseg-wrbtr ).
  WRITE: / lv_amount CURRENCY lv_waers, lv_waers.
ENDIF.`);
n('exact','EXACT · 정수 전송 전 금액 손실 검사','외부 인터페이스가 정수만 받는 경우 실제 전표 금액의 손실을 검사합니다.\n소수 또는 범위 손실이 있으면 예외입니다. 보통 FI 금액을 정수로 바꿔 저장하지 않습니다.',document,`READ TABLE lt_bseg INTO DATA(ls_bseg) INDEX 1.
CHECK sy-subrc = 0.

TRY.
    DATA(lv_integer) = EXACT i( ls_bseg-wrbtr ).
    WRITE / lv_integer.

  CATCH cx_root INTO DATA(lx_error).
    WRITE / lx_error->get_text( ).
ENDTRY.`);
n('template','문자열 템플릿 · 회사코드 조회 메시지','조회한 회사코드·명칭·통화와 기준일을 한 문장으로 표시합니다.\nDATE = ISO는 표시 형식입니다. 금액 출력에는 실제 통화의 CURRENCY 옵션을 적용하세요.',oneCompany,`DATA(lv_text) = |회사코드: { ls_t001-bukrs } / { ls_t001-butxt } / { ls_t001-waers }|.
WRITE / lv_text.
WRITE / |기준일: { sy-datum DATE = ISO }|.`);
n('for','VALUE FOR · 회사코드 출력 목록 만들기','T001 조회 결과를 읽어 회사명을 대문자로 바꾼 별도 목록을 만듭니다.\n원본 조회 결과는 유지됩니다. 긴 업무 로직은 LOOP로 작성하는 편이 읽기 쉽습니다.',company,`DATA lt_display LIKE lt_t001.

lt_display = VALUE #( FOR ls_t001 IN lt_t001
                     ( bukrs = ls_t001-bukrs
                       butxt = to_upper( ls_t001-butxt )
                       waers = ls_t001-waers ) ).`);
n('for-where','FOR WHERE · 통화별 회사코드 추출','T001 결과에서 PA_WAERS 통화를 사용하는 회사코드만 새 목록에 담습니다.\n원본은 바꾸지 않습니다. 처음부터 조회를 제한하려면 SQL WHERE를 사용하세요.',company,`DATA lt_display LIKE lt_t001.

lt_display = VALUE #( FOR ls_t001 IN lt_t001
                     WHERE ( waers = pa_waers )
                     ( ls_t001 ) ).

WRITE: / '회사코드 수:', lines( lt_display ).`);
n('reduce','REDUCE · 실제 전표 차변 합계','한 FI 전표의 BSEG 차변 금액을 하나의 값으로 집계합니다.\nABAP 7.40 SP08+. BKPF 통화로 표시하며 서로 다른 전표·통화를 섞지 않습니다.',document,`DATA(lv_total) = REDUCE wrbtr(
  INIT lv_sum = CONV wrbtr( 0 )
  FOR ls_bseg IN lt_bseg
  WHERE ( shkzg = 'S' )
  NEXT lv_sum = lv_sum + ls_bseg-wrbtr ).

WRITE: / lv_total CURRENCY lv_waers, lv_waers.`);
n('filter','FILTER · 통화 키로 회사코드 추출','통화 정렬 키를 선언하고 해당 통화의 회사코드만 추출합니다.\nABAP 7.40 SP08+. FILTER에는 조건과 맞는 SORTED/HASHED 키가 필요합니다.',`DATA lt_t001 TYPE SORTED TABLE OF t001 WITH NON-UNIQUE KEY waers.
DATA lt_display LIKE lt_t001.

SELECT * FROM t001 INTO TABLE @lt_t001.`,`lt_display = FILTER #( lt_t001 WHERE waers = pa_waers ).
WRITE: / '회사코드 수:', lines( lt_display ).`);
n('let','LET · 회사코드 조회 건수 메시지','실제 T001 조회 건수를 표현식 안의 보조 변수로 사용합니다.\nLET 변수는 이 표현식 안에서만 유효합니다. 반복 계산이 있을 때 짧게 적용하세요.',company,`DATA(lv_text) = COND string(
  LET lv_count = lines( lt_t001 ) IN
  WHEN lv_count > 0 THEN |회사코드 { lv_count }개를 조회했습니다.|
  ELSE '조회된 회사코드가 없습니다.' ).

WRITE / lv_text.`);
n('default','DEFAULT · 미등록 회사코드 표시','조회 결과에 회사코드가 없으면 표시용 기본 문구를 반환합니다.\n기본 문구를 실제 마스터로 저장하지 마세요. 존재 검증과 표시값 보완을 구분합니다.',company,`DATA ls_default LIKE LINE OF lt_t001.
DATA ls_display LIKE LINE OF lt_t001.

ls_default = VALUE #( bukrs = pa_bukrs butxt = '미등록 회사코드' ).
ls_display = VALUE #( lt_t001[ bukrs = pa_bukrs ] DEFAULT ls_default ).

WRITE: / ls_display-bukrs, ls_display-butxt.`);
n('xsdbool','XSDBOOL · 회사코드 존재 플래그','실제 조회 목록의 회사코드 존재 여부를 ABAP_BOOL로 보관합니다.\n문자열을 반환하는 BOOLC와 구분하세요. 존재 여부만 필요하면 LINE_EXISTS를 바로 써도 됩니다.',company,`DATA(lv_exists) = xsdbool( line_exists( lt_t001[ bukrs = pa_bukrs ] ) ).

IF lv_exists = abap_true.
  MESSAGE '등록된 회사코드입니다.' TYPE 'S'.
ENDIF.`);
n('ref','NEW / REF · 조회 건수와 행 참조','T001 조회 건수는 새 데이터 참조에 담고, 조회 행은 기존 데이터 참조로 받습니다.\nNEW는 별도 데이터, REF는 기존 데이터 참조입니다. 참조한 행의 수명을 확인하세요.',company,`DATA(lr_count) = NEW i( lines( lt_t001 ) ).
WRITE: / '조회 건수:', lr_count->*.

READ TABLE lt_t001 INTO DATA(ls_t001) INDEX 1.

IF sy-subrc = 0.
  DATA(lr_company) = REF #( ls_t001 ).
  WRITE / lr_company->butxt.
ENDIF.`);

export const standardSnippets=Object.fromEntries(entries.map(e=>[e.kind,e]));
export const parameterDefinitions={
 pa_bukrs:"PARAMETERS pa_bukrs TYPE t001-bukrs OBLIGATORY.",
 pa_saknr:"PARAMETERS pa_saknr TYPE skb1-saknr OBLIGATORY.",
 pa_waers:"PARAMETERS pa_waers TYPE t001-waers OBLIGATORY.",
 pa_belnr:"PARAMETERS pa_belnr TYPE bkpf-belnr OBLIGATORY.",
 pa_gjahr:"PARAMETERS pa_gjahr TYPE bkpf-gjahr OBLIGATORY.",
 pa_bschl:"PARAMETERS pa_bschl TYPE tbsl-bschl OBLIGATORY."
};
export function snippetParameters(core){return [...new Set(core.match(/\bpa_\w+/g)||[])].map(v=>parameterDefinitions[v]).join('\n');}
