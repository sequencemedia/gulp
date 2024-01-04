import {
  EventEmitter
} from 'node:events'

import path from 'node:path'

import {
  use,
  expect
} from 'chai'
import sinon from 'sinon'
import sinonChai from '@sequencemedia/sinon-chai'

import gulp from '#gulp'

use(sinonChai)

describe('`gulp.src()`', () => {
  it('returns a stream', () => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { cwd: '.' })

    return expect(stream)
      .to.be.an.instanceOf(EventEmitter)
  })

  it('returns a stream from a flat glob', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { cwd: '.' })

    const spy = sinon.stub().callsFake((file) => {
      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/fixture.coffee'))

      expect(file.contents.toString().trim())
        .to.eql('MOCK FILE CONTENTS')
    })

    return (
      stream
        .on('data', spy)
        .on('end', done)
    )
  })

  it('returns a stream for multiple globs', (done) => {
    const FILE_PATH_ONE = 'fixtures/json/one.json'
    const FILE_PATH_TWO = 'fixtures/json/two.json'

    const array = [
      FILE_PATH_ONE,
      FILE_PATH_TWO
    ]

    const stream = gulp.src(array, { cwd: path.resolve('./test') })

    const spy = sinon.spy()

    return (
      stream
        .on('data', spy)
        .on('end', () => {
          expect(spy)
            .to.have.been.calledTwice

          const [[fileOne], [fileTwo]] = spy.args

          expect(fileOne.contents.toString().trim())
            .to.equal('{"one":1}')

          expect(fileOne.path)
            .to.equal(path.join(path.resolve('./test'), FILE_PATH_ONE))

          expect(fileTwo.contents.toString().trim())
            .to.equal('{"two":2}')

          expect(fileTwo.path)
            .to.equal(path.join(path.resolve('./test'), FILE_PATH_TWO))
        })
        .on('end', done)
    )
  })

  it('returns a stream for multiple globs, with negation', (done) => {
    const EXPECTED_PATH = path.resolve('./test/fixtures/json/one.json')
    const INCLUDED_PATH = 'fixtures/json/*.json'
    const EXCLUDED_PATH = '!fixtures/json/two.json'

    const array = [
      INCLUDED_PATH,
      EXCLUDED_PATH
    ]

    const stream = gulp.src(array, { cwd: path.resolve('./test') })

    const spy = sinon.stub().callsFake((file) => {
      expect(file.contents.toString().trim())
        .to.equal('{"one":1}')

      expect(file.path)
        .to.equal(EXPECTED_PATH)
    })

    return (
      stream
        .on('data', spy)
        .on('end', () => {
          expect(spy)
            .to.have.been.calledOnce
        })
        .on('end', done)
    )
  })

  it('returns a stream with no contents when read is false', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { read: false, cwd: '.' })

    const spy = sinon.stub().callsFake((file) => {
      expect(file.contents)
        .to.be.null

      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/fixture.coffee'))
    })

    return (
      stream
        .on('data', spy)
        .on('end', () => {
          expect(spy)
            .to.have.been.calledOnce
        })
        .on('end', done)
    )
  })

  it('returns a stream with contents as stream when buffer is false', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { buffer: false, cwd: '.' })

    return (
      stream.on('data', (file) => {
        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/fixture.coffee'))

        expect(file.contents)
          .to.be.an.instanceOf(EventEmitter)

        let contents = ''

        file.contents
          .on('data', (data) => {
            contents += data
          })
          .on('end', () => {
            expect(contents.trim())
              .to.equal('MOCK FILE CONTENTS')
          })
          .on('end', done)
      })
    )
  })

  it('returns a stream from a deep glob', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/**/*.jade'), { cwd: '.' })

    const spy = sinon.stub().callsFake((file) => {
      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/jade/view.jade'))

      expect(file.contents.toString().trim())
        .to.eql('h1 MOCK FILE CONTENTS')
    })

    return (
      stream
        .on('data', spy)
        .on('end', () => {
          expect(spy)
            .to.have.been.calledOnce
        })
        .on('end', done)
    )
  })

  it('returns a stream from a deeper glob', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/**/*.json'), { cwd: '.' })

    const spy = sinon.spy()

    return (
      stream
        .on('data', spy)
        .on('end', () => {
          expect(spy)
            .to.have.been.calledTwice

          const [[fileOne], [fileTwo]] = spy.args

          expect(fileOne.contents.toString().trim())
            .to.equal('{"one":1}')

          expect(fileOne.path)
            .to.equal(path.resolve('./test/fixtures/json/one.json'))

          expect(fileTwo.contents.toString().trim())
            .to.equal('{"two":2}')

          expect(fileTwo.path)
            .to.equal(path.resolve('./test/fixtures/json/two.json'))
        })
        .on('end', done)
    )
  })

  it('returns a file stream from a flat path', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/fixture.coffee'))

    const spy = sinon.stub().callsFake((file) => {
      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/fixture.coffee'))

      expect(file.contents.toString().trim())
        .to.eql('MOCK FILE CONTENTS')
    })

    return (
      stream
        .on('data', spy)
        .on('end', () => {
          expect(spy)
            .to.have.been.calledOnce
        })
        .on('end', done)
    )
  })
})
