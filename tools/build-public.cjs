'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),rows=JSON.parse(fs.readFileSync(path.join(__dirname,'public-files.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert(rows.length>0);fs.mkdirSync(out,{recursive:true});
for(const e of rows){assert(!path.isAbsolute(e.file)&&!e.file.split('/').some(x=>x==='..'||x.startsWith('.')),'Unexpected output path');const b=fs.readFileSync(path.join(root,e.file));assert.equal(b.length,e.bytes,e.file);assert.equal(hash(b),e.sha256,e.file);const target=path.join(out,e.file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,b);}
const allowed=new Set(rows.map(e=>e.file));function audit(dir,prefix=''){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const rel=prefix+e.name;if(e.isDirectory())audit(path.join(dir,e.name),rel+'/');else assert(allowed.has(rel),'Unlisted public file '+rel);}}audit(out);
console.log('Verified '+rows.length+' application files in public; no authoring or patient files.');
