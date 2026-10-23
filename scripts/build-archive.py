#!/usr/bin/env python3
"""Build the source archive from collected Notion and GitHub JSON (stdlib only).

The generated index contains complete searchable text. The document payloads keep
full body text, including source whitespace and code. GitHub source groups are
navigation/copy bundles, never a fabricated concatenated executable report.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = ROOT / 'references'
DEST = ROOT / 'dist' / 'archive'
DOCS = DEST / 'docs'


def load(name, default=None):
    path = REFERENCES / name
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def normalize(value):
    return unicodedata.normalize('NFKC', value).lower()


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def notion_body(value):
    """Do not strip, normalize, unescape, or summarize the <content> payload."""
    if '<blank-page>' in value:
        return ''
    start = value.find('<content>')
    end = value.rfind('</content>')
    return value[start + len('<content>'):end] if start >= 0 and end >= start else value


# Ordered title rules: specific subjects win over general ALV or ABAP terms.
CATEGORY_RULES = [
    ('이벤트', r'event|이벤트|data_changed|hotspot|double.click|user.command|top.of.page|top.of.list|end.of.list|end.of.page|initialization|selection.screen 실행 순서|start.of.selection|end.of.selection|at.line.selection|at.user.command'),
    ('파일·엑셀', r'excel|엑셀|파일|upload|download|업로드|다운로드|smw0|ole|csv|gui.upload|gui.download'),
    ('BDC·전표', r'bdc|shdb|fb01|fb03|전표|bdcdata'),
    ('Gateway·CDS·Fiori', r'gateway|odata|fiori|ui5|cds|amdp|adbc|rap\b|bopf'),
    ('DDIC', r'ddic|dictionary|도메인|domain|data.element|데이터.요소|데이터.엘리먼트|lock.object|search.help|탐색.도움말|구조체.생성'),
    ('ITAB·문자열', r'itab|internal.table|내부.?테이블|문자열|field.symbol|필드.?심볼|field-symbol|read.table|for.in|for.in|append|collect|sort|delete.adjacent|range|레인지|move.corresponding|corresponding|condense|substring|split\b|concatenate|replace\b'),
    ('SQL·DB', r'open.sql|sql|select\b|join\b|for.all.entr|fae\b|dml|데이터베이스|database|commit|rollback|update\b|insert\b'),
    ('화면·조회조건', r'module.pool|selection.screen|조회조건|조회.조건|화면|dynpro|screen|tabstrip|subscreen|pbo|pai|pf.status|gui.status|f4|text.symbol|text.edit|textedit|라디오|radio|리스트박스|listbox'),
    ('함수·클래스', r'function|펑션|함수|클래스|class|method|메서드|메소드|객체|인스턴스|interface|inherit|상속|encaps|다형|fm\b'),
    ('FI·업무', r'반제|역분개|외화|환율|회계|회계연도|자산|감가|결산|재무|매입|매출|채권|채무|공급업체|고객|구매|생산|재고|fi\b|co\b|mm\b|sd\b|qm\b|account|payment|clearing|reversal|bkpf|bseg|ekko|ekpo'),
    ('운영·확장', r'배치|batch|job\b|운영|성능|디버그|debug|덤프|dump|오류|error|st22|sm37|submit|memory|enhancement|badi|user.exit|rfc|idoc|확장|t.code|트랜잭션'),
    ('ALV 표시·편집', r'alv|splitter|grid|container|필드카탈로그|fieldcatalog|layout|색상|아이콘|소계|subtotal|합계|toolbar|툴바'),
    ('기초·문법', r'abap|기초|문법|기본|변수|선언|data\b|types\b|상수|조건문|반복문|loop\b|case\b|if\b|do\b|신문법|구문법|training|노트'),
]
FALLBACK = {
    'ALV 기초': 'ALV 표시·편집', 'ABAP 기초·SQL·내부테이블': '기초·문법',
    '함수·클래스·ALV 이벤트': '함수·클래스', '편집 ALV·DML·툴바': 'ALV 표시·편집',
    'Module Pool·Tabstrip·BDC': '화면·조회조건', 'Splitter·다중 ALV': 'ALV 표시·편집',
    'FAE·Range·SUBMIT·Hotspot': 'SQL·DB', '필드심볼·동적 ALV·BDC': 'ITAB·문자열',
    'CDS·AMDP·ADBC': 'Gateway·CDS·Fiori', '종합 실습·프로젝트': '운영·확장', '저장소 안내': '기초·문법'
}


def category(title, fallback='', path=''):
    for name, pattern in CATEGORY_RULES:
        if re.search(pattern, title, re.I):
            return name
    if 'dictionary-' in path.lower():
        return 'DDIC'
    return FALLBACK.get(fallback, fallback if fallback in {x[0] for x in CATEGORY_RULES} else '기타')


CLASSIC_EVENTS = (
    'AT SELECTION-SCREEN OUTPUT', 'AT SELECTION-SCREEN ON VALUE-REQUEST',
    'AT SELECTION-SCREEN ON HELP-REQUEST', 'AT SELECTION-SCREEN',
    'INITIALIZATION', 'START-OF-SELECTION', 'END-OF-SELECTION',
    'TOP-OF-PAGE', 'END-OF-PAGE', 'AT LINE-SELECTION', 'AT USER-COMMAND',
    'LOAD-OF-PROGRAM', 'GET LATE',
)


def events(text):
    found = {e.lower() for e in re.findall(r'\bFOR\s+EVENT\s+(\w+)', text, re.I)}
    for e in CLASSIC_EVENTS:
        if re.search(r'^\s*' + re.escape(e) + r'\b', text, re.M | re.I):
            found.add(e)
    return sorted(found)


def summary(text):
    lines = []
    for line in text.splitlines():
        plain = re.sub(r'^[#>*`\s-]+', '', line).strip()
        if plain and not plain.startswith(('<', '```', '*&', 'Extracted by')):
            lines.append(plain)
        if len(' '.join(lines)) > 200:
            break
    return ' '.join(lines)[:220]


def code_blocks(body):
    # The block reader does not mutate stored source body.
    return [m.group(2) for m in re.finditer(r'^[ \t]*(`{3,})[^\n]*\n(.*?)^[ \t]*\1[ \t]*$', body, re.M | re.S)]


def actual_program(text):
    return bool(re.search(r'^\s*(?:REPORT|PROGRAM)\s+[\w/]+\s*(?:[.\n]|MESSAGE-ID|NO STANDARD|LINE-SIZE|LINE-COUNT)', text, re.I | re.M))


def notion_recipe(body, title):
    # A TOP-only sample or conceptual REPORT mention must not become a recipe.
    whole_pattern = r'프로그램\s*전체|전체\s*코드|코드\s*전체|통합\s*코드|완성\s*코드|전체\s*틀|한\s*번에\s*복사|전체\s*프로그램'
    headings = '\n'.join(line for line in body.splitlines() if re.match(r'^#{1,6}\s', line))
    whole = bool(re.search(whole_pattern, title + '\n' + headings))
    return whole and any(actual_program(block) for block in code_blocks(body))


def common(doc_id, title, source, cat, body, path, url, recipe=False, extra=None):
    record = {'id': doc_id, 'title': title, 'source': source, 'category': cat,
              'summary': summary(body), 'text': body,
              'search': normalize('\n'.join((title, cat, path, body))),
              'path': path, 'url': url, 'recipe': bool(recipe), 'events': events(body)}
    payload = {**{k:v for k,v in record.items() if k not in ['text','search']}, 'body': body, **(extra or {})}
    save(DOCS / (doc_id + '.json'), payload)
    # The browser derives the full search string from text once after loading.
    # Avoid shipping the entire source body twice in the index.
    record['search'] = normalize('\n'.join((title, cat, path)))
    return record


def fence(body):
    length = max([2] + [len(m.group()) for m in re.finditer(r'`+', body)]) + 1
    mark = '`' * length
    return mark + 'abap\n' + body + ('' if body.endswith('\n') else '\n') + mark


def include_refs(body):
    return {x.lower() for x in re.findall(r'^\s*INCLUDE\s+([\w/]+)\s*\.', body, re.M | re.I)}


def build():
    DOCS.mkdir(parents=True, exist_ok=True)
    notion = load('notion-documents.json', [])
    github = load('github-documents.json', [])
    groups = load('github-programs.json', [])
    inventory = load('github-inventory.json', {})
    index = []
    notion_missing_content = []
    notion_empty = 0
    for item in notion:
        raw = item.get('text', '')
        body = notion_body(raw)
        if '<content>' not in raw:
            notion_missing_content.append(item['id'])
        if not body.strip():
            notion_empty += 1
        ancestors = re.findall(r'<parent-page\b[^>]*\btitle="([^"]*)"', raw.split('<content>', 1)[0])
        title = item.get('title') or '제목 없음'
        path = ' / '.join([html.unescape(t) for t in ancestors] + [title])
        index.append(common('notion-' + item['id'], title, 'Notion', category(title), body, path,
                            item.get('url') or 'https://app.notion.com/p/' + item['id'],
                            notion_recipe(body, title), {'format': 'markdown', 'sourceId': item['id'],
                            'pageLastEditedAt': item.get('page_last_edited_at')}))
    by_id = {d['id']: d for d in github}
    for item in github:
        body = item.get('body', '')
        index.append(common(item['id'], item['title'], 'GitHub',
                            category(item['title'], item.get('category', ''), item['path']),
                            body, item['path'], item['url'], False,
                            {'format': item.get('format', 'code'), 'role': item.get('role'),
                             'program': item.get('program'), 'sourceSha': item.get('sourceSha'),
                             'repo': item.get('repo','ABAP-STUDY'), 'commit': item.get('commit'),
                             'language': item.get('language','abap'), 'sourceSha256':item.get('sourceSha256'),
                             'asset':item.get('asset'), 'empty': not bool(body.strip())}))
    unresolved = {}
    group_recipes = 0
    for group in groups:
        components = [by_id[c['id']] for c in group.get('components', []) if c['id'] in by_id]
        # All code/text stays in separate fenced blocks; Screen Painter flow is
        # a component and must never be appended to a REPORT as executable ABAP.
        blocks = []
        for component in components:
            label = component.get('role', '소스') + ' / ' + component['path']
            body = component.get('body', '')
            blocks.append('## ' + label + '\n\n' + fence(body))
        body = '\n\n'.join(blocks)
        available = {Path(d['path']).stem.lower() for d in components}
        refs = set().union(*(include_refs(d.get('body', '')) for d in components)) if components else set()
        missing = sorted(refs - available)
        if missing:
            unresolved[group['id']] = missing
        recipe = bool(group.get('hasTop') and any(actual_program(d.get('body', '')) for d in components) and not missing)
        combined = None
        if recipe:
            sources = {Path(d['path']).stem.lower():d.get('body','') for d in components}
            mains = [d.get('body','') for d in components if actual_program(d.get('body',''))]
            def expand_includes(text, stack=()):
                def substitute(match):
                    name = match.group(1).lower()
                    if name in stack or name not in sources:
                        raise ValueError('Cannot expand INCLUDE '+name)
                    return expand_includes(sources[name], stack+(name,))
                return re.sub(r'^\s*INCLUDE\s+([\w/]+)\s*\.[^\n]*$', substitute, text, flags=re.M|re.I)
            if len(mains) == 1:
                combined = expand_includes(mains[0])
                body = '## 프로그램 전체 — Include를 펼친 통합본\n\nTOP·조회조건·클래스·MODULE·FORM을 원본 INCLUDE 위치에 펼쳤습니다. 새 프로그램에는 이 블록 하나를 붙이고, 아래 원본 Include를 중복해서 붙이지 마세요. 화면 Flow Logic·DDIC·GUI Status는 별도로 준비합니다. SAP 컴파일·실행 미검증.\n\n' + fence(combined) + '\n\n' + body
        flow_parts = []
        for component in components:
            original = component.get('body','')
            if '%_FLOWLOGIC' in original:
                flow = re.split(r'^%_', original.split('%_FLOWLOGIC',1)[1], maxsplit=1, flags=re.M)[0]
                flow = '\n'.join(line.rstrip() for line in flow.splitlines()).strip()
                if re.search(r'^PROCESS (BEFORE|AFTER)', flow, re.M):
                    flow_parts.append('## 화면 Flow Logic — ' + Path(component['path']).stem + '\n\nSE80의 해당 화면 Flow Logic 탭에만 붙입니다.\n\n' + fence(flow))
        if flow_parts:
            body = '\n\n'.join(flow_parts) + '\n\n' + body
        group_recipes += recipe
        title = group['program'].upper() + ' · 원본 Include 묶음'
        extra = {'format': 'markdown', 'program': group['program'], 'repo':group.get('repo','ABAP-STUDY'),
                 'components': [{'id':d['id'], 'title':d['title'], 'path':d['path'],
                                 'role':d.get('role'), 'body':d.get('body',''),
                                 'format':d.get('format','code')} for d in components],
                 'combinedProgram':combined, 'unresolvedIncludes':missing, 'hasTop':bool(group.get('hasTop')),
                 'copyNotice':'원본 Include별 복사 묶음입니다. Flow Logic은 해당 화면에 입력하고, DDIC·GUI Status·화면 객체는 별도로 준비합니다.'}
        repo = group.get('repo','ABAP-STUDY')
        url = 'https://github.com/sherlock0105/' + repo + '/tree/' + ('main' if repo=='masterpack-project-fi' else 'master') + '/' + group['path']
        index.append(common(group['id'], title, 'GitHub',
                            category(title, group.get('category', ''), group['path']),
                            body, group['path'], url, recipe, extra))
    if len({d['id'] for d in index}) != len(index):
        raise ValueError('Duplicate document IDs in archive')
    referenced = {d['id'] + '.json' for d in index}
    for stale in DOCS.glob('*.json'):
        if stale.name not in referenced:
            stale.unlink()
    status = inventory.get('summary', {}).get('statusCounts', {})
    coverage = {
        'builtAt': datetime.now(timezone.utc).isoformat(),
        'unavailableNotion': load('notion-unavailable.json', []),
        'notionDatabaseRowsChecked': 89,
        'documentCount': len(index), 'notion': len(notion), 'github': len(github),
        'programGroups': len(groups), 'recipeCount': sum(d['recipe'] for d in index),
        'notionRecipes': sum(d['recipe'] for d in index if d['source'] == 'Notion'),
        'githubProgramRecipes': group_recipes,
        'eventDocumentCount': sum(bool(d['events']) for d in index),
        'sources': {'Notion': len(notion), 'GitHub': len(github)},
        'categories': dict(Counter(d['category'] for d in index)),
        'githubInventory': inventory.get('summary', {}),
        'notionEmpty': notion_empty, 'notionMissingContentWrapper': notion_missing_content,
        'githubEmpty': status.get('empty', sum(not d.get('body','').strip() for d in github)),
        'githubBinaryExtracted': status.get('extracted-document', 0),
        'unresolvedIncludeGroups': unresolved,
        'searchCharacters': sum(len(d['text']) for d in index),
        'notes': ['Notion 본문은 content 태그 안의 전체 내용을 그대로 보존합니다.',
                  'GitHub의 빈 원본 파일 9개도 색인에 포함합니다. DOCX 1개는 텍스트를 추출했습니다.',
                  '원본 Include 묶음은 파일별 복사 모음이며 실행 가능한 단일 Report로 합친 코드가 아닙니다.',
                  '소스 수집 시점의 스냅샷이며 노션·깃허브를 실시간 동기화하지 않습니다.']
    }
    save(DEST / 'index.json', index)
    save(DEST / 'coverage.json', coverage)
    print(json.dumps({k: coverage[k] for k in ('documentCount','notion','github','programGroups','recipeCount','notionRecipes','githubProgramRecipes','eventDocumentCount','githubEmpty','githubBinaryExtracted','searchCharacters')}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    build()
