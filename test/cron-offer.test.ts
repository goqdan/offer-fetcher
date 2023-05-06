import {OfferJob} from '../src/cron/offer/offer.job'
import {OfferService} from '../src/offer/offer.service'
import {payload as offerOnePayload} from '../src/cron/offer/payloads/offer1.payload'
import {payload as offerTwoPayload} from '../src/cron/offer/payloads/offer2.payload'
import {getProviderName, ProviderEnum} from '../src/offer/offer.dto'
import {
  providerOneBadPayloadMissesOfferId,
  providerOneBadPayloadMissingOffersProperty,
  providerTwoBadPayloadMissesCampaignId,
  providerTwoBadPayloadMissesCampaignOs,
  providerTwoBadPayloadMissesCampaignOsAndroid,
  providerTwoBadPayloadMissesDataProperty,
} from './payloads/bad-payloads'

describe('Offers cron processing', () => {
  const offerService = new OfferService()
  const offerCron = new OfferJob(offerService)

  it('Should successfully process initially provided payloads', async () => {
    const offers = await offerCron.fetchPayloads([offerOnePayload, offerTwoPayload])
    expect(offers.length).toBe(2)
    expect(offers[0]).toMatchObject({
      providerName: getProviderName.get(ProviderEnum.PROVIDER_ONE),
      name: offerOnePayload.response.offers[0].offer_name,
      description: offerOnePayload.response.offers[0].offer_desc,
      requirements: offerOnePayload.response.offers[0].call_to_action,
      offerUrlTemplate: offerOnePayload.response.offers[0].offer_url,
      thumbnail: offerOnePayload.response.offers[0].image_url,
      isDesktop: 0,
      isAndroid: 0,
      isIos: 1,
      externalOfferId: offerOnePayload.response.offers[0].offer_id,
    })
    const offerTwoKey = Object.keys(offerTwoPayload.data)[0]
    expect(offers[1]).toMatchObject({
      providerName: getProviderName.get(ProviderEnum.PROVIDER_TWO),
      name: offerTwoPayload.data[offerTwoKey].Offer.name,
      description: offerTwoPayload.data[offerTwoKey].Offer.description,
      requirements: offerTwoPayload.data[offerTwoKey].Offer.instructions,
      offerUrlTemplate: offerTwoPayload.data[offerTwoKey].Offer.tracking_url,
      thumbnail: offerTwoPayload.data[offerTwoKey].Offer.icon,
      isDesktop: +offerTwoPayload.data[offerTwoKey].OS.web,
      isAndroid: +offerTwoPayload.data[offerTwoKey].OS.android,
      isIos: +offerTwoPayload.data[offerTwoKey].OS.ios,
      externalOfferId: offerTwoKey,
    })
  })

  it('Should not process bad payloads', async () => {
    {
      // The one with bad provider 1 payload and good provider 2 payload
      const offers = await offerCron.fetchPayloads([
        providerOneBadPayloadMissingOffersProperty as undefined,
        offerTwoPayload,
      ])
      expect(offers.length).toBe(1)
      const offerTwoKey = Object.keys(offerTwoPayload.data)[0]
      expect(offers[0].externalOfferId).toBe(offerTwoKey)
    }
    {
      // The one with bad provider 1 payload(offer object) and good provider 2 payload
      const offers = await offerCron.fetchPayloads([
        providerOneBadPayloadMissesOfferId as undefined,
        offerTwoPayload,
      ])
      expect(offers.length).toBe(1)
      const offerTwoKey = Object.keys(offerTwoPayload.data)[0]
      expect(offers[0].externalOfferId).toBe(offerTwoKey)
    }
    {
      // The one with good provider 1 payload and bad provider 2 payload
      const offers = await offerCron.fetchPayloads([
        offerOnePayload,
        providerTwoBadPayloadMissesDataProperty as undefined,
      ])
      expect(offers.length).toBe(1)
      expect(offers[0].externalOfferId).toBe(offerOnePayload.response.offers[0].offer_id)
    }
    {
      // The one with good provider 1 payload and bad provider 2 payload(offer object: misses campaign id)
      const offers = await offerCron.fetchPayloads([
        offerOnePayload,
        providerTwoBadPayloadMissesCampaignId as undefined,
      ])
      expect(offers.length).toBe(1)
      expect(offers[0].externalOfferId).toBe(offerOnePayload.response.offers[0].offer_id)
    }
    {
      // The one with good provider 1 payload and bad provider 2 payload(OS object: misses android)
      const offers = await offerCron.fetchPayloads([
        offerOnePayload,
        providerTwoBadPayloadMissesCampaignOsAndroid as undefined,
      ])
      expect(offers.length).toBe(1)
      expect(offers[0].externalOfferId).toBe(offerOnePayload.response.offers[0].offer_id)
    }
    {
      // The one with good provider 1 payload and bad provider 2 payload(misses OS object)
      const offers = await offerCron.fetchPayloads([
        offerOnePayload,
        providerTwoBadPayloadMissesCampaignOs as undefined,
      ])
      expect(offers.length).toBe(1)
      expect(offers[0].externalOfferId).toBe(offerOnePayload.response.offers[0].offer_id)
    }
  })
})
