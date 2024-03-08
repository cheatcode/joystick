/**
 * VAT
 * https://gist.github.com/marcinlerka/630cc05d11bb10c5f1904506ff92abcd
*/

import types from "../../lib/types.js";

const regexes = { 
  AT: (/^(AT)(U\d{8}$)/i),                                   
  BE: (/^(BE)(\d{10}$)/i),                                   
  BG: (/^(BG)(\d{9,10}$)/i),                                 
  CY: (/^(CY)([0-5|9]\d{7}[A-Z]$)/i),                        
  CZ: (/^(CZ)(\d{8,10})?$/i),                                
  DE: (/^(DE)([1-9]\d{8}$)/i),                               
  DK: (/^(DK)(\d{8}$)/i),                                    
  EE: (/^(EE)(10\d{7}$)/i),                                  
  EL: (/^(EL)(\d{9}$)/i),                                    
  ES: (/^(ES)([0-9A-Z][0-9]{7}[0-9A-Z]$)/i),                 
  EU: (/^(EU)(\d{9}$)/i),                                    
  FI: (/^(FI)(\d{8}$)/i),                                    
  FR: (/^(FR)([0-9A-Z]{2}[0-9]{9}$)/i),                      
  GB: (/^(GB)((?:[0-9]{12}|[0-9]{9}|(?:GD|HA)[0-9]{3})$)/i),
  GR: (/^(GR)(\d{8,9}$)/i),                                 
  HR: (/^(HR)(\d{11}$)/i),                                  
  HU: (/^(HU)(\d{8}$)/i),                                   
  IE: (/^(IE)([0-9A-Z\*\+]{7}[A-Z]{1,2}$)/i),               
  IT: (/^(IT)(\d{11}$)/i),                                  
  LV: (/^(LV)(\d{11}$)/i),                                  
  LT: (/^(LT)(\d{9}$|\d{12}$)/i),                           
  LU: (/^(LU)(\d{8}$)/i),                                   
  MT: (/^(MT)([1-9]\d{7}$)/i),                              
  NL: (/^(NL)(\d{9}B\d{2}$)/i),                             
  NO: (/^(NO)(\d{9}$)/i),                                   
  PL: (/^(PL)(\d{10}$)/i),                                  
  PT: (/^(PT)(\d{9}$)/i),                                   
  RO: (/^(RO)([1-9]\d{1,9}$)/i),                            
  RU: (/^(RU)(\d{10}$|\d{12}$)/i),                          
  RS: (/^(RS)(\d{9}$)/i),                                   
  SI: (/^(SI)([1-9]\d{7}$)/i),                              
  SK: (/^(SK)([1-9]\d[(2-4)|(6-9)]\d{7}$)/i),               
  SE: (/^(SE)(\d{10}01$)/i)
};

const vat = (rule, value = "") => {
  const regex = types.is_object(rule) && rule.iso ? regexes[rule.iso || 'EU'] : regexes.EU;

  if (types.is_object(rule)) {
    return rule.rule === true ? !!value.match(regex) : !value.match(regex);
  }

  return rule === true ? !!value.match(regex) : !value.match(regex);
};

export default vat;
