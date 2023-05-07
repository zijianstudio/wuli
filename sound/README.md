Sound
=============
"Sound" is a HTML5 conversion of the educational simulation [Sound](https://phet.colorado.edu/en/simulation/legacy/sound) written in JAVA, by <a href="https://phet.colorado.edu/" target="_blank">PhET Interactive Simulations</a>
at the University of Colorado Boulder.

### Getting started

(1) Clone the simulation and its dependencies:
```
git clone https://github.com/phetsims/assert.git
git clone https://github.com/phetsims/axon.git
git clone https://github.com/phetsims/babel.git
git clone https://github.com/phetsims/brand.git
git clone https://github.com/phetsims/chipper.git
git clone https://github.com/phetsims/dot.git
git clone https://github.com/phetsims/joist.git
git clone https://github.com/phetsims/kite.git
git clone https://github.com/phetsims/phet-core.git
git clone https://github.com/phetsims/phetcommon.git
git clone https://github.com/phetsims/phetmarks.git
git clone https://github.com/phetsims/perennial.git
git clone https://github.com/phetsims/query-string-machine.git
git clone https://github.com/phetsims/scenery.git
git clone https://github.com/phetsims/scenery-phet.git
git clone https://github.com/phetsims/sherpa.git
git clone https://github.com/phetsims/sun.git
git clone https://github.com/phetsims/tambo.git
git clone https://github.com/phetsims/tandem.git
git clone https://github.com/phetsims/utterance-queue.git
git clone https://github.com/phetsims/wave-interference.git
```
(2) Make sure node and npm are installed.

(3) Rename the sound project folder to ```sound```

(4) Run the following commands:

In the sound project folder:

```
npm install
npm prune
npm update
npm install grunt-cli -g
```

In the chipper folder:

```
npm update
```

### Building

To build the code, run 

```grunt build```

in the sound project folder.

### Building the dutch version:

Copy  the ```sound-strings-nl.json``` file to ```/babel/sound```

Then run:

```grunt build --locales=nl```

The built html file will be stored in the ```/build/adapted-from-phet folder```.

### Development
The <a href="https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md" target="_blank">PhET Development Overview</a> is the most complete guide to PhET Simulation
Development. This guide includes how to obtain simulation code and its dependencies, notes about architecture & design, how to test and build
the sims, as well as other important information.

### Setting up for development

(1) In the root folder for the project install http-server: 

```npm install http-server -g```

(2) Prevent package.lock files from being created:

```npm config set save false```

(3) Start the server:

```http-server -c-1```

(4) Navigate to  ```http://localhost:8080/sound/sound_en.html```

This shòuld run the simulation, and should update when the code gets updated.



### License
See the <a href="https://github.com/phetsims/sound/blob/master/LICENSE" target="_blank">LICENSE</a>
