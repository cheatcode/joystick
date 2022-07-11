import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}, html = '') => {
  try {
    const { wrapper = null, ssrId = null, id = null, instanceId = null } = componentInstance;
    return `<div ${wrapper?.id ? `id="${wrapper.id}" ` : ''}${wrapper?.classList ? `class="${wrapper.classList?.join(' ')}" ` : ''}js-ssrId="${ssrId}" js-c="${id}" js-i="${instanceId}">${html}</div>`;
  } catch (exception) {
    throwFrameworkError('component.render.wrapHTML', exception);
  }
};
