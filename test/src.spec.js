const {
  EventEmitter
} = require('node:stream')

const path = require('node:path')

const chai = require('chai')
const sinonChai = require('sinon-chai')
const {
  expect
} = chai // require('chai')

chai.use(sinonChai)

const gulp = require('..')

describe('gulp.src()', () => {
  it('should return a stream', () => {
    const stream = gulp.src('./fixtures/*.coffee', { cwd: __dirname })

    return expect(stream)
      .to.be.an.instanceOf(EventEmitter)
  })

  it('should return a stream from a flat glob', (done) => {
    const stream = gulp.src('./fixtures/*.coffee', { cwd: __dirname })

    stream
      .on('data', (file) => {
        expect(file.path)
          .to.equal(path.join(__dirname, './fixtures/test.coffee'))

        expect(file.contents)
          .to.eql(Buffer.from('this is a test'))

        done()
      })
  })

  it('should return a stream for multiple globs', (done) => {
    const FILE_PATH_ONE = './fixtures/stuff/run.dmc'
    const FILE_PATH_TWO = './fixtures/stuff/test.dmc'

    const array = [
      FILE_PATH_ONE,
      FILE_PATH_TWO
    ]

    const stream = gulp.src(array, { cwd: __dirname })

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
          .to.equal(path.join(__dirname, FILE_PATH_ONE))

        expect(fileTwo.path)
          .to.equal(path.join(__dirname, FILE_PATH_TWO))
      })
      .on('end', done)
  })

  it('should return a stream for multiple globs, with negation', (done) => {
    const EXPECTED_PATH = path.join(__dirname, './fixtures/stuff/run.dmc')
    const INCLUDED_PATH = './fixtures/stuff/*.dmc'
    const EXCLUDED_PATH = '!fixtures/stuff/test.dmc'

    const array = [
      INCLUDED_PATH,
      EXCLUDED_PATH
    ]

    const stream = gulp.src(array, { cwd: __dirname })

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

  it('should return a stream with no contents when read is false', () => {
    const stream = gulp.src('./fixtures/*.coffee', { read: false, cwd: __dirname })

    stream.on('data', (file) => {
      expect(file.contents)
        .to.be.null

      expect(file.path)
        .to.equal(path.join(__dirname, './fixtures/test.coffee'))
    })
  })

  it('should return a stream with contents as stream when buffer is false', (done) => {
    const stream = gulp.src('./fixtures/*.coffee', { buffer: false, cwd: __dirname })

    stream.on('data', (file) => {
      expect(file.path)
        .to.equal(path.join(__dirname, './fixtures/test.coffee'))

      expect(file.contents)
        .to.be.an.instanceOf(EventEmitter)

      let contents = ''

      file.contents
        .on('data', function (data) {
          contents += data
        })
        .on('end', () => {
          expect(contents)
            .to.equal('this is a test')
        })
        .on('end', done)
    })
  })

  it('should return a stream from a deep glob', () => {
    const stream = gulp.src('./fixtures/**/*.jade', { cwd: __dirname })

    stream.on('data', (file) => {
      expect(file.path)
        .to.equal(path.join(__dirname, './fixtures/test/run.jade'))

      expect(file.contents)
        .to.eql(Buffer.from('test template'))
    })
  })

  it('should return a stream from a deeper glob', (done) => {
    const stream = gulp.src('./fixtures/**/*.dmc', { cwd: __dirname })

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

  it('should return a file stream from a flat path', (done) => {
    const stream = gulp.src(path.join(__dirname, './fixtures/test.coffee'))

    let resultCount = 0

    stream
      .on('data', () => {
        resultCount = resultCount + 1
      })
      .on('data', (file) => {
        expect(file.path)
          .to.equal(path.join(__dirname, './fixtures/test.coffee'))

        expect(file.contents)
          .to.eql(Buffer.from('this is a test'))
      })
      .on('end', () => {
        expect(resultCount)
          .to.equal(1)
      })
      .on('end', done)
  })
})
