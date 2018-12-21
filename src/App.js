import {diff, patch} from 'virtual-dom';
import createElement from 'virtual-dom/create-element';

/**
 * [app Core App, starts the program]
 * @param  {[object]} initModel [description]
 * @param  {[function]} update    [description]
 * @param  {[function]} view      [description]
 * @param  {[object]} node      [description]
 */
function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);

  /**
   * [dispatch Message dispatching fuction]
   * @param  {[Message]} msg [description]
   */
  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    // Get the scrolling to work right.
    const scrollDiv = document.getElementById('scrollbox');
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
    currentView = updatedView;
  }
}

export default app;
