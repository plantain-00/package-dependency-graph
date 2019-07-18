# package-dependency-graph

A CLI tool to generate a dependency graph of packages in a monorepo by graphviz or dagre.

[![Dependency Status](https://david-dm.org/plantain-00/package-dependency-graph.svg)](https://david-dm.org/plantain-00/package-dependency-graph)
[![devDependency Status](https://david-dm.org/plantain-00/package-dependency-graph/dev-status.svg)](https://david-dm.org/plantain-00/package-dependency-graph#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/package-dependency-graph.svg?branch=master)](https://travis-ci.org/plantain-00/package-dependency-graph)
[![npm version](https://badge.fury.io/js/package-dependency-graph.svg)](https://badge.fury.io/js/package-dependency-graph)
[![Downloads](https://img.shields.io/npm/dm/package-dependency-graph.svg)](https://www.npmjs.com/package/package-dependency-graph)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fpackage-dependency-graph%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/package-dependency-graph)

## install

`yarn global add package-dependency-graph`

## usage

### graphviz

1. install `graphviz`
2. run `package-dependency-graph --dot foo.dot`
3. run `dot -Tpng foo.dot > foo.png`

![graphviz](./demo/graphviz.png)

### dagre

`package-dependency-graph --png foo.png`

![dagre](./demo/dagre.png)

## arguments

name | type | description
--- | --- | ---
`--root` | string? | tell the CLI the root directory of project
`--dot` | string? | save the dot file
`--png` | string? | save the png file
`--exclude-node_modules` | boolean? | exclude packages from `node_modules`
`--check` | boolean? | check unnecessary dependencies(not recommended)
`--debug` | boolean? | show debug info
