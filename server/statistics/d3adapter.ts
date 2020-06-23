import R from 'ramda'
import { Node } from './AuditStatisticsCollector'
import { Event } from './types'

export interface D3Hierarchy {
  name: Event

  // The number of journeys that passed through this node
  value?: number

  // The number of journeys that reached but went no further.
  remainder: number

  children?: Array<D3Hierarchy>
}

export interface D3HierarchyWithOutcomes extends D3Hierarchy {
  outcomes: Outcomes
}

export interface Outcomes {
  optOut: number
  ineligible: number
  pdfLicence: number
}

const defaultOutcomes: Outcomes = Object.freeze({ optOut: 0, ineligible: 0, pdfLicence: 0 })

const addValues = (children: Array<D3Hierarchy>) => children.reduceRight((acc, v) => acc + v.value, 0)

const mapPair = ([name, node]: [string, Node]): D3Hierarchy => {
  const children: Array<D3Hierarchy> = mapChildren(node.children)

  const hierarchy: D3Hierarchy = {
    name: name as Event,
    value: node.count,
    remainder: node.count - addValues(children),
  }

  if (children.length > 0) {
    hierarchy.children = children
  }
  return hierarchy
}

const mapChildren = (children): Array<D3Hierarchy> => R.pipe(R.toPairs, R.sortBy(R.prop(0)), R.map(mapPair))(children)

const getOutcome = (hierarchy: D3Hierarchy): Outcomes => {
  switch (hierarchy.name) {
    case Event.ineligible:
      return { ...defaultOutcomes, ineligible: hierarchy.remainder }

    case Event.optOut:
      return { ...defaultOutcomes, optOut: hierarchy.remainder }

    case Event.pdfLicence:
      return { ...defaultOutcomes, pdfLicence: hierarchy.remainder }

    default:
      return defaultOutcomes
  }
}

const addOutcomes = (a: Outcomes, b: Outcomes): Outcomes => ({
  ineligible: a.ineligible + b.ineligible,
  optOut: a.optOut + b.optOut,
  pdfLicence: a.pdfLicence + b.pdfLicence,
})

const decorateWithOutcomes = (hierarchy: D3Hierarchy): D3HierarchyWithOutcomes => {
  if (hierarchy.children) {
    const decoratedChildren = hierarchy.children.map(decorateWithOutcomes)
    return {
      ...hierarchy,
      children: decoratedChildren,
      outcomes: decoratedChildren.map((h) => h.outcomes).reduceRight(addOutcomes, getOutcome(hierarchy)),
    }
  }
  return {
    ...hierarchy,
    outcomes: getOutcome(hierarchy),
  }
}

export const d3hierarchy = (tree: Node): Array<D3HierarchyWithOutcomes> =>
  mapChildren(tree.children).map(decorateWithOutcomes)
