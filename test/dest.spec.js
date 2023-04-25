'use strict'

const {
  EventEmitter
} = require('node:stream')
const {
  Stats
} = require('node:fs')

const {
  stat,
  readFile
} = require('node:fs/promises')
const path = require('node:path')

const chai = require('chai')
const sinonChai = require('sinon-chai')
const {
  expect
} = chai // require('chai')

const {
  rimraf
} = require('rimraf')

const {
  mkdirp
} = require('mkdirp')

chai.use(sinonChai)

const gulp = require('..')

const FILE_PATH = path.join(__dirname, './out-fixtures')

function streamFilesToDirectories (options) {
  const readStream = gulp.src('./fixtures/stuff', options)

  const writeStream = readStream.pipe(gulp.dest(FILE_PATH))

  return (
    writeStream
      .on('data', (file) => {
        expect(file.path)
          .to.equal(path.join(FILE_PATH, 'stuff'))
      })
      .on('end', async () => {
        const stats = await stat(path.join(FILE_PATH, 'stuff'))

        return expect(stats)
          .to.be.an.instanceOf(Stats)
      })
  )
}

describe('gulp.dest()', () => {
  beforeEach(async () => {
    await mkdirp(FILE_PATH)
  })

  afterEach(async () => {
    await rimraf(FILE_PATH)
  })

  it('should return a stream', () => {
    const stream = gulp.dest(path.join(__dirname, './fixtures/'))

    return expect(stream)
      .to.be.an.instanceOf(EventEmitter)
  })

  it('should return a stream to writes files', (done) => {
    const readStream = gulp.src('./fixtures/**/*.txt', { cwd: __dirname })
    const writeStream = gulp.dest(FILE_PATH)

    readStream.pipe(writeStream)

    writeStream
      .on('data', (file) => {
        expect(file.contents)
          .to.eql(Buffer.from('this is a test'))
        expect(file.path)
          .to.equal(path.join(FILE_PATH, './copy/example.txt'))
      })
      .on('end', async () => {
        const fileData = await readFile(path.join(FILE_PATH, 'copy', 'example.txt'))

        expect(fileData)
          .to.eql(Buffer.from('this is a test'))
      })
      .on('end', done)
  })

  it('should return a stream that does not write non-read files', (done) => {
    const readStream = gulp.src('./fixtures/**/*.txt', { read: false, cwd: __dirname })
    const writeStream = gulp.dest(FILE_PATH)

    readStream.pipe(writeStream)

    writeStream
      .on('data', (file) => {
        expect(file.contents)
          .to.be.null
        expect(file.path)
          .to.equal(path.join(FILE_PATH, './copy/example.txt'))
      })
      .on('end', async () => {
        const fileData = await readFile(path.join(FILE_PATH, 'copy', 'example.txt'))

        expect(fileData)
          .to.be.undefined
      })
      .on('end', done)
  })

  it('should return a stream that writes files', (done) => {
    const readStream = gulp.src('./fixtures/**/*.txt', { buffer: false, cwd: __dirname })

    const writeStream = readStream.pipe(gulp.dest(FILE_PATH))

    writeStream
      .on('data', (file) => {
        expect(file.contents)
          .to.be.an.instanceOf(EventEmitter)

        expect(file.path)
          .to.equal(path.join(FILE_PATH, './copy/example.txt'))
      })
      .on('end', async () => {
        const fileData = await readFile(path.join(FILE_PATH, 'copy', 'example.txt'))

        expect(fileData)
          .to.eql(Buffer.from('this is a test'))
      })
      .on('end', done)
  })

  it('should return a stream that writes files into directories', (done) => {
    return (
      streamFilesToDirectories({ cwd: __dirname })
        .on('end', done)
    )
  })

  it('should return a stream that writes files into directories (buffer: false)', (done) => {
    return (
      streamFilesToDirectories({ buffer: false, cwd: __dirname })
        .on('end', done)
    )
  })

  it('should return a stream that writes files into directories (read: false)', (done) => {
    return (
      streamFilesToDirectories({ read: false, cwd: __dirname })
        .on('end', done)
    )
  })

  it('should return a stream that writes files into directories (read: false, buffer: false)', (done) => {
    return (
      streamFilesToDirectories({ buffer: false, read: false, cwd: __dirname })
        .on('end', done)
    )
  })
})
