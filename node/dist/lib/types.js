const n=r=>!!r,t=r=>!!Array.isArray(r),s=r=>r===!0||r===!1,e=r=>Number(r)===r&&r%1!==0,o=r=>typeof r=="function",i=r=>Number(r)===r&&r%1===0,c=r=>r===null,u=r=>Number(r)===r,f=r=>!!(r&&typeof r=="object"&&!Array.isArray(r)),y=r=>typeof r=="string",_=r=>typeof r>"u",b={is_any:n,is_array:t,is_boolean:s,is_float:e,is_function:o,is_integer:i,is_null:c,is_number:u,is_object:f,is_string:y,is_undefined:_};var p=b;export{p as default};
