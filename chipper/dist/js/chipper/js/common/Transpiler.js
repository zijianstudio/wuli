// Copyright 2021-2023, University of Colorado Boulder

/**
 * Transpiles *.ts and copies all *.js files to chipper/dist. Does not do type checking. Filters based on
 * perennial-alias/active-repos and subsets of directories within repos (such as js/, images/, and sounds/)
 *
 * See transpile.js for the CLI usage
 *
 *  @author Sam Reid (PhET Interactive Simulations)
 */

// imports
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CacheLayer = require('./CacheLayer');
const core = require('@babel/core');
const assert = require('assert');
const _ = require('lodash');

// Cache status is stored in chipper/dist so if you wipe chipper/dist you also wipe the cache
const statusPath = '../chipper/dist/js-cache-status.json';
const root = '..' + path.sep;

// Directories in a sim repo that may contain things for transpilation
// This is used for a top-down search in the initial transpilation and for filtering relevant files in the watch process
const subdirs = ['js', 'images', 'mipmaps', 'sounds', 'shaders', 'common',
// phet-io-sim-specific has nonstandard directory structure
'repos'];
const getActiveRepos = () => fs.readFileSync('../perennial-alias/data/active-repos', 'utf8').trim().split('\n').map(sim => sim.trim());
class Transpiler {
  constructor(options) {
    options = _.extend({
      clean: false,
      // delete the previous state/cache file, and create a new one.
      verbose: false,
      // Add extra logging
      silent: false,
      // hide all logging but error reporting, include any specified with verbose
      repos: [],
      // {string[]} additional repos to be transpiled (beyond those listed in perennial-alias/data/active-repos)
      brands: [] // {sting[]} additional brands to visit in the brand repo
    }, options);

    // @private
    this.verbose = options.verbose;
    this.silent = options.silent;
    this.repos = options.repos;
    this.brands = options.brands;

    // Track the status of each repo. Key= repo, value=md5 hash of contents
    this.status = {};

    // Handle the case where programs want to handle this itself and do something before exiting.
    if (!global.processEventOptOut) {
      // Exit on Ctrl + C case, but make sure to save the cache
      process.on('SIGINT', () => {
        this.saveCache();
        process.exit();
      });
    }

    // Make sure a directory exists for the cached status file
    fs.mkdirSync(path.dirname(statusPath), {
      recursive: true
    });
    if (options.clean) {
      !this.silent && console.log('cleaning...');
      fs.writeFileSync(statusPath, JSON.stringify({}, null, 2));
    }

    // Load cached status
    try {
      this.status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
    } catch (e) {
      !this.silent && console.log('couldn\'t parse status cache, making a clean one');
      this.status = {};
      fs.writeFileSync(statusPath, JSON.stringify(this.status, null, 2));
    }

    // Use the same implementation as getRepoList, but we need to read from perennial-alias since chipper should not
    // depend on perennial.
    this.activeRepos = getActiveRepos();
  }

  /**
   * Returns the path in chipper/dist that corresponds to a source file.
   * @param filename
   * @returns {string}
   * @public
   */
  static getTargetPath(filename) {
    const relativePath = path.relative(root, filename);
    const suffix = relativePath.substring(relativePath.lastIndexOf('.'));

    // Note: When we upgrade to Node 16, this may no longer be necessary, see https://github.com/phetsims/chipper/issues/1272#issuecomment-1222574593
    const extension = relativePath.includes('phet-build-script') ? '.mjs' : '.js';
    return Transpiler.join(root, 'chipper', 'dist', 'js', ...relativePath.split(path.sep)).split(suffix).join(extension);
  }

  /**
   * Transpile the file using babel, and write it to the corresponding location in chipper/dist
   * @param {string} sourceFile
   * @param {string} targetPath
   * @param {string} text - file text
   * @private
   */
  static transpileFunction(sourceFile, targetPath, text) {
    const x = core.transformSync(text, {
      filename: sourceFile,
      // Load directly from node_modules so we do not have to npm install this dependency
      // in every sim repo.  This strategy is also used in transpile.js
      presets: ['../chipper/node_modules/@babel/preset-typescript', '../chipper/node_modules/@babel/preset-react'],
      sourceMaps: 'inline',
      plugins: [['../chipper/node_modules/@babel/plugin-proposal-decorators', {
        version: '2022-03'
      }]]
    });
    fs.mkdirSync(path.dirname(targetPath), {
      recursive: true
    });
    fs.writeFileSync(targetPath, x.code);
  }

  // @public
  static modifiedTimeMilliseconds(file) {
    return fs.statSync(file).mtime.getTime();
  }

