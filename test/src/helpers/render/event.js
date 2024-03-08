const event = (event_type = '', event_target = '', dom = {}, overrides = {}) => {
 const app = dom?.document?.querySelector('#app');
 
 const target = app?.querySelector(event_target);
 const event_to_dispatch = new Event(event_type);

 if (Object.keys(overrides)?.length > 0) {
   // NOTE: Isolate to event.target as that's the most common thing to override
   // and avoids event being broken with non-standard API changes.
   Object.assign(target, overrides);
 }
 
 target.dispatchEvent(event_to_dispatch);
 
 return true;
};

export default event;
