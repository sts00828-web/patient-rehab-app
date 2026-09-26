/* Reapply only the selected additions; preserve all existing definitions and assignments. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),catalog=require(path.join(root,'clinical-catalog.js'));
const selection=require('./clinical-v03-selection.json');
for(const row of selection.adopted){
 const image=path.join(root,row.definition.image);
 if(!fs.existsSync(image))throw Error('Reviewed image missing: '+row.id);
 const sha256=crypto.createHash('sha256').update(fs.readFileSync(image)).digest('hex');
 catalog.definitions[row.id]={...row.definition,sha256};
 for(const [cid,level] of Object.entries(row.placements)){
  const ids=catalog.categories[cid]?.levels[level];if(!ids)throw Error('Unknown category/level '+cid+'/'+level);
  if(!ids.includes(row.id))ids.push(row.id);
 }
}
catalog.version='0.3-selected';
catalog.selectionReview={date:selection.date,kind:'AI evidence-informed design review; individual prescribing remains with the treating clinician',added:selection.adopted.map(r=>r.id)};
catalog.references={...catalog.references,...selection.references};
fs.writeFileSync(path.join(root,'clinical-catalog.js'),'/* Existing v0.2 definitions plus selected v0.3 additions. Clinical approval is not inferred from AI review. */\n(function(root){\nconst data='+JSON.stringify(catalog,null,2)+';\nif(typeof module!=="undefined"&&module.exports)module.exports=data;else root.ClinicalCatalog=data;\n})(globalThis);\n');
console.log('Selected additions ready:',selection.adopted.length,'active:',Object.values(catalog.definitions).filter(d=>d.status!=='retired').length);
