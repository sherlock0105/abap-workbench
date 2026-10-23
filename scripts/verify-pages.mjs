import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('dist/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
 const ref=match[1];if(/^(?:https?:|data:|#)/.test(ref))continue;
 assert.ok(!ref.startsWith('/'),'Use repository-relative URL: '+ref);
 assert.ok(fs.existsSync('dist/'+ref.replace(/^\.\//,'')),ref);
}
for(const name of ['archive/index.json.gz','archive/coverage.json.gz','standard-snippets.js','core-code-view.js'])assert.ok(fs.existsSync('dist/'+name));
console.log('GitHub Pages assets and repository-relative URLs verified.');
