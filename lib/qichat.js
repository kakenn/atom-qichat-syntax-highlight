'use babel';

import QichatView from './qichat-view';
import { CompositeDisposable } from 'atom';

export default {

  qichatView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.qichatView = new QichatView(state.qichatViewState);
    this.subscriptions = new CompositeDisposable();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.qichatView.destroy();
  },

  serialize() {
    return {
      qichatViewState: this.qichatView.serialize()
    };
  },

};
