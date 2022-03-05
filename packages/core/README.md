# package-dependency-graph-core

```ts
import { collectDependencies, toDotFile } from 'package-dependency-graph-core'

const dependencies = await collectDependencies('.', true)
/*
{ 'package-dependency-graph': [ 'dagre-canvas', 'dagre-svg', 'package-dependency-graph-core' ],
  'package-dependency-graph-core': [],
  'dagre-abstract-renderer': [],
  'dagre-canvas': [ 'dagre-abstract-renderer' ],
  'dagre-svg': [ 'dagre-abstract-renderer' ] }
*/

const dot = toDotFile(dependencies)

const dagre = toDagre(dependencies)
```
