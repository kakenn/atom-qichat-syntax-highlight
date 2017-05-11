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

  provideLinter() {
    return {
      name: 'linter-qichat',
      scope: 'file', // or 'project'
      lintsOnChange: false, // or true
      grammarScopes: ['source.qichat'],
      lint(textEditor) {
        const editorPath = textEditor.getPath()
        const fileText = textEditor.getText()
        const fileName = textEditor.getFileName()

        // Do something async
        return new Promise(function(resolve) {
          const messages = []

          var pos = [0, 0]
          let lines = fileText.split(/[\r|\n]/)

          function checkTopic(line) {
            var reg = /~[\w]+/
            var m = line.match(reg)

            if (!m) {
              messages.push({
                severity: 'error',
                location: {
                  file: editorPath,
                  position: [[pos[0], 0], [pos[0], line.length]],
                },
                excerpt: `no topic name`,
                description: `topic name don't find`
              })
            } else if (m[0].slice(1) != fileName.split("_").slice(0, -1).join("_")) {
              var lastpos = [pos[0], m.index + m[0].length]
              messages.push({
                severity: 'error',
                location: {
                  file: editorPath,
                  position: [[pos[0], m.index], lastpos],
                },
                excerpt: `no match file name and topic name`,
                description: `diferrence file name and topic name`
              })
            }
          }

          function checkLanguage(line) {
            var reg = /language:\s+(\w+)/
            var m = line.match(reg)

            if (!m) {
              messages.push({
                severity: 'error',
                location: {
                  file: editorPath,
                  position: [[pos[0], 0], [pos[0], line.length]],
                },
                excerpt: `no language name`,
                description: `language name don't find`
              })
            } else if(RegExp.$1 != fileName.split("_").slice(-1)[0].split(".")[0]) {
              var lastpos = [pos[0], m.index + m[0].length]
              messages.push({
                severity: 'error',
                location: {
                  file: editorPath,
                  position: [[pos[0], m.index], lastpos],
                },
                excerpt: `no match file name and language name`,
                description: `diferrence file name and language name`
              })
            }
          }

          // 各行のチェック
          lines.forEach(function(line, i){
            if (line.startsWith("topic:")) {
              checkTopic(line)
            } else if (line.startsWith("language:")) {
              checkLanguage(line)
            } else if (line.match(/\s+proposal:/)) {
              
            }

            // ポジションの更新
            pos[0] += 1
            pos[1] = 0
          })

          // テストデータ
          messages.push({
            severity: 'info',
            location: {
              file: editorPath,
              position: [[0, 0], [0, 1]],
            },
            excerpt: `A random value is ${Math.random()}`,
            description: `### What is this?\nThis is a randomly generated value`
          })
          console.log(messages)

          resolve(messages)
        })
      }
    }
  },

};
