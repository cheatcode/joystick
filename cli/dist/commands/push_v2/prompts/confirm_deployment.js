import _ from"ascii-table";import e from"chalk";const s=(r,[l="",o=[]])=>{r.addRow(`${e.magenta(l)}
`);for(let t=0;t<o?.length;t+=1){const n=o[t];r.addRow(`${e.yellow(n?.provider)} (${e.green(n?.region)})`,`${e.white(n?.size)}  $${e.green(n?.pricePerMonth)}/mo.  x${e.blue(n?.quantity)}  ${e.white("=")}  $${e.green(n?.quantity*n?.pricePerMonth)}/mo.${t+1===o?.length?`
`:""}`)}},d=(r=[])=>Object.values(r)?.flatMap(o=>o)?.reduce((o=0,t={})=>(o+=t?.pricePerMonth*t?.quantity,o),0),h=(r={})=>{const l=d(r?.load_balancer),o=d(r?.app),t=l+o,n=new _;n.removeBorder(),n.addRow(`${e.blue("Load Balancer")}
`);const i=Object.entries(r?.load_balancer),c=Object.entries(r?.app);for(let a=0;a<i?.length;a+=1)s(n,i[a]);n.addRow(`
  ${e.blue("App")}
`);for(let a=0;a<c?.length;a+=1)s(n,c[a]);n.addRow(e.white(`
  ---
`)),n.addRow(e.green("Monthly Cost"),e.white(`$${e.green(t)}/mo.`)),n.addRow(e.green("Annual Cost"),e.white(`$${e.green(t*12)}/yr.`));const p=t>100;return[{name:"confirm_deployment",type:"confirm",prefix:"",message:`
 ${e.greenBright(">")} Start deployment and provision these instances?`,suffix:`
	  
${n.toString()}
	  ${p?`

  ${e.yellowBright(`!!! >>> These costs are ${e.magenta("high")}. Be absolutely ${e.magenta("CERTAIN")} you want to run this deployment. <<< !!!`)}
	  
 `:`
`}`}]};var g=h;export{g as default};
