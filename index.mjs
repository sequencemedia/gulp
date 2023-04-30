import Undertaker from 'undertaker'
import vinylFs from 'vinyl-fs'
import watch from '@sequencemedia/glob-watcher'

class Gulp extends Undertaker {
  constructor () {
    super()
    // Bind the functions for destructuring
    this.watch = this.watch.bind(this)
    this.task = this.task.bind(this)
    this.series = this.series.bind(this)
    this.parallel = this.parallel.bind(this)
    this.registry = this.registry.bind(this)
    this.tree = this.tree.bind(this)
    this.lastRun = this.lastRun.bind(this)
    this.src = this.src.bind(this)
    this.dest = this.dest.bind(this)
    this.symlink = this.symlink.bind(this)
  }

  src = vinylFs.src
  dest = vinylFs.dest
  symlink = vinylFs.symlink
  watch (glob, opts, task) {
    if (
      typeof opts === 'string' ||
      typeof task === 'string' ||
      Array.isArray(opts) ||
      Array.isArray(task)
    ) {
      throw new Error(`watching ${glob}: watch task has to be ` +
        'a function (optionally generated by using gulp.parallel ' +
        'or gulp.series)')
    }

    if (typeof opts === 'function') {
      task = opts
      opts = {}
    }

    opts = opts || {}

    let func
    if (typeof task === 'function') {
      func = this.parallel(task)
    }

    return watch(glob, opts, func)
  }

  static Gulp = Gulp
}

export default new Gulp()
