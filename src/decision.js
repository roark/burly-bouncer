class Decision {
  constructor (timeout) {
    this._timeout = timeout
    this._promiseResolve = null
    this._promiseReject = null
    this._promise = new Promise((resolve, reject) => {
      this._promiseResolve = resolve
      this._promiseReject = reject
      const timeoutVerdict = this._buildVerdict(false, 'rule timed out')
      setTimeout(resolve, this._timeout, timeoutVerdict)
    })
  }

  promise () {
    return this._promise
  }

  allow (reason) {
    if (this._promiseResolve) {
      const verdict = this._buildVerdict(true, reason)
      this._promiseResolve(verdict)
    }
  }

  deny (reason) {
    if (this._promiseResolve) {
      const verdict = this._buildVerdict(false, reason)
      this._promiseResolve(verdict)
    }
  }

  _buildVerdict (allow, reason) {
    return {isAllow: allow, isDeny: !allow, reason: reason}
  }
}

module.exports = Decision
