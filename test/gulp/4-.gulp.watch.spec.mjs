import * as url from 'node:url'

import crypto from 'node:crypto'

import {
  EventEmitter
} from 'node:events'

import {
  writeFile,
  appendFile
} from 'node:fs/promises'

import {
  resolve,
  join
} from 'node:path'

import {
  use,
  expect
} from 'chai'
import sinon from 'sinon'
import sinonChai from '@sequencemedia/sinon-chai'

import {
  rimraf
} from 'rimraf'

import {
  mkdirp
} from 'mkdirp'

import gulp from '#gulp'

use(sinonChai)

const WAIT = 1000 // 375
const TIMEOUT = 5000
const DIRECTORY = url.fileURLToPath(new URL('.', import.meta.url))
const FILE_PATH = toFilePath(DIRECTORY, './tmp')
const WATCHERS = new Set()

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

describe('`gulp.watch()`', () => {
  before(async () => {
    await mkdirp(FILE_PATH)
  })

  after(() => {
    WATCHERS
      .forEach((watcher) => {
        if (!watcher.closed) watcher.close()
        WATCHERS.delete(watcher)
      })
  })

  after(async () => {
    await rimraf(FILE_PATH)
  })

  it('performs the task when the file changes: no options', async () => {
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
  }).timeout(TIMEOUT * 3)

  it('performs the task when the file changes: w/ options', async () => {
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

  it('performs parallel tasks: no options', async () => {
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

  it('performs parallel tasks: w/ options', async () => {
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

  it('performs series tasks: no options', async () => {
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

  it('performs series tasks: w/ options', async () => {
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

    /*
    gulp.on('stop', ({ name }) => {
      if (name === 'series-1') {
        expect(seriesOne)
          .to.have.been.called
      }

      if (name === 'series-2') {
        expect(seriesTwo)
          .to.have.been.called
      }
    }) */

    expect(seriesOne)
      .to.have.been.called

    expect(seriesTwo)
      .to.have.been.called
  }).timeout(TIMEOUT)

  describe('returning a watch when the path is a path', () => {
    it('returns a watch when the path is a path', () => {
      const watcher = gulp.watch(FILE_PATH)

      watcher.close()

      return expect(watcher)
        .to.be.instanceOf(EventEmitter)
    })

    it('returns a watch when the path is a dot', () => {
      const watcher = gulp.watch('.')

      watcher.close()

      return expect(watcher)
        .to.be.instanceOf(EventEmitter)
    })

    it('returns a watch when the path is a double dot dot', () => {
      const watcher = gulp.watch('..')

      watcher.close()

      return expect(watcher)
        .to.be.instanceOf(EventEmitter)
    })
  })

  it('throws when the path is a zero-length string', () => {
    try {
      WATCHERS.add(
        gulp.watch('')
      )
    } catch ({ message }) {
      expect(message)
        .to.equal('Nothing to watch')
    }
  })

  it('throws when the parameter (string) is not a function', async () => {
    const FILE_NAME = 'parameter-string.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    try {
      WATCHERS.add(
        gulp.watch(FILE_NAME, { cwd: FILE_PATH }, 'task')
      )
    } catch ({ message }) {
      expect(message)
        .to.equal(`watching ${FILE_NAME}: watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)`)
    }
  })

  it('throws when the parameter (number) is not a function', async () => {
    const FILE_NAME = 'parameter-number.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    try {
      WATCHERS.add(
        gulp.watch(FILE_NAME, { cwd: FILE_PATH }, 0)
      )
    } catch ({ message }) {
      expect(message)
        .to.equal(`watching ${FILE_NAME}: watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)`)
    }
  })

  it('throws when the parameter (object) is not a function', async () => {
    const FILE_NAME = 'parameter-object.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    try {
      WATCHERS.add(
        gulp.watch(FILE_NAME, { cwd: FILE_PATH }, {})
      )
    } catch ({ message }) {
      expect(message)
        .to.equal(`watching ${FILE_NAME}: watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)`)
    }
  })

  it('throws when the parameter (array) is not a function', async () => {
    const FILE_NAME = 'parameter-array.txt'
    const filePath = toFilePath(FILE_PATH, FILE_NAME)

    await createFile(filePath)

    try {
      WATCHERS.add(
        gulp.watch(FILE_NAME, { cwd: FILE_PATH }, ['task'])
      )
    } catch ({ message }) {
      expect(message)
        .to.equal(`watching ${FILE_NAME}: watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)`)
    }
  })
})
