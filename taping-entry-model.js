/* Display helpers only. Existing prescription IDs and records are never rewritten. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TapingEntryModel=api;})(globalThis,function(){
 'use strict';
 const taping=new Set(['v02_P27','v02_P28','v02_P29','v02_P30','v02_P41']);
 function isTaping(ex){return taping.has(ex?.exerciseKey);}
 function hasGuide(ex){return ['v02_P27','v02_P41'].includes(ex?.exerciseKey);}
 function guideExercise(ex){return ex?.exerciseKey==='v02_P27'?{...ex,exerciseKey:'v02_P41'}:ex;}
 function chapters(steps){const groups=[];for(const [index,step] of steps.entries()){let g=groups.at(-1);if(!g||g.phase!==step.phase){g={phase:step.phase,steps:[],first:index};groups.push(g);}g.steps.push({step,index,number:index+1});}return groups;}
 function endpoints(chapter){const steps=chapter.steps.map(x=>x.step);return steps.some(s=>s.logicalStripId&&s.logicalStripId!=='none')?{start:steps[0].action,end:steps.at(-1).action}:null;}
 return {isTaping,hasGuide,guideExercise,chapters,endpoints};
});
