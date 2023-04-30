
import {
  expect
} from 'chai'

import gulp from '#gulp'

describe('gulp', () => {
  it('src', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'src'))
        .to.equal(true)
    )
  })

  it('dest', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'dest'))
        .to.equal(true)
    )
  })

  it('symlink', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'symlink'))
        .to.equal(true)
    )
  })

  it('watch', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'watch'))
        .to.equal(true)
    )
  })

  it('task', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'task'))
        .to.equal(true)
    )
  })

  it('series', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'series'))
        .to.equal(true)
    )
  })

  it('parallel', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'parallel'))
        .to.equal(true)
    )
  })

  it('tree', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'tree'))
        .to.equal(true)
    )
  })

  it('lastRun', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'lastRun'))
        .to.equal(true)
    )
  })

  it('registry', () => {
    return (
      expect(Object.prototype.hasOwnProperty.call(gulp, 'registry'))
        .to.equal(true)
    )
  })
})
