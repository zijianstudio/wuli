// Copyright 2018, University of Colorado Boulder

/**
 * Updates our github-pages branches (shows up at e.g. https://phetsims.github.io/scenery)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const gitAdd = require('./gitAdd');
const gitCheckout = require('./gitCheckout');
const gitCommit = require('./gitCommit');
const gitIsClean = require('./gitIsClean');
const gitPull = require('./gitPull');
const gitPush = require('./gitPush');
const gruntCommand = require('./gruntCommand');
const npmUpdate = require('./npmUpdate');
const winston = require('winston');

/**
 * Checks to see if the git state/status is clean
 * @public
 *
 * @returns {Promise}
 * @rejects {ExecuteError}
 */
module.exports = async function () {
  winston.info('Updating GitHub pages');
  const taggedRepos = [{
    repo: 'assert'
  }, {
    repo: 'aqua'
  }, {
    repo: 'tandem'
  }, {
    repo: 'query-string-machine'
  }, {
    repo: 'phet-core'
  }, {
    repo: 'chipper'
  }, {
    repo: 'sherpa'
  }, {
    repo: 'axon'
  }, {
    repo: 'dot',
    build: true
  }, {
    repo: 'kite',
    build: true
  }, {
    repo: 'scenery',
    build: true
  }];
  for (const taggedRepo of taggedRepos) {
    const repo = taggedRepo.repo;
    winston.info(`Updating ${repo}`);
    await gitCheckout(repo, 'gh-pages');
    await gitPull(repo);
    await execute('git', ['merge', 'master', '-m', 'Update for gh-pages'], `../${repo}`);
    if (taggedRepo.build) {
      await npmUpdate(repo);
      winston.info(`Building ${repo}`);
      await execute(gruntCommand, [], `../${repo}`);
      if (!(await gitIsClean(repo))) {
        await gitAdd(repo, 'build');
        await gitCommit(repo, 'Updating for gh-pages build');
      }
    }
    await gitPush(repo, 'gh-pages');
    await gitCheckout(repo, 'master');
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImdpdEFkZCIsImdpdENoZWNrb3V0IiwiZ2l0Q29tbWl0IiwiZ2l0SXNDbGVhbiIsImdpdFB1bGwiLCJnaXRQdXNoIiwiZ3J1bnRDb21tYW5kIiwibnBtVXBkYXRlIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbmZvIiwidGFnZ2VkUmVwb3MiLCJyZXBvIiwiYnVpbGQiLCJ0YWdnZWRSZXBvIl0sInNvdXJjZXMiOlsidXBkYXRlR2l0aHViUGFnZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZXMgb3VyIGdpdGh1Yi1wYWdlcyBicmFuY2hlcyAoc2hvd3MgdXAgYXQgZS5nLiBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5KVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICk7XHJcbmNvbnN0IGdpdEFkZCA9IHJlcXVpcmUoICcuL2dpdEFkZCcgKTtcclxuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRDaGVja291dCcgKTtcclxuY29uc3QgZ2l0Q29tbWl0ID0gcmVxdWlyZSggJy4vZ2l0Q29tbWl0JyApO1xyXG5jb25zdCBnaXRJc0NsZWFuID0gcmVxdWlyZSggJy4vZ2l0SXNDbGVhbicgKTtcclxuY29uc3QgZ2l0UHVsbCA9IHJlcXVpcmUoICcuL2dpdFB1bGwnICk7XHJcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi9naXRQdXNoJyApO1xyXG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi9ncnVudENvbW1hbmQnICk7XHJcbmNvbnN0IG5wbVVwZGF0ZSA9IHJlcXVpcmUoICcuL25wbVVwZGF0ZScgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB0byBzZWUgaWYgdGhlIGdpdCBzdGF0ZS9zdGF0dXMgaXMgY2xlYW5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oKSB7XHJcbiAgd2luc3Rvbi5pbmZvKCAnVXBkYXRpbmcgR2l0SHViIHBhZ2VzJyApO1xyXG5cclxuICBjb25zdCB0YWdnZWRSZXBvcyA9IFtcclxuICAgIHsgcmVwbzogJ2Fzc2VydCcgfSxcclxuICAgIHsgcmVwbzogJ2FxdWEnIH0sXHJcbiAgICB7IHJlcG86ICd0YW5kZW0nIH0sXHJcbiAgICB7IHJlcG86ICdxdWVyeS1zdHJpbmctbWFjaGluZScgfSxcclxuICAgIHsgcmVwbzogJ3BoZXQtY29yZScgfSxcclxuICAgIHsgcmVwbzogJ2NoaXBwZXInIH0sXHJcbiAgICB7IHJlcG86ICdzaGVycGEnIH0sXHJcbiAgICB7IHJlcG86ICdheG9uJyB9LFxyXG4gICAgeyByZXBvOiAnZG90JywgYnVpbGQ6IHRydWUgfSxcclxuICAgIHsgcmVwbzogJ2tpdGUnLCBidWlsZDogdHJ1ZSB9LFxyXG4gICAgeyByZXBvOiAnc2NlbmVyeScsIGJ1aWxkOiB0cnVlIH1cclxuICBdO1xyXG5cclxuICBmb3IgKCBjb25zdCB0YWdnZWRSZXBvIG9mIHRhZ2dlZFJlcG9zICkge1xyXG4gICAgY29uc3QgcmVwbyA9IHRhZ2dlZFJlcG8ucmVwbztcclxuXHJcbiAgICB3aW5zdG9uLmluZm8oIGBVcGRhdGluZyAke3JlcG99YCApO1xyXG5cclxuICAgIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCAnZ2gtcGFnZXMnICk7XHJcbiAgICBhd2FpdCBnaXRQdWxsKCByZXBvICk7XHJcbiAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnbWVyZ2UnLCAnbWFzdGVyJywgJy1tJywgJ1VwZGF0ZSBmb3IgZ2gtcGFnZXMnIF0sIGAuLi8ke3JlcG99YCApO1xyXG5cclxuICAgIGlmICggdGFnZ2VkUmVwby5idWlsZCApIHtcclxuICAgICAgYXdhaXQgbnBtVXBkYXRlKCByZXBvICk7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggYEJ1aWxkaW5nICR7cmVwb31gICk7XHJcbiAgICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgW10sIGAuLi8ke3JlcG99YCApO1xyXG5cclxuICAgICAgaWYgKCAhYXdhaXQgZ2l0SXNDbGVhbiggcmVwbyApICkge1xyXG4gICAgICAgIGF3YWl0IGdpdEFkZCggcmVwbywgJ2J1aWxkJyApO1xyXG4gICAgICAgIGF3YWl0IGdpdENvbW1pdCggcmVwbywgJ1VwZGF0aW5nIGZvciBnaC1wYWdlcyBidWlsZCcgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IGdpdFB1c2goIHJlcG8sICdnaC1wYWdlcycgKTtcclxuICAgIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCAnbWFzdGVyJyApO1xyXG4gIH1cclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFFLFdBQVksQ0FBQztBQUN0QyxNQUFNQyxNQUFNLEdBQUdELE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDcEMsTUFBTUUsV0FBVyxHQUFHRixPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNRyxTQUFTLEdBQUdILE9BQU8sQ0FBRSxhQUFjLENBQUM7QUFDMUMsTUFBTUksVUFBVSxHQUFHSixPQUFPLENBQUUsY0FBZSxDQUFDO0FBQzVDLE1BQU1LLE9BQU8sR0FBR0wsT0FBTyxDQUFFLFdBQVksQ0FBQztBQUN0QyxNQUFNTSxPQUFPLEdBQUdOLE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTU8sWUFBWSxHQUFHUCxPQUFPLENBQUUsZ0JBQWlCLENBQUM7QUFDaEQsTUFBTVEsU0FBUyxHQUFHUixPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1TLE9BQU8sR0FBR1QsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQVUsTUFBTSxDQUFDQyxPQUFPLEdBQUcsa0JBQWlCO0VBQ2hDRixPQUFPLENBQUNHLElBQUksQ0FBRSx1QkFBd0IsQ0FBQztFQUV2QyxNQUFNQyxXQUFXLEdBQUcsQ0FDbEI7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxFQUNsQjtJQUFFQSxJQUFJLEVBQUU7RUFBTyxDQUFDLEVBQ2hCO0lBQUVBLElBQUksRUFBRTtFQUFTLENBQUMsRUFDbEI7SUFBRUEsSUFBSSxFQUFFO0VBQXVCLENBQUMsRUFDaEM7SUFBRUEsSUFBSSxFQUFFO0VBQVksQ0FBQyxFQUNyQjtJQUFFQSxJQUFJLEVBQUU7RUFBVSxDQUFDLEVBQ25CO0lBQUVBLElBQUksRUFBRTtFQUFTLENBQUMsRUFDbEI7SUFBRUEsSUFBSSxFQUFFO0VBQU8sQ0FBQyxFQUNoQjtJQUFFQSxJQUFJLEVBQUUsS0FBSztJQUFFQyxLQUFLLEVBQUU7RUFBSyxDQUFDLEVBQzVCO0lBQUVELElBQUksRUFBRSxNQUFNO0lBQUVDLEtBQUssRUFBRTtFQUFLLENBQUMsRUFDN0I7SUFBRUQsSUFBSSxFQUFFLFNBQVM7SUFBRUMsS0FBSyxFQUFFO0VBQUssQ0FBQyxDQUNqQztFQUVELEtBQU0sTUFBTUMsVUFBVSxJQUFJSCxXQUFXLEVBQUc7SUFDdEMsTUFBTUMsSUFBSSxHQUFHRSxVQUFVLENBQUNGLElBQUk7SUFFNUJMLE9BQU8sQ0FBQ0csSUFBSSxDQUFHLFlBQVdFLElBQUssRUFBRSxDQUFDO0lBRWxDLE1BQU1aLFdBQVcsQ0FBRVksSUFBSSxFQUFFLFVBQVcsQ0FBQztJQUNyQyxNQUFNVCxPQUFPLENBQUVTLElBQUssQ0FBQztJQUNyQixNQUFNZixPQUFPLENBQUUsS0FBSyxFQUFFLENBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUscUJBQXFCLENBQUUsRUFBRyxNQUFLZSxJQUFLLEVBQUUsQ0FBQztJQUV4RixJQUFLRSxVQUFVLENBQUNELEtBQUssRUFBRztNQUN0QixNQUFNUCxTQUFTLENBQUVNLElBQUssQ0FBQztNQUN2QkwsT0FBTyxDQUFDRyxJQUFJLENBQUcsWUFBV0UsSUFBSyxFQUFFLENBQUM7TUFDbEMsTUFBTWYsT0FBTyxDQUFFUSxZQUFZLEVBQUUsRUFBRSxFQUFHLE1BQUtPLElBQUssRUFBRSxDQUFDO01BRS9DLElBQUssRUFBQyxNQUFNVixVQUFVLENBQUVVLElBQUssQ0FBQyxHQUFHO1FBQy9CLE1BQU1iLE1BQU0sQ0FBRWEsSUFBSSxFQUFFLE9BQVEsQ0FBQztRQUM3QixNQUFNWCxTQUFTLENBQUVXLElBQUksRUFBRSw2QkFBOEIsQ0FBQztNQUN4RDtJQUNGO0lBRUEsTUFBTVIsT0FBTyxDQUFFUSxJQUFJLEVBQUUsVUFBVyxDQUFDO0lBQ2pDLE1BQU1aLFdBQVcsQ0FBRVksSUFBSSxFQUFFLFFBQVMsQ0FBQztFQUNyQztBQUNGLENBQUMifQ==