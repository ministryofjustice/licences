import Booking from '../../server/statistics/booking'

const EXCLUDED_YES = { path: '/hdc/eligibility/excluded/', userInput: { decision: 'Yes' } }
const SUITABILITY_YES = { path: '/hdc/eligibility/suitability/', userInput: { decision: 'Yes' } }
const CRD_TIME_YES = { path: '/hdc/eligibility/crdTime/', userInput: { decision: 'Yes' } }

const EXCLUDED_NO = { path: '/hdc/eligibility/excluded/', userInput: { decision: 'No' } }
const SUITABILITY_NO = { path: '/hdc/eligibility/suitability/', userInput: { decision: 'No' } }
const CRD_TIME_NO = { path: '/hdc/eligibility/crdTime/', userInput: { decision: 'No' } }

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
