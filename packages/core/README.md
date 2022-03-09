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

const nestedGroups = [
  {
    name: 'a super group name',
    children: [
      {
        name: 'a group name',
        children: [
          'package-name-1',
          'package-name-2',
        ],
      },
      'package-name-3',
    ]
  }
]
const dot = toDotFile(dependencies, nestedGroups)

const dagre = toDagre(dependencies, nestedGroups)
```
