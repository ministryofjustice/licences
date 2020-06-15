import R from 'ramda'
import { Node } from './AuditStatisticsCollector'

export interface D3Hierarchy {
  name: string
  value?: number
  children: Array<D3Hierarchy>
}

export const d3hierarchy = (tree: Node, cutoff: number = 0): D3Hierarchy => {
  const mapPair = ([name, node]) => {
    const children = mapChildren(node.children)
    return children.length === 0
      ? { name, value: node.count }
      : {
          name,
          value: node.count,
          children,
        }
  }

  const mapChildren = (children) =>
    R.pipe(
      R.toPairs,
      R.sortBy(R.prop(0)),
      R.map(mapPair),
      R.filter((d) => d.value > cutoff)
    )(children)

  return {
    name: 'Root',
    children: mapChildren(tree.children),
  }
}
