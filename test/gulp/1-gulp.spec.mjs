
import {
  expect
} from 'chai'

import gulp from '#gulp'

describe('Gulp', () => {
  describe('`src`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'src'))
          .to.equal(true)
      )
    })
  })

  describe('`dest`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'dest'))
          .to.equal(true)
      )
    })
  })

  describe('`symlink`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'symlink'))
          .to.equal(true)
      )
    })
  })

  describe('`watch`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'watch'))
          .to.equal(true)
      )
    })
  })

  describe('`task`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'task'))
          .to.equal(true)
      )
    })
  })

  describe('`series`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'series'))
          .to.equal(true)
      )
    })
  })

  describe('`parallel`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'parallel'))
          .to.equal(true)
      )
    })
  })

  describe('`tree`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'tree'))
          .to.equal(true)
      )
    })
  })

  describe('`lastRun`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'lastRun'))
          .to.equal(true)
      )
    })
  })

  describe('`registry`', () => {
    it('is a function', () => {
      return (
        expect(Object.prototype.hasOwnProperty.call(gulp, 'registry'))
          .to.equal(true)
      )
    })
  })
})
