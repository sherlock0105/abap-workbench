import {readableCode,combinedProgram,argumentRows} from './code-tools.js';
export const fieldPresets=[
 {id:'BKPF-BUKRS',label:'회사코드',table:'T001',key:'BUKRS',text:'BUTXT',listTable:'T001',listText:'BUTXT',context:[]},
 {id:'BKPF-BLART',label:'전표유형',table:'T003',key:'BLART',text:'',listTable:'T003T',listText:'LTEXT',language:true,context:[]},
 {id:'BKPF-WAERS',label:'통화',table:'TCURC',key:'WAERS',text:'',listTable:'TCURT',listText:'LTEXT',language:true,context:[]},
 {id:'BKPF-BELNR',label:'회계전표 번호',table:'BKPF',key:'BELNR',text:'BKTXT',convert:'ALPHA',large:true,context:[['BUKRS','T001-BUKRS','회사코드'],['GJAHR','BKPF-GJAHR','회계연도']]},
 {id:'BSEG-HKONT',label:'G/L 계정',table:'SKB1',key:'SAKNR',text:'',convert:'ALPHA',large:true,context:[['BUKRS','T001-BUKRS','회사코드']]},
 {id:'BSEG-KOSTL',label:'코스트센터',table:'CSKS',key:'KOSTL',text:'',convert:'ALPHA',large:true,dates:true,context:[['KOKRS','TKA01-KOKRS','관리회계영역']]},
 {id:'KNA1-KUNNR',label:'고객',table:'KNA1',key:'KUNNR',text:'NAME1',convert:'ALPHA',large:true,context:[]},
 {id:'LFA1-LIFNR',label:'공급업체',table:'LFA1',key:'LIFNR',text:'NAME1',convert:'ALPHA',large:true,context:[]},
 {id:'MARA-MATNR',label:'자재',table:'MARA',key:'MATNR',text:'',convert:'MATN1',large:true,context:[]},
 {id:'T001W-WERKS',label:'플랜트',table:'T001W',key:'WERKS',text:'NAME1',context:[]},
 {id:'T001L-LGORT',label:'저장위치',table:'T001L',key:'LGORT',text:'LGOBE',context:[['WERKS','T001W-WERKS','플랜트']]},
 {id:'TVKO-VKORG',label:'영업조직',table:'TVKO',key:'VKORG',text:'',listTable:'TVKOT',listText:'VTEXT',language:true,context:[]},
 {id:'TVTW-VTWEG',label:'유통경로',table:'TVTW',key:'VTWEG',text:'',listTable:'TVTWT',listText:'VTEXT',language:true,context:[]},
 {id:'TSPA-SPART',label:'제품군',table:'TSPA',key:'SPART',text:'',listTable:'TSPAT',listText:'VTEXT',language:true,context:[]},
 {id:'T024-EKGRP',label:'구매그룹',table:'T024',key:'EKGRP',text:'EKNAM',context:[]},
 {id:'T024E-EKORG',label:'구매조직',table:'T024E',key:'EKORG',text:'EKOTX',context:[]},
 {id:'T005-LAND1',label:'국가',table:'T005',key:'LAND1',text:'',listTable:'T005T',listText:'LANDX',language:true,context:[]},
 {id:'AUFK-AUFNR',label:'내부오더',table:'AUFK',key:'AUFNR',text:'KTEXT',convert:'ALPHA',large:true,context:[['KOKRS','TKA01-KOKRS','관리회계영역']]},
 {id:'SKA1-SAKNR',label:'계정과목표 G/L 계정',table:'SKA1',key:'SAKNR',text:'',convert:'ALPHA',large:true,context:[['KTOPL','T004-KTOPL','계정과목표']]},
 {id:'SCARR-CARRID',label:'항공사 · 연습용',table:'SCARR',key:'CARRID',text:'CARRNAME',listTable:'SCARR',listText:'CARRNAME',context:[]}
];
export const catalogPresets={BKPF:[['BUKRS','회사코드',true],['BELNR','전표번호',true],['GJAHR','회계연도',true],['BLART','전표유형'],['BUDAT','전기일'],['WAERS','통화'],['BKTXT','헤더텍스트']],BSEG:[['BUKRS','회사코드',true],['BELNR','전표번호',true],['GJAHR','회계연도',true],['BUZEI','항목',true],['HKONT','G/L 계정'],['WRBTR','전표통화 금액'],['DMBTR','현지통화 금액'],['SGTXT','항목텍스트']],SCARR:[['CARRID','항공사',true],['CARRNAME','항공사명'],['CURRCODE','통화'],['URL','URL']]};
Object.assign(catalogPresets,{
 T001:[['BUKRS','회사코드',true],['BUTXT','회사명'],['WAERS','통화'],['KTOPL','계정과목표']],
 T001W:[['WERKS','플랜트',true],['NAME1','플랜트명'],['BWKEY','평가영역']],
 MARA:[['MATNR','자재번호',true],['MTART','자재유형'],['MATKL','자재그룹'],['MEINS','기본단위']],
 KNA1:[['KUNNR','고객',true],['NAME1','고객명'],['LAND1','국가'],['ORT01','도시']],
 LFA1:[['LIFNR','공급업체',true],['NAME1','공급업체명'],['LAND1','국가'],['ORT01','도시']],
 AUFK:[['AUFNR','내부오더',true],['KTEXT','오더명'],['BUKRS','회사코드'],['KOKRS','관리회계영역']],
 SFLIGHT:[['CARRID','항공사',true],['CONNID','항공편',true],['FLDATE','운항일',true],['CURRENCY','통화'],['SEATSMAX','좌석수'],['SEATSOCC','예약좌석']]
});
const name=(value,label)=>{const v=String(value||'').trim().toUpperCase();if(!/^[A-Z][A-Z0-9_]{0,29}$/.test(v))throw Error(label+'은 영문으로 시작하는 이름(최대 30자)으로 입력하세요.');return v;};
const literal=v=>String(v).replace(/'/g,"''");
const file=(name,code,where)=>({name,code:readableCode(code),where});
export const defaultVariable=(id,dyn=false)=>{const field=String(id).split('-')[1]||'VALUE';return dyn?'GV_'+field:(field.length<=5?'PA_':'P_')+field.slice(0,6);};
export function resolveField(input){
 const id=String(input.ddic||'BKPF-BUKRS').trim().toUpperCase();
 if(!/^[A-Z][A-Z0-9_]{0,29}-[A-Z][A-Z0-9_]{0,29}$/.test(id))throw Error('DDIC 필드는 BKPF-BUKRS처럼 테이블-필드로 입력하세요.');
 const known=fieldPresets.find(p=>p.id===id);
 if(known)return {...known};
 const table=name(input.checkTable,'검증 테이블'),key=name(input.checkKey,'검증 필드'),text=input.textField?name(input.textField,'텍스트 필드'):'';
 return {id,label:id,table,key,text,listTable:table,listText:text,convert:input.conversion==='ALPHA'?'ALPHA':input.conversion==='MATN1'?'MATN1':null,context:[]};
}
export function generateFieldTask(input={}){
 if(input.task==='fcat')return generateCatalog(input);
 const p=resolveField(input),task=input.task||'f4',dyn=input.screenType==='dynpro',program=name(input.program||'ZFIELD_HELP','프로그램명').toLowerCase();
 if(!/^[ZY]/i.test(program))throw Error('프로그램명은 Z 또는 Y로 시작하세요.');
 const screen=String(input.screen||'0100');if(!/^\d{4}$/.test(screen)||screen==='0000')throw Error('화면번호는 0100처럼 0000을 제외한 네 자리로 입력하세요.');
 const raw=String(input.variable||defaultVariable(p.id,dyn)).trim().toUpperCase();
 if(!/^[A-Z][A-Z0-9_]{0,29}(?:-[A-Z][A-Z0-9_]{0,29})?$/.test(raw)||!dyn&&(raw.length>8||raw.includes('-')))throw Error(dyn?'화면 변수는 GV_BUKRS 또는 GS_INPUT-BUKRS 형식으로 입력하세요.':'조회조건 PARAMETERS 이름은 PA_BUKRS처럼 8자 이내로 입력하세요.');
 if(task==='listbox'&&p.large)throw Error(p.label+'은 후보가 많은 필드입니다. F4 + Enter 작업을 사용하세요. 리스트박스는 회사코드·전표유형·통화처럼 작은 목록에 사용합니다.');
 const v=raw.toLowerCase(),typ=p.id.toLowerCase(),ctx=p.context.map(([key,type,label])=>({key:key.toLowerCase(),type:type.toLowerCase(),label,v:(dyn?'gv_':'pa_')+key.toLowerCase()}));
 if(ctx.some(c=>c.v===v)||['GV_TEXT','GV_OKCODE','GC_SCREEN'].includes(raw))throw Error('화면 변수명이 기준 조건 또는 생성 변수와 겹칩니다. 다른 이름을 입력하세요.');
 const required=input.required!==false,check=task!=='f4'||input.enter!==false,f4=task==='f4',list=task==='listbox',ddic=input.helpMode==='ddic',files=[];
 const declare=(variable,type)=>variable.includes('-')?`DATA: BEGIN OF ${variable.split('-')[0]}, ${variable.split('-')[1]} TYPE ${type}, END OF ${variable.split('-')[0]}.`:`DATA ${variable} TYPE ${type}.`;
 let top=`* ${p.id} · ${p.label}\nDATA gv_text TYPE c LENGTH 80.\n`;
 let s01='';
 if(dyn){top+=declare(v,typ)+'\n'+ctx.map(c=>declare(c.v,c.type)).join('\n')+`\nDATA gv_okcode TYPE sy-ucomm.\nCONSTANTS gc_screen TYPE sy-dynnr VALUE '${screen}'.\n`;}
 else{s01=ctx.map(c=>`PARAMETERS ${c.v} TYPE ${c.type} OBLIGATORY.`).join('\n')+`\nPARAMETERS ${v} TYPE ${typ}${list?' AS LISTBOX VISIBLE LENGTH 40 USER-COMMAND pick':''}${required?' OBLIGATORY':''}.\n`;}
 if(list)top+='TYPE-POOLS vrm.\nDATA gt_values TYPE vrm_values.\n';
 const conditions=[`${p.key.toLowerCase()} = @${v}`,...ctx.map(c=>`${c.key} = @${c.v}`),...(p.dates?['datab <= @sy-datum','datbi >= @sy-datum']:[])];
 const selectText=p.text?`${p.text.toLowerCase()}`:p.key.toLowerCase();
 const convert=p.convert?`CALL FUNCTION 'CONVERSION_EXIT_${p.convert}_INPUT'\n  EXPORTING input = ${v}\n  IMPORTING output = ${v}.\n`:'';
 const guard=ctx.map(c=>`IF ${c.v} IS INITIAL.\n  MESSAGE '${literal(c.label)}을 먼저 입력하세요.' TYPE 'I'.\n  RETURN.\nENDIF.`).join('\n');
 const readScreen=`DATA: lt_dynp TYPE STANDARD TABLE OF dynpread, ls_dynp TYPE dynpread.\n${[...ctx.map(c=>c.v),v].map(x=>`CLEAR ls_dynp.\nls_dynp-fieldname = '${x.toUpperCase()}'.\nAPPEND ls_dynp TO lt_dynp.`).join('\n')}\nCALL FUNCTION 'DYNP_VALUES_READ'\n  EXPORTING dyname = sy-repid dynumb = sy-dynnr\n  TABLES dynpfields = lt_dynp\n  EXCEPTIONS OTHERS = 1.\nIF sy-subrc <> 0.\n  MESSAGE '화면 입력값을 읽을 수 없습니다.' TYPE 'I'.\n  RETURN.\nENDIF.\n${[...ctx.map(c=>c.v),v].map(x=>`READ TABLE lt_dynp INTO ls_dynp WITH KEY fieldname = '${x.toUpperCase()}'.\nIF sy-subrc = 0.\n  ${x} = ls_dynp-fieldvalue.\nENDIF.`).join('\n')}`;
 let forms=`FORM read_text.\n  CLEAR gv_text.\n  ${p.text?`SELECT SINGLE ${selectText} FROM ${p.table.toLowerCase()}\n    WHERE ${conditions.join(' AND ')} INTO @gv_text.`:''}\nENDFORM.\n`;
 if(check)forms+=`\nFORM check_input.\n  DATA lv_found TYPE ${p.table.toLowerCase()}-${p.key.toLowerCase()}.\n  CLEAR gv_text.\n  IF ${v} IS INITIAL.\n    ${required?`MESSAGE '${literal(p.label)}을 입력하세요.' TYPE 'E'.`:'RETURN.'}\n  ENDIF.\n${ctx.map(c=>`  IF ${c.v} IS INITIAL.\n    MESSAGE '${literal(c.label)}을 입력하세요.' TYPE 'E'.\n  ENDIF.`).join('\n')}\n  ${convert}\n  SELECT SINGLE ${p.key.toLowerCase()} FROM ${p.table.toLowerCase()}\n    WHERE ${conditions.join(' AND ')} INTO @lv_found.\n  IF sy-subrc <> 0.\n    MESSAGE '입력값 또는 기준 조건을 확인하세요.' TYPE 'E'.\n  ENDIF.\n  PERFORM read_text.\nENDFORM.\n`;
 if(f4){
  const filter=[...ctx.map(c=>`${c.key} = @${c.v}`),...(p.dates?['datab <= @sy-datum','datbi >= @sy-datum']:[])];
  const request=ddic?`CALL FUNCTION 'F4IF_FIELD_VALUE_REQUEST'\n  EXPORTING tabname = '${p.id.split('-')[0]}' fieldname = '${p.id.split('-')[1]}'\n  TABLES return_tab = lt_return\n  EXCEPTIONS field_not_found = 1 no_help_for_field = 2 inconsistent_help = 3 no_values_found = 4 OTHERS = 5.`:`SELECT * FROM ${p.table.toLowerCase()} ${filter.length?'WHERE '+filter.join(' AND '):''}\n  ORDER BY PRIMARY KEY INTO TABLE @lt_values UP TO 200 ROWS.\nIF lt_values IS INITIAL.\n  MESSAGE '조건에 맞는 후보가 없습니다.' TYPE 'I'.\n  RETURN.\nENDIF.\nCALL FUNCTION 'F4IF_INT_TABLE_VALUE_REQUEST'\n  EXPORTING ddic_structure = '${p.table}' retfield = '${p.key}' value_org = 'S'\n  TABLES value_tab = lt_values return_tab = lt_return\n  EXCEPTIONS parameter_error = 1 no_values_found = 2 OTHERS = 3.`;
  forms+=`\nFORM f4_input.\n  DATA: lt_values TYPE STANDARD TABLE OF ${p.table.toLowerCase()},\n        lt_return TYPE STANDARD TABLE OF ddshretval, ls_return TYPE ddshretval,\n        lt_update TYPE STANDARD TABLE OF dynpread, ls_update TYPE dynpread.\n  ${readScreen}\n  ${guard}\n  ${request}\n  IF sy-subrc <> 0.\n    MESSAGE 'F4 후보를 가져올 수 없습니다.' TYPE 'I'.\n    RETURN.\n  ENDIF.\n  READ TABLE lt_return INTO ls_return INDEX 1.\n  IF sy-subrc <> 0 OR ls_return-fieldval IS INITIAL.\n    RETURN. " 취소하면 기존 값 유지\n  ENDIF.\n  ${v} = ls_return-fieldval.\n  ${convert}\n  PERFORM read_text.\n  CLEAR ls_update.\n  ls_update-fieldname = '${raw}'.\n  ls_update-fieldvalue = ls_return-fieldval.\n  APPEND ls_update TO lt_update.\n${dyn?`  CLEAR ls_update.\n  ls_update-fieldname = 'GV_TEXT'.\n  ls_update-fieldvalue = gv_text.\n  APPEND ls_update TO lt_update.\n`:''}  CALL FUNCTION 'DYNP_VALUES_UPDATE'\n    EXPORTING dyname = sy-repid dynumb = sy-dynnr\n    TABLES dynpfields = lt_update\n    EXCEPTIONS OTHERS = 1.\n  IF sy-subrc <> 0.\n    MESSAGE '선택값을 화면에 반영하지 못했습니다.' TYPE 'I'.\n  ENDIF.\nENDFORM.\n`;
 }
 if(list){const tab=(p.listTable||p.table).toLowerCase(),text=(p.listText||p.text||'').toLowerCase();
  const listFilters=[...ctx.map(c=>c.key+' = @'+c.v),...(p.language?['spras = @sy-langu']:[])];
  forms+=`\nFORM set_listbox.\n  DATA: lt_items TYPE STANDARD TABLE OF ${tab}, ls_item TYPE ${tab}, ls_value TYPE vrm_value.\n  CLEAR gt_values.\n  SELECT * FROM ${tab} ${listFilters.length?'WHERE '+listFilters.join(' AND '):''}\n    ORDER BY PRIMARY KEY INTO TABLE @lt_items.\n  LOOP AT lt_items INTO ls_item.\n    CLEAR ls_value.\n    ls_value-key = ls_item-${p.key.toLowerCase()}.\n    ls_value-text = ${text?`|{ ls_item-${p.key.toLowerCase()} } { ls_item-${text} }|`:`ls_item-${p.key.toLowerCase()}`}.\n    APPEND ls_value TO gt_values.\n  ENDLOOP.\n  CALL FUNCTION 'VRM_SET_VALUES'\n    EXPORTING id = '${raw}' values = gt_values\n    EXCEPTIONS id_illegal_name = 1 OTHERS = 2.\n  IF sy-subrc <> 0.\n    MESSAGE '리스트박스 연결을 확인하세요.' TYPE 'I'.\n  ENDIF.\nENDFORM.\n`;
 }
 let events='';const init=ctx.find(c=>c.key==='gjahr');if(init)events+=`INITIALIZATION.\n  ${init.v} = sy-datum(4).\n`;
 if(!dyn){if(list)events+='AT SELECTION-SCREEN OUTPUT.\n  PERFORM set_listbox.\n';if(f4)events+=`AT SELECTION-SCREEN ON VALUE-REQUEST FOR ${v}.\n  PERFORM f4_input.\n`;if(check)events+=ctx.length?`AT SELECTION-SCREEN.\n  PERFORM check_input.\n`:`AT SELECTION-SCREEN ON ${v}.\n  PERFORM check_input.\n`;events+=`START-OF-SELECTION.\n  WRITE: / ${v}, gv_text.\n`;}
 else events=`START-OF-SELECTION.\n  CALL SCREEN gc_screen.\n`;
 files.push(file(program+'_top.abap',top,'TOP · 전역 선언'));
 if(!dyn)files.push(file(program+'_s01.abap',s01,'S01 · 조회조건'));
 if(dyn){files.push(file(program+'_o01.abap',`MODULE status_${screen} OUTPUT.\n  SET PF-STATUS 'S${screen}'.\n${list?'  PERFORM set_listbox.\n':''}ENDMODULE.`,'O01 · PBO'));
 files.push(file(program+'_i01.abap',`MODULE exit_${screen} INPUT.\n  CLEAR gv_okcode.\n  LEAVE TO SCREEN 0.\nENDMODULE.\n${check?'MODULE check_input INPUT.\n  PERFORM check_input.\nENDMODULE.\n':''}${f4?'MODULE f4_input INPUT.\n  PERFORM f4_input.\nENDMODULE.\n':''}MODULE command_${screen} INPUT.\n  CLEAR gv_okcode.\nENDMODULE.`,'I01 · PAI / POV'));
 files.push(file('screen_'+screen+'.flow.abap',`PROCESS BEFORE OUTPUT.\n  MODULE status_${screen}.\nPROCESS AFTER INPUT.\n  MODULE exit_${screen} AT EXIT-COMMAND.\n${check?`  CHAIN.\n${ctx.map(c=>'    FIELD '+c.v+'.').join('\n')}\n    FIELD ${v}.\n    MODULE check_input.\n  ENDCHAIN.\n`:''}  MODULE command_${screen}.\n${f4?`PROCESS ON VALUE-REQUEST.\n  FIELD ${v} MODULE f4_input.`:''}`,'SE51 · Flow Logic'));}
 files.push(file(program+'_f01.abap',forms,'F01 · 처리 FORM'));
 const includes=files.filter(f=>!f.name.includes('.flow.')).map(f=>'INCLUDE '+f.name.replace('.abap','')+'.');
 const first=includes.filter(l=>/_top\.|_s01\./.test(l)),last=includes.filter(l=>!/_top\.|_s01\./.test(l));
 files.unshift(file(program+'.abap',`REPORT ${program}.\n${first.join('\n')}\n${events}\n${last.join('\n')}`,'실행 프로그램'));
 const notes=[`${p.id} → ${p.table}-${p.key} 존재 검사${ctx.length?' · '+ctx.map(c=>c.label).join(' + ')+' 조건':''}.`,...(dyn?[`SE51 ${screen}: ${raw}${ctx.length?', '+ctx.map(c=>c.v.toUpperCase()).join(', '):''} 입력칸, GV_TEXT 출력칸, OK Code GV_OKCODE.`,`SE41 S${screen}: BACK / EXIT / CANC를 기능유형 E로 등록. 다음 화면 ${screen}.`]:['SE38에서 실행 프로그램과 이름이 같은 Include를 생성. Selection Text는 프로그램 텍스트 요소에서 설정.']),...(list?[dyn?'SE51 입력칸 Dropdown = LISTBOX, Value list = A. PBO에서 후보 연결.':'AS LISTBOX 선언과 OUTPUT 이벤트를 함께 사용.']:[]),...(f4?[ddic?'SE11에 연결된 표준 Search Help를 호출합니다. 값 테이블/업무 종속조건을 자동으로 추론하지 않으며, 선택값은 Enter에서 다시 검사합니다.':'후보는 최대 200건입니다. 대량 데이터는 DDIC 검색도움 또는 추가 검색조건으로 좁히세요. F4 호출은 별도의 SE11 Search Help 객체를 생성하지 않습니다.']:[]),...(p.id==='BSEG-HKONT'?['SKB1의 회사코드별 존재 검사입니다. 전기 가능·차단·삭제·권한 검사는 저장 로직에 추가하세요.']:[]),...(!fieldPresets.some(x=>x.id===p.id)?['직접 지정한 검증 테이블의 단일 키 존재 검사입니다. 복합 업무키·언어·유효기간 조건은 SE11과 업무 규칙에 맞게 추가하세요.']:[]),...(p.dates?['유효기간은 SY-DATUM 기준입니다. 업무 기준일이 다르면 조건을 변경하세요.']:[]),'Standard ABAP 7.40 SP08+ · SAP GUI. 구문 검사와 실제 SAP DDIC·FM 인터페이스/실행 검증은 구분됩니다.'];
 const combined=combinedProgram(files);
 return {title:p.id+' · '+({f4:'F4 + Enter',enter:'Enter 검증',listbox:'리스트박스'})[task],files:combined?[combined,...files]:files,notes};
}
export function generateCatalog(input={}){
 const table=name(input.catalogTable||'BKPF','테이블명'),program=name(input.program||'ZFIELD_HELP','프로그램명').toLowerCase();
 const rows=input.columns||catalogPresets[table]?.map(([field,label,key])=>({field,label,key}))||[];
 if(!rows.length)throw Error('표시할 필드를 한 개 이상 선택하세요.');if(rows.length>50)throw Error('한 번에 최대 50개 필드를 만드세요.');
 const seen=new Set(),columns=rows.map(r=>{const field=name(r.field,'필드명');if(seen.has(field))throw Error('중복 필드: '+field);seen.add(field);if(String(r.label||'').length>40)throw Error('열 제목은 40자 이내로 입력하세요.');return {...r,field};});
 if(columns.some(c=>c.field==='WRBTR')&&!input.currencyField)throw Error('WRBTR에는 통화 참조가 필요합니다. 통화 필드명을 입력하세요(예: WAERS).');
 if(columns.some(c=>c.field==='DMBTR')&&!input.localCurrencyField)throw Error('DMBTR에는 회사코드 통화 참조 필드가 필요합니다(예: HWAER).');
 const currency=input.currencyField?name(input.currencyField,'통화 참조 필드'):'',localCurrency=input.localCurrencyField?name(input.localCurrencyField,'현지 통화 참조 필드'):'';
 const declarations=`DATA : gt_fcat TYPE lvc_t_fcat,\n       gs_fcat TYPE lvc_s_fcat.\n* 기존 ALV의 GT_DATA와 GCL_GRID를 사용합니다.`;
 const form=`FORM set_fcat .

  REFRESH gt_fcat.

* KEY / FIELD / TEXT / REF_TABLE / REF_FIELD
  PERFORM make_fcat USING :
${argumentRows(columns.map(c=>[c.key?'X':' ',c.field,c.label||c.field,table,c.field]))}

ENDFORM.

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

  gs_fcat-col_pos = lines( gt_fcat ) + 1.

  CASE pv_field.
${columns.map(c=>`    WHEN '${c.field}'.
${c.edit?"      gs_fcat-edit = 'X'.\n":''}${c.hotspot?"      gs_fcat-hotspot = 'X'.\n":''}${c.field==='WRBTR'&&currency?`      gs_fcat-cfieldname = '${currency}'.\n`:''}${c.field==='DMBTR'&&localCurrency?`      gs_fcat-cfieldname = '${localCurrency}'.\n`:''}      gs_fcat-coltext = pv_text.`).join('\n\n')}
  ENDCASE.

  APPEND gs_fcat TO gt_fcat.

ENDFORM.`;
 const call=`* Grid 객체 생성과 GT_DATA 조회 뒤, 최초 표시 시 호출
PERFORM set_fcat.

CALL METHOD gcl_grid->set_table_for_first_display
  CHANGING
    it_outtab       = gt_data
    it_fieldcatalog = gt_fcat
  EXCEPTIONS
    invalid_parameter_combination = 1
    program_error                 = 2
    too_many_lines                = 3
    OTHERS                        = 4.

IF sy-subrc <> 0.
  MESSAGE 'ALV 최초 표시 실패' TYPE 'I'.
ENDIF.`;
 return {title:table+' · MAKE_FCAT',files:[file(program+'_top.abap',declarations,'TOP · 기존 선언에 추가'),file(program+'_f01.abap',form,'F01 · SET_FCAT / MAKE_FCAT'),file(program+'_alv_call.abap',call,'Grid 최초 표시 위치에 추가')],notes:[`기존 ALV에 붙이는 코드입니다. GT_DATA와 GCL_GRID는 기존 조회·Container/Grid 생성 로직을 사용하세요.`,`GT_DATA 행 구조에 ${columns.map(c=>c.field).join(', ')}가 있어야 합니다. REF_TABLE / REF_FIELD는 ${table}의 DDIC 정보를 참조합니다.`,...(currency||localCurrency?[`통화 참조 ${[currency,localCurrency].filter(Boolean).join(', ')}는 GT_DATA의 같은 행에 있어야 합니다. BSEG에 WAERS가 없으므로 BKPF-WAERS / T001-WAERS를 조회해 행에 추가하세요.`]:[]),'EDIT는 표시·입력 속성만 설정합니다. 저장/DB 변경과 DATA_CHANGED 검증은 별도입니다.','Standard ABAP · CL_GUI_ALV_GRID / LVC. SAP에서 실제 활성화·실행은 별도 확인.']};
}
