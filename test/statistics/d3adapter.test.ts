import { d3hierarchy, Outcomes } from '../../server/statistics/d3adapter'
import { Event } from '../../server/statistics/types'

const defaultOutcomes = (): Outcomes => ({ ineligible: 0, optOut: 0, pdfLicence: 0 })

describe('d3hierarchy', () => {
  it('converts an empty tree', () => {
    expect(d3hierarchy({ count: 0, children: {} })).toEqual([])
  })

  it('converts one child', () => {
    expect(d3hierarchy({ count: 0, children: { A: { count: 4, children: {} } } })).toEqual([
      { name: 'A', value: 4, remainder: 4, outcomes: defaultOutcomes() },
    ])
  })

  it('converts children', () => {
    expect(
      d3hierarchy({
        count: 0,
        children: {
          [Event.caToRoAddress.toString()]: { count: 4, children: {} },
          [Event.roToCa]: { count: 5, children: {} },
          [Event.caToDm]: { count: 3, children: {} },
        },
      })
    ).toEqual([
      { name: Event.caToDm, value: 3, remainder: 3, outcomes: defaultOutcomes() },
      { name: Event.caToRoAddress, value: 4, remainder: 4, outcomes: defaultOutcomes() },
      { name: Event.roToCa, value: 5, remainder: 5, outcomes: defaultOutcomes() },
    ])
  })

  it('descends linear tree', () => {
    expect(
      d3hierarchy({
        count: 0,
        children: {
          A: {
            count: 6,
            children: {
              B: {
                count: 5,
                children: {},
              },
            },
          },
        },
      })
    ).toEqual([
      {
        name: 'A',
        value: 6,
        remainder: 1,
        outcomes: defaultOutcomes(),
        children: [
          {
            name: 'B',
            value: 5,
            remainder: 5,
            outcomes: defaultOutcomes(),
          },
        ],
      },
    ])
  })

  it('calculates remainders correctly', () => {
    expect(
      d3hierarchy({
        count: 0,
        children: {
          A: {
            count: 13,
            children: {
              B: { count: 2, children: {} },
              C: {
                count: 8,
                children: {
                  P: { count: 1, children: {} },
                  Q: { count: 2, children: {} },
                  R: { count: 3, children: {} },
                },
              },
            },
          },
        },
      })
    ).toEqual([
      {
        name: 'A',
        value: 13,
        remainder: 3,
        outcomes: defaultOutcomes(),
        children: [
          { name: 'B', value: 2, remainder: 2, outcomes: defaultOutcomes() },
          {
            name: 'C',
            value: 8,
            remainder: 2,
            outcomes: defaultOutcomes(),
            children: [
              { name: 'P', value: 1, remainder: 1, outcomes: defaultOutcomes() },
              { name: 'Q', value: 2, remainder: 2, outcomes: defaultOutcomes() },
              { name: 'R', value: 3, remainder: 3, outcomes: defaultOutcomes() },
            ],
          },
        ],
      },
    ])
  })

  describe('outcomes', () => {
    it('counts child outcomes correctly', () => {
      expect(
        d3hierarchy({
          count: 0,
          children: {
            [Event.ineligible.toString()]: { count: 4, children: {} },
            [Event.optOut]: { count: 5, children: {} },
            [Event.pdfLicence]: { count: 3, children: {} },
          },
        })
      ).toEqual([
        { name: Event.ineligible, value: 4, remainder: 4, outcomes: { ...defaultOutcomes(), ineligible: 4 } },
        { name: Event.optOut, value: 5, remainder: 5, outcomes: { ...defaultOutcomes(), optOut: 5 } },
        { name: Event.pdfLicence, value: 3, remainder: 3, outcomes: { ...defaultOutcomes(), pdfLicence: 3 } },
      ])
    })

    it('accumulates outcomes from linear tree', () => {
      expect(
        d3hierarchy({
          count: 0,
          children: {
            [Event.pdfLicence]: {
              count: 6,
              children: {
                [Event.pdfLicence]: {
                  count: 5,
                  children: {},
                },
              },
            },
          },
        })
      ).toEqual([
        {
          name: Event.pdfLicence,
          value: 6,
          remainder: 1,
          outcomes: { ...defaultOutcomes(), pdfLicence: 6 },
          children: [
            {
              name: Event.pdfLicence,
              value: 5,
              remainder: 5,
              outcomes: { ...defaultOutcomes(), pdfLicence: 5 },
            },
          ],
        },
      ])
    })

    it('accumulates outcomes correctly', () => {
      expect(
        d3hierarchy({
          count: 0,
          children: {
            [Event.pdfLicence]: {
              count: 13,
              children: {
                [Event.optOut]: { count: 2, children: {} },
                [Event.ineligible]: {
                  count: 8,
                  children: {
                    [Event.pdfLicence]: { count: 1, children: {} },
                    [Event.optOut]: { count: 2, children: {} },
                    [Event.caToDm]: { count: 3, children: {} },
                  },
                },
              },
            },
          },
        })
      ).toEqual([
        {
          name: Event.pdfLicence,
          value: 13,
          remainder: 3,
          outcomes: { optOut: 4, ineligible: 2, pdfLicence: 4 },
          children: [
            {
              name: Event.ineligible,
              value: 8,
              remainder: 2,
              outcomes: { ineligible: 2, optOut: 2, pdfLicence: 1 },
              children: [
                { name: Event.caToDm, value: 3, remainder: 3, outcomes: { ...defaultOutcomes() } },
                { name: Event.optOut, value: 2, remainder: 2, outcomes: { ...defaultOutcomes(), optOut: 2 } },
                { name: Event.pdfLicence, value: 1, remainder: 1, outcomes: { ...defaultOutcomes(), pdfLicence: 1 } },
              ],
            },
            { name: Event.optOut, value: 2, remainder: 2, outcomes: { ...defaultOutcomes(), optOut: 2 } },
          ],
        },
      ])
    })
  })
})
