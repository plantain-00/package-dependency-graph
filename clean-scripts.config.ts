import { Tasks, readWorkspaceDependencies } from 'clean-scripts'

const tsFiles = `"packages/**/src/**/*.ts"`

export default {
  build: [
    new Tasks(readWorkspaceDependencies().map((d) => ({
      name: d.name,
      script: [
        `rimraf ${d.path}/dist/`,
        `tsc -p ${d.path}/src/`
      ],
      dependencies: d.dependencies
    }))),
    'node packages/cli/dist/index.js --config ./package-dependency-graph.dagre.config.ts --supressError > spec/result.txt',
    'node packages/cli/dist/index.js --config ./package-dependency-graph.graphviz.config.ts'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    export: `no-unused-export ${tsFiles} --strict --need-module tslib`,
    markdown: `markdownlint README.md`,
    typeCoverageCore: 'type-coverage -p packages/core/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageCli: 'type-coverage -p packages/cli/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageCanvas: 'type-coverage -p packages/dagre-canvas/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageSvg: 'type-coverage -p packages/dagre-svg/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageRender: 'type-coverage -p packages/dagre-abstract-renderer/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageDependency: 'type-coverage -p packages/dependency/src --strict --ignore-files "**/*.d.ts"'
  },
  test: [],
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`
}
