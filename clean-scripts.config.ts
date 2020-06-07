import { Tasks } from 'clean-scripts'

const tsFiles = `"packages/**/src/**/*.ts"`
const jsFiles = `"*.config.js"`

export default {
  build: [
    new Tasks([
      {
        name: 'dagre-abstract-renderer',
        script: [
          'rimraf packages/dagre-abstract-renderer/dist/',
          'tsc -p packages/dagre-abstract-renderer/src/'
        ]
      },
      {
        name: 'core',
        script: [
          'rimraf packages/core/dist/',
          'tsc -p packages/core/src/'
        ]
      },
      {
        name: 'dagre-canvas',
        script: [
          'rimraf packages/dagre-canvas/dist/',
          'tsc -p packages/dagre-canvas/src/'
        ],
        dependencies: ['dagre-abstract-renderer']
      },
      {
        name: 'dagre-svg',
        script: [
          'rimraf packages/dagre-svg/dist/',
          'tsc -p packages/dagre-svg/src/'
        ],
        dependencies: ['dagre-abstract-renderer']
      },
      {
        name: 'cli',
        script: [
          'rimraf packages/cli/dist/',
          'tsc -p packages/cli/src/'
        ],
        dependencies: [
          'core',
          'dagre-canvas',
          'dagre-svg'
        ]
      }
    ]),
    'node packages/cli/dist/index.js --dot spec/result.dot --png spec/dagre-result.png --svg spec/dagre-result.svg --debug --supressError > spec/result.txt'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles}`,
    export: `no-unused-export ${tsFiles} --strict --need-module tslib`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverageCore: 'type-coverage -p packages/core/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageCli: 'type-coverage -p packages/cli/src --strict --ignore-files "**/*.d.ts"',
    typeCoveragecanvas: 'type-coverage -p packages/dagre-canvas/src --strict --ignore-files "**/*.d.ts"',
    typeCoverageSvg: 'type-coverage -p packages/dagre-svg/src --strict --ignore-files "**/*.d.ts"',
    typeCoveragerender: 'type-coverage -p packages/dagre-abstract-renderer/src --strict --ignore-files "**/*.d.ts"'
  },
  test: [],
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles} --fix`
}
