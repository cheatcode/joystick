const d=async(o={},t={},e={})=>{const u=process?.queues[o?.body?.queue],s=e?.options?.queues[o?.body?.queue]?.jobs[o?.body?.job];if(!u)return t.status(404).send({status:404,error:`Queue ${o?.body?.queue} not found.`});if(!s)return t.status(400).send({status:400,error:`Couldn't find a job called ${o?.body?.job} for the ${o?.body?.queue} queue.`});await u.handle_next_job({_id:"joystick_test",job:o?.body?.job,payload:o?.body?.payload}),t.status(200).send({status:200,data:{}})};var a=d;export{a as default};
