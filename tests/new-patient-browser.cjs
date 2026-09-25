/* TASK-020: real pointer input, using the existing isolated Chrome harness. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('  await evaluate("window.fillTestPrescription='));
const suffix=source.slice(source.indexOf("  assert.deepEqual(errors,[],'browser runtime errors');"));
const scenario=fs.readFileSync(path.join(__dirname,'new-patient-browser-scenario.js'),'utf8');
const file=path.join(__dirname,'new-patient-browser-generated.cjs');
const runner=new Module(file,module);runner.filename=file;runner.paths=module.paths;
runner._compile(prefix+scenario+'\n'+suffix,file);
