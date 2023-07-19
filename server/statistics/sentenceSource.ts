import SignInService from '../authentication/signInService'
import { OffenderSentence } from '../data/nomisClientTypes'
import nomisClientBuilder = require('../data/nomisClientBuilder')
import TokenStore from '../data/tokenStore'
import { createRedisClient } from '../data/redisClient'

const signInService = new SignInService(new TokenStore(createRedisClient()))

export default class SentenceSource {
  async getOffenderSentencesByBookingId(bookingIds: number[]): Promise<Map<number, OffenderSentence>> {
    console.log(`Fetching sentences for ${bookingIds.length} bookingIds`)
    const token = await signInService.getAnonymousClientCredentialsTokens('nomis')
    const sentences: OffenderSentence[] = await nomisClientBuilder(token).getOffenderSentencesByBookingId(bookingIds)
    console.log(`Retrieved ${sentences.length} sentence rows`)
    return sentences.reduce(
      (map, sentence) => map.set(sentence.bookingId, sentence),
      new Map<number, OffenderSentence>()
    )
  }
}
