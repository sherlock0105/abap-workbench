// Original archive stays intact; authored guides share its search and reader.
import {learningContent} from './learning-content.js';
export const learningDocuments=learningContent.map(d=>({
 ...d,source:'학습 문서',category:'F4·텍스트 매핑',track:'ABAP',format:'markdown',recipe:false,
 path:'ZPDHFIR0001 / F4·텍스트 매핑 / 2026.10.19',
 url:'https://sherlock0105.github.io/abap-workbench/#docs/'+d.id,
 text:d.body,search:(d.title+' '+d.summary+' '+d.body).normalize('NFKC').toLowerCase(),
 relatedObjects:learningContent.filter(x=>x.id!==d.id).map(x=>x.id),events:['PROCESS ON VALUE-REQUEST · POV']
}));
