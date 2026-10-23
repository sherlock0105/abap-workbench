"""Preserve source bodies; enrich navigation, image mapping, and dependency links."""
import json,re
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
idx=read(ROOT/'dist/archive/index.json');assets=read(ROOT/'references/notion-assets.json')
tracks=read(ROOT/'references/notion-tracks.json')
tasks=read(ROOT/'references/task-guides.json')['featureEntrypoints'];rap=read(ROOT/'references/rap-workflows.json')
taskmap={t['siteId']:dict(title=t['label'],intent=t['intent'],location='SAP GUI · SE38 / SE80',required=t['requiredObjects'],notes=t['notes'],relatedIds=t['relatedIds'],aliases=t['searchAliases']) for t in tasks}
audit=read(ROOT/'audit-abap-2026-10-18.json')
for t in audit['entrypoints']:
    original=taskmap.get(t['id'],{})
    taskmap[t['id']]={**original,'title':t['task'],'location':t['implementation'],'required':t['prerequisites'],'aliases':t['aliases']}
for t in rap:
    taskmap['notion-'+t['id']]=dict(title=t['task'],intent=t['check'],location=t['location'],steps=t['steps'],relatedIds=t.get('relatedIds',[]))
for item in idx:
    p=ROOT/'dist/archive/docs'/(item['id']+'.json');d=read(p)
    d['search']=item['search']
    d['track']=tracks.get(d['id'],'GitHub' if d['source']=='GitHub' else 'RAP' if 'RAP' in d['path'] else 'ABAP')
    if d['id'] in taskmap:
        d['task']=taskmap[d['id']];d['search']+=' '+json.dumps(d['task'],ensure_ascii=False).lower()
    if d['source']=='Notion':
        refs=set(re.findall(r'notion-file-block://[^\s)<>"\]]+',d['body']))
        d['images']={ref:assets[ref] for ref in refs if ref in assets}
        if d['id']=='notion-2cea6b8522df8033a626f7d103a430e5':
            originals=read(ROOT/'references/notion-documents.json')
            row_ids={'notion-'+x['id'] for x in originals if x['id']!='2cea6b8522df8033a626f7d103a430e5' and '2cea6b8522df8033a626f7d103a430e5' in x['text'].split('<content>',1)[0]}
            d['format']='database'
            d['databaseItems']=[{'id':x['id'],'title':x['title'],'category':x['category']} for x in idx if x['id'] in row_ids]
    if d.get('components'):
        # Link only dictionary objects referenced in actual component code.
        code='\n'.join(c['body'] for c in d['components'])
        objects=set(re.findall(r'\b(?:z[\w/]+)\b',code,re.I))
        d['relatedObjects']=[x['id'] for x in idx if x['source']=='GitHub' and 'dictionary-' in x['path'].lower() and
            Path(x['path']).stem.lower().removeprefix('dictionary-') in {n.lower() for n in objects}]
    item.update({k:v for k,v in d.items() if k not in ['body','components','combinedProgram','images']})
    item['search']=' '.join([d['title'],d['category'],d['path'],json.dumps(d.get('task',{}),ensure_ascii=False)]).lower()
    save(p,d)
c=read(ROOT/'dist/archive/coverage.json');fi=read(ROOT/'references/masterpack-inventory.json')
c.update(masterpackInventory=fi,notionImages=len(assets),rapDocuments=sum(d['track']=='RAP' for d in idx),
    verifiedOn='2026-10-18',repositories=['ABAP-STUDY','masterpack-project-fi'])
save(ROOT/'dist/archive/index.json',idx);save(ROOT/'dist/archive/coverage.json',c)
save(ROOT/'dist/workflows.json',{'rap':rap,'abap':tasks})
print(json.dumps({'documents':len(idx),'images':len(assets),'rap':c['rapDocuments'],'repositories':c['repositories']},ensure_ascii=False))
