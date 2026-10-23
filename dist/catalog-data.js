import {validationTopics} from './practice-docs.js';
const topic=(id,title,description,match,aliases='')=>({id,title,description,match,aliases});
export const catalogGroups=[
 {id:'field-lab',title:'이번에 보강한 실무 패턴',description:'블로그 30편 대조 · NEWKO·업로드·BDC·AT 전체 코드',technical:'ONF4 · GT_MESSTAB · TRY CATCH · AT NEW',categories:['실무 보강 안내'],topics:[
 topic('map','30편 전체 읽기 지도','추가·보강 문서와 원문 링크','율밥퍼 30개'),
 topic('f4','NEWKO 조건별 F4','전기키 → 고객·공급업체·G/L·자산','NEWKO|ONF4'),
 topic('upload','Excel·예외·검증','원본 행 보존·실제 오류·TRY/CATCH','Excel|GT_MESSTAB|FI BDC'),
 topic('loop','LOOP 전체 FORM과 AT','제어 수준·마지막 그룹·대체 구문','AT NEW|AT NEW / END') ]},
 {id:'deep-syntax',title:'반복·타입·문자열 더 익히기',description:'AT·Offset·RANGE·숫자·필드심볼을 작은 실행 예제로',technical:'AT NEW · NMIN/NMAX · VALUE BASE · ASSIGN',categories:['반복·타입 심화'],topics:[
 topic('loop','그룹 경계와 합계','정렬·작업영역·LOOP 전체 FORM','AT NEW'),
 topic('dynamic','필드심볼·역참조','원본 변경·동적 매핑 실패 방어','필드심볼|ASSIGN COMPONENT|역참조'),
 topic('numbers','숫자·범위','숫자 타입·RANGE·최소/최대','숫자 타입|RANGE —|NMIN'),
 topic('text','문자·Offset·신문법','자르기·공백·타입 추론·분기식','Offset|문자 타입|DATA / VALUE|COND / SWITCH') ]},
 {id:'forms',title:'Smart Forms 출력 만들기',description:'폼·스타일·이미지·바코드·다국어를 출력까지 연결',technical:'SMARTFORMS · SE78 · SE73 · SE63 · SSF',categories:['Smart Forms'],topics:[
 topic('start','폼 구성·호출','페이지·MAIN·인터페이스·드라이버','Smart Forms 전체'),
 topic('style','스타일·다국어','단락·문자 포맷·글꼴·번역 진단','Smart Styles|다국어'),
 topic('graphics','로고·바코드','그래픽 노드·실제 출력·스캔 확인','Smart Forms 이미지|Smart Forms 바코드') ]},
 {id:'validation',title:'유효성 검사',description:'필수값부터 FI 전표·권한까지 12가지 검증 유형',technical:'SY-SUBRC · PAI · DATA_CHANGED · BAPI CHECK',categories:['유효성 검사'],topics:validationTopics},
 {id:'generation',title:'완성 코드 묶음 만들기',description:'F4_ACCOUNT · MAKE_FCAT · TOP-OF-PAGE · CRUD',technical:'TOP F01 I01 O01 Screen DDIC',categories:['생성기 전체 예제'],topics:[
 topic('f4','Dynpro F4 전체 만들기','계정·코스트센터·내부오더·WBS·사용자 필드','F4'),
 topic('alv','ALV와 TOP-OF-PAGE 만들기','카탈로그·툴바·편집·상단요약','ALV|MAKE_FCAT|TOP-OF-PAGE'),
 topic('crud','CREATE / UPDATE / DELETE / CRUD','DB 계약과 트랜잭션·메모리 CRUD','CREATE|UPDATE|DELETE|CRUD'),
 topic('utility','변환·파일·SQL·구조','업로드·다운로드·날짜·금액·FORM·클래스','Popup|파일|날짜|금액|변환|JOIN|RANGES|Class|FORM|Function|권한|FI') ]},
 {id:'f4-text',title:'F4·텍스트 매핑 연결하기',description:'전표유형·세금코드·계정 F4부터 화면과 ALV 설명까지',technical:'Search Help · FIELDVAL · ALPHA · PAI/POV',categories:['F4·텍스트 매핑'],topics:[
 topic('blart','전표유형 SH 연결하기','SE11 ZSH_PDH_BLART · BLART/LTEXT · SPRAS','전표유형 Search Help','T003T IMP EXP 서치헬프'),
 topic('tax','세금코드 SH 연결하기','ZSH_PDH_TAX · MWSKZ/TEXT1 · KALSM','세금코드 Search Help','세금계산절차'),
 topic('account','계정 F4 반환값 고치기','F0001 · FIELDVAL=11010100 · ALPHA 키 비교','계정 F4와 FIELDVAL 진단','F4_ACCOUNT READ TABLE RECORDPOS'),
 topic('mapping','설명을 화면·그리드에 표시하기','GS_INPUT-ACCOUNT_TEXT · 직접 입력 · ALV fieldcat','텍스트 매핑 —','계정명 텍스트 연결 설명') ]},
 {id:'start',title:'ABAP 기초부터 보기',description:'변수와 표를 만들고, 조건·반복문을 쓰는 법',technical:'DATA · TYPES · IF · LOOP',categories:['기초·문법'],topics:[
 topic('setup','개발 도구·프로그램 만들기','SE38·SE80에서 새 프로그램을 만드는 순서','개발환경|프로그램 생성|패키지|단축키|namespace|네임스페이스|이름'),
 topic('variables','변수·타입 선언하기','DATA와 TYPE·LIKE, GS·GT 이름 이해','타입|type|like|data 선언|top 선언|기본 데이터|char|numc|변수','선언 자료형 구조 테이블'),
 topic('conditions','조건문·반복문 쓰기','IF·CASE·LOOP, 반복을 멈추는 위치','조건문|if 문|논리|case|조건부 종료|check|exit|continue|sy-index','분기 반복 중단'),
 topic('modern','짧은 신문법으로 바꾸기','VALUE·FOR·REDUCE·COND·OPTIONAL','신문법|value|for in|reduce|cond|optional','구문법 최신 문법') ]},
 {id:'ddic',title:'테이블·자료형 만들기',description:'DB 테이블, 필드 타입, 입력값 검증을 준비',technical:'SE11 · DDIC · Domain',categories:['DDIC'],topics:[
 topic('table','DB 테이블·키 만들기','필드·기본키·데이터 엘리먼트 설정','테이블 생성|키|pk|dictionary|ddic|data element','저장소 데이터베이스'),
 topic('domain','필드 타입·고정값 정하기','도메인과 데이터 엘리먼트의 역할','도메인|domain|fixed value|데이터 엘리먼트','필드 타입 고정값'),
 topic('structure','구조체·테이블 확장하기','Structure·INCLUDE·Append 구조','structure|구조체|append structure|quan|curr','구조 선언 확장'),
 topic('check','입력값·설명값 연결하기','Check Table·Text Table·Search Help','check table|value table|외래|text table|서치헬프|search help','값 검증 검색 도움말'),
 topic('maintenance','유지보수 화면 만들기','SM30·TMG·View Cluster','tmg|maintenance|view cluster|sm30|se54','테이블 직접 관리 유지보수') ]},
 {id:'itab',title:'내부 테이블 다루기',description:'프로그램 안의 목록을 읽고·추가하고·바꾸기',technical:'ITAB · READ TABLE · Field Symbol',categories:['ITAB·문자열'],topics:[
 topic('declare','목록·한 줄 구조 선언하기','Internal Table과 Work Area 구분','itab 만들기|인터널 테이블|internal table|타입|header line','목록 구조 gs gt 선언'),
 topic('read','원하는 행 찾기','READ TABLE·키·INDEX·LINE_EXISTS','read table|line_exists|존재 확인|이진 검색|binary search','한줄 행 검색 읽기'),
 topic('change','행 추가·수정·삭제·복사','APPEND·INSERT·MODIFY·DELETE 비교','append|modify|insert|삭제|복사|5대 명령어|corresponding','행 복제 변경'),
 topic('sort','정렬·중복 제거·집계','SORT·COLLECT·GROUP BY','sort|중복|collect|집계|group by','합계 정렬'),
 topic('symbol','필드심볼·동적 매핑 쓰기','ASSIGNING·ASSIGN COMPONENT','필드심볼|field symbol|field-symbol|assign component|동적','필드 심볼 열 매핑'),
 topic('string','문자·숫자·날짜 바꾸기','문자열 결합·분리·WRITE TO·변환','문자열|concatenate|split|write to|condense|변환|날짜','금액 날짜 포맷') ]},
 {id:'sql',title:'DB 조회·저장하기',description:'조건을 걸어 읽고, 테이블을 연결해 저장하기',technical:'SELECT · JOIN · INSERT · COMMIT',categories:['SQL·DB'],topics:[
 topic('select','조건으로 조회하기','SELECT·WHERE·ORDER BY','select|where|order by|sql|조회.*get_data','조회조건 정렬'),
 topic('join','여러 테이블 연결하기','INNER·LEFT JOIN·키 연결','join|여러 개의 key','조인 연결 헤더 아이템'),
 topic('aggregate','합계·건수·그룹 집계하기','SUM·COUNT·GROUP BY','집계|sum|count|group by|collect','합계 건수 평균'),
 topic('bulk','한 번에 여러 키 조회하기','FOR ALL ENTRIES·내부 테이블 JOIN','for all entries|fae|internal table|루프|성능','반복 select 일괄 조회'),
 topic('save','생성·변경·삭제 저장하기','INSERT·UPDATE·MODIFY·DELETE','db 저장|insert|update|modify|delete|dml','crud 데이터 저장'),
 topic('transaction','저장 확정·취소·잠금','COMMIT·ROLLBACK·ENQUEUE','commit|rollback|transaction|잠금|lock object|enqueue','동시 수정 트랜잭션') ]},
 {id:'screen',title:'화면·조회조건 만들기',description:'입력칸·버튼·팝업을 만들고 화면을 연결',technical:'Screen Painter · PBO/PAI',categories:['화면·조회조건'],topics:[
 topic('basic','첫 조회 화면 만들기','TOP → 조회조건 → 조회 → 화면 출력','기초 조회|기본 틀|top 선언|화면 만드는 순서|module pool','처음 화면 프로그램'),
 topic('selection','실행 전 조회조건 만들기','PARAMETERS·SELECT-OPTIONS·RANGE','selection|조회조건|조회 조건|parameters|select-options|range','입력 조건 선택화면'),
 topic('layout','화면 영역·컨테이너 배치하기','Custom Control·Docking·Splitter','container|custom control|screen painter|splitter|docking','컨테이너 스플리터 위아래 좌우 나누기'),
 topic('flow','화면 표시·버튼 처리 연결하기','PBO·PAI·MODULE·Flow Logic','pbo|pai|flow logic|okcode|user_command|exit-command','화면 표시 입력 처리 실행 순서'),
 topic('buttons','버튼·제목·종료 만들기','GUI Status·TITLEBAR·BACK/EXIT','gui status|pf-status|titlebar|버튼|종료|popup 닫기','메뉴 제목 뒤로가기 닫기'),
 topic('popup','팝업·탭·하위 화면 만들기','CALL SCREEN·Subscreen·Tabstrip','popup|팝업|subscreen|tabstrip|tab -|모달','대화상자 창 탭'),
 topic('input','입력칸 잠금·F4·선택값 만들기','LOOP AT SCREEN·MODIF ID·Listbox','loop at screen|동적 제어|modif|listbox|리스트박스|f4|라디오|on request','활성 비활성 검색 도움말') ]},
 {id:'alv',title:'ALV 목록 만들기',description:'조회 결과를 표로 보여주고 편집 기능 붙이기',technical:'CL_GUI_ALV_GRID · FCAT · Layout',categories:['ALV 표시·편집'],topics:[
 topic('filter','상태별 필터·보기 전환하기','전체·완료·대기·오류·선택 해제·필터 저장/복원','필터|filter|view_all|view_done|view_wait|view_error','ICON 상태 프리셋 조건'),
 topic('basic','기본 ALV 출력하기','선언·컨테이너·Grid·첫 화면 표시','기본 alv|기초 조회|alv training|구석기|첫 화면|create_grid|기본 틀','그리드 표 조회'),
 topic('columns','열 제목·순서·타입 정하기','FCAT·필드카탈로그·참조 필드','fcat|field catalog|fieldcatalog|필드명 매핑|필드카탈로그','컬럼 라벨 열 이름'),
 topic('layout','표 모양·레이아웃 저장하기','Zebra·너비·Variant·스크롤 유지','layout|레이아웃|variant|정렬|스크롤','줄무늬 열너비'),
 topic('edit','입력·조회 모드와 셀 제어','EDIT·STYLE·수정 허용/금지','편집|수정 허용|style|toggle|입력|crud','셀 편집 잠금'),
 topic('rows','행 선택·추가·삭제·복사','선택 행 읽기·역순 삭제·라인복사','선택 행|행 추가|행 삭제|행 복사|라인|create|delete|copy|checkbox','체크박스 전체선택 해제'),
 topic('decorate','아이콘·색상·합계 표시하기','ICON·COLOR·DO_SUM·소계','아이콘|색상|color|emphasize|합계|소계|do_sum|subtotal','상태 신호등'),
 topic('refresh','변경값 반영·새로고침하기','CHECK_CHANGED_DATA·REFRESH','refresh|새로고침|변경값|check_changed_data','갱신 스크롤 유지'),
 topic('multiple','두 목록·트리·상단 요약 만들기','Splitter·Tree·TOP OF PAGE','splitter|tree|트리|top of page|상단 요약|헤더','헤더 아이템 연동 좌우 위아래') ]},
 {id:'events',title:'클릭·입력 이벤트 연결하기',description:'더블클릭·값 변경·F4가 일어났을 때 처리',technical:'SET HANDLER · DATA_CHANGED',categories:['이벤트'],topics:[
 topic('flow','프로그램·화면 실행 순서 알기','INITIALIZATION·선택화면·PBO·PAI','initialization|selection-screen|프로그램의 이벤트|실행 순서|pbo|pai','초기값 실행 타이밍'),
 topic('handler','이벤트 클래스·핸들러 연결하기','CLASS·FOR EVENT·SET HANDLER','local class|이벤트 연결|이벤트 찾기|핸들러|instance handler|local_class','등록 c01 선언'),
 topic('click','더블클릭·핫스팟·셀 버튼','선택 행 키로 상세 화면 열기','double.click|더블클릭|hotspot|핫스팟|button_click|셀 버튼','클릭 상세조회'),
 topic('changed','입력 변경 감지·완료 처리','DATA_CHANGED와 FINISHED의 차이','data_changed|변경 완료|입력 변경|변경 감지','검증 수정 셀 반영'),
 topic('toolbar','툴바 버튼 추가·실행하기','TOOLBAR·USER_COMMAND','toolbar|툴바|user_command|버튼 실행','버튼 누르기 명령'),
 topic('f4','ALV 셀의 F4 연결하기','ONF4·검색 도움말 등록','onf4|alv.*f4|f4.*alv','서치헬프'),
 topic('tree','트리·타이머·상단 요약 이벤트','노드 더블클릭·FINISHED·TOP_OF_PAGE','node_double_click|노드 클릭|타이머|timer|top.of.page|상단 요약','시간 자동 갱신') ]},
 {id:'excel',title:'엑셀·파일 가져오기',description:'양식 내려받기부터 업로드·ALV 반영까지',technical:'SMW0 · ALSM · GUI_UPLOAD',categories:['파일·엑셀'],topics:[
 topic('template','엑셀 양식 다운로드하기','SMW0 원본 파일·저장 위치 선택','smw0|템플릿|양식|다운로드|download','서식 내려받기'),
 topic('upload','엑셀·텍스트 업로드하기','파일 선택 → 읽기 → 내부 테이블','엑셀|excel|upload|업로드|gui_upload|alsm','파일 불러오기'),
 topic('mapping','열을 필드에 연결하기','행·열 번호 매핑·금액·날짜 변환','매핑|동적.*엑셀|엑셀|excel|alsm','동적 매핑'),
 topic('edit','대량 업로드 결과 수정하기','오류 표시·선택·행 조작·전표 생성','대량|업로드|엑셀|오류','대량전표 결과 확인') ]},
 {id:'functions',title:'FORM·함수·클래스 쓰기',description:'코드를 나누고 다른 프로그램과 값 주고받기',technical:'PERFORM · Function Module · Class',categories:['함수·클래스'],topics:[
 topic('form','FORM으로 코드 나누기','PERFORM·USING·CHANGING','form|perform|using|changing|macro','서브루틴 인자 전달'),
 topic('function','공용 함수 만들고 호출하기','SE37·Function Group·인터페이스','function|함수|펑션|fm|테이블 인자','전역 펑션 재사용'),
 topic('class','로컬·전역 클래스 만들기','Instance·Static·객체 생성','class|클래스|instance|static|메서드','new create object 메소드'),
 topic('f4','표준 함수·F4·확인창 쓰기','F4IF·POPUP_TO_CONFIRM·도메인 값','f4|popup_to_confirm|브라우저|도메인 설명','표준 펑션 팝업'),
 topic('memory','다른 프로그램에 값 전달하기','SUBMIT·ABAP/SAP Memory·Parameter ID','submit|memory|파라미터|parameter id|프로그램 간','리포트 실행 메모리') ]},
 {id:'fi',title:'전표·BDC·FI 업무 보기',description:'계정·차대변부터 전표 생성·반제·결산까지',technical:'BKPF/BSEG · FB01 · SHDB',categories:['BDC·전표','FI·업무'],topics:[
 topic('fi-basic','계정·전표·차대변 이해하기','헤더/항목·채권/채무·계정 유형','fi 기초|계정|채권|채무|차변|대변|bkpf|bseg|전표 조회','회계 헤더 아이템 공급업체 고객'),
 topic('bdc','화면 녹화로 전표 만들기','SHDB → BDCDATA → CALL TRANSACTION','bdc|shdb|fb01|okcode|cursor','기표 정상전표 임시전표'),
 topic('mass','엑셀로 대량전표 만들기','업로드·그룹별 생성·결과 메시지','대량|엑셀|업로드|메시지|전표생성','일괄 전표'),
 topic('clearing','반제·역분개 구분하기','미결 연결·원전표 취소·반제 취소','반제|역분개|clearing|reversal|fb08|fbra','미결 지급 수금'),
 topic('closing','자산·외화평가·결산 보기','취득·감가상각·평가·환입','자산|감가|외화|환율|결산|재무제표|환입','월말 회계'),
 topic('business','구매·판매·생산 흐름 이해하기','MM·SD·PP와 회계의 연결','\\bmm\\b|\\bsd\\b|\\bpp\\b|구매|생산|판매|bom|routing','업무 모듈 erp') ]},
 {id:'gateway',title:'Gateway·CDS·Fiori 보기',description:'ABAP 데이터를 서비스와 화면으로 연결',technical:'OData · CDS · RAP · UI5',categories:['Gateway·CDS·Fiori'],topics:[
 topic('odata','OData 서비스·CRUD 만들기','Entity·GET·CREATE·UPDATE·DELETE','odata|gateway|segt|entity|crud','서비스 api'),
 topic('cds','CDS로 조회·집계 만들기','View·Annotation·파라미터·Association','cds|annotation|association','데이터 뷰'),
 topic('fiori','Fiori 화면·바인딩 보기','UI5·모델·화면과 서비스 연결','fiori|ui5|binding|sapui5','웹 화면'),
 topic('rap','RAP 구조·액션 이해하기','Behavior·Action·Draft·EML','rap|behavior|draft|eml|action','임시저장'),
 topic('database','AMDP·ADBC·DB 처리 보기','SQLScript와 데이터 접근','amdp|adbc|sqlscript','hana') ]},
 {id:'operate',title:'오류·운영 도구 찾기',description:'덤프 확인·배치잡·채번·전송·확장',technical:'ST22 · SM36/37 · SNRO · CTS',categories:['운영·확장'],topics:[
 topic('debug','오류·덤프·디버깅하기','중단점·ST22·메시지 클래스','오류|덤프|debug|디버|st22|message|메시지','타입 충돌 디버깅'),
 topic('batch','백그라운드·배치잡 실행하기','SM36 등록·SM37 결과 확인','배치|batch|job|백그라운드|timer','스케줄 자동 실행'),
 topic('number','문서 번호 자동 채번하기','SNRO·NUMBER_GET_NEXT','채번|snro|number range|number_get_next','일련번호 번호 범위'),
 topic('transport','개발 객체 옮기고 내려받기','CTS·SE09·프로그램 다운로드','cts|전송|se09|코드 다운로드|패키지','운송 요청 task'),
 topic('extension','표준 기능 확장·연동하기','Enhancement·BAdI·RFC·IDoc','enhancement|badi|user.exit|rfc|idoc|확장','인터페이스') ]}
];
export function topicMatch(doc,groupId,topicId){const group=catalogGroups.find(g=>g.id===groupId);if(!group)return true;const title=doc.title.toLowerCase(),topic=group.topics.find(t=>t.id===topicId),inGroup=group.categories.includes(doc.category);if(!topic)return inGroup||group.topics.some(t=>new RegExp(t.match,'i').test(title));return (inGroup||new RegExp(topic.match,'i').test(title))&&new RegExp(topic.match,'i').test(title+' '+(doc.source==='GitHub'?doc.text.slice(0,12000):''));}
export const isReadableDoc=d=>d.source==='학습 문서'||d.source==='Notion'&&!/휴지통|원본 코드 보관함|문서 위치|ABAP 지식 사전|^🧭|화면 만드는 순서|실무 코드 — 기능별|기초 — 문법|개념 — DDIC/.test(d.title);
export function catalogSearchAliases(doc){return catalogGroups.filter(g=>g.categories.includes(doc.category)).map(g=>g.title+' '+g.technical+' '+g.topics.filter(t=>new RegExp(t.match,'i').test(doc.title)).map(t=>t.title+' '+t.aliases).join(' ')).join(' ');}
