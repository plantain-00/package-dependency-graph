import { Configuration } from "package-dependency-graph"

export default {
  png: 'demo/graphviz.png',
  svg: 'spec/result.svg',
  graphviz: true,
  nestedGroups: (packages) => [
    {
      name: 'dagre renderer',
      children: packages.filter((p) => p.startsWith('dagre-')),
    },
  ],
} as Configuration
