import o from"../../lib/types.js";const s=(t={},n=[])=>{const i=Object.entries(t||{});for(let r=0;r<i?.length;r+=1){const[a,e]=i[r],l=n.find(_=>_.key===a);if(l||delete t[a],l&&o.is_object(e)&&l.children.length===0)return e;if(l&&o.is_object(e)&&l.children.length>0&&s(e,l.children),l&&o.is_array(e)&&l.children&&l.children.length>0)for(let _=0;_<e?.length;_+=1){const c=e[_];c&&o.is_object(c)&&s(c,l.children)}}return t},f=(t=[])=>t.map(n=>n.split(".")),h=(t=[])=>{const[n,...i]=t;return{head:n,tail:i}},u=(t=[])=>t.map(n=>h(n)),d=(t=[],n=[])=>{for(let i=0;i<n?.length;i+=1){const r=n[i],a=t.find(e=>e.key===r.head);if(!a){const e=r.tail&&r.tail.length>0?h(r.tail):null;t.push({key:r.head,children:e?d([],[e]):[]})}if(a){const e=r.tail&&r.tail.length>0?h(r.tail):null;a.children=[...e?d(a.children,[e]):[]]}}return t},p=(t={},n=[])=>{const i=[],r=f(n),a=u(r);return d(i,a),o.is_array(t)?t.map(e=>s(e,i)):s(t,i)};var y=p;export{y as default};
