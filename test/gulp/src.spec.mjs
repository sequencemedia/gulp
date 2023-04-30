import {
  Stream
} from 'node:stream'

import path from 'node:path'

import {
  expect
} from 'chai'

import gulp from '#gulp'

describe('gulp.src()', () => {
  it('returns a stream', () => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { cwd: '.' })

    return expect(stream)
      .to.be.an.instanceOf(Stream)
  })

  it('returns a stream from a flat glob', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { cwd: '.' })

    stream
      .on('data', (file) => {
        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/fixture.coffee'))

        expect(file.contents.toString().trim())
          .to.eql('MOCK FILE CONTENTS')

        done()
      })
  })

  it('returns a stream for multiple globs', (done) => {
    const FILE_PATH_ONE = 'fixtures/json/one.json'
    const FILE_PATH_TWO = 'fixtures/json/two.json'

    const array = [
      FILE_PATH_ONE,
      FILE_PATH_TWO
    ]

    const stream = gulp.src(array, { cwd: path.resolve('./test') })

    const files = []

    stream
      .on('data', (file) => {
        files.push(file)
      })
      .on('data', (file) => {
        expect(file.path)
          .to.be.a('string')
      })
      .on('end', () => {
        const [
          fileOne,
          fileTwo
        ] = files

        expect(files.length)
          .to.equal(2)

        expect(fileOne.path)
          .to.equal(path.join(path.resolve('./test'), FILE_PATH_ONE))

        expect(fileTwo.path)
          .to.equal(path.join(path.resolve('./test'), FILE_PATH_TWO))
      })
      .on('end', done)
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

    const files = []

    stream
      .on('data', (file) => {
        files.push(file)
      })
      .on('data', (file) => {
        expect(file.path)
          .to.be.a('string')
      })
      .on('end', () => {
        const [
          file
        ] = files

        expect(files.length)
          .to.equal(1)

        expect(file.path)
          .to.equal(EXPECTED_PATH)
      })
      .on('end', done)
  })

  it('returns a stream with no contents when read is false', () => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { read: false, cwd: '.' })

    stream.on('data', (file) => {
      expect(file.contents)
        .to.be.null

      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/fixture.coffee'))
    })
  })

  it('returns a stream with contents as stream when buffer is false', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/*.coffee'), { buffer: false, cwd: '.' })

    stream.on('data', (file) => {
      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/fixture.coffee'))

      expect(file.contents)
        .to.be.an.instanceOf(Stream)

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
  })

  it('returns a stream from a deep glob', () => {
    const stream = gulp.src(path.resolve('./test/fixtures/**/*.jade'), { cwd: '.' })

    stream.on('data', (file) => {
      expect(file.path)
        .to.equal(path.resolve('./test/fixtures/jade/view.jade'))

      expect(file.contents.toString().trim())
        .to.eql('h1 MOCK FILE CONTENTS')
    })
  })

  it('returns a stream from a deeper glob', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/**/*.json'), { cwd: '.' })

    let resultCount = 0

    stream
      .on('data', () => {
        resultCount = resultCount + 1
      })
      .on('end', () => {
        expect(resultCount)
          .to.equal(2)
      })
      .on('end', done)
  })

  it('returns a file stream from a flat path', (done) => {
    const stream = gulp.src(path.resolve('./test/fixtures/fixture.coffee'))

    let resultCount = 0

    stream
      .on('data', () => {
        resultCount = resultCount + 1
      })
      .on('data', (file) => {
        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/fixture.coffee'))

        expect(file.contents.toString().trim())
          .to.eql('MOCK FILE CONTENTS')
      })
      .on('end', () => {
        expect(resultCount)
          .to.equal(1)
      })
      .on('end', done)
  })
})
