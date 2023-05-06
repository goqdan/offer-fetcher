import {Injectable} from '@nestjs/common'
import {plainToClass} from 'class-transformer'
import {validate} from 'class-validator'

import {
  OfferDto,
  OfferPayloadType,
  ProviderEnum,
  ProviderOneOffer,
  ProviderOneResponseDto,
  ProviderTwoDataObject,
  ProviderTwoResponseDto,
} from './offer.dto'
import {Offer} from './offer.entity'

@Injectable()
export class OfferService {
  async processProviderPayloadsOfCron(transformedPayloadArray: OfferPayloadType[]) {
    const filteredPayloads = await this.validateAndFilterPayloads(transformedPayloadArray)
    const offers: Offer[] = []
    for (const payload of filteredPayloads) {
      if (payload instanceof ProviderOneResponseDto) {
        offers.push(...(await this.generateOffersForProviderOne(payload)))
      } else if (payload instanceof ProviderTwoResponseDto) {
        offers.push(...(await this.generateOffersForProviderTwo(payload)))
      }
    }
    // Probably will call a method to save the offers, but we log it in our case
    console.log(offers)
    // For tests
    return offers
  }

  private async validateAndFilterPayloads(transformedPayloads: OfferPayloadType[]) {
    const filteredPayloads = await Promise.all(
      transformedPayloads.map(async (payload) => {
        // This will only validate the wrapper structure around offers (array for payload 1 and data object for payload 2)
        const err = await validate(payload, {whitelist: true})
        if (!err.length) {
          return payload
        }
        console.log(`Bad payload for ${payload.constructor}. Errors: ${err}`)
      }),
    )

    const result = filteredPayloads.filter((payload) => !!payload)

    return result
  }

  private async generateOffersForProviderOne(payload: ProviderOneResponseDto): Promise<Offer[]> {
    const validatedOffers = await Promise.all(
      payload.response.offers.map(async (offer, index) => {
        const transformedOffer = plainToClass(ProviderOneOffer, offer)
        // This will validate offer objects independently in order to not invalidate all of them because of one faulty offer
        const err = await validate(transformedOffer, {whitelist: true})
        if (!err.length) {
          return transformedOffer
        }
        console.log(`Bad offer in type ProviderOneOffer at index ${index}. Errors: ${err}`)
      }),
    )
    const filteredAndValidatedOffers = validatedOffers.filter((offer) => !!offer)
    const offers = filteredAndValidatedOffers
      .map((offer) => new OfferDto(offer, ProviderEnum.PROVIDER_ONE))
      .map((dto) => plainToClass(Offer, dto))
    return offers
  }

  private async generateOffersForProviderTwo(payload: ProviderTwoResponseDto): Promise<Offer[]> {
    const validatedOffers = []
    for (const [key, offer] of payload.data.entries()) {
      await (async (key, offer) => {
        // This will validate offer objects independently in order to not invalidate all of them because of one faulty offer
        const transformedOffer = plainToClass(ProviderTwoDataObject, offer)
        const err = await validate(transformedOffer, {whitelist: true})
        if (!err.length) {
          validatedOffers.push(transformedOffer)
          return
        }
        console.log(`Bad offer in type ProviderTwoDataObject at key ${key}. Errors: ${err}`)
      })(key, offer)
    }
    const filteredAndValidatedOffers = validatedOffers.filter((offer) => !!offer)
    return filteredAndValidatedOffers
      .map((data) => new OfferDto(data.Offer, ProviderEnum.PROVIDER_TWO, {os: data.OS}))
      .map((dto) => plainToClass(Offer, dto))
  }
}
