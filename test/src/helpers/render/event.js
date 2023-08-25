export default (eventType = '', eventTarget = '', dom = {}, overrides = {}) => {
 const app = dom?.document?.querySelector('#app');
 
 const target = app?.querySelector(eventTarget);
 const eventToDispatch = new Event(eventType);

 if (Object.keys(overrides)?.length > 0) {
   // NOTE: Isolate to event.target as that's the most common thing to override
   // and avoids event being broken with non-standard API changes.
   Object.assign(target, overrides);
 }
 
 target.dispatchEvent(eventToDispatch);
 
 return true;
};
