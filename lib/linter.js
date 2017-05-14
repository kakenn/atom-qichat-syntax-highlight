'use babel';

export default class Linter {
  checkTopic(line) {
    var reg = /~[\w]+/
    var m = line.match(reg)

    if (!m) {
      this.addMessage('error', [[this.pos[0], 0], [this.pos[0], line.length]], `nothing topic name`)
    } else if (m[0].slice(1) != this.fileName.split("_").slice(0, -1).join("_")) {
      var lastpos = [this.pos[0], m.index + m[0].length]
      this.addMessage('error', [[this.pos[0], m.index], lastpos], `not match file name and topic name`)
    }

    if (!line.endsWith("()")) {
      this.addMessage('error', [[this.pos[0], 0], [this.pos[0], line.length]], `nothing expected "()" end line ` + (this.pos[0] + 1))
    }
  }

  checkLanguage(line) {
    var reg = /language:\s+(\w+)/
    var m = line.match(reg)

    if (!m) {
      this.addMessage('error', [[this.pos[0], 0], [this.pos[0], line.length]], `nothing language name`)
    } else if(RegExp.$1 != this.fileName.split("_").slice(-1)[0].split(".")[0]) {
      var lastpos = [this.pos[0], m.index + m[0].length]
      this.addMessage('error', [[this.pos[0], m.index], lastpos], `not match file name and language name`)
    }
  }

  checkZenkaku(line, pos) {
    // 全角になっているキーワードを探す
    Array.prototype.forEach.call(line, function(c, i) {
      var m = c.match(/([：＄（）｛｝”　〜＝])/)
      if (m) {
        this.addMessage('warning', [[pos[0], i], [pos[0], i + 1]], `unexpected zenkaku "` + m[0] + `"`)
      }
    }, this)
  }

  checkVoice(line, pos) {
    // 抑揚タグで表記が間違っているものを探す
    var _startPos = -1
    var _endPos = -1
    Array.prototype.forEach.call(line, function(c, i) {
      if (c == "\\") {
        if (_startPos == -1) {
          _startPos = i
        } else {
          _endPos = i
        }

        if (_endPos != -1) {
          var m = line.slice(_startPos, _endPos + 1).match(/\\(.+?)=[0-9]+?\\/i)
          if (m) {
            if (!m[1].match(/rspd/i) && !m[1].match(/vct/i) && !m[1].match(/pau/i) && !m[1].match(/emph/i)) {
              var lastpos = [pos[0], _startPos + m.index + m[0].length]
              this.addMessage('error', [[pos[0], _startPos + m.index], lastpos], `unexpected voice tag "` + m[1] + `"`)
            }
          }
          _startPos = -1
          _endPos = -1
        }
      }
    }, this)
  }

  checkProposal(lines) {
    var pos = [this.pos[0], this.pos[1]]
    var s = ""

    lines.forEach(function(line, i){
      this.checkZenkaku(line, pos)
      this.checkVoice(line, pos)
      pos [0] += 1
    }, this)
  }

  checkUtterance(lines) {
    var pos = [this.pos[0], this.pos[1]]
    var s = ""

    lines.forEach(function(line, i){
      this.checkZenkaku(line, pos)
      this.checkVoice(line, pos)
      pos [0] += 1
    }, this)
  }

  checkLine(stack) {
    if (stack["type"] == "p") {
      this.checkProposal(stack["lines"])
    } else if (stack["type"] == "u") {
      this.checkUtterance(stack["lines"])
    }
    this.pos[0] += stack["lines"].length
    this.pos[1] = 0
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
    var _stack = {"lines": [], "type": ""}

    // 各行のチェック
    lines.forEach(function(line, i){
      if (line.startsWith("topic:")) {
        this.checkTopic(line)
        _checkedTopic = true

        // ポジションの更新
        this.pos[0] += 1
        this.pos[1] = 0
      } else if (line.startsWith("language:")) {
        if (!_checkedTopic) {
          this.addMessage('error', [[this.pos[0], 0], [this.pos[0], 1]], `nothing topic def before laguage def`)
        }
        this.checkLanguage(line)
        _checkedLanguage = true

        // ポジションの更新
        this.pos[0] += 1
        this.pos[1] = 0
      } else if (line.match(/\s*proposal[:：]/)) {
        if (_stack["lines"].length != 0) {
          this.checkLine(_stack)
          _stack = {"lines": [], "type": ""}
        }

        _stack["lines"].push(line)
        _stack["type"] = "p"
      } else if (line.match(/\s*u[1-9]*[:：]/)) {
        if (_stack["lines"].length != 0) {
          this.checkLine(_stack)
          _stack = {"lines": [], "type": ""}
        }

        _stack["lines"].push(line)
        _stack["type"] = "u"
      } else if (line.trim == "") {
        this.pos[0] += 1
        this.pos[0] = 0
      } else {
        _stack["lines"].push(line)
      }
    }, this)
  }

  addMessage(type, pos, message) {
    this.messages.push({
      severity: type,
      location: {
        file: this.editorPath,
        position: pos,
      },
      excerpt: message,
      description: message
    })
  }
}