  // @public.  Delete any files in chipper/dist/js that don't have a corresponding file in the source tree
  pruneStaleDistFiles() {
    const startTime = Date.now();
    const start = '../chipper/dist/js/';
    const visitFile = path => {
      path = Transpiler.forwardSlashify(path);
      assert(path.startsWith(start));
      const tail = path.substring(start.length);
      const correspondingFile = `../${tail}`;
      const jsTsFile = correspondingFile.split('.js').join('.ts');
      const jsTsxFile = correspondingFile.split('.js').join('.tsx');
      const mjsTsFile = correspondingFile.split('.mjs').join('.ts');
      const mjsTsxFile = correspondingFile.split('.mjs').join('.tsx');
      if (!fs.existsSync(correspondingFile) && !fs.existsSync(jsTsFile) && !fs.existsSync(jsTsxFile) && !fs.existsSync(mjsTsFile) && !fs.existsSync(mjsTsxFile)) {
        fs.unlinkSync(path);
        console.log('No parent source file for: ' + path + ', deleted.');
      }
    };

    // @private - Recursively visit a directory for files to transpile
    const visitDir = dir => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const child = Transpiler.join(dir, file);
        if (fs.lstatSync(child).isDirectory() && fs.existsSync(child)) {
          visitDir(child);
        } else if (fs.existsSync(child) && fs.lstatSync(child).isFile()) {
          visitFile(child);
        }
      });
    };
    if (fs.existsSync(start) && fs.lstatSync(start).isDirectory()) {
      visitDir(start);
    }
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    console.log('Clean stale chipper/dist/js files finished in ' + elapsed + 'ms');
  }

  // @public join and normalize the paths (forward slashes for ease of search and readability)
  static join(...paths) {
    return Transpiler.forwardSlashify(path.join(...paths));
  }

  /**
   * For *.ts and *.js files, checks if they have changed file contents since last transpile.  If so, the
   * file is transpiled.
   * @param {string} filePath
   * @private
   */
  visitFile(filePath) {
    if ((filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && !this.isPathIgnored(filePath)) {
      const changeDetectedTime = Date.now();
      const text = fs.readFileSync(filePath, 'utf-8');
      const hash = crypto.createHash('md5').update(text).digest('hex');

      // If the file has changed, transpile and update the cache.  We have to choose on the spectrum between safety
      // and performance.  In order to maintain high performance with a low error rate, we only write the transpiled file
      // if (a) the cache is out of date (b) there is no target file at all or (c) if the target file has been modified.
      const targetPath = Transpiler.getTargetPath(filePath);
      if (!this.status[filePath] || this.status[filePath].sourceMD5 !== hash || !fs.existsSync(targetPath) || this.status[filePath].targetMilliseconds !== Transpiler.modifiedTimeMilliseconds(targetPath)) {
        try {
          let reason = '';
          if (this.verbose) {
            reason = !this.status[filePath] ? ' (not cached)' : this.status[filePath].sourceMD5 !== hash ? ' (changed)' : !fs.existsSync(targetPath) ? ' (no target)' : this.status[filePath].targetMilliseconds !== Transpiler.modifiedTimeMilliseconds(targetPath) ? ' (target modified)' : '???';
          }
          Transpiler.transpileFunction(filePath, targetPath, text);
          this.status[filePath] = {
            sourceMD5: hash,
            targetMilliseconds: Transpiler.modifiedTimeMilliseconds(targetPath)
          };
          fs.writeFileSync(statusPath, JSON.stringify(this.status, null, 2));
          const now = Date.now();
          const nowTimeString = new Date(now).toLocaleTimeString();
          !this.silent && console.log(`${nowTimeString}, ${now - changeDetectedTime} ms: ${filePath}${reason}`);
        } catch (e) {
          console.log(e);
          console.log('ERROR');
        }
      }
    }
  }

  // @private - Recursively visit a directory for files to transpile
  visitDirectory(dir) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const child = Transpiler.join(dir, file);
        if (fs.lstatSync(child).isDirectory()) {
          this.visitDirectory(child);
        } else {
          this.visitFile(child);
        }
      });
    }
  }

  // @private
  isPathIgnored(filePath) {
    const withForwardSlashes = Transpiler.forwardSlashify(filePath);
    try {
      // ignore directories, just care about individual files
      // Try catch because there can still be a race condition between checking and lstatting. This covers enough cases
      // though to still keep it in.
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        return true;
      }
    } catch (e) {/* ignore please */}
    return withForwardSlashes.includes('/node_modules') || withForwardSlashes.includes('.git/') || withForwardSlashes.includes('/build/') || withForwardSlashes.includes('chipper/dist/') || withForwardSlashes.includes('transpile/cache/status.json') ||
    // Temporary files sometimes saved by the IDE
    withForwardSlashes.endsWith('~') ||
    // eslint cache files
    withForwardSlashes.includes('/chipper/eslint/cache/') || withForwardSlashes.includes('/perennial-alias/logs/') || withForwardSlashes.endsWith('.eslintcache');
  }

  // @private
  static forwardSlashify(filePath) {
    return filePath.split('\\').join('/');
  }

  /**
   * Transpile the specified repos
   * @param {string[]} repos
   * @public
   */
  transpileRepos(repos) {
    assert(Array.isArray(repos), 'repos should be an array');
    repos.forEach(repo => this.transpileRepo(repo));
  }

  // @public - Visit all the subdirectories in a repo that need transpilation
  transpileRepo(repo) {
    subdirs.forEach(subdir => this.visitDirectory(Transpiler.join('..', repo, subdir)));
    if (repo === 'sherpa') {
      // Our sims load this as a module rather than a preload, so we must transpile it
      this.visitFile(Transpiler.join('..', repo, 'lib', 'game-up-camera-1.0.0.js'));
    } else if (repo === 'brand') {
      this.visitDirectory(Transpiler.join('..', repo, 'phet'));
      this.visitDirectory(Transpiler.join('..', repo, 'phet-io'));
      this.visitDirectory(Transpiler.join('..', repo, 'adapted-from-phet'));
      this.brands.forEach(brand => this.visitDirectory(Transpiler.join('..', repo, brand)));
    }
  }

  // @public
  transpileAll() {
    this.transpileRepos([...this.activeRepos, ...this.repos]);
  }

  // @private
  saveCache() {
    fs.writeFileSync(statusPath, JSON.stringify(this.status, null, 2));
  }

  // @public
  watch() {
    // Invalidate caches when we start watching
    CacheLayer.updateLastChangedTimestamp();

    // For coordination with CacheLayer, clear the cache while we are not watching for file changes
    // https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    process.stdin.resume(); //so the program will not close instantly

    function exitHandler(options) {
      // NOTE: this gets called 2x on ctrl-c for unknown reasons
      CacheLayer.clearLastChangedTimestamp();
      if (options && options.exit) {
        if (options.arg) {
          throw options.arg;
        }
        process.exit();
      }
    }

    // do something when app is closing
    process.on('exit', () => exitHandler());

    // catches ctrl+c event
    process.on('SIGINT', () => exitHandler({
      exit: true
    }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', () => exitHandler({
      exit: true
    }));
    process.on('SIGUSR2', () => exitHandler({
      exit: true
    }));

    // catches uncaught exceptions
    process.on('uncaughtException', e => exitHandler({
      arg: e,
      exit: true
    }));
    fs.watch('..' + path.sep, {
      recursive: true
    }, (eventType, filename) => {
      const changeDetectedTime = Date.now();
      const filePath = Transpiler.forwardSlashify('..' + path.sep + filename);

      // We observed a null filename on Windows for an unknown reason.
      if (filename === null || this.isPathIgnored(filePath)) {
        return;
      }

      // Invalidate cache when any relevant file has changed.
      CacheLayer.updateLastChangedTimestamp();
      const pathExists = fs.existsSync(filePath);
      if (!pathExists) {
        const targetPath = Transpiler.getTargetPath(filePath);
        if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isFile()) {
          fs.unlinkSync(targetPath);
          delete this.status[filePath];
          this.saveCache();
          const now = Date.now();
          const reason = ' (deleted)';
          !this.silent && console.log(`${new Date(now).toLocaleTimeString()}, ${now - changeDetectedTime} ms: ${filePath}${reason}`);
        }
        return;
      }
      if (filePath.endsWith('perennial-alias/data/active-repos')) {
        const newActiveRepos = getActiveRepos();
        !this.silent && console.log('reloaded active repos');
        const newRepos = newActiveRepos.filter(repo => !this.activeRepos.includes(repo));

        // Run an initial scan on newly added repos
        newRepos.forEach(repo => {
          !this.silent && console.log('New repo detected in active-repos, transpiling: ' + repo);
          this.transpileRepo(repo);
        });
        this.activeRepos = newActiveRepos;
      } else {
        const terms = filename.split(path.sep);
        if ((this.activeRepos.includes(terms[0]) || this.repos.includes(terms[0])) && subdirs.includes(terms[1]) && pathExists) {
          this.visitFile(filePath);
        }
      }
    });
  }
}
module.exports = Transpiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJwYXRoIiwiY3J5cHRvIiwiQ2FjaGVMYXllciIsImNvcmUiLCJhc3NlcnQiLCJfIiwic3RhdHVzUGF0aCIsInJvb3QiLCJzZXAiLCJzdWJkaXJzIiwiZ2V0QWN0aXZlUmVwb3MiLCJyZWFkRmlsZVN5bmMiLCJ0cmltIiwic3BsaXQiLCJtYXAiLCJzaW0iLCJUcmFuc3BpbGVyIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZXh0ZW5kIiwiY2xlYW4iLCJ2ZXJib3NlIiwic2lsZW50IiwicmVwb3MiLCJicmFuZHMiLCJzdGF0dXMiLCJnbG9iYWwiLCJwcm9jZXNzRXZlbnRPcHRPdXQiLCJwcm9jZXNzIiwib24iLCJzYXZlQ2FjaGUiLCJleGl0IiwibWtkaXJTeW5jIiwiZGlybmFtZSIsInJlY3Vyc2l2ZSIsImNvbnNvbGUiLCJsb2ciLCJ3cml0ZUZpbGVTeW5jIiwiSlNPTiIsInN0cmluZ2lmeSIsInBhcnNlIiwiZSIsImFjdGl2ZVJlcG9zIiwiZ2V0VGFyZ2V0UGF0aCIsImZpbGVuYW1lIiwicmVsYXRpdmVQYXRoIiwicmVsYXRpdmUiLCJzdWZmaXgiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImV4dGVuc2lvbiIsImluY2x1ZGVzIiwiam9pbiIsInRyYW5zcGlsZUZ1bmN0aW9uIiwic291cmNlRmlsZSIsInRhcmdldFBhdGgiLCJ0ZXh0IiwieCIsInRyYW5zZm9ybVN5bmMiLCJwcmVzZXRzIiwic291cmNlTWFwcyIsInBsdWdpbnMiLCJ2ZXJzaW9uIiwiY29kZSIsIm1vZGlmaWVkVGltZU1pbGxpc2Vjb25kcyIsImZpbGUiLCJzdGF0U3luYyIsIm10aW1lIiwiZ2V0VGltZSIsInBydW5lU3RhbGVEaXN0RmlsZXMiLCJzdGFydFRpbWUiLCJEYXRlIiwibm93Iiwic3RhcnQiLCJ2aXNpdEZpbGUiLCJmb3J3YXJkU2xhc2hpZnkiLCJzdGFydHNXaXRoIiwidGFpbCIsImxlbmd0aCIsImNvcnJlc3BvbmRpbmdGaWxlIiwianNUc0ZpbGUiLCJqc1RzeEZpbGUiLCJtanNUc0ZpbGUiLCJtanNUc3hGaWxlIiwiZXhpc3RzU3luYyIsInVubGlua1N5bmMiLCJ2aXNpdERpciIsImRpciIsImZpbGVzIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwiY2hpbGQiLCJsc3RhdFN5bmMiLCJpc0RpcmVjdG9yeSIsImlzRmlsZSIsImVuZFRpbWUiLCJlbGFwc2VkIiwicGF0aHMiLCJmaWxlUGF0aCIsImVuZHNXaXRoIiwiaXNQYXRoSWdub3JlZCIsImNoYW5nZURldGVjdGVkVGltZSIsImhhc2giLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwiZGlnZXN0Iiwic291cmNlTUQ1IiwidGFyZ2V0TWlsbGlzZWNvbmRzIiwicmVhc29uIiwibm93VGltZVN0cmluZyIsInRvTG9jYWxlVGltZVN0cmluZyIsInZpc2l0RGlyZWN0b3J5Iiwid2l0aEZvcndhcmRTbGFzaGVzIiwidHJhbnNwaWxlUmVwb3MiLCJBcnJheSIsImlzQXJyYXkiLCJyZXBvIiwidHJhbnNwaWxlUmVwbyIsInN1YmRpciIsImJyYW5kIiwidHJhbnNwaWxlQWxsIiwid2F0Y2giLCJ1cGRhdGVMYXN0Q2hhbmdlZFRpbWVzdGFtcCIsInN0ZGluIiwicmVzdW1lIiwiZXhpdEhhbmRsZXIiLCJjbGVhckxhc3RDaGFuZ2VkVGltZXN0YW1wIiwiYXJnIiwiZXZlbnRUeXBlIiwicGF0aEV4aXN0cyIsIm5ld0FjdGl2ZVJlcG9zIiwibmV3UmVwb3MiLCJmaWx0ZXIiLCJ0ZXJtcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlcyI6WyJUcmFuc3BpbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRyYW5zcGlsZXMgKi50cyBhbmQgY29waWVzIGFsbCAqLmpzIGZpbGVzIHRvIGNoaXBwZXIvZGlzdC4gRG9lcyBub3QgZG8gdHlwZSBjaGVja2luZy4gRmlsdGVycyBiYXNlZCBvblxyXG4gKiBwZXJlbm5pYWwtYWxpYXMvYWN0aXZlLXJlcG9zIGFuZCBzdWJzZXRzIG9mIGRpcmVjdG9yaWVzIHdpdGhpbiByZXBvcyAoc3VjaCBhcyBqcy8sIGltYWdlcy8sIGFuZCBzb3VuZHMvKVxyXG4gKlxyXG4gKiBTZWUgdHJhbnNwaWxlLmpzIGZvciB0aGUgQ0xJIHVzYWdlXHJcbiAqXHJcbiAqICBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbi8vIGltcG9ydHNcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcclxuY29uc3QgY3J5cHRvID0gcmVxdWlyZSggJ2NyeXB0bycgKTtcclxuY29uc3QgQ2FjaGVMYXllciA9IHJlcXVpcmUoICcuL0NhY2hlTGF5ZXInICk7XHJcbmNvbnN0IGNvcmUgPSByZXF1aXJlKCAnQGJhYmVsL2NvcmUnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5cclxuLy8gQ2FjaGUgc3RhdHVzIGlzIHN0b3JlZCBpbiBjaGlwcGVyL2Rpc3Qgc28gaWYgeW91IHdpcGUgY2hpcHBlci9kaXN0IHlvdSBhbHNvIHdpcGUgdGhlIGNhY2hlXHJcbmNvbnN0IHN0YXR1c1BhdGggPSAnLi4vY2hpcHBlci9kaXN0L2pzLWNhY2hlLXN0YXR1cy5qc29uJztcclxuY29uc3Qgcm9vdCA9ICcuLicgKyBwYXRoLnNlcDtcclxuXHJcbi8vIERpcmVjdG9yaWVzIGluIGEgc2ltIHJlcG8gdGhhdCBtYXkgY29udGFpbiB0aGluZ3MgZm9yIHRyYW5zcGlsYXRpb25cclxuLy8gVGhpcyBpcyB1c2VkIGZvciBhIHRvcC1kb3duIHNlYXJjaCBpbiB0aGUgaW5pdGlhbCB0cmFuc3BpbGF0aW9uIGFuZCBmb3IgZmlsdGVyaW5nIHJlbGV2YW50IGZpbGVzIGluIHRoZSB3YXRjaCBwcm9jZXNzXHJcbmNvbnN0IHN1YmRpcnMgPSBbICdqcycsICdpbWFnZXMnLCAnbWlwbWFwcycsICdzb3VuZHMnLCAnc2hhZGVycycsICdjb21tb24nLFxyXG5cclxuICAvLyBwaGV0LWlvLXNpbS1zcGVjaWZpYyBoYXMgbm9uc3RhbmRhcmQgZGlyZWN0b3J5IHN0cnVjdHVyZVxyXG4gICdyZXBvcycgXTtcclxuXHJcbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gKCkgPT4gZnMucmVhZEZpbGVTeW5jKCAnLi4vcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJlcG9zJywgJ3V0ZjgnICkudHJpbSgpLnNwbGl0KCAnXFxuJyApLm1hcCggc2ltID0+IHNpbS50cmltKCkgKTtcclxuXHJcbmNsYXNzIFRyYW5zcGlsZXIge1xyXG5cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gXy5leHRlbmQoIHtcclxuICAgICAgY2xlYW46IGZhbHNlLCAvLyBkZWxldGUgdGhlIHByZXZpb3VzIHN0YXRlL2NhY2hlIGZpbGUsIGFuZCBjcmVhdGUgYSBuZXcgb25lLlxyXG4gICAgICB2ZXJib3NlOiBmYWxzZSwgLy8gQWRkIGV4dHJhIGxvZ2dpbmdcclxuICAgICAgc2lsZW50OiBmYWxzZSwgLy8gaGlkZSBhbGwgbG9nZ2luZyBidXQgZXJyb3IgcmVwb3J0aW5nLCBpbmNsdWRlIGFueSBzcGVjaWZpZWQgd2l0aCB2ZXJib3NlXHJcbiAgICAgIHJlcG9zOiBbXSwgLy8ge3N0cmluZ1tdfSBhZGRpdGlvbmFsIHJlcG9zIHRvIGJlIHRyYW5zcGlsZWQgKGJleW9uZCB0aG9zZSBsaXN0ZWQgaW4gcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJlcG9zKVxyXG4gICAgICBicmFuZHM6IFtdIC8vIHtzdGluZ1tdfSBhZGRpdGlvbmFsIGJyYW5kcyB0byB2aXNpdCBpbiB0aGUgYnJhbmQgcmVwb1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2U7XHJcbiAgICB0aGlzLnNpbGVudCA9IG9wdGlvbnMuc2lsZW50O1xyXG4gICAgdGhpcy5yZXBvcyA9IG9wdGlvbnMucmVwb3M7XHJcbiAgICB0aGlzLmJyYW5kcyA9IG9wdGlvbnMuYnJhbmRzO1xyXG5cclxuICAgIC8vIFRyYWNrIHRoZSBzdGF0dXMgb2YgZWFjaCByZXBvLiBLZXk9IHJlcG8sIHZhbHVlPW1kNSBoYXNoIG9mIGNvbnRlbnRzXHJcbiAgICB0aGlzLnN0YXR1cyA9IHt9O1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSBwcm9ncmFtcyB3YW50IHRvIGhhbmRsZSB0aGlzIGl0c2VsZiBhbmQgZG8gc29tZXRoaW5nIGJlZm9yZSBleGl0aW5nLlxyXG4gICAgaWYgKCAhZ2xvYmFsLnByb2Nlc3NFdmVudE9wdE91dCApIHtcclxuXHJcbiAgICAgIC8vIEV4aXQgb24gQ3RybCArIEMgY2FzZSwgYnV0IG1ha2Ugc3VyZSB0byBzYXZlIHRoZSBjYWNoZVxyXG4gICAgICBwcm9jZXNzLm9uKCAnU0lHSU5UJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2F2ZUNhY2hlKCk7XHJcbiAgICAgICAgcHJvY2Vzcy5leGl0KCk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgYSBkaXJlY3RvcnkgZXhpc3RzIGZvciB0aGUgY2FjaGVkIHN0YXR1cyBmaWxlXHJcbiAgICBmcy5ta2RpclN5bmMoIHBhdGguZGlybmFtZSggc3RhdHVzUGF0aCApLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9ICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmNsZWFuICkge1xyXG4gICAgICAhdGhpcy5zaWxlbnQgJiYgY29uc29sZS5sb2coICdjbGVhbmluZy4uLicgKTtcclxuICAgICAgZnMud3JpdGVGaWxlU3luYyggc3RhdHVzUGF0aCwgSlNPTi5zdHJpbmdpZnkoIHt9LCBudWxsLCAyICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2FkIGNhY2hlZCBzdGF0dXNcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBzdGF0dXNQYXRoLCAndXRmLTgnICkgKTtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAhdGhpcy5zaWxlbnQgJiYgY29uc29sZS5sb2coICdjb3VsZG5cXCd0IHBhcnNlIHN0YXR1cyBjYWNoZSwgbWFraW5nIGEgY2xlYW4gb25lJyApO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHt9O1xyXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKCBzdGF0dXNQYXRoLCBKU09OLnN0cmluZ2lmeSggdGhpcy5zdGF0dXMsIG51bGwsIDIgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSB0aGUgc2FtZSBpbXBsZW1lbnRhdGlvbiBhcyBnZXRSZXBvTGlzdCwgYnV0IHdlIG5lZWQgdG8gcmVhZCBmcm9tIHBlcmVubmlhbC1hbGlhcyBzaW5jZSBjaGlwcGVyIHNob3VsZCBub3RcclxuICAgIC8vIGRlcGVuZCBvbiBwZXJlbm5pYWwuXHJcbiAgICB0aGlzLmFjdGl2ZVJlcG9zID0gZ2V0QWN0aXZlUmVwb3MoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHBhdGggaW4gY2hpcHBlci9kaXN0IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBzb3VyY2UgZmlsZS5cclxuICAgKiBAcGFyYW0gZmlsZW5hbWVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGF0aWMgZ2V0VGFyZ2V0UGF0aCggZmlsZW5hbWUgKSB7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXRoLnJlbGF0aXZlKCByb290LCBmaWxlbmFtZSApO1xyXG4gICAgY29uc3Qgc3VmZml4ID0gcmVsYXRpdmVQYXRoLnN1YnN0cmluZyggcmVsYXRpdmVQYXRoLmxhc3RJbmRleE9mKCAnLicgKSApO1xyXG5cclxuICAgIC8vIE5vdGU6IFdoZW4gd2UgdXBncmFkZSB0byBOb2RlIDE2LCB0aGlzIG1heSBubyBsb25nZXIgYmUgbmVjZXNzYXJ5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzIjaXNzdWVjb21tZW50LTEyMjI1NzQ1OTNcclxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IHJlbGF0aXZlUGF0aC5pbmNsdWRlcyggJ3BoZXQtYnVpbGQtc2NyaXB0JyApID8gJy5tanMnIDogJy5qcyc7XHJcbiAgICByZXR1cm4gVHJhbnNwaWxlci5qb2luKCByb290LCAnY2hpcHBlcicsICdkaXN0JywgJ2pzJywgLi4ucmVsYXRpdmVQYXRoLnNwbGl0KCBwYXRoLnNlcCApICkuc3BsaXQoIHN1ZmZpeCApLmpvaW4oIGV4dGVuc2lvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNwaWxlIHRoZSBmaWxlIHVzaW5nIGJhYmVsLCBhbmQgd3JpdGUgaXQgdG8gdGhlIGNvcnJlc3BvbmRpbmcgbG9jYXRpb24gaW4gY2hpcHBlci9kaXN0XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUZpbGVcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0UGF0aFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gZmlsZSB0ZXh0XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGF0aWMgdHJhbnNwaWxlRnVuY3Rpb24oIHNvdXJjZUZpbGUsIHRhcmdldFBhdGgsIHRleHQgKSB7XHJcbiAgICBjb25zdCB4ID0gY29yZS50cmFuc2Zvcm1TeW5jKCB0ZXh0LCB7XHJcbiAgICAgIGZpbGVuYW1lOiBzb3VyY2VGaWxlLFxyXG5cclxuICAgICAgLy8gTG9hZCBkaXJlY3RseSBmcm9tIG5vZGVfbW9kdWxlcyBzbyB3ZSBkbyBub3QgaGF2ZSB0byBucG0gaW5zdGFsbCB0aGlzIGRlcGVuZGVuY3lcclxuICAgICAgLy8gaW4gZXZlcnkgc2ltIHJlcG8uICBUaGlzIHN0cmF0ZWd5IGlzIGFsc28gdXNlZCBpbiB0cmFuc3BpbGUuanNcclxuICAgICAgcHJlc2V0czogW1xyXG4gICAgICAgICcuLi9jaGlwcGVyL25vZGVfbW9kdWxlcy9AYmFiZWwvcHJlc2V0LXR5cGVzY3JpcHQnLFxyXG4gICAgICAgICcuLi9jaGlwcGVyL25vZGVfbW9kdWxlcy9AYmFiZWwvcHJlc2V0LXJlYWN0J1xyXG4gICAgICBdLFxyXG4gICAgICBzb3VyY2VNYXBzOiAnaW5saW5lJyxcclxuXHJcbiAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICBbICcuLi9jaGlwcGVyL25vZGVfbW9kdWxlcy9AYmFiZWwvcGx1Z2luLXByb3Bvc2FsLWRlY29yYXRvcnMnLCB7IHZlcnNpb246ICcyMDIyLTAzJyB9IF1cclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGZzLm1rZGlyU3luYyggcGF0aC5kaXJuYW1lKCB0YXJnZXRQYXRoICksIHsgcmVjdXJzaXZlOiB0cnVlIH0gKTtcclxuICAgIGZzLndyaXRlRmlsZVN5bmMoIHRhcmdldFBhdGgsIHguY29kZSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0YXRpYyBtb2RpZmllZFRpbWVNaWxsaXNlY29uZHMoIGZpbGUgKSB7XHJcbiAgICByZXR1cm4gZnMuc3RhdFN5bmMoIGZpbGUgKS5tdGltZS5nZXRUaW1lKCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljLiAgRGVsZXRlIGFueSBmaWxlcyBpbiBjaGlwcGVyL2Rpc3QvanMgdGhhdCBkb24ndCBoYXZlIGEgY29ycmVzcG9uZGluZyBmaWxlIGluIHRoZSBzb3VyY2UgdHJlZVxyXG4gIHBydW5lU3RhbGVEaXN0RmlsZXMoKSB7XHJcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0ID0gJy4uL2NoaXBwZXIvZGlzdC9qcy8nO1xyXG5cclxuICAgIGNvbnN0IHZpc2l0RmlsZSA9IHBhdGggPT4ge1xyXG4gICAgICBwYXRoID0gVHJhbnNwaWxlci5mb3J3YXJkU2xhc2hpZnkoIHBhdGggKTtcclxuICAgICAgYXNzZXJ0KCBwYXRoLnN0YXJ0c1dpdGgoIHN0YXJ0ICkgKTtcclxuICAgICAgY29uc3QgdGFpbCA9IHBhdGguc3Vic3RyaW5nKCBzdGFydC5sZW5ndGggKTtcclxuXHJcbiAgICAgIGNvbnN0IGNvcnJlc3BvbmRpbmdGaWxlID0gYC4uLyR7dGFpbH1gO1xyXG4gICAgICBjb25zdCBqc1RzRmlsZSA9IGNvcnJlc3BvbmRpbmdGaWxlLnNwbGl0KCAnLmpzJyApLmpvaW4oICcudHMnICk7XHJcbiAgICAgIGNvbnN0IGpzVHN4RmlsZSA9IGNvcnJlc3BvbmRpbmdGaWxlLnNwbGl0KCAnLmpzJyApLmpvaW4oICcudHN4JyApO1xyXG4gICAgICBjb25zdCBtanNUc0ZpbGUgPSBjb3JyZXNwb25kaW5nRmlsZS5zcGxpdCggJy5tanMnICkuam9pbiggJy50cycgKTtcclxuICAgICAgY29uc3QgbWpzVHN4RmlsZSA9IGNvcnJlc3BvbmRpbmdGaWxlLnNwbGl0KCAnLm1qcycgKS5qb2luKCAnLnRzeCcgKTtcclxuICAgICAgaWYgKCAhZnMuZXhpc3RzU3luYyggY29ycmVzcG9uZGluZ0ZpbGUgKSAmJlxyXG4gICAgICAgICAgICFmcy5leGlzdHNTeW5jKCBqc1RzRmlsZSApICYmICFmcy5leGlzdHNTeW5jKCBqc1RzeEZpbGUgKSAmJlxyXG4gICAgICAgICAgICFmcy5leGlzdHNTeW5jKCBtanNUc0ZpbGUgKSAmJiAhZnMuZXhpc3RzU3luYyggbWpzVHN4RmlsZSApXHJcbiAgICAgICkge1xyXG4gICAgICAgIGZzLnVubGlua1N5bmMoIHBhdGggKTtcclxuICAgICAgICBjb25zb2xlLmxvZyggJ05vIHBhcmVudCBzb3VyY2UgZmlsZSBmb3I6ICcgKyBwYXRoICsgJywgZGVsZXRlZC4nICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBSZWN1cnNpdmVseSB2aXNpdCBhIGRpcmVjdG9yeSBmb3IgZmlsZXMgdG8gdHJhbnNwaWxlXHJcbiAgICBjb25zdCB2aXNpdERpciA9IGRpciA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoIGRpciApO1xyXG4gICAgICBmaWxlcy5mb3JFYWNoKCBmaWxlID0+IHtcclxuICAgICAgICBjb25zdCBjaGlsZCA9IFRyYW5zcGlsZXIuam9pbiggZGlyLCBmaWxlICk7XHJcbiAgICAgICAgaWYgKCBmcy5sc3RhdFN5bmMoIGNoaWxkICkuaXNEaXJlY3RvcnkoKSAmJiBmcy5leGlzdHNTeW5jKCBjaGlsZCApICkge1xyXG4gICAgICAgICAgdmlzaXREaXIoIGNoaWxkICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBmcy5leGlzdHNTeW5jKCBjaGlsZCApICYmIGZzLmxzdGF0U3luYyggY2hpbGQgKS5pc0ZpbGUoKSApIHtcclxuICAgICAgICAgIHZpc2l0RmlsZSggY2hpbGQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKCBmcy5leGlzdHNTeW5jKCBzdGFydCApICYmIGZzLmxzdGF0U3luYyggc3RhcnQgKS5pc0RpcmVjdG9yeSgpICkge1xyXG4gICAgICB2aXNpdERpciggc3RhcnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbmRUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgIGNvbnN0IGVsYXBzZWQgPSBlbmRUaW1lIC0gc3RhcnRUaW1lO1xyXG4gICAgY29uc29sZS5sb2coICdDbGVhbiBzdGFsZSBjaGlwcGVyL2Rpc3QvanMgZmlsZXMgZmluaXNoZWQgaW4gJyArIGVsYXBzZWQgKyAnbXMnICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIGpvaW4gYW5kIG5vcm1hbGl6ZSB0aGUgcGF0aHMgKGZvcndhcmQgc2xhc2hlcyBmb3IgZWFzZSBvZiBzZWFyY2ggYW5kIHJlYWRhYmlsaXR5KVxyXG4gIHN0YXRpYyBqb2luKCAuLi5wYXRocyApIHtcclxuICAgIHJldHVybiBUcmFuc3BpbGVyLmZvcndhcmRTbGFzaGlmeSggcGF0aC5qb2luKCAuLi5wYXRocyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgKi50cyBhbmQgKi5qcyBmaWxlcywgY2hlY2tzIGlmIHRoZXkgaGF2ZSBjaGFuZ2VkIGZpbGUgY29udGVudHMgc2luY2UgbGFzdCB0cmFuc3BpbGUuICBJZiBzbywgdGhlXHJcbiAgICogZmlsZSBpcyB0cmFuc3BpbGVkLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdmlzaXRGaWxlKCBmaWxlUGF0aCApIHtcclxuICAgIGlmICggKCBmaWxlUGF0aC5lbmRzV2l0aCggJy5qcycgKSB8fCBmaWxlUGF0aC5lbmRzV2l0aCggJy50cycgKSB8fCBmaWxlUGF0aC5lbmRzV2l0aCggJy50c3gnICkgKSAmJiAhdGhpcy5pc1BhdGhJZ25vcmVkKCBmaWxlUGF0aCApICkge1xyXG4gICAgICBjb25zdCBjaGFuZ2VEZXRlY3RlZFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICBjb25zdCB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKCBmaWxlUGF0aCwgJ3V0Zi04JyApO1xyXG4gICAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goICdtZDUnICkudXBkYXRlKCB0ZXh0ICkuZGlnZXN0KCAnaGV4JyApO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGZpbGUgaGFzIGNoYW5nZWQsIHRyYW5zcGlsZSBhbmQgdXBkYXRlIHRoZSBjYWNoZS4gIFdlIGhhdmUgdG8gY2hvb3NlIG9uIHRoZSBzcGVjdHJ1bSBiZXR3ZWVuIHNhZmV0eVxyXG4gICAgICAvLyBhbmQgcGVyZm9ybWFuY2UuICBJbiBvcmRlciB0byBtYWludGFpbiBoaWdoIHBlcmZvcm1hbmNlIHdpdGggYSBsb3cgZXJyb3IgcmF0ZSwgd2Ugb25seSB3cml0ZSB0aGUgdHJhbnNwaWxlZCBmaWxlXHJcbiAgICAgIC8vIGlmIChhKSB0aGUgY2FjaGUgaXMgb3V0IG9mIGRhdGUgKGIpIHRoZXJlIGlzIG5vIHRhcmdldCBmaWxlIGF0IGFsbCBvciAoYykgaWYgdGhlIHRhcmdldCBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkLlxyXG4gICAgICBjb25zdCB0YXJnZXRQYXRoID0gVHJhbnNwaWxlci5nZXRUYXJnZXRQYXRoKCBmaWxlUGF0aCApO1xyXG5cclxuICAgICAgaWYgKCAhdGhpcy5zdGF0dXNbIGZpbGVQYXRoIF0gfHwgdGhpcy5zdGF0dXNbIGZpbGVQYXRoIF0uc291cmNlTUQ1ICE9PSBoYXNoIHx8ICFmcy5leGlzdHNTeW5jKCB0YXJnZXRQYXRoICkgfHwgdGhpcy5zdGF0dXNbIGZpbGVQYXRoIF0udGFyZ2V0TWlsbGlzZWNvbmRzICE9PSBUcmFuc3BpbGVyLm1vZGlmaWVkVGltZU1pbGxpc2Vjb25kcyggdGFyZ2V0UGF0aCApICkge1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgbGV0IHJlYXNvbiA9ICcnO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLnZlcmJvc2UgKSB7XHJcbiAgICAgICAgICAgIHJlYXNvbiA9ICggIXRoaXMuc3RhdHVzWyBmaWxlUGF0aCBdICkgPyAnIChub3QgY2FjaGVkKScgOiAoIHRoaXMuc3RhdHVzWyBmaWxlUGF0aCBdLnNvdXJjZU1ENSAhPT0gaGFzaCApID8gJyAoY2hhbmdlZCknIDogKCAhZnMuZXhpc3RzU3luYyggdGFyZ2V0UGF0aCApICkgPyAnIChubyB0YXJnZXQpJyA6ICggdGhpcy5zdGF0dXNbIGZpbGVQYXRoIF0udGFyZ2V0TWlsbGlzZWNvbmRzICE9PSBUcmFuc3BpbGVyLm1vZGlmaWVkVGltZU1pbGxpc2Vjb25kcyggdGFyZ2V0UGF0aCApICkgPyAnICh0YXJnZXQgbW9kaWZpZWQpJyA6ICc/Pz8nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgVHJhbnNwaWxlci50cmFuc3BpbGVGdW5jdGlvbiggZmlsZVBhdGgsIHRhcmdldFBhdGgsIHRleHQgKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnN0YXR1c1sgZmlsZVBhdGggXSA9IHtcclxuICAgICAgICAgICAgc291cmNlTUQ1OiBoYXNoLCB0YXJnZXRNaWxsaXNlY29uZHM6IFRyYW5zcGlsZXIubW9kaWZpZWRUaW1lTWlsbGlzZWNvbmRzKCB0YXJnZXRQYXRoIClcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCBzdGF0dXNQYXRoLCBKU09OLnN0cmluZ2lmeSggdGhpcy5zdGF0dXMsIG51bGwsIDIgKSApO1xyXG4gICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgIGNvbnN0IG5vd1RpbWVTdHJpbmcgPSBuZXcgRGF0ZSggbm93ICkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgIXRoaXMuc2lsZW50ICYmIGNvbnNvbGUubG9nKCBgJHtub3dUaW1lU3RyaW5nfSwgJHsoIG5vdyAtIGNoYW5nZURldGVjdGVkVGltZSApfSBtczogJHtmaWxlUGF0aH0ke3JlYXNvbn1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGUgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCAnRVJST1InICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSAtIFJlY3Vyc2l2ZWx5IHZpc2l0IGEgZGlyZWN0b3J5IGZvciBmaWxlcyB0byB0cmFuc3BpbGVcclxuICB2aXNpdERpcmVjdG9yeSggZGlyICkge1xyXG4gICAgaWYgKCBmcy5leGlzdHNTeW5jKCBkaXIgKSApIHtcclxuICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyggZGlyICk7XHJcbiAgICAgIGZpbGVzLmZvckVhY2goIGZpbGUgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gVHJhbnNwaWxlci5qb2luKCBkaXIsIGZpbGUgKTtcclxuICAgICAgICBpZiAoIGZzLmxzdGF0U3luYyggY2hpbGQgKS5pc0RpcmVjdG9yeSgpICkge1xyXG4gICAgICAgICAgdGhpcy52aXNpdERpcmVjdG9yeSggY2hpbGQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnZpc2l0RmlsZSggY2hpbGQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgaXNQYXRoSWdub3JlZCggZmlsZVBhdGggKSB7XHJcbiAgICBjb25zdCB3aXRoRm9yd2FyZFNsYXNoZXMgPSBUcmFuc3BpbGVyLmZvcndhcmRTbGFzaGlmeSggZmlsZVBhdGggKTtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgLy8gaWdub3JlIGRpcmVjdG9yaWVzLCBqdXN0IGNhcmUgYWJvdXQgaW5kaXZpZHVhbCBmaWxlc1xyXG4gICAgICAvLyBUcnkgY2F0Y2ggYmVjYXVzZSB0aGVyZSBjYW4gc3RpbGwgYmUgYSByYWNlIGNvbmRpdGlvbiBiZXR3ZWVuIGNoZWNraW5nIGFuZCBsc3RhdHRpbmcuIFRoaXMgY292ZXJzIGVub3VnaCBjYXNlc1xyXG4gICAgICAvLyB0aG91Z2ggdG8gc3RpbGwga2VlcCBpdCBpbi5cclxuICAgICAgaWYgKCBmcy5leGlzdHNTeW5jKCBmaWxlUGF0aCApICYmIGZzLmxzdGF0U3luYyggZmlsZVBhdGggKS5pc0RpcmVjdG9yeSgpICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjYXRjaCggZSApIHsgLyogaWdub3JlIHBsZWFzZSAqLyB9XHJcblxyXG4gICAgcmV0dXJuIHdpdGhGb3J3YXJkU2xhc2hlcy5pbmNsdWRlcyggJy9ub2RlX21vZHVsZXMnICkgfHxcclxuICAgICAgICAgICB3aXRoRm9yd2FyZFNsYXNoZXMuaW5jbHVkZXMoICcuZ2l0LycgKSB8fFxyXG4gICAgICAgICAgIHdpdGhGb3J3YXJkU2xhc2hlcy5pbmNsdWRlcyggJy9idWlsZC8nICkgfHxcclxuICAgICAgICAgICB3aXRoRm9yd2FyZFNsYXNoZXMuaW5jbHVkZXMoICdjaGlwcGVyL2Rpc3QvJyApIHx8XHJcbiAgICAgICAgICAgd2l0aEZvcndhcmRTbGFzaGVzLmluY2x1ZGVzKCAndHJhbnNwaWxlL2NhY2hlL3N0YXR1cy5qc29uJyApIHx8XHJcblxyXG4gICAgICAgICAgIC8vIFRlbXBvcmFyeSBmaWxlcyBzb21ldGltZXMgc2F2ZWQgYnkgdGhlIElERVxyXG4gICAgICAgICAgIHdpdGhGb3J3YXJkU2xhc2hlcy5lbmRzV2l0aCggJ34nICkgfHxcclxuXHJcbiAgICAgICAgICAgLy8gZXNsaW50IGNhY2hlIGZpbGVzXHJcbiAgICAgICAgICAgd2l0aEZvcndhcmRTbGFzaGVzLmluY2x1ZGVzKCAnL2NoaXBwZXIvZXNsaW50L2NhY2hlLycgKSB8fFxyXG4gICAgICAgICAgIHdpdGhGb3J3YXJkU2xhc2hlcy5pbmNsdWRlcyggJy9wZXJlbm5pYWwtYWxpYXMvbG9ncy8nICkgfHxcclxuICAgICAgICAgICB3aXRoRm9yd2FyZFNsYXNoZXMuZW5kc1dpdGgoICcuZXNsaW50Y2FjaGUnICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHN0YXRpYyBmb3J3YXJkU2xhc2hpZnkoIGZpbGVQYXRoICkge1xyXG4gICAgcmV0dXJuIGZpbGVQYXRoLnNwbGl0KCAnXFxcXCcgKS5qb2luKCAnLycgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zcGlsZSB0aGUgc3BlY2lmaWVkIHJlcG9zXHJcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcmVwb3NcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJhbnNwaWxlUmVwb3MoIHJlcG9zICkge1xyXG4gICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCByZXBvcyApLCAncmVwb3Mgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xyXG4gICAgcmVwb3MuZm9yRWFjaCggcmVwbyA9PiB0aGlzLnRyYW5zcGlsZVJlcG8oIHJlcG8gKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIFZpc2l0IGFsbCB0aGUgc3ViZGlyZWN0b3JpZXMgaW4gYSByZXBvIHRoYXQgbmVlZCB0cmFuc3BpbGF0aW9uXHJcbiAgdHJhbnNwaWxlUmVwbyggcmVwbyApIHtcclxuICAgIHN1YmRpcnMuZm9yRWFjaCggc3ViZGlyID0+IHRoaXMudmlzaXREaXJlY3RvcnkoIFRyYW5zcGlsZXIuam9pbiggJy4uJywgcmVwbywgc3ViZGlyICkgKSApO1xyXG4gICAgaWYgKCByZXBvID09PSAnc2hlcnBhJyApIHtcclxuXHJcbiAgICAgIC8vIE91ciBzaW1zIGxvYWQgdGhpcyBhcyBhIG1vZHVsZSByYXRoZXIgdGhhbiBhIHByZWxvYWQsIHNvIHdlIG11c3QgdHJhbnNwaWxlIGl0XHJcbiAgICAgIHRoaXMudmlzaXRGaWxlKCBUcmFuc3BpbGVyLmpvaW4oICcuLicsIHJlcG8sICdsaWInLCAnZ2FtZS11cC1jYW1lcmEtMS4wLjAuanMnICkgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCByZXBvID09PSAnYnJhbmQnICkge1xyXG4gICAgICB0aGlzLnZpc2l0RGlyZWN0b3J5KCBUcmFuc3BpbGVyLmpvaW4oICcuLicsIHJlcG8sICdwaGV0JyApICk7XHJcbiAgICAgIHRoaXMudmlzaXREaXJlY3RvcnkoIFRyYW5zcGlsZXIuam9pbiggJy4uJywgcmVwbywgJ3BoZXQtaW8nICkgKTtcclxuICAgICAgdGhpcy52aXNpdERpcmVjdG9yeSggVHJhbnNwaWxlci5qb2luKCAnLi4nLCByZXBvLCAnYWRhcHRlZC1mcm9tLXBoZXQnICkgKTtcclxuXHJcbiAgICAgIHRoaXMuYnJhbmRzLmZvckVhY2goIGJyYW5kID0+IHRoaXMudmlzaXREaXJlY3RvcnkoIFRyYW5zcGlsZXIuam9pbiggJy4uJywgcmVwbywgYnJhbmQgKSApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgdHJhbnNwaWxlQWxsKCkge1xyXG4gICAgdGhpcy50cmFuc3BpbGVSZXBvcyggWyAuLi50aGlzLmFjdGl2ZVJlcG9zLCAuLi50aGlzLnJlcG9zIF0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgc2F2ZUNhY2hlKCkge1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyggc3RhdHVzUGF0aCwgSlNPTi5zdHJpbmdpZnkoIHRoaXMuc3RhdHVzLCBudWxsLCAyICkgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICB3YXRjaCgpIHtcclxuXHJcbiAgICAvLyBJbnZhbGlkYXRlIGNhY2hlcyB3aGVuIHdlIHN0YXJ0IHdhdGNoaW5nXHJcbiAgICBDYWNoZUxheWVyLnVwZGF0ZUxhc3RDaGFuZ2VkVGltZXN0YW1wKCk7XHJcblxyXG4gICAgLy8gRm9yIGNvb3JkaW5hdGlvbiB3aXRoIENhY2hlTGF5ZXIsIGNsZWFyIHRoZSBjYWNoZSB3aGlsZSB3ZSBhcmUgbm90IHdhdGNoaW5nIGZvciBmaWxlIGNoYW5nZXNcclxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE0MDMxNzYzL2RvaW5nLWEtY2xlYW51cC1hY3Rpb24tanVzdC1iZWZvcmUtbm9kZS1qcy1leGl0c1xyXG4gICAgcHJvY2Vzcy5zdGRpbi5yZXN1bWUoKTsvL3NvIHRoZSBwcm9ncmFtIHdpbGwgbm90IGNsb3NlIGluc3RhbnRseVxyXG5cclxuICAgIGZ1bmN0aW9uIGV4aXRIYW5kbGVyKCBvcHRpb25zICkge1xyXG5cclxuICAgICAgLy8gTk9URTogdGhpcyBnZXRzIGNhbGxlZCAyeCBvbiBjdHJsLWMgZm9yIHVua25vd24gcmVhc29uc1xyXG4gICAgICBDYWNoZUxheWVyLmNsZWFyTGFzdENoYW5nZWRUaW1lc3RhbXAoKTtcclxuXHJcbiAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmV4aXQgKSB7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLmFyZyApIHtcclxuICAgICAgICAgIHRocm93IG9wdGlvbnMuYXJnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9jZXNzLmV4aXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvIHNvbWV0aGluZyB3aGVuIGFwcCBpcyBjbG9zaW5nXHJcbiAgICBwcm9jZXNzLm9uKCAnZXhpdCcsICgpID0+IGV4aXRIYW5kbGVyKCkgKTtcclxuXHJcbiAgICAvLyBjYXRjaGVzIGN0cmwrYyBldmVudFxyXG4gICAgcHJvY2Vzcy5vbiggJ1NJR0lOVCcsICgpID0+IGV4aXRIYW5kbGVyKCB7IGV4aXQ6IHRydWUgfSApICk7XHJcblxyXG4gICAgLy8gY2F0Y2hlcyBcImtpbGwgcGlkXCIgKGZvciBleGFtcGxlOiBub2RlbW9uIHJlc3RhcnQpXHJcbiAgICBwcm9jZXNzLm9uKCAnU0lHVVNSMScsICgpID0+IGV4aXRIYW5kbGVyKCB7IGV4aXQ6IHRydWUgfSApICk7XHJcbiAgICBwcm9jZXNzLm9uKCAnU0lHVVNSMicsICgpID0+IGV4aXRIYW5kbGVyKCB7IGV4aXQ6IHRydWUgfSApICk7XHJcblxyXG4gICAgLy8gY2F0Y2hlcyB1bmNhdWdodCBleGNlcHRpb25zXHJcbiAgICBwcm9jZXNzLm9uKCAndW5jYXVnaHRFeGNlcHRpb24nLCBlID0+IGV4aXRIYW5kbGVyKCB7IGFyZzogZSwgZXhpdDogdHJ1ZSB9ICkgKTtcclxuXHJcbiAgICBmcy53YXRjaCggJy4uJyArIHBhdGguc2VwLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9LCAoIGV2ZW50VHlwZSwgZmlsZW5hbWUgKSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBjaGFuZ2VEZXRlY3RlZFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICBjb25zdCBmaWxlUGF0aCA9IFRyYW5zcGlsZXIuZm9yd2FyZFNsYXNoaWZ5KCAnLi4nICsgcGF0aC5zZXAgKyBmaWxlbmFtZSApO1xyXG5cclxuICAgICAgLy8gV2Ugb2JzZXJ2ZWQgYSBudWxsIGZpbGVuYW1lIG9uIFdpbmRvd3MgZm9yIGFuIHVua25vd24gcmVhc29uLlxyXG4gICAgICBpZiAoIGZpbGVuYW1lID09PSBudWxsIHx8IHRoaXMuaXNQYXRoSWdub3JlZCggZmlsZVBhdGggKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEludmFsaWRhdGUgY2FjaGUgd2hlbiBhbnkgcmVsZXZhbnQgZmlsZSBoYXMgY2hhbmdlZC5cclxuICAgICAgQ2FjaGVMYXllci51cGRhdGVMYXN0Q2hhbmdlZFRpbWVzdGFtcCgpO1xyXG5cclxuICAgICAgY29uc3QgcGF0aEV4aXN0cyA9IGZzLmV4aXN0c1N5bmMoIGZpbGVQYXRoICk7XHJcblxyXG4gICAgICBpZiAoICFwYXRoRXhpc3RzICkge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBUcmFuc3BpbGVyLmdldFRhcmdldFBhdGgoIGZpbGVQYXRoICk7XHJcbiAgICAgICAgaWYgKCBmcy5leGlzdHNTeW5jKCB0YXJnZXRQYXRoICkgJiYgZnMubHN0YXRTeW5jKCB0YXJnZXRQYXRoICkuaXNGaWxlKCkgKSB7XHJcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKCB0YXJnZXRQYXRoICk7XHJcblxyXG4gICAgICAgICAgZGVsZXRlIHRoaXMuc3RhdHVzWyBmaWxlUGF0aCBdO1xyXG4gICAgICAgICAgdGhpcy5zYXZlQ2FjaGUoKTtcclxuICAgICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICBjb25zdCByZWFzb24gPSAnIChkZWxldGVkKSc7XHJcblxyXG4gICAgICAgICAgIXRoaXMuc2lsZW50ICYmIGNvbnNvbGUubG9nKCBgJHtuZXcgRGF0ZSggbm93ICkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9LCAkeyggbm93IC0gY2hhbmdlRGV0ZWN0ZWRUaW1lICl9IG1zOiAke2ZpbGVQYXRofSR7cmVhc29ufWAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBmaWxlUGF0aC5lbmRzV2l0aCggJ3BlcmVubmlhbC1hbGlhcy9kYXRhL2FjdGl2ZS1yZXBvcycgKSApIHtcclxuICAgICAgICBjb25zdCBuZXdBY3RpdmVSZXBvcyA9IGdldEFjdGl2ZVJlcG9zKCk7XHJcbiAgICAgICAgIXRoaXMuc2lsZW50ICYmIGNvbnNvbGUubG9nKCAncmVsb2FkZWQgYWN0aXZlIHJlcG9zJyApO1xyXG4gICAgICAgIGNvbnN0IG5ld1JlcG9zID0gbmV3QWN0aXZlUmVwb3MuZmlsdGVyKCByZXBvID0+ICF0aGlzLmFjdGl2ZVJlcG9zLmluY2x1ZGVzKCByZXBvICkgKTtcclxuXHJcbiAgICAgICAgLy8gUnVuIGFuIGluaXRpYWwgc2NhbiBvbiBuZXdseSBhZGRlZCByZXBvc1xyXG4gICAgICAgIG5ld1JlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xyXG4gICAgICAgICAgIXRoaXMuc2lsZW50ICYmIGNvbnNvbGUubG9nKCAnTmV3IHJlcG8gZGV0ZWN0ZWQgaW4gYWN0aXZlLXJlcG9zLCB0cmFuc3BpbGluZzogJyArIHJlcG8gKTtcclxuICAgICAgICAgIHRoaXMudHJhbnNwaWxlUmVwbyggcmVwbyApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVJlcG9zID0gbmV3QWN0aXZlUmVwb3M7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgdGVybXMgPSBmaWxlbmFtZS5zcGxpdCggcGF0aC5zZXAgKTtcclxuICAgICAgICBpZiAoICggdGhpcy5hY3RpdmVSZXBvcy5pbmNsdWRlcyggdGVybXNbIDAgXSApIHx8IHRoaXMucmVwb3MuaW5jbHVkZXMoIHRlcm1zWyAwIF0gKSApXHJcbiAgICAgICAgICAgICAmJiBzdWJkaXJzLmluY2x1ZGVzKCB0ZXJtc1sgMSBdICkgJiYgcGF0aEV4aXN0cyApIHtcclxuICAgICAgICAgIHRoaXMudmlzaXRGaWxlKCBmaWxlUGF0aCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc3BpbGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQU1BLEVBQUUsR0FBR0MsT0FBTyxDQUFFLElBQUssQ0FBQztBQUMxQixNQUFNQyxJQUFJLEdBQUdELE9BQU8sQ0FBRSxNQUFPLENBQUM7QUFDOUIsTUFBTUUsTUFBTSxHQUFHRixPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1HLFVBQVUsR0FBR0gsT0FBTyxDQUFFLGNBQWUsQ0FBQztBQUM1QyxNQUFNSSxJQUFJLEdBQUdKLE9BQU8sQ0FBRSxhQUFjLENBQUM7QUFDckMsTUFBTUssTUFBTSxHQUFHTCxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1NLENBQUMsR0FBR04sT0FBTyxDQUFFLFFBQVMsQ0FBQzs7QUFFN0I7QUFDQSxNQUFNTyxVQUFVLEdBQUcsc0NBQXNDO0FBQ3pELE1BQU1DLElBQUksR0FBRyxJQUFJLEdBQUdQLElBQUksQ0FBQ1EsR0FBRzs7QUFFNUI7QUFDQTtBQUNBLE1BQU1DLE9BQU8sR0FBRyxDQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUTtBQUV4RTtBQUNBLE9BQU8sQ0FBRTtBQUVYLE1BQU1DLGNBQWMsR0FBR0EsQ0FBQSxLQUFNWixFQUFFLENBQUNhLFlBQVksQ0FBRSxzQ0FBc0MsRUFBRSxNQUFPLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFLElBQUssQ0FBQyxDQUFDQyxHQUFHLENBQUVDLEdBQUcsSUFBSUEsR0FBRyxDQUFDSCxJQUFJLENBQUMsQ0FBRSxDQUFDO0FBRTVJLE1BQU1JLFVBQVUsQ0FBQztFQUVmQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8s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