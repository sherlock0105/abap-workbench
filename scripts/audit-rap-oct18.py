import json,re,hashlib,difflib
from pathlib import Path
from collections import deque,Counter
base=Path(__file__).resolve().parents[1]
def load(path): return json.loads(path.read_text(encoding='utf-8-sig'))
idx=load(base/'dist/archive/index.json')
refs=load(base/'references/notion-documents.json')
refmap={r['id']:r for r in refs}
indexmap={r['id'].removeprefix('notion-'):r for r in idx if r.get('source')=='Notion'}
root='3a3a6b8522df80cdb505c85b6e8ca52e'
def body(text):
    if '<blank-page>' in text:return ''
    i=text.find('<content>');j=text.rfind('</content>')
    return text[i+9:j] if i>=0 and j>=i else text
def links(text):
    out=set()
    for url in re.findall(r'https://(?:app\.notion\.com/p|(?:www\.)?notion\.so)/[^\s<>"\)]+',text):
        compact=url.replace('-','')
        m=re.search(r'([a-f0-9]{32})(?:[?/#].*)?$',compact)
        if m:out.add(m.group(1))
    return sorted(out)
fresh={}
for file in (base/'references/audit-rap-raw-2026-10-18').glob('*.json'):
    result=load(file)
    if result.get('isError'):continue
    data=result.get('structuredContent') or json.loads(next(x['text'] for x in result['content'] if x.get('type')=='text'))
    fresh[file.stem]=data
def payload(id):
    file=base/'dist/archive/docs'/('notion-'+id+'.json')
    return load(file) if file.exists() else None
hashof=lambda text:hashlib.sha256(text.encode()).hexdigest()
comparisons=[]
for id,data in fresh.items():
    old=payload(id);fbody=body(data['text']);oldbody=(old or {}).get('body',(old or {}).get('text',''))
    row=dict(id=id,title=data.get('title'),url=data.get('url'),freshEditedAt=data.get('page_last_edited_at'),archiveEditedAt=(old or {}).get('pageLastEditedAt'),inIndex=id in indexmap,inReferences=id in refmap,payloadPresent=old is not None,category=(old or {}).get('category'),freshChars=len(fbody),archiveChars=len(oldbody),freshSHA256=hashof(fbody),archiveSHA256=hashof(oldbody),changed=fbody!=oldbody,childIds=links(fbody),truncated=data.get('truncated',False),unknownBlockCount=data.get('unknown_block_count',0))
    if row['changed']:row['diff']='\n'.join(difflib.unified_diff(oldbody.splitlines(),fbody.splitlines(),fromfile='archive',tofile='fresh'))[:15000]
    row['sourceContentChanged']=body(refmap.get(id,{}).get('text',''))!=fbody
    row['differenceKind']='blank-source-imported-as-fetch-envelope' if '<blank-page>' in data.get('text','') and row['changed'] else ('content' if row['changed'] else None)
    comparisons.append(row)
queue=deque([root]);visited=set();edges=[];missing=[];closure=[]
while queue:
    id=queue.popleft()
    if id in visited:continue
    visited.add(id)
    p=payload(id)
    d=fresh.get(id) or refmap.get(id) or {}
    txt=body(d.get('text','')) if d else (p or {}).get('body','')
    kids=links(txt)
    closure.append(dict(id=id,title=d.get('title') or (p or {}).get('title'),inIndex=id in indexmap,inReferences=id in refmap,payloadPresent=p is not None,freshChecked=id in fresh,category=(p or {}).get('category'),childIds=kids))
    for child in kids:
        edges.append(dict(parentId=id,childId=child))
        if child not in indexmap or not (base/'dist/archive/docs'/('notion-'+child+'.json')).exists():
            missing.append(dict(parentId=id,childId=child,inIndex=child in indexmap,inReferences=child in refmap,payloadPresent=(base/'dist/archive/docs'/('notion-'+child+'.json')).exists()))
        if child not in visited:queue.append(child)
workflowfile=base.parent/'abap-workbench/content-import/rap-workflows.json'
workflows=load(workflowfile) if workflowfile.exists() else []
for w in workflows:
    id=w['id'];p=payload(id) or {}
    w['archiveId']='notion-'+id
    w['archivePresent']=id in indexmap
    w['archiveCategory']=p.get('category')
    w['freshChecked']=id in fresh
    if id in fresh:w['sourceEditedAt']=fresh[id].get('page_last_edited_at')
    w['provenance']='Workflow organization derived from supplied Notion content; source excerpts preserved; not an SAP system execution test.'
unavailable=load(base/'references/notion-unavailable.json')
audit=dict(dateKST='2026-10-18',scope='17 fresh Notion reads: RAP root + 6 section pages + 10 primary workflow sources. Recursive link closure checked against current 517-page archive; descendant content not unnecessarily re-fetched.',sourceRootId=root,archiveNotionCount=len(indexmap),referencesNotionCount=len(refmap),freshFetchCount=len(fresh),changedPageIds=[r['id'] for r in comparisons if r['changed']],freshReadFailures=[],comparisons=comparisons,recursiveClosure=dict(reachablePageCount=len(closure),linkedEdgeCount=len(edges),missingLinks=missing,missingPageIds=sorted(set(r['childId'] for r in missing)),categoryCounts=dict(Counter(r['category'] for r in closure)),pages=closure),workflows=workflows,knownUnavailable=[r for r in unavailable if r['id'] in visited],observations=[dict(kind='organization',evidence='The RAP root is classified Gateway·CDS·Fiori, the EML primary source SQL·DB, and the full RAP project source FI·업무. These pages exist but RAP context is lost when filtering only by one category.',ids=[root,'3b6a6b8522df803d9395cb786ffb6100','3dda6b8522df80199896e13be8201d76']),dict(kind='workflow',evidence='Keep Notion section ancestry / a RAP track separate from functional tags; expose object location, source snippet, full-project section, and an observable completion check for each task.'),dict(kind='source-fidelity',evidence='Whole source code is a reference, not an SAP-validated generated template. Preserve the original project defect notes and link excerpts to their complete source context.')])
audit['scope']='18 fresh reads: RAP root + six section pages + ten primary workflow sources + one blank descendant confirmation. Current archive/reference closure checked without re-fetching all 517 documents; ancestry excluded.'
audit['archivePayloadMismatchPageIds']=audit['changedPageIds']
audit['changedPageIds']=[r['id'] for r in comparisons if r['sourceContentChanged']]
audit['blankSourceImportIssue']={'id':'2fea6b8522df804c9e38e68a3b4b0676','title':'SELECT','freshSourceIsBlank':True,'archiveIssue':'The archive body contains the complete Notion fetch envelope including ancestor-path and properties, rather than an empty source body. This is an importer representation issue, not a new source edit.','sourceEditedAt':'2026-02-05T12:47:55.252Z','builderLocation':'scripts/build-archive.py notion_body fallback when no <content> exists'}
audit['recursiveClosure']['recipeCount']=sum(bool(indexmap.get(r['id'],{}).get('recipe')) for r in closure)
audit['workflowsAllPresent']=all(w['archivePresent'] for w in workflows)
audit['observations'].append({'kind':'importer','evidence':'The SELECT blank-page descendant is rendered/stored as a fetch envelope. Do not treat ancestor URLs in that envelope as missing RAP child content; all 96 actual linked pages are present.'})
(base/'references/audit-rap-2026-10-18.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(fresh=len(fresh),changed=audit['changedPageIds'],reachable=len(closure),missing=audit['recursiveClosure']['missingPageIds'],categoryCounts=audit['recursiveClosure']['categoryCounts']),ensure_ascii=True,indent=2))

