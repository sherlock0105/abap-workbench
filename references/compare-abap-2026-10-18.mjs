import fs from 'node:fs';
const docs=JSON.parse(fs.readFileSync('dist/archive/index.json','utf8'));
const getId=u=>String(u).match(/([0-9a-f]{32}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})/i)?.[1]?.replaceAll('-','').toLowerCase();
const ids=new Set(docs.filter(x=>x.source==='Notion').map(d=>getId(d.id)||getId(d.url)));
const body=d=>d.text?.match(/<content>([\s\S]*?)<\/content>/)?.[1]||'';
const links=t=>[...new Set([...t.matchAll(/https:\/\/(?:app\.notion\.com|(?:www\.)?notion\.so|[a-zA-Z0-9.-]+\.notion\.site)\/[^"'\s)<]+/g)].map(x=>x[0]))];
const data=JSON.parse(fs.readFileSync('references/notion-new-2026-10-18.json','utf8'));
const comparison=data.responses.map(({id,response})=>{
const source=response.structuredContent||JSON.parse(response.content.find(x=>x.type==='text').text),old=docs.find(x=>getId(x.id)===id),text=body(source),oldText=old?.text||'';
const currentLinks=links(text),previousLinks=links(oldText);
return {id,title:source.title,sourceEditedAt:source.page_last_edited_at,imported:!!old,exactBodyMatches:text===oldText,trimBodyMatches:text.trim()===oldText.trim(),sourceCharacters:text.length,archiveCharacters:oldText.length,addedLines:text.split('\n').filter(l=>!oldText.split('\n').includes(l)),removedLines:oldText.split('\n').filter(l=>!text.split('\n').includes(l)),codeBlocks:(text.match(/```/g)||[]).length/2,codeIdentical:JSON.stringify([...text.matchAll(/^[ \t]*```[^\n]*\n([\s\S]*?)^[ \t]*```[ \t]*$/gm)].map(x=>x[1]))===JSON.stringify([...oldText.matchAll(/^[ \t]*```[^\n]*\n([\s\S]*?)^[ \t]*```[ \t]*$/gm)].map(x=>x[1])),directLinks:currentLinks.length,newLinkIds:currentLinks.map(getId).filter(x=>!previousLinks.map(getId).includes(x)),missingLinkIds:currentLinks.map(getId).filter(x=>x&&!ids.has(x)),truncated:!!source.truncated,unknownBlockCount:source.unknown_block_count||0};
});
fs.writeFileSync('references/abap-comparison-2026-10-18.json',JSON.stringify(comparison,null,2));
console.log(JSON.stringify(comparison.map(({addedLines,removedLines,...r})=>({...r,addedLineCount:addedLines.length,removedLineCount:removedLines.length}))));

