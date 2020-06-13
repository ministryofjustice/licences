import R from 'ramda'

const YES = 'Yes'

const INELIGIBLE = 'Ineligible'

const ELIGIBILITY_PATTERN = '/hdc/eligibility/([a-zA-Z]+)/'

export default class Booking {
  private eligibility: {
    excluded?: string
    suitability?: string
    crdTime?: string
  }

  private event: string

  /**
   * Only care about a booking being made ineligible. The opposite transition
   * enables other events like sending from CA to RO.
   */
  private isIneligible() {
    return (
      this.eligibility?.excluded === YES || this.eligibility?.suitability === YES || this.eligibility?.crdTime === YES
    )
  }

  private updateEligibilityState(details) {
    const path = details?.path
    const decision = details?.userInput?.decision
    if (!(path && decision)) return
    if (!path.startsWith('/hdc/eligibility/')) return

    const result = new RegExp(ELIGIBILITY_PATTERN).exec(path)

    if (!result || result.length < 2) return
    const formName = result[1]

    const newEligibility = {
      ...this.eligibility,
      [formName]: decision,
    }

    if (R.equals(this.eligibility, newEligibility)) return

    this.eligibility = newEligibility

    if (this.isIneligible()) {
      this.event = INELIGIBLE
    }
  }

  /**
   * Update the object from data in action and details. If there is a significant state change then
   * the event property will contain its name.
   * @param action
   * @param details
   */
  update(action: string, details: any) {
    if (action !== 'UPDATE_SECTION') return
    this.event = undefined

    this.updateEligibilityState(details)
  }

  getEvent(): string {
    return this.event
  }
}
