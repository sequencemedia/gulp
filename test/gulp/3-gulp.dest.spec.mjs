import * as url from 'node:url'

import {
  Stream
} from 'node:stream'

import {
  Stats
} from 'node:fs'

import {
  stat,
  readFile
} from 'node:fs/promises'

import path from 'node:path'

import {
  expect
} from 'chai'

import {
  rimraf
} from 'rimraf'

import {
  mkdirp
} from 'mkdirp'

import gulp from '#gulp'

const DIRECTORY = url.fileURLToPath(new URL('.', import.meta.url))
const FILE_PATH = path.resolve('./test/fixtures/tmp')

function commonStream (options) {
  const readStream = gulp.src(path.resolve('./test/fixtures/text'), options)
  const writeStream = gulp.dest(FILE_PATH)

  readStream.pipe(writeStream)

  return (
    writeStream
      .on('data', (file) => {
        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/tmp/text'))
      })
      .on('end', async () => {
        const stats = await stat(path.resolve('./test/fixtures/tmp/text'))

        return expect(stats)
          .to.be.an.instanceOf(Stats)
      })
  )
}

describe('`gulp.dest()`', () => {
  beforeEach(async () => {
    await mkdirp(FILE_PATH)
  })

  afterEach(async () => {
    await rimraf(FILE_PATH)
  })

  it('returns a stream', () => {
    const stream = gulp.dest(path.resolve('./test/fixtures'))

    return expect(stream)
      .to.be.an.instanceOf(Stream)
  })

  it('returns a stream to writes files', (done) => {
    const readStream = gulp.src(path.resolve('./test/fixtures/**/*.txt'), { cwd: DIRECTORY })
    const writeStream = gulp.dest(FILE_PATH)

    readStream.pipe(writeStream)

    writeStream
      .on('data', (file) => {
        expect(file.contents.toString().trim())
          .to.eql('MOCK FILE CONTENTS')

        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/tmp/text/stream.txt'))
      })
      .on('end', async () => {
        const fileData = await readFile(path.resolve('./test/fixtures/tmp/text/stream.txt'))

        expect(fileData.toString().trim())
          .to.eql('MOCK FILE CONTENTS')
      })
      .on('end', done)
  })

  it('returns a stream that does not write non-read files', (done) => {
    const readStream = gulp.src(path.resolve('./test/fixtures/**/*.txt'), { read: false, cwd: DIRECTORY })
    const writeStream = gulp.dest(FILE_PATH)

    readStream.pipe(writeStream)

    writeStream
      .on('data', (file) => {
        expect(file.contents)
          .to.be.null

        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/tmp/text/stream.txt'))
      })
      .on('end', async () => {
        const fileData = await readFile(path.resolve('./test/fixtures/tmp/text/stream.txt'))

        expect(fileData)
          .to.be.undefined
      })
      .on('end', done)
  })

  it('returns a stream that writes files', (done) => {
    const readStream = gulp.src(path.resolve('./test/fixtures/**/*.txt'), { buffer: false, cwd: DIRECTORY })
    const writeStream = gulp.dest(FILE_PATH)

    readStream.pipe(writeStream)

    writeStream
      .on('data', (file) => {
        expect(file.contents)
          .to.be.an.instanceOf(Stream)

        expect(file.path)
          .to.equal(path.resolve('./test/fixtures/tmp/text/stream.txt'))
      })
      .on('end', async () => {
        const fileData = await readFile(path.resolve('./test/fixtures/tmp/text/stream.txt'))

        expect(fileData.toString().trim())
          .to.eql('MOCK FILE CONTENTS')
      })
      .on('end', done)
  })

  it('returns a stream that writes files into directories', (done) => {
    return (
      commonStream({ cwd: DIRECTORY })
        .on('end', done)
    )
  })

  it('returns a stream that writes files into directories (buffer: false)', (done) => {
    return (
      commonStream({ buffer: false, cwd: DIRECTORY })
        .on('end', done)
    )
  })

  it('returns a stream that writes files into directories (read: false)', (done) => {
    return (
      commonStream({ read: false, cwd: DIRECTORY })
        .on('end', done)
    )
  })

  it('returns a stream that writes files into directories (read: false, buffer: false)', (done) => {
    return (
      commonStream({ buffer: false, read: false, cwd: DIRECTORY })
        .on('end', done)
    )
  })
})
