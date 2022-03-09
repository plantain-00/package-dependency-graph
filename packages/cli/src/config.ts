import { NestedGroupInput } from "package-dependency-graph-core"

export interface Configuration {
  root?: string
  dot?: string
  png?: string
  svg?: string
  excludeNodeModules?: boolean
  includeDevDependencies?: boolean
  includePeerDependencies?: boolean
  debug?: boolean
  graphviz?: boolean
  nestedGroups?: (packages: string[]) => NestedGroupInput[]
}
