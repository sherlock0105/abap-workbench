// Store source data compressed at rest; preserve every source byte when reading.
export async function fetchData(path){
 const response=await fetch(path+'.gz');
 if(!response.ok)throw Error('자료를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
 if(typeof response.arrayBuffer!=='function')return response.json();
 const bytes=new Uint8Array(await response.arrayBuffer());
 // Some hosts decode Content-Encoding automatically; accept either form.
 if(bytes[0]!==31||bytes[1]!==139)return JSON.parse(new TextDecoder().decode(bytes));
 const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
 return new Response(stream).json();
}
