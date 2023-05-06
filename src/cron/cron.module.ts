import {Module} from '@nestjs/common'
import {OfferService} from '../offer/offer.service'
import {OfferJob} from './offer/offer.job'

@Module({
  imports: [],
  controllers: [],
  providers: [OfferService, OfferJob],
})
export class CronModule {}
