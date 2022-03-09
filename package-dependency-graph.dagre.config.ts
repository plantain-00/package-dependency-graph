import { Configuration } from "package-dependency-graph"

export default {
  dot: 'spec/result.dot',
  png: 'demo/dagre.png',
  svg: 'spec/dagre-result.svg',
  debug: true,
  nestedGroups: (packages) => [
    {
      name: 'dagre renderer',
      children: packages.filter((p) => p.startsWith('dagre')),
    },
  ],
} as Configuration
