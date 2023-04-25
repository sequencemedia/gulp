
const path = require('path')

const { expect } = require('expect')

const gulp = require('../')

describe('gulp.src()', () => {
  it('should return a stream', () => {
    const stream = gulp.src('./fixtures/*.coffee', { cwd: __dirname })

    expect(stream).toBeDefined()
    expect(stream.on).toBeDefined()
  })

  it('should return a stream from a flat glob', () => {
    const stream = gulp.src('./fixtures/*.coffee', { cwd: __dirname })

    stream.on('data', (file) => {
      expect(file).toBeDefined()
      expect(file.path).toBeDefined()
      expect(file.contents).toBeDefined()
      expect(file.path).toEqual(path.join(__dirname, './fixtures/test.coffee'))
      expect(file.contents).toEqual(Buffer.from('this is a test'))
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
        expect(file).toBeDefined()
        expect(file.path).toBeDefined()
      })
      .on('end', () => {
        const [
          fileOne,
          fileTwo
        ] = files

        expect(files.length).toEqual(2)
        expect(fileOne.path).toEqual(path.join(__dirname, FILE_PATH_ONE))
        expect(fileTwo.path).toEqual(path.join(__dirname, FILE_PATH_TWO))
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
        expect(file).toBeDefined()
        expect(file.path).toBeDefined()
      })
      .on('end', () => {
        const [
          file
        ] = files

        expect(files.length).toEqual(1)
        expect(file.path).toEqual(EXPECTED_PATH)
      })
      .on('end', done)
  })

  it('should return a stream with no contents when read is false', () => {
    const stream = gulp.src('./fixtures/*.coffee', { read: false, cwd: __dirname })

    stream.on('data', (file) => {
      expect(file).toBeDefined()
      expect(file.path).toBeDefined()
      expect(file.contents).toBeNull()
      expect(file.path).toEqual(path.join(__dirname, './fixtures/test.coffee'))
    })
  })

  it('should return a stream with contents as stream when buffer is false', (done) => {
    const stream = gulp.src('./fixtures/*.coffee', { buffer: false, cwd: __dirname })

    stream.on('data', (file) => {
      expect(file).toBeDefined()
      expect(file.path).toBeDefined()
      expect(file.contents).toBeDefined()
      expect(file.path).toEqual(path.join(__dirname, './fixtures/test.coffee'))

      let contents = ''

      file.contents
        .on('data', function (data) {
          contents += data
        })
        .on('end', () => {
          expect(contents).toEqual('this is a test')
        })
        .on('end', done)
    })
  })

  it('should return a stream from a deep glob', () => {
    const stream = gulp.src('./fixtures/**/*.jade', { cwd: __dirname })

    stream.on('data', (file) => {
      expect(file).toBeDefined()
      expect(file.path).toBeDefined()
      expect(file.contents).toBeDefined()
      expect(file.path).toEqual(path.join(__dirname, './fixtures/test/run.jade'))
      expect(file.contents).toEqual(Buffer.from('test template'))
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
        expect(resultCount).toEqual(2)
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
        expect(file).toBeDefined()
        expect(file.path).toBeDefined()
        expect(file.contents).toBeDefined()
        expect(file.path).toEqual(path.join(__dirname, './fixtures/test.coffee'))
        expect(file.contents).toEqual(Buffer.from('this is a test'))
      })
      .on('end', () => {
        expect(resultCount).toEqual(1)
      })
      .on('end', done)
  })
})
