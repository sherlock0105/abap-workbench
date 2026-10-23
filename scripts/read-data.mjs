import fs from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
export async function readData(path){let bytes;try{bytes=await fs.readFile(path)}catch(e){if(e.code!=='ENOENT'||!path.endsWith('.json'))throw e;bytes=await fs.readFile(path+'.gz')}if(bytes[0]===31&&bytes[1]===139)bytes=gunzipSync(bytes);return JSON.parse(bytes.toString('utf8'));}
