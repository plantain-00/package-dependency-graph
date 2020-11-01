# package-dependency-collect

```ts
import { readWorkspaceDependenciesAsync } from 'package-dependency-collect'

await readWorkspaceDependenciesAsync()
/*
[
  {
    name: 'package-dependency-graph',
    path: 'packages/cli',
    dependencies: [
      'canvas',
      'dagre-canvas',
      'dagre-svg',
      'graphviz-cli',
      'minimist',
      'package-dependency-graph-core'
    ],
    version: '1.9.1'
  },
  {
    name: 'package-dependency-graph-core',
    path: 'packages/core',
    dependencies: [ 'dagre', 'package-dependency-collect', 'tslib' ],
    version: '1.9.1'
  },
  {
    name: 'dagre-abstract-renderer',
    path: 'packages/dagre-abstract-renderer',
    dependencies: [ 'dagre', 'tslib' ],
    version: '1.9.1'
  },
  {
    name: 'dagre-canvas',
    path: 'packages/dagre-canvas',
    dependencies: [ 'dagre', 'dagre-abstract-renderer' ],
    version: '1.9.1'
  },
  {
    name: 'dagre-svg',
    path: 'packages/dagre-svg',
    dependencies: [ 'dagre', 'dagre-abstract-renderer' ],
    version: '1.9.1'
  },
  {
    name: 'package-dependency-collect',
    path: 'packages/dependency',
    dependencies: [ 'glob', 'tslib' ],
    version: '1.9.1'
  }
]
*/
```
