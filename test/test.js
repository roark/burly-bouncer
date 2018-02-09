/* eslint-env mocha */
const assert = require('assert')
const Bouncer = require('../src/index')
const sleep = require('await-sleep')

describe('Bouncer', function () {
  let bouncer

  before(function (done) {
    bouncer = new Bouncer()

    bouncer.setRule('enter club', (decide, {age}) => {
      if (age >= 21) {
        decide.allow('user is old enough')
      } else {
        decide.deny('user is a minor')
      }
    })

    bouncer.setRule('async rule', async (decide) => {
      await sleep(250)
      decide.allow('async works')
    })

    bouncer.setRule('never resolve', (decide) => {
      // never resolves
    })

    bouncer.setRule('errored rule', (decide) => {
      throw new Error('mock unexpected error')
    })

    bouncer.setTimeout(500)

    done()
  })

  describe('canUser()', function () {
    it('should allow if valid args', function (done) {
      bouncer.canUser('enter club', {age: 25}).then((verdict) => {
        assert.equal(verdict.isAllow, true)
        assert.equal(verdict.isDeny, false)
        assert.equal(verdict.reason, 'user is old enough')
        done()
      })
    })

    it('should deny if invalid args', function (done) {
      bouncer.canUser('enter club', {age: 17}).then((verdict) => {
        assert.equal(verdict.isAllow, false)
        assert.equal(verdict.isDeny, true)
        assert.equal(verdict.reason, 'user is a minor')
        done()
      })
    })

    it('should deny if non defined rule name', function (done) {
      bouncer.canUser('not a rule').then((verdict) => {
        assert.equal(verdict.isAllow, false)
        assert.equal(verdict.isDeny, true)
        assert.equal(verdict.reason, 'no rule set')
        done()
      })
    })

    it('should deny if rule error', function (done) {
      bouncer.canUser('errored rule').then((verdict) => {
        assert.equal(verdict.isAllow, false)
        assert.equal(verdict.isDeny, true)
        assert.equal(verdict.reason, 'error interpreting rule')
        done()
      })
    })

    it('should deny if rule does not resolve in timeout period', function (done) {
      bouncer.canUser('never resolve').then((verdict) => {
        assert.equal(verdict.isAllow, false)
        assert.equal(verdict.isDeny, true)
        assert.equal(verdict.reason, 'rule timed out')
        done()
      })
    })

    it('should work with async rules', function (done) {
      bouncer.canUser('async rule').then((verdict) => {
        assert.equal(verdict.isAllow, true)
        assert.equal(verdict.isDeny, false)
        assert.equal(verdict.reason, 'async works')
        done()
      })
    })
  })

  describe('handleError()', function () {
    it('should catch rule error', function (done) {
      bouncer.handleError((err) => {
        assert.equal(err.message, 'mock unexpected error')
        done()
      })
      bouncer.canUser('errored rule')
    })
  })
})
