'use strict';

var fs = require('fs');
var path = require('path');

var { expect } = require('expect');
var { rimraf } = require('rimraf');

var gulp = require('../');

var outpath = path.join(__dirname, './out-fixtures');

describe('gulp.dest()', function() {
  beforeEach(async () => {
    await rimraf(outpath)
  });

  afterEach(async () => {
    await rimraf(outpath)
  });

  it('should return a stream', function() {
    var stream = gulp.dest(path.join(__dirname, './fixtures/'));
    expect(stream).toBeDefined();
    expect(stream.on).toBeDefined();
  });

  it('should return a stream to writes files', function(done) {
    var readStream = gulp.src('./fixtures/**/*.txt', { cwd: __dirname });
    var writeStream = gulp.dest(outpath);

    readStream.pipe(writeStream);

    writeStream
      .on('data', function(file) {
        // Data should be re-emitted right
        expect(file).toBeDefined();
        expect(file.path).toBeDefined();
        expect(file.contents).toBeDefined();
        expect(file.path).toEqual(path.join(outpath, './copy/example.txt'));
        expect(file.contents).toEqual(Buffer.from('this is a test'));
    })
    .on('end', function() {
      fs.readFile(path.join(outpath, 'copy', 'example.txt'), function(err, contents) {
        expect(err).toBeNull();
        expect(contents).toBeDefined();
        expect(contents).toEqual(Buffer.from('this is a test'));
      });
    })
    .on('end', done);
  });

  it('should return a output stream that does not write non-read files', function(done) {
    var readStream = gulp.src('./fixtures/**/*.txt', { read: false, cwd: __dirname });
    var writeStream = gulp.dest(outpath);

    readStream.pipe(writeStream);

    writeStream
      .on('data', function(file) {
        // Data should be re-emitted right
        expect(file).toBeDefined();
        expect(file.path).toBeDefined();
        expect(file.contents).toBeNull();
        expect(file.path).toEqual(path.join(outpath, './copy/example.txt'));
      })
      .on('end', function() {
        fs.readFile(path.join(outpath, 'copy', 'example.txt'), function(err, contents) {
          expect(err).toBeDefined();
          expect(contents).toBeUndefined();
        })
      })
      .on('end', done);
  });

  it('should return a output stream that writes streaming files', function(done) {
    var readStream = gulp.src('./fixtures/**/*.txt', { buffer: false, cwd: __dirname });

    var writeStream = readStream.pipe(gulp.dest(outpath));

    writeStream
      .on('data', function(file) {
        // Data should be re-emitted right
        expect(file).toBeDefined();
        expect(file.path).toBeDefined();
        expect(file.contents).toBeDefined();
        expect(file.path).toEqual(path.join(outpath, './copy/example.txt'));
      })
      .on('end', function() {
        fs.readFile(path.join(outpath, 'copy', 'example.txt'), function(err, contents) {
          expect(err).toBeNull();
          expect(contents).toBeDefined();
          expect(contents).toEqual(Buffer.from('this is a test'));
        });
      })
      .on('end', done);
  });

  it('should return a output stream that writes streaming files into new directories', function(done) {
    testWriteDir({ cwd: __dirname }, done);
  });

  it('should return a output stream that writes streaming files into new directories (buffer: false)', function(done) {
    testWriteDir({ buffer: false, cwd: __dirname }, done);
  });

  it('should return a output stream that writes streaming files into new directories (read: false)', function(done) {
    testWriteDir({ read: false, cwd: __dirname }, done);
  });

  it('should return a output stream that writes streaming files into new directories (read: false, buffer: false)', function(done) {
    testWriteDir({ buffer: false, read: false, cwd: __dirname }, done);
  });

  function testWriteDir(srcOptions, done) {
    var readStream = gulp.src('./fixtures/stuff', srcOptions);

    var writeStream = readStream.pipe(gulp.dest(outpath));

    writeStream
      .on('data', function(file) {
        // Data should be re-emitted right
        expect(file).toBeDefined();
        expect(file.path).toBeDefined();
        expect(file.path).toEqual(path.join(outpath, './stuff'));
      })
      .on('end', function() {
        fs.stat(path.join(outpath, 'stuff'), function(err, stats) {
          expect(err).toBeNull()
          expect(stats).toBeDefined()
        })
      })
      .on('end', done);
  }
});
