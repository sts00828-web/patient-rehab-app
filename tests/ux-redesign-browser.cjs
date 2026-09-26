/* Isolated synthetic-patient browser validation for the simplified workflow. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('  await evaluate("window.fillTestPrescription='));
const suffix=source.slice(source.indexOf("  assert.deepEqual(errors,[],'browser runtime errors');"));
const scenario=fs.readFileSync(path.join(__dirname,'ux-redesign-browser-scenario.js'),'utf8');
const file=path.join(__dirname,'ux-redesign-browser-generated.cjs');
const runner=new Module(file,module);runner.filename=file;runner.paths=module.paths;
runner._compile((prefix+scenario+'\n'+suffix).replace("art=path.join(root,'.test-artifacts')","art=path.join(root,'.test-artifacts','clinical-redesign','ux')"),file);
