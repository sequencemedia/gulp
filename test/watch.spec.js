const crypto = require('node:crypto')

const EventEmitter = require('node:events')

const {
  writeFile,
  appendFile
} = require('node:fs/promises')

const {
  resolve,
  join
} = require('node:path')

const chai = require('chai')
const sinon = require('sinon')
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

const WAIT = 375
const TIMEOUT = 1500

const gulp = require('../')

async function createFile (filePath) {
  await writeFile(filePath, crypto.randomBytes(16))
}

async function changeFile (filePath) {
  await appendFile(filePath, crypto.randomBytes(16))
}

function toFilePath (filePath, fileName) {
  return join(resolve(filePath), fileName)
}

function waitFor (delay = 0) {
  return (
    new Promise((resolve) => {
      setTimeout(resolve, delay)
    })
  )
}

const FILE_PATH = toFilePath(__dirname, './out-fixtures')

const WATCHERS = new Set()

describe('gulp.watch()', () => {
  before(async () => {
    await mkdirp(FILE_PATH)
  })

  after(() => {
    WATCHERS
      .forEach((watcher) => {
        if (!watcher.closed) watcher.close()
      })
  })

  after(async () => {
    await rimraf(FILE_PATH)
  })

  it('should perform the task when the file changes: no options', async () => {
    const FILE_NAME = 'changes.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    const task = sinon.spy()

    WATCHERS.add(
      gulp.watch(filePath, task)
    )

    await changeFile(filePath)

    await waitFor(WAIT)

    return (
      expect(task)
        .to.have.been.called
    )
  }).timeout(TIMEOUT)

  it('should perform the task when the file changes: w/ options', async () => {
    const FILE_NAME = 'changes-with-options.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    const task = sinon.spy()

    WATCHERS.add(
      gulp.watch(FILE_NAME, { cwd: FILE_PATH }, task)
    )

    await changeFile(filePath)

    await waitFor(WAIT)

    return (
      expect(task)
        .to.have.been.called
    )
  }).timeout(TIMEOUT)

  it('should perform parallel tasks: no options', async () => {
    const FILE_NAME = 'parallel.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    const parallelOne = sinon.stub().callsFake((next) => next())
    const parallelTwo = sinon.stub().callsFake((next) => next())

    gulp.task('parallel-1', parallelOne)

    gulp.task('parallel-2', parallelTwo)

    WATCHERS.add(
      gulp.watch(filePath, gulp.parallel('parallel-1', 'parallel-2'))
    )

    await changeFile(filePath)

    await waitFor(WAIT)

    expect(parallelOne)
      .to.have.been.called

    expect(parallelTwo)
      .to.have.been.called
  }).timeout(TIMEOUT)

  it('should perform parallel tasks: w/ options', async () => {
    const FILE_NAME = 'parallel.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    const parallelOne = sinon.stub().callsFake((next) => next())
    const parallelTwo = sinon.stub().callsFake((next) => next())

    gulp.task('parallel-1', parallelOne)

    gulp.task('parallel-2', parallelTwo)

    WATCHERS.add(
      gulp.watch(FILE_NAME, { cwd: FILE_PATH }, gulp.parallel('parallel-1', 'parallel-2'))
    )

    await changeFile(filePath)

    await waitFor(WAIT)

    expect(parallelOne)
      .to.have.been.called

    expect(parallelTwo)
      .to.have.been.called
  }).timeout(TIMEOUT)

  it('should perform series tasks: no options', async () => {
    const FILE_NAME = 'series.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    const seriesOne = sinon.stub().callsFake((next) => next())
    const seriesTwo = sinon.stub().callsFake((next) => next())

    gulp.task('series-1', seriesOne)

    gulp.task('series-2', seriesTwo)

    WATCHERS.add(
      gulp.watch(filePath, gulp.series('series-1', 'series-2'))
    )

    await changeFile(filePath)

    await waitFor(WAIT)

    expect(seriesOne)
      .to.have.been.called

    expect(seriesTwo)
      .to.have.been.called
  }).timeout(TIMEOUT)

  it('should perform series tasks: w/ options', async () => {
    const FILE_NAME = 'series-with-options.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    const seriesOne = sinon.stub().callsFake((next) => next())
    const seriesTwo = sinon.stub().callsFake((next) => next())

    gulp.task('series-1', seriesOne)

    gulp.task('series-2', seriesTwo)

    WATCHERS.add(
      gulp.watch(FILE_NAME, { cwd: FILE_PATH }, gulp.series('series-1', 'series-2'))
    )

    await changeFile(filePath)

    await waitFor(WAIT)

    expect(seriesOne)
      .to.have.been.called

    expect(seriesTwo)
      .to.have.been.called
  }).timeout(TIMEOUT)

  it('should always return a watch: no file path', () => {
    const watcher = gulp.watch('').close()

    return expect(watcher)
      .to.be.instanceOf(EventEmitter)
  })

  it('should always return a watch: w/ file path', () => {
    const watcher = gulp.watch(FILE_PATH).close()

    return expect(watcher)
      .to.be.instanceOf(EventEmitter)
  })

  it('should throw when the parameter (string) is not a function', async () => {
    const FILE_NAME = 'parameter-string.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    try {
      gulp.watch(FILE_NAME, { cwd: FILE_PATH }, 'task')
    } catch ({ message }) {
      expect(message)
        .to.equal(`watching ${FILE_NAME}: watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)`)
    }
  })

  it('should throw when the parameter (array) is not a function', async () => {
    const FILE_NAME = 'parameter-array.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    try {
      gulp.watch(FILE_NAME, { cwd: FILE_PATH }, ['task'])
    } catch ({ message }) {
      expect(message)
        .to.equal(`watching ${FILE_NAME}: watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)`)
    }
  })
})
