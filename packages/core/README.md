# package-dependency-graph-core

```ts
import { collectDependencies } from 'package-dependency-graph-core'

console.info(await collectDependencies('.', true))
/*
{ 'package-dependency-graph': [ 'dagre-canvas', 'dagre-svg', 'package-dependency-graph-core' ],
  'package-dependency-graph-core': [],
  'dagre-abstract-renderer': [],
  'dagre-canvas': [ 'dagre-abstract-renderer' ],
  'dagre-svg': [ 'dagre-abstract-renderer' ] }
*/
```
