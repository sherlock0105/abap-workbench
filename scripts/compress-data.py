"""Publish gzip source payloads and verify exact decompression before removal."""
import gzip,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
files=[*sorted((DIST/'archive').rglob('*.json')),DIST/'workflows.json']
count=before=after=0
for p in files:
    if not p.exists():continue
    data=p.read_bytes();packed=gzip.compress(data,compresslevel=9,mtime=0)
    if gzip.decompress(packed)!=data:raise ValueError('Data does not round-trip: '+str(p))
    p.with_suffix(p.suffix+'.gz').write_bytes(packed)
    before+=len(data);after+=len(packed);count+=1;p.unlink()
# Remove no-longer-indexed payloads only within the generated document directory.
index=json.loads(gzip.decompress((DIST/'archive/index.json.gz').read_bytes()))
allowed={d['id']+'.json.gz' for d in index}
for p in (DIST/'archive/docs').glob('*.json.gz'):
    if p.name not in allowed:p.unlink()
expanded=sum(p.stat().st_size for p in DIST.rglob('*') if p.is_file())
print(json.dumps({'files':count,'dataBytesBefore':before,'dataBytesAfter':after,'siteExpandedBytes':expanded,'limitBytes':256*1024*1024}))
if expanded>256*1024*1024:raise ValueError('Expanded static assets exceed hosting limit')
