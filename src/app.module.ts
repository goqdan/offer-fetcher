import {Module} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'

import {OfferModule} from './offer/offer.module'
import {CronModule} from './cron/cron.module'

@Module({
  imports: [OfferModule, ScheduleModule.forRoot(), CronModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
