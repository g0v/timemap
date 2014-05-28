#!/usr/bin/env lsc -cj
author:
  name: ['chihchun']
  email: 'chihchun@bala...'
name: 'leaflet-tw'
description: 'bala'
version: '0.0.1'
main: \lib/index.js
repository:
  type: 'git'
  url: 'git://github.com/chihchun/leaflet-tw.git'
scripts:
  test: """
    mocha
  """
  prepublish: """
    lsc -cj package.ls &&
    lsc -bc -o lib src
  """
  # this is probably installing from git directly, no lib.  assuming dev
  postinstall: """
    if [ ! -e ./lib ]; then npm i LiveScript; lsc -bc -o lib src; fi
  """
engines: {node: '*'}
devDependencies:
  mocha: \1.14.x
  LiveScript: \1.2.x
