"""Fit native-resolution captures into hosting limits, with verified pixel bounds.

Identical images share one asset. Large captures use libwebp near-lossless80;
every changed RGBA channel must differ by at most1 and alpha must remain exact.
The source Notion links and source bodies are unchanged.
"""
import hashlib,json,subprocess,sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1]
assetroot=(ROOT/'dist/assets/notion').resolve()
exe=Path(sys.argv[1]).resolve()
manifestpath=ROOT/'references/notion-assets.json'
manifest=json.loads(manifestpath.read_text(encoding='utf-8'))
temp=ROOT/'artifacts/qa/capture-encoding';temp.mkdir(parents=True,exist_ok=True)
originalroot=(Path(sys.argv[2]) if len(sys.argv)>2 else ROOT.parent/'abap-workbench-latest/dist/assets/notion').resolve()
groups={}
for p in sorted(originalroot.glob('*.webp'),key=lambda p:p.stat().st_size,reverse=True):
    groups.setdefault(hashlib.sha256(p.read_bytes()).hexdigest(),[]).append(p)
canonical={p.name:files[0].name for files in groups.values() for p in files}
dedupebytes=sum(p.stat().st_size for files in groups.values() for p in files[1:])
for row in manifest.values():row['path']='assets/notion/'+canonical[Path(row['path']).name]

def optimize(p):
    before=p.stat().st_size
    target=assetroot/p.name
    if before<65000:
        target.write_bytes(p.read_bytes());return None
    png=temp/(p.stem+'.png');dest=temp/(p.stem+'.webp')
    with Image.open(p) as original:
        a=original.convert('RGBA');a.save(png,'PNG')
        subprocess.run([str(exe),'-quiet','-near_lossless','80','-m','4',str(png),'-o',str(dest)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
        with Image.open(dest) as dec:
            b=dec.convert('RGBA');diff=ImageChops.difference(a,b).getextrema()
            valid=a.size==b.size and all(x[1]<=1 for x in diff[:3]) and diff[3][1]==0
        after=dest.stat().st_size
        png.unlink()
        if valid and after<before:
            target.write_bytes(dest.read_bytes());dest.unlink()
            return {'name':p.name,'before':before,'after':after,'width':a.width,'height':a.height,'maxChannelDifference':max(x[1] for x in diff),'alphaExact':True}
        dest.unlink();target.write_bytes(p.read_bytes())
    return None

results=[];count=0;saved=0
with ThreadPoolExecutor(max_workers=6) as pool:
    pending=[pool.submit(optimize,v[0]) for v in groups.values()]
    for f in as_completed(pending):
        r=f.result();count+=1
        if r:results.append(r);saved+=r['before']-r['after']
        if count%100==0:print(json.dumps({'checked':count,'optimized':len(results),'savedBytes':saved,'deduplicatedBytes':dedupebytes}),flush=True)
changes={r['name']:r for r in results}
for row in manifest.values():
    name=Path(row['path']).name;p=assetroot/name
    row['bytes']=p.stat().st_size
    if name in changes:row.update(lossless=False,nearLossless=80,maxChannelDifference=changes[name]['maxChannelDifference'],alphaExact=True)
manifestpath.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
# Only unreferenced duplicate files inside the verified capture directory.
used={Path(row['path']).name for row in manifest.values()}
for p in assetroot.glob('*.webp'):
    if p.parent.resolve()!=assetroot:raise ValueError('Outside capture directory')
    if p.name not in used:p.unlink()
audit={'captures':len(manifest),'uniqueAssets':len(used),'optimized':len(results),'savedBytes':saved,'deduplicatedBytes':dedupebytes,
       'nativeDimensionsPreserved':True,'alphaExact':True,'maximumChannelDifference':max([0]+[r['maxChannelDifference'] for r in results]),'results':results}
(ROOT/'references/capture-optimization.json').write_text(json.dumps(audit,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({k:v for k,v in audit.items() if k!='results'}),flush=True)
