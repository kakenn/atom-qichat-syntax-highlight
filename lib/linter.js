'use babel';

export default class Linter {
  checkTopic(line) {
    var reg = /~[\w]+/
    var m = line.match(reg)

    if (!m) {
      this.addMessage([[this.pos[0], 0], [this.pos[0], line.length]], `no topic name`)
    } else if (m[0].slice(1) != this.fileName.split("_").slice(0, -1).join("_")) {
      var lastpos = [this.pos[0], m.index + m[0].length]
      this.addMessage([[this.pos[0], m.index], lastpos], `not match file name and topic name`)
    }

    if (!line.endsWith("()")) {
      this.addMessage([[this.pos[0], 0], [this.pos[0], line.length]], `nothing expected "()" end line ` + (this.pos[0] + 1))
    }
  }

  checkLanguage(line) {
    var reg = /language:\s+(\w+)/
    var m = line.match(reg)

    if (!m) {
      this.addMessage([[this.pos[0], 0], [this.pos[0], line.length]], `no language name`)
    } else if(RegExp.$1 != this.fileName.split("_").slice(-1)[0].split(".")[0]) {
      var lastpos = [this.pos[0], m.index + m[0].length]
      this.addMessage([[this.pos[0], m.index], lastpos], `not match file name and language name`)
    }
  }

  lint(textEditor) {
    this.editorPath = textEditor.getPath()
    this.fileText = textEditor.getText()
    this.fileName = textEditor.getFileName()
    var lines = this.fileText.split(/[\r|\n]/)

    this.messages = []
    this.pos = [0, 0]

    var _checkedTopic = false
    var _checkedLanguage = false

    // 各行のチェック
    lines.forEach(function(line, i){
      if (line.startsWith("topic:")) {
        this.checkTopic(line)
        _checkedTopic = true
      } else if (line.startsWith("language:")) {
        if (!_checkedTopic) {
          this.addMessage([[this.pos[0], 0], [this.pos[0], 1]], `nothing topic def before laguage def`)
        }
        this.checkLanguage(line)
        _checkedLanguage = true
      } else if (line.match(/\s+proposal:/)) {

      }

      // ポジションの更新
      this.pos[0] += 1
      this.pos[1] = 0
    }, this)
  }

  addMessage(pos, message) {
    this.messages.push({
      severity: 'error',
      location: {
        file: this.editorPath,
        position: pos,
      },
      excerpt: message,
      description: message
    })
  }
}
