var r=$=>!!($&&typeof $=="object"&&!Array.isArray($));var e=$=>typeof $=="string";var s=/^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/,o=($,d="")=>{if(!d)return!0;if(d&&!e(d))return!1;let t=d?d.replace(/[- ]+/g,""):"";return $===!0?t.match(new RegExp(s)):!t.match(new RegExp(s))};var i=($="",d="")=>$(d);var a=/^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/,m=($,d="")=>$===!0?!!d.match(a):!d.match(a);var x=($,d="")=>$===d;var A=($,d="")=>$===d;var n=($,d="")=>d.length<=$;var c=($,d="")=>d.length>=$;var Z=/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,f=($,d="")=>$===!0?!!d.match(Z):!d.match(Z);var p={AF:/^\d{4}$/,AX:/^\d{5}$/,AL:/^\d{4}$/,DZ:/^\d{5}$/,AS:/^\d{5}(-{1}\d{4,6})$/,AD:/^[Aa][Dd]\d{3}$/,AI:/^[Aa][I][-][2][6][4][0]$/,AR:/^\d{4}|[A-Za-z]\d{4}[a-zA-Z]{3}$/,AM:/^\d{4}$/,AC:/^[Aa][Ss][Cc][Nn]\s{0,1}[1][Zz][Zz]$/,AU:/^\d{4}$/,AT:/^\d{4}$/,AZ:/^[Aa][Zz]\d{4}$/,BH:/^\d{3,4}$/,BD:/^\d{4}$/,BB:/^[Aa][Zz]\d{5}$/,BY:/^\d{6}$/,BE:/^\d{4}$/,BM:/^[A-Za-z]{2}\s([A-Za-z]{2}|\d{2})$/,BT:/^\d{5}$/,BO:/^\d{4}$/,BA:/^\d{5}$/,BR:/^\d{5}-\d{3}$/,"":/^[Bb][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,IO:/^[Bb]{2}[Nn][Dd]\s{0,1}[1][Zz]{2}$/,VG:/^[Vv][Gg]\d{4}$/,BN:/^[A-Za-z]{2}\d{4}$/,BG:/^\d{4}$/,KH:/^\d{5}$/,CA:/^(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\s{0,1}\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d$/,CV:/^\d{4}$/,KY:/^[Kk][Yy]\d[-\s]{0,1}\d{4}$/,TD:/^\d{5}$/,CL:/^\d{7}\s\(\d{3}-\d{4}\)$/,CN:/^\d{6}$/,CX:/^\d{4}$/,CC:/^\d{4}$/,CO:/^\d{6}$/,CD:/^[Cc][Dd]$/,CR:/^\d{4,5}$/,HR:/^\d{5}$/,CU:/^\d{5}$/,CY:/^\d{4}$/,CZ:/^\d{5}\s\(\d{3}\s\d{2}\)$/,DK:/^\d{4}$/,DO:/^\d{5}$/,EC:/^\d{6}$/,SV:/^1101$/,EG:/^\d{5}$/,EE:/^\d{5}$/,ET:/^\d{4}$/,FK:/^[Ff][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,FO:/^\d{3}$/,FI:/^\d{5}$/,FR:/^\d{5}$/,GF:/^973\d{2}$/,PF:/^987\d{2}$/,GA:/^\d{2}\s[a-zA-Z-_ ]\s\d{2}$/,GE:/^\d{4}$/,DE:/^\d{2}$/,GI:/^[Gg][Xx][1]{2}\s{0,1}[1][Aa]{2}$/,GR:/^\d{3}\s{0,1}\d{2}$/,GL:/^\d{4}$/,GP:/^971\d{2}$/,GU:/^\d{5}$/,GT:/^\d{5}$/,GG:/^[A-Za-z]{2}\d\s{0,1}\d[A-Za-z]{2}$/,GW:/^\d{4}$/,HT:/^\d{4}$/,HM:/^\d{4}$/,HN:/^\d{5}$/,HU:/^\d{4}$/,IS:/^\d{3}$/,IN:/^\d{6}$/,ID:/^\d{5}$/,IR:/^\d{5}-\d{5}$/,IQ:/^\d{5}$/,IM:/^[Ii[Mm]\d{1,2}\s\d\[A-Z]{2}$/,IL:/^\b\d{5}(\d{2})?$/,IT:/^\d{5}$/,JM:/^\d{2}$/,JP:/^\d{7}\s\(\d{3}-\d{4}\)$/,JE:/^[Jj][Ee]\d\s{0,1}\d[A-Za-z]{2}$/,JO:/^\d{5}$/,KZ:/^\d{6}$/,KE:/^\d{5}$/,KR:/^\d{6}\s\(\d{3}-\d{3}\)$/,XK:/^\d{5}$/,KW:/^\d{5}$/,KG:/^\d{6}$/,LV:/^[Ll][Vv][- ]{0,1}\d{4}$/,LA:/^\d{5}$/,LB:/^\d{4}\s{0,1}\d{4}$/,LS:/^\d{3}$/,LR:/^\d{4}$/,LY:/^\d{5}$/,LI:/^\d{4}$/,LT:/^[Ll][Tt][- ]{0,1}\d{5}$/,LU:/^\d{4}$/,MK:/^\d{4}$/,MG:/^\d{3}$/,MV:/^\d{4,5}$/,MY:/^\d{5}$/,MT:/^[A-Za-z]{3}\s{0,1}\d{4}$/,MH:/^\d{5}$/,MQ:/^972\d{2}$/,YT:/^976\d{2}$/,FM:/^\d{5}(-{1}\d{4})$/,MX:/^\d{5}$/,MD:/^[Mm][Dd][- ]{0,1}\d{4}$/,MC:/^980\d{2}$/,MN:/^\d{5}$/,ME:/^\d{5}$/,MS:/^[Mm][Ss][Rr]\s{0,1}\d{4}$/,MA:/^\d{5}$/,MZ:/^\d{4}$/,MM:/^\d{5}$/,NA:/^\d{5}$/,NP:/^\d{5}$/,NL:/^\d{4}\s{0,1}[A-Za-z]{2}$/,NC:/^988\d{2}$/,NZ:/^\d{4}$/,NI:/^\d{5}$/,NE:/^\d{4}$/,NG:/^\d{6}$/,NF:/^\d{4}$/,MP:/^\d{5}$/,NO:/^\d{4}$/,OM:/^\d{3}$/,PK:/^\d{5}$/,PW:/^\d{5}$/,PA:/^\d{6}$/,PG:/^\d{3}$/,PY:/^\d{4}$/,PE:/^\d{5}$/,PH:/^\d{4}$/,PN:/^[Pp][Cc][Rr][Nn]\s{0,1}[1][Zz]{2}$/,PL:/^\d{2}[- ]{0,1}\d{3}$/,PT:/^\d{4}$/,PR:/^\d{5}$/,RE:/^974\d{2}$/,RO:/^\d{6}$/,RU:/^\d{6}$/,BL:/^97133$/,SH:/^[Ss][Tt][Hh][Ll]\s{0,1}[1][Zz]{2}$/,MF:/^97150$/,PM:/^97500$/,VC:/^[Vv][Cc]\d{4}$/,SM:/^4789\d$/,SA:/^\d{5}(-{1}\d{4})?$/,SN:/^\d{5}$/,RS:/^\d{5}$/,SG:/^\d{2}$/,SK:/^\d{5}\s\(\d{3}\s\d{2}\)$/,SI:/^([Ss][Ii][- ]{0,1}){0,1}\d{4}$/,ZA:/^\d{4}$/,GS:/^[Ss][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,ES:/^\d{5}$/,LK:/^\d{5}$/,SD:/^\d{5}$/,SZ:/^[A-Za-z]\d{3}$/,SE:/^\d{3}\s*\d{2}$/,CH:/^\d{4}$/,SJ:/^\d{4}$/,TW:/^\d{5}$/,TJ:/^\d{6}$/,TH:/^\d{5}$/,TT:/^\d{6}$/,TN:/^\d{4}$/,TR:/^\d{5}$/,TM:/^\d{6}$/,TC:/^[Tt][Kk][Cc][Aa]\s{0,1}[1][Zz]{2}$/,UA:/^\d{5}$/,GB:/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z-[CIKMOV]]{2}/,US:/^\b\d{5}\b(?:[- ]{1}\d{4})?$/,UY:/^\d{5}$/,VI:/^\d{5}$/,UZ:/^\d{3} \d{3}$/,VA:/^120$/,VE:/^\d{4}(\s[a-zA-Z]{1})?$/,VN:/^\d{6}$/,WF:/^986\d{2}$/,ZM:/^\d{5}$/},z=($,d="")=>{let t=r($)&&$.iso?p[$.iso||"US"]:p.US;return r($)?$.rule===!0?!!d.match(t):!d.match(t):$===!0?!!d.match(t):!d.match(t)};var u=($="",d="")=>(d?.match($)||[])?.length>0;var E=($,d="",t={isChecked:!1})=>{if(!t.isChecked)return $===!0?d&&d.trim()!=="":d&&d.trim()==="";if(t.isChecked)return $===!0?d:!d};var h=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,S=($,d="")=>$===!0?!!d.match(h):!d.match(h);var C=/^[a-z0-9]+(?:-[a-z0-9]+)*$/,L=($,d="")=>$===!0?!!d.match(C):!d.match(C);var M=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,I=($,d="")=>$===!0?!!d.match(M):!d.match(M);var g=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/,T=($,d="")=>$===!0?!!d.match(g):!d.match(g);var R={AT:/^(AT)(U\d{8}$)/i,BE:/^(BE)(\d{10}$)/i,BG:/^(BG)(\d{9,10}$)/i,CY:/^(CY)([0-5|9]\d{7}[A-Z]$)/i,CZ:/^(CZ)(\d{8,10})?$/i,DE:/^(DE)([1-9]\d{8}$)/i,DK:/^(DK)(\d{8}$)/i,EE:/^(EE)(10\d{7}$)/i,EL:/^(EL)(\d{9}$)/i,ES:/^(ES)([0-9A-Z][0-9]{7}[0-9A-Z]$)/i,EU:/^(EU)(\d{9}$)/i,FI:/^(FI)(\d{8}$)/i,FR:/^(FR)([0-9A-Z]{2}[0-9]{9}$)/i,GB:/^(GB)((?:[0-9]{12}|[0-9]{9}|(?:GD|HA)[0-9]{3})$)/i,GR:/^(GR)(\d{8,9}$)/i,HR:/^(HR)(\d{11}$)/i,HU:/^(HU)(\d{8}$)/i,IE:/^(IE)([0-9A-Z\*\+]{7}[A-Z]{1,2}$)/i,IT:/^(IT)(\d{11}$)/i,LV:/^(LV)(\d{11}$)/i,LT:/^(LT)(\d{9}$|\d{12}$)/i,LU:/^(LU)(\d{8}$)/i,MT:/^(MT)([1-9]\d{7}$)/i,NL:/^(NL)(\d{9}B\d{2}$)/i,NO:/^(NO)(\d{9}$)/i,PL:/^(PL)(\d{10}$)/i,PT:/^(PT)(\d{9}$)/i,RO:/^(RO)([1-9]\d{1,9}$)/i,RU:/^(RU)(\d{10}$|\d{12}$)/i,RS:/^(RS)(\d{9}$)/i,SI:/^(SI)([1-9]\d{7}$)/i,SK:/^(SK)([1-9]\d[(2-4)|(6-9)]\d{7}$)/i,SE:/^(SE)(\d{10}01$)/i},G=($,d="")=>{let t=r($)&&$.iso?R[$.iso||"EU"]:R.EU;return r($)?$.rule===!0?!!d.match(t):!d.match(t):$===!0?!!d.match(t):!d.match(t)};var nd={creditCard:o,custom:i,email:m,equals:x,matches:A,maxLength:n,minLength:c,phone:f,postalCode:z,regex:u,required:E,semVer:S,slug:L,strongPassword:I,url:T,vat:G};export{nd as default};
