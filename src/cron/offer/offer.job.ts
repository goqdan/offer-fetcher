import {Injectable} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'
import {plainToClass} from 'class-transformer'

import {payload as offerOnePayload} from './payloads/offer1.payload'
import {payload as offerTwoPayload} from './payloads/offer2.payload'
import {OfferService} from '../../offer/offer.service'
import {
  OfferPayloadType,
  ProviderOneResponseDto,
  ProviderTwoResponseDto,
} from '../../offer/offer.dto'
import {Offer} from '../../offer/offer.entity'

@Injectable()
export class OfferJob {
  constructor(private readonly offerService: OfferService) {}
  private payloads = [offerOnePayload, offerTwoPayload]

  @Cron(CronExpression.EVERY_10_SECONDS)
  async fetchPayloads(payloads = this.payloads): Promise<Offer[]> {
    try {
      console.info('Started cron job')

      // Presumed code to fetch offers, which is simulated with payload files here
      const [offerOnePayload, offerTwoPayload] = payloads

      const transformedPayloads: OfferPayloadType[] = [
        plainToClass(ProviderOneResponseDto, offerOnePayload),
        plainToClass(ProviderTwoResponseDto, offerTwoPayload),
      ]

      return this.offerService.processProviderPayloadsOfCron(transformedPayloads)
    } catch (e) {
      console.log(e)
    }
  }
}
