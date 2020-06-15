import Booking from '../../server/statistics/booking'

// eslint-disable-next-line import/prefer-default-export
export enum Path {
  eligExcluded = '/hdc/eligibility/excluded/',
  eligSuitability = '/hdc/eligibility/suitability/',
  eligCrdTime = '/hdc/eligibility/crdTime/',

  curfewAddressChoice = '/hdc/proposedAddress/curfewAddressChoice/',
  enterCurfewAddress = '/hdc/proposedAddress/curfewAddress/',
  enterBassAddress = '/hdc/bassReferral/bassRequest/',
}

const UPDATE_ACTION = 'UPDATE_SECTION'

describe('Booking', () => {
  let booking: Booking

  beforeEach(() => {
    booking = new Booking()
  })

  it('consumes an arbitrary action without failing', () => {
    booking.update('X', undefined)
  })

  it('consumes an arbitrary action and details without failing', () => {
    booking.update('X', { p: {} })
  })

  describe('Eligibility', () => {
    const EXCLUDED_YES = { path: Path.eligExcluded, userInput: { decision: 'Yes' } }
    const SUITABILITY_YES = { path: Path.eligSuitability, userInput: { decision: 'Yes' } }
    const CRD_TIME_YES = { path: Path.eligCrdTime, userInput: { decision: 'Yes' } }

    const EXCLUDED_NO = { path: Path.eligExcluded, userInput: { decision: 'No' } }
    const SUITABILITY_NO = { path: Path.eligSuitability, userInput: { decision: 'No' } }
    const CRD_TIME_NO = { path: Path.eligCrdTime, userInput: { decision: 'No' } }

    it('recognises Ineligible event', () => {
      booking.update(UPDATE_ACTION, EXCLUDED_NO)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, SUITABILITY_NO)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, CRD_TIME_NO)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, EXCLUDED_YES)
      expect(booking.getEvent()).toEqual('Ineligible')

      booking.update(UPDATE_ACTION, EXCLUDED_NO)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, SUITABILITY_YES)
      expect(booking.getEvent()).toEqual('Ineligible')

      booking.update(UPDATE_ACTION, SUITABILITY_NO)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, CRD_TIME_NO)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, CRD_TIME_YES)
      expect(booking.getEvent()).toEqual('Ineligible')
    })

    it('ignores Ineligible events when ineligible', () => {
      booking.update(UPDATE_ACTION, EXCLUDED_YES)
      expect(booking.getEvent()).toEqual('Ineligible')

      booking.update(UPDATE_ACTION, SUITABILITY_YES)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, CRD_TIME_YES)
      expect(booking.getEvent()).toBeUndefined()
    })
  })

  describe('Address OptOut', () => {
    const CHOICE_ADDRESS = { path: Path.curfewAddressChoice, userInput: { decision: 'Address' } }
    const CHOICE_BASS = { path: Path.curfewAddressChoice, userInput: { decision: 'Bass' } }
    const CHOICE_OPT_OUT = { path: Path.curfewAddressChoice, userInput: { decision: 'OptOut' } }

    const NEW_BASS_ADDRESS = { path: Path.enterBassAddress }
    const NEW_CURFEW_ADDRESS = { path: Path.enterCurfewAddress }

    it('Records BASS choice', () => {
      booking.update(UPDATE_ACTION, NEW_BASS_ADDRESS)
      expect(booking.getAddressChoice()).toEqual('Bass')
    })

    it('Records Address choice', () => {
      booking.update(UPDATE_ACTION, NEW_CURFEW_ADDRESS)
      expect(booking.getAddressChoice()).toEqual('Address')
    })

    it('Records Opt Out choice', () => {
      booking.update(UPDATE_ACTION, CHOICE_OPT_OUT)
      expect(booking.getAddressChoice()).toEqual('OptOut')
    })

    it('ignores Curfew Address choice', () => {
      booking.update(UPDATE_ACTION, CHOICE_ADDRESS)
      expect(booking.getAddressChoice()).toBeUndefined()
    })

    it('ignores BASS Address choice', () => {
      booking.update(UPDATE_ACTION, CHOICE_BASS)
      expect(booking.getAddressChoice()).toBeUndefined()
    })

    it('Recognises OptOut event', () => {
      booking.update(UPDATE_ACTION, CHOICE_ADDRESS)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, CHOICE_BASS)
      expect(booking.getEvent()).toBeUndefined()

      booking.update(UPDATE_ACTION, CHOICE_OPT_OUT)
      expect(booking.getEvent()).toEqual('OptOut')

      booking.update(UPDATE_ACTION, CHOICE_OPT_OUT)
      expect(booking.getEvent()).toBeUndefined()
    })
  })
})
