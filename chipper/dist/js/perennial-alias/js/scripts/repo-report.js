// Copyright 2018, University of Colorado Boulder

/**
 * usage:
 * cd {{repo}}
 * node ../perennial/js/scripts/repo-report.js > out.txt
 * then import in Excel
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * TODO https://github.com/phetsims/tasks/issues/942 This is a "quick" version which could benefit from documentation, better command line hygiene, more options, etc.
 */

const {
  exec
} = require('child_process'); // eslint-disable-line require-statement-match

exec('git rev-list master', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr.length === 0 && stdout.length !== 0) {
    const lines = stdout.trim().split(/\n/).reverse();
    console.log('sha\tdate\tLOC\tTODO\tREVIEW');
    const visit = function (index) {
      exec(`git checkout ${lines[index]}`, (error, stdout, stderr) => {
        exec('grep -ro "TODO" ./js/ | wc -l', (error, stdout, stderr) => {
          const todoCount = stdout.trim();
          exec('grep -ro "REVIEW" ./js/ | wc -l', (error, stdout, stderr) => {
            const reviewCount = stdout.trim();
            exec('git log -1 --format=format:\'%ai\'', (error, stdout, stderr) => {
              const date = stdout.trim();
              exec('( find ./js/ -name \'*.js\' -print0 | xargs -0 cat ) | wc -l', (error, stdout, stderr) => {
                const lineCount = stdout.trim();

                // console.log( 'hello ' + lines[ index ] );
                // console.log( stdout.trim() );
                // console.log( stdout.trim() );
                console.log(`${lines[index]}\t${date}\t${lineCount}\t${todoCount}\t${reviewCount}`);
                if (index < lines.length - 1) {
                  visit(index + 1);
                } else {
                  // done
                  exec('git checkout master', (error, stdout, stderr) => {
                    // console.log( 'checked out master' );
                  });
                }
              });
            });
          });
        });
      });
    };
    visit(0);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjIiwicmVxdWlyZSIsImVycm9yIiwic3Rkb3V0Iiwic3RkZXJyIiwiY29uc29sZSIsImxlbmd0aCIsImxpbmVzIiwidHJpbSIsInNwbGl0IiwicmV2ZXJzZSIsImxvZyIsInZpc2l0IiwiaW5kZXgiLCJ0b2RvQ291bnQiLCJyZXZpZXdDb3VudCIsImRhdGUiLCJsaW5lQ291bnQiXSwic291cmNlcyI6WyJyZXBvLXJlcG9ydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogdXNhZ2U6XHJcbiAqIGNkIHt7cmVwb319XHJcbiAqIG5vZGUgLi4vcGVyZW5uaWFsL2pzL3NjcmlwdHMvcmVwby1yZXBvcnQuanMgPiBvdXQudHh0XHJcbiAqIHRoZW4gaW1wb3J0IGluIEV4Y2VsXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqXHJcbiAqIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy85NDIgVGhpcyBpcyBhIFwicXVpY2tcIiB2ZXJzaW9uIHdoaWNoIGNvdWxkIGJlbmVmaXQgZnJvbSBkb2N1bWVudGF0aW9uLCBiZXR0ZXIgY29tbWFuZCBsaW5lIGh5Z2llbmUsIG1vcmUgb3B0aW9ucywgZXRjLlxyXG4gKi9cclxuXHJcbmNvbnN0IHsgZXhlYyB9ID0gcmVxdWlyZSggJ2NoaWxkX3Byb2Nlc3MnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVxdWlyZS1zdGF0ZW1lbnQtbWF0Y2hcclxuXHJcbmV4ZWMoICdnaXQgcmV2LWxpc3QgbWFzdGVyJywgKCBlcnJvciwgc3Rkb3V0LCBzdGRlcnIgKSA9PiB7XHJcbiAgaWYgKCBlcnJvciApIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoIGBleGVjIGVycm9yOiAke2Vycm9yfWAgKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmICggc3RkZXJyLmxlbmd0aCA9PT0gMCAmJiBzdGRvdXQubGVuZ3RoICE9PSAwICkge1xyXG4gICAgY29uc3QgbGluZXMgPSBzdGRvdXQudHJpbSgpLnNwbGl0KCAvXFxuLyApLnJldmVyc2UoKTtcclxuICAgIGNvbnNvbGUubG9nKCAnc2hhXFx0ZGF0ZVxcdExPQ1xcdFRPRE9cXHRSRVZJRVcnICk7XHJcbiAgICBjb25zdCB2aXNpdCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcclxuXHJcbiAgICAgIGV4ZWMoIGBnaXQgY2hlY2tvdXQgJHtsaW5lc1sgaW5kZXggXX1gLCAoIGVycm9yLCBzdGRvdXQsIHN0ZGVyciApID0+IHtcclxuXHJcbiAgICAgICAgZXhlYyggJ2dyZXAgLXJvIFwiVE9ET1wiIC4vanMvIHwgd2MgLWwnLCAoIGVycm9yLCBzdGRvdXQsIHN0ZGVyciApID0+IHtcclxuICAgICAgICAgIGNvbnN0IHRvZG9Db3VudCA9IHN0ZG91dC50cmltKCk7XHJcblxyXG4gICAgICAgICAgZXhlYyggJ2dyZXAgLXJvIFwiUkVWSUVXXCIgLi9qcy8gfCB3YyAtbCcsICggZXJyb3IsIHN0ZG91dCwgc3RkZXJyICkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXZpZXdDb3VudCA9IHN0ZG91dC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBleGVjKCAnZ2l0IGxvZyAtMSAtLWZvcm1hdD1mb3JtYXQ6XFwnJWFpXFwnJywgKCBlcnJvciwgc3Rkb3V0LCBzdGRlcnIgKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHN0ZG91dC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICAgIGV4ZWMoICcoIGZpbmQgLi9qcy8gLW5hbWUgXFwnKi5qc1xcJyAtcHJpbnQwIHwgeGFyZ3MgLTAgY2F0ICkgfCB3YyAtbCcsICggZXJyb3IsIHN0ZG91dCwgc3RkZXJyICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGluZUNvdW50ID0gc3Rkb3V0LnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2hlbGxvICcgKyBsaW5lc1sgaW5kZXggXSApO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coIHN0ZG91dC50cmltKCkgKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCBzdGRvdXQudHJpbSgpICk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggYCR7bGluZXNbIGluZGV4IF19XFx0JHtkYXRlfVxcdCR7bGluZUNvdW50fVxcdCR7dG9kb0NvdW50fVxcdCR7cmV2aWV3Q291bnR9YCApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCBpbmRleCA8IGxpbmVzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgICAgICAgICAgIHZpc2l0KCBpbmRleCArIDEgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gZG9uZVxyXG4gICAgICAgICAgICAgICAgICBleGVjKCAnZ2l0IGNoZWNrb3V0IG1hc3RlcicsICggZXJyb3IsIHN0ZG91dCwgc3RkZXJyICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCAnY2hlY2tlZCBvdXQgbWFzdGVyJyApO1xyXG4gICAgICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICAgIHZpc2l0KCAwICk7XHJcbiAgfVxyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNO0VBQUVBO0FBQUssQ0FBQyxHQUFHQyxPQUFPLENBQUUsZUFBZ0IsQ0FBQyxDQUFDLENBQUM7O0FBRTdDRCxJQUFJLENBQUUscUJBQXFCLEVBQUUsQ0FBRUUsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sS0FBTTtFQUN4RCxJQUFLRixLQUFLLEVBQUc7SUFDWEcsT0FBTyxDQUFDSCxLQUFLLENBQUcsZUFBY0EsS0FBTSxFQUFFLENBQUM7SUFDdkM7RUFDRjtFQUVBLElBQUtFLE1BQU0sQ0FBQ0UsTUFBTSxLQUFLLENBQUMsSUFBSUgsTUFBTSxDQUFDRyxNQUFNLEtBQUssQ0FBQyxFQUFHO0lBQ2hELE1BQU1DLEtBQUssR0FBR0osTUFBTSxDQUFDSyxJQUFJLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUUsSUFBSyxDQUFDLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0lBQ25ETCxPQUFPLENBQUNNLEdBQUcsQ0FBRSw4QkFBK0IsQ0FBQztJQUM3QyxNQUFNQyxLQUFLLEdBQUcsU0FBQUEsQ0FBVUMsS0FBSyxFQUFHO01BRTlCYixJQUFJLENBQUcsZ0JBQWVPLEtBQUssQ0FBRU0sS0FBSyxDQUFHLEVBQUMsRUFBRSxDQUFFWCxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsTUFBTSxLQUFNO1FBRW5FSixJQUFJLENBQUUsK0JBQStCLEVBQUUsQ0FBRUUsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sS0FBTTtVQUNsRSxNQUFNVSxTQUFTLEdBQUdYLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLENBQUM7VUFFL0JSLElBQUksQ0FBRSxpQ0FBaUMsRUFBRSxDQUFFRSxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsTUFBTSxLQUFNO1lBQ3BFLE1BQU1XLFdBQVcsR0FBR1osTUFBTSxDQUFDSyxJQUFJLENBQUMsQ0FBQztZQUVqQ1IsSUFBSSxDQUFFLG9DQUFvQyxFQUFFLENBQUVFLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxNQUFNLEtBQU07Y0FDdkUsTUFBTVksSUFBSSxHQUFHYixNQUFNLENBQUNLLElBQUksQ0FBQyxDQUFDO2NBRTFCUixJQUFJLENBQUUsOERBQThELEVBQUUsQ0FBRUUsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sS0FBTTtnQkFDakcsTUFBTWEsU0FBUyxHQUFHZCxNQUFNLENBQUNLLElBQUksQ0FBQyxDQUFDOztnQkFFL0I7Z0JBQ0E7Z0JBQ0E7Z0JBQ0FILE9BQU8sQ0FBQ00sR0FBRyxDQUFHLEdBQUVKLEtBQUssQ0FBRU0sS0FBSyxDQUFHLEtBQUlHLElBQUssS0FBSUMsU0FBVSxLQUFJSCxTQUFVLEtBQUlDLFdBQVksRUFBRSxDQUFDO2dCQUN2RixJQUFLRixLQUFLLEdBQUdOLEtBQUssQ0FBQ0QsTUFBTSxHQUFHLENBQUMsRUFBRztrQkFDOUJNLEtBQUssQ0FBRUMsS0FBSyxHQUFHLENBQUUsQ0FBQztnQkFDcEIsQ0FBQyxNQUNJO2tCQUVIO2tCQUNBYixJQUFJLENBQUUscUJBQXFCLEVBQUUsQ0FBRUUsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sS0FBTTtvQkFDeEQ7a0JBQUEsQ0FDQSxDQUFDO2dCQUNMO2NBQ0YsQ0FBRSxDQUFDO1lBRUwsQ0FBRSxDQUFDO1VBQ0wsQ0FBRSxDQUFDO1FBQ0wsQ0FBRSxDQUFDO01BQ0wsQ0FBRSxDQUFDO0lBQ0wsQ0FBQztJQUNEUSxLQUFLLENBQUUsQ0FBRSxDQUFDO0VBQ1o7QUFDRixDQUFFLENBQUMifQ==