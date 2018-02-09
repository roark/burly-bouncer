# Burly Bouncer

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A concise, framework agnostic, authorization library. Written in JS, utilizing promises.

```javascript
bouncer.setRule('enter club', (decide, {age}) => {
  if (age >= 21)
    decide.allow('old enough')
  else 
    decide.deny('is a minor')
})

const verdict = await bouncer.canUser('enter club', {age: 25})

if (verdict.isAllow)
  console.log('lets drink!')
else 
  console.log(verdict.reason)
```

## Background
The motivation for this library was to build a framework agnostic authorization module that was powerful yet simple to use. 

It needed to accomplish the following items:
1) Allow for defining of custom authorization rules
2) Always return an authorization `verdict`
3) Gracefully handle rule errors
4) Allow for async rules
5) Always return promises for async / await 
6) Be framework agnostic
7) Small codebase, no dependencies (small attack surface)

## Install
```
npm install --save burly-bouncer
```

## Usage

We recommend you instantiate, define the the rules and configure your bouncer in a single file.
```javascript
// bouncer.js
import BurlyBouncer from 'burly-bouncer'
const bouncer = new BurlyBouncer()

// define rules
bouncer.setRule('enter vip', (decide, {tip}) => {
  if (tip >= 50) {
    decide.allow('welcome back sir')
  } else {
    decide.deny('vips only buddy')
  }
})

// handle errors (optional)
bouncer.handleErrors(function (error) {
  console.log(error)
})

// timeout config (optional)
bouncer.setTimeout(5000) // default 5s

export default bouncer
```

Then you can require your bouncer, client side or server side, wherever it is needed.
```javascript
import bouncer from './bouncer.js'

bouncer.canUser('enter vip', {tip: 100}).then((verdict) => {
  if (verdict.isAllow) {
    console.log('vip life!')
  } else {
    console.log(verdict.reason)
  }
})
```

#### Using with async / await
Since `bouncer.canUser()` always returns a promise you can `await` its results if you're within an `async` function.
```javascript
async function someFunc () {
  const verdict = await bouncer.canUser('enter vip', {tip: 100})
}
```

## Design

Burly Bouncer is designed to be as robust as possible. 

It will noisely throw errors if you supply it with incorrectly formed rules, duplicate rules or any other mis-configuration.

However, when it comes to executing those rules `bouncer.canUser()` it will **never** throw an error.

If there is trouble executing an authorization rule, Burly Bouncer will always return a `deny verdict`. Cases that may cause this are, **(1)** an unexpected error thrown inside rule, **(2)** rule never resolves with a decision or **(3)** a rule that is not defined.

You never need to wrap your calls to `bouncer.canUser()` in `try / catch` blocks. Since it will always return a verdict and never throw an error. This allows for cleaner code.

If there is an error in a rule, it can be caught and logged via the `bouncer.handleError()` callback. Rules should not intentionally throw errors, therefore any error in a custom defined rule should be logged and fixed.

## Considerations
As with all authorization rules. It is important that you only pass in arguments you know to be valid and trusted.

**Never** trust the end-user to supply you with valid information. 

This library is written by a single person. It hasn't been thoroughly vetted by a 3rd party or the world at large. Use at your own discretion.

That said, the codebase is incredibly small. I welcome you to take a look at it to see if it fits your needs and is up to your security standards.

All issue reports and PRs welcome.

## API
`bouncer.setRule(ruleName, ruleFunc)`
`bouncer.canUser(ruleName, argsObj)`
`bouncer.handleError(callback)`
`bouncer.setTimeout(milliseconds)`

`ruleFunc(decision, argsObj)`

`decision.allow(reason)`
`decision.deny(reason)`

`verdict.isAllow`
`verdict.isDeny`
`verdict.reason`

## Contribute
PRs accepted. 
Using [standard-js](https://github.com/standard/standard) and [standard-readme](https://github.com/RichardLitt/standard-readme) for styling conventions.

## License
[MIT © Roark](../LICENSE)