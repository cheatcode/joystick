export default (eventType = '', eventTarget = '', dom = {}) => {
 const app = dom?.document?.querySelector('#app');
 
 const target = app?.querySelector(eventTarget);
 const eventToDispatch = new Event(eventType);
 
 target.dispatchEvent(eventToDispatch);
 
 return true;
};
