'use babel';

export default class Linter {
  constructor() {
    this.messages = []
    this.pos = [0, 0]
  }

  checkTopic(line) {
    var reg = /~[\w]+/
    var m = line.match(reg)

    if (!m) {
      this.messages.push({
        severity: 'error',
        location: {
          file: self.editorPath,
          position: [[this.pos[0], 0], [this.pos[0], line.length]],
        },
        excerpt: `no topic name`,
        description: `topic name don't find`
      })
    } else if (m[0].slice(1) != self.fileName.split("_").slice(0, -1).join("_")) {
      var lastpos = [this.pos[0], m.index + m[0].length]
      this.messages.push({
        severity: 'error',
        location: {
          file: self.editorPath,
          position: [[this.pos[0], m.index], lastpos],
        },
        excerpt: `no match file name and topic name`,
        description: `diferrence file name and topic name`
      })
    }
  }

  checkLanguage(line) {
    var reg = /language:\s+(\w+)/
    var m = line.match(reg)

    if (!m) {
      this.messages.push({
        severity: 'error',
        location: {
          file: self.editorPath,
          position: [[this.pos[0], 0], [this.pos[0], line.length]],
        },
        excerpt: `no language name`,
        description: `language name don't find`
      })
    } else if(RegExp.$1 != self.fileName.split("_").slice(-1)[0].split(".")[0]) {
      var lastpos = [this.pos[0], m.index + m[0].length]
      this.messages.push({
        severity: 'error',
        location: {
          file: self.editorPath,
          position: [[this.pos[0], m.index], lastpos],
        },
        excerpt: `no match file name and language name`,
        description: `diferrence file name and language name`
      })
    }
  }

  lint(textEditor) {
    self.editorPath = textEditor.getPath()
    self.fileText = textEditor.getText()
    self.fileName = textEditor.getFileName()
    var lines = fileText.split(/[\r|\n]/)

    // 各行のチェック
    lines.forEach(function(line, i){
      if (line.startsWith("topic:")) {
        this.checkTopic(line)
      } else if (line.startsWith("language:")) {
        this.checkLanguage(line)
      } else if (line.match(/\s+proposal:/)) {

      }

      // ポジションの更新
      this.pos[0] += 1
      this.pos[1] = 0
    }, this)
  }
}
