var c=(i,n,l,h)=>{if(n.id==i&&(n[l]=h),n.children!==void 0&&n.children.length>0)for(let d=0;d<n.children.length;d++)n.children[d]=c(i,n.children[d],l,h);return n},f=c;export{f as default};
