const Decision = require('./decision')

class Bouncer {
  constructor () {
    this._rules = {}
    this._timeout = 5000
    this._errorCallback = null
  }

  setRule (ruleName, ruleFunc) {
    // validate args
    if (typeof ruleName !== 'string') {
      throw new Error('name must be a String')
    }

    if (typeof ruleFunc !== 'function') {
      throw new Error('rule must be a Function')
    }

    const rule = this._rules[ruleName]

    // verify rule doesn't exist
    if (typeof rule === 'function') {
      throw new Error('rule already defined')
    }

    // otherwise set rule
    this._rules[ruleName] = ruleFunc
  }

  async canUser (ruleName, args) {
    const rule = this._rules[ruleName]
    const decision = new Decision(this._timeout)

    if (rule === undefined || rule === null) {
      // rule undefined
      decision.deny('no rule set')
    } else {
      // rule defined
      try {
        rule(decision, args)
      } catch (error) {
        decision.deny('error interpreting rule')
        this._reportError(error)
      }
    }

    return decision.promise()
  }

  handleError (newErrorCallback) {
    if (typeof this._errorCallback === 'function') {
      throw new Error('error handling already setup')
    }
    if (typeof newErrorCallback === 'function') {
      this._errorCallback = newErrorCallback
    } else {
      throw new Error('error callback must be a function')
    }
  }

  setTimeout (timeout) {
    if (typeof timeout !== 'number') {
      throw new Error('timeout must be a number')
    } else {
      this._timeout = timeout
    }
  }

  _reportError (error) {
    if (typeof this._errorCallback === 'function') {
      this._errorCallback(error)
    }
  }
}

module.exports = Bouncer
