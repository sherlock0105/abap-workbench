"""Import every tracked file of the supplied FI repository, with source hashes."""
import hashlib, html, json, re, shutil, subprocess, sys
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter,defaultdict
from urllib.parse import quote

ROOT=Path(__file__).resolve().parents[1]
repo=Path(sys.argv[1]).resolve()
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
paths=subprocess.check_output(['git','ls-files','-z'],cwd=repo).decode('utf-8').split('\0')
paths=[p for p in paths if p]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
class Extract(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.pre=False;self.code=[];self.parts=[];self.title=False;self.t=[]
    def handle_starttag(self,tag,attrs):
        if tag=='pre':self.pre=True
        if tag=='title':self.title=True
        if tag=='tr':self.parts.append('\n| ')
        if tag in ['p','br','h1','h2','h3','table']:self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag=='pre':self.pre=False;self.code.append('\n')
        if tag=='title':self.title=False
        if tag in ['td','th']:self.parts.append(' | ')
        if tag in ['tr','p','h1','h2','h3']:self.parts.append('\n')
    def handle_data(self,data):
        if self.pre:self.code.append(data)
        if self.title:self.t.append(data)
        self.parts.append(data)
docs=[];programs=defaultdict(list);file_status=Counter()
for path in paths:
    raw=(repo/path).read_bytes();ext=Path(path).suffix.lower()
    source='https://github.com/sherlock0105/masterpack-project-fi/blob/'+commit+'/'+quote(path,safe='/')
    d={'id':'gh-fi-'+hashlib.sha256(path.encode()).hexdigest()[:16],'title':Path(path).name,'path':path,'url':source,
       'repo':'masterpack-project-fi','commit':commit,'sourceSha':hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest(),
       'sourceSha256':hashlib.sha256(raw).hexdigest(),'category':'FI·업무','format':'code','role':'원본 파일','language':'text'}
    if ext=='.png':
        asset='assets/github-fi/'+hashlib.sha256(raw).hexdigest()[:24]+ext
        (ROOT/'dist/assets/github-fi').mkdir(parents=True,exist_ok=True);shutil.copyfile(repo/path,ROOT/'dist'/asset)
        d.update(format='markdown',body='![저장소 원본 화면](./'+asset+')',role='화면 이미지',asset=asset);file_status['image']+=1
    else:
        try:body=raw.decode('utf-8-sig')
        except UnicodeDecodeError:body=raw.decode('cp949')
        d['body']=body;file_status['indexed-text' if body.strip() else 'empty']+=1
        if ext=='.html':
            parser=Extract();parser.feed(body)
            if 'Code listing for:' in body:
                d.update(body=''.join(parser.code),title=''.join(parser.t).strip() or d['title'],language='abap',role='ABAP 소스')
            else:d.update(body=''.join(parser.parts),format='markdown',role='DDIC 정의',category='DDIC')
        elif ext=='.md':d.update(format='markdown',role='설명',language='markdown')
        elif ext in ['.js','.xml','.json','.css','.yaml','.properties']:
            d.update(language={'.js':'javascript','.xml':'xml','.json':'json','.css':'css','.yaml':'yaml','.properties':'text'}[ext],role='UI5·설정 소스',category='Gateway·CDS·Fiori')
        elif ext=='.txt':
            d.update(role='화면 정의' if '%_DYNPRO' in body else 'GUI 제목',language='text')
        stem=Path(path).stem.lower()
        for suffix,label in [('top','TOP 선언'),('s01','Selection Screen'),('c01','로컬 클래스·이벤트'),('o01','PBO'),('i01','PAI'),('f01','FORM')]:
            if stem.endswith('_'+suffix):d['role']=label
    docs.append(d)
    if ext=='.html' and d.get('language')=='abap':
        folder=str(Path(path).parent).replace('\\','/');programs[folder].append(d)
    elif '/screens/' in path:
        folder=path.split('/screens/')[0];programs[folder].append(d)

base=read(ROOT/'references/github-documents.json');base=[d for d in base if d.get('repo')!='masterpack-project-fi'];base.extend(docs)
groups=read(ROOT/'references/github-programs.json');groups=[g for g in groups if g.get('repo')!='masterpack-project-fi']
for folder,files in programs.items():
    program=Path(folder).name
    files.sort(key=lambda d:({'TOP 선언':0,'Selection Screen':1,'로컬 클래스·이벤트':2,'PBO':3,'PAI':4,'FORM':5,'ABAP 소스':-1}.get(d['role'],6),d['path']))
    groups.append({'id':'ghp-fi-'+hashlib.sha256(folder.encode()).hexdigest()[:16],'program':program,'path':folder,'repo':'masterpack-project-fi','commit':commit,
        'category':'FI·업무','hasTop':any(f['role']=='TOP 선언' for f in files),
        'components':[{k:f[k] for k in ['id','path','title','role']} for f in files]})
save(ROOT/'references/github-documents.json',base);save(ROOT/'references/github-programs.json',groups)
audit={'repository':'sherlock0105/masterpack-project-fi','branch':'main','commit':commit,'fileCount':len(paths),'documentCount':len(docs),
       'programGroups':len(programs),'statusCounts':dict(file_status),'allPathsAccounted':len(paths)==len(docs),'checkedOn':'2026-10-18',
       'files':[{k:d[k] for k in ['id','path','sourceSha','sourceSha256']} for d in docs]}
save(ROOT/'references/masterpack-inventory.json',audit)
print(json.dumps({k:v for k,v in audit.items() if k!='files'},ensure_ascii=False))
