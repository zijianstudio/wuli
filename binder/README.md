 # binder

See [https://phetsims.github.io/binder/](https://phetsims.github.io/binder/) for public up to date documentation and style guide on PhET sim
components.

Generates and publishes documentation for PhET simulation components. Included components are registered to an `instanceRegistry` that's created as a result of a `binder` query parameter. It uses `puppeteer` to manage a Chromium instance to grab the images of the registered components from the specified sims. We then stitch those images with content from `doc` directories in sun/, scenery-phet/, and scenery/ (the latter two are forthcoming) and produce HTML in the `doc` directory that houses the `gh-pages` branch. The page is hosted from [Github Pages](https://pages.github.com/) from that branch.

## generation
To generate the component images and pull the appropriate :

    `npm run build`

To generate docs with only specific simulation examples, add them as an argument, comma separated:

    `npm run build -- ohms-law,wave-on-a-string`

The generated docs load sim to gather runtime information. To bypass this step and use stored data from sim loads:

    `npm run build-json`

NOTE: This will only log out the html string, not write it to the output file. The above snippet will copy the output
into a file of your choosing.

We render markdown and insert it into `index.html` with the `handlebars` library. These templates can be found in the `templates/` directory.

For more information see https://github.com/phetsims/binder/ or contact @zepumph.

## output

`/docs` from master is hosted at  https://phetsims.github.io/binder/. So checking in the build file will update the 
endpoint for all to see changes immediately. `docs/` is against phet convention of having a `doc/` folder, but github 
requires the folder named as such to support hosting files from master. 