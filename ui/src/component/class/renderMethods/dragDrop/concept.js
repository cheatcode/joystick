// import ui from '@joystick.js/ui';

// /*
//   TODO:

//   Idea: circumvent the need for manipulating DOM nodes directly.

//   Instead, have a component for sortable() which manages state and re-renders internally.
//   So, instead of insertBefore and stuff, just track the current index relative to state using
//   data attributes on list items. 

//   <li data-sortable-index="0" data-draggable="abc123">Thing</li>
//   <li data-sortable-index="1" data-draggable="def123">Thing</li>
//   <li data-sortable-index="2" data-draggable="ghi123">Thing</li>

//   When [data-sortable-index="1"] is dragged over 0, just say "take 0 and make it 1, take 1 and make it 0" on state.
//   This would trigger a re-render, ordering the list BUT would avoid jarring the DOM.

//   ---

//   For custom implementations, have a vanilla drag() and drop() render method for creating drag and drop targets. E.g.,
//   having a list of "parts" on the left and dragging them into a canvas on the right (see Jetic example in UI folder).

//   The idea for these would be to have event listeners like we have now and you can implement however you'd like.
// */
// const Store = ui.component({
//   render: ({ drag, drop, sortable, state }) => {
//     return `
//       <div>
//         ${sortable('listName', {
//           group: 'store',
//           drop: true,
//           pull: true,
//           items: state.items,
//           rootElement: 'div',
//           renderItem: (item = {}, sortable = {}) => {
//             return `<li>${item.name}</li>`;
//           },
//           events: {
//             onDrag: () => {},
//           },
//         })}
//       </div>
//     `;
//   },
// });

// export default Store;