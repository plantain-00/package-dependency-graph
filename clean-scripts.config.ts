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
    'node packages/cli/dist/index.js --dot spec/result.dot --png spec/dagre-result.png --svg spec/dagre-result.svg --debug --supressError > spec/result.txt'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    export: `no-unused-export ${tsFiles} --strict --need-module tslib`,
    markdown: `markdownlint README.md`,
    typeCoverageCore: 'type-coverage -p packages/core/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageCli: 'type-coverage -p packages/cli/src --strict --ignore-files "**/*.d.ts"',
    typeCoveragecanvas: 'type-coverage -p packages/dagre-canvas/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageSvg: 'type-coverage -p packages/dagre-svg/src --strict --ignore-files "**/*.d.ts"',
    typeCoveragerender: 'type-coverage -p packages/dagre-abstract-renderer/src --strict --ignore-files "**/*.d.ts"'
  },
  test: [],
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`
}
