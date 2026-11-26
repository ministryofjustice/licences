import { LicenceClient } from '../data/licenceClient'
import SignInService from '../authentication/signInService'
import nomisClientBuilderFn from '../data/nomisClientBuilder'

export default class LicenceSearchService {
  constructor(
    private readonly licenceClient: LicenceClient,
    private readonly signInService: SignInService,
    private readonly nomisClientBuilder: typeof nomisClientBuilderFn
  ) {}

  private async bookingIdForLicenceIncludingSoftDeleted(bookingId: number): Promise<number | null> {
    const licence = await this.licenceClient.getLicenceIncludingSoftDeleted(bookingId)
    return licence ? licence.booking_id : null
  }

  private async findByBookingId(offenderIdentifier: string) {
    const parsedBookingId = parseInt(offenderIdentifier.trim(), 10)
    return parsedBookingId && this.bookingIdForLicenceIncludingSoftDeleted(parsedBookingId)
  }

  private async findByOffenderNumber(username: string, offenderIdentifier: string) {
    const systemToken = await this.signInService.getClientCredentialsTokens(username)
    const client = this.nomisClientBuilder(systemToken)

    try {
      const booking = await client.getBookingByOffenderNumber(offenderIdentifier)
      if (!booking) return null
      const { bookingId } = booking
      return bookingId && this.bookingIdForLicenceIncludingSoftDeleted(bookingId)
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        return null
      }
      throw error
    }
  }

  async findForId(username: string, offenderIdentifier: string): Promise<number | null> {
    const bookingId = await this.findByBookingId(offenderIdentifier)
    if (bookingId) {
      return bookingId
    }
    return this.findByOffenderNumber(username, offenderIdentifier)
  }
}
