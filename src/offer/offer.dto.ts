import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import {Type} from 'class-transformer'

export class OfferDto implements IOffer {
  name: string
  slug: string
  description: string
  requirements: string
  thumbnail: string
  isDesktop: number
  isAndroid: number
  isIos: number
  offerUrlTemplate: string
  providerName: string
  externalOfferId: string

  constructor(
    data: ProviderOneOffer | ProviderTwoOffer,
    providerName: ProviderEnum,
    collateralInfo?: {
      os: ProviderTwoOS
    },
  ) {
    this.providerName = getProviderName.get(providerName)
    if (providerName === ProviderEnum.PROVIDER_ONE) {
      const offer = data as ProviderOneOffer
      this.name = offer.offer_name
      this.description = offer.offer_desc
      this.requirements = offer.call_to_action
      this.offerUrlTemplate = offer.offer_url
      this.thumbnail = offer.image_url
      this.isDesktop = offer.platform === ProviderOnePlatformEnum.DESKTOP ? 1 : 0
      this.isAndroid = offer.device === 'iphone_ipad' ? 0 : 1
      this.isIos = offer.device === 'iphone_ipad' ? 1 : 0
      this.externalOfferId = offer.offer_id.toString()
    } else if (providerName === ProviderEnum.PROVIDER_TWO) {
      const offer = data as ProviderTwoOffer
      const os = collateralInfo.os
      this.name = offer.name
      this.description = offer.description
      this.requirements = offer.instructions
      this.offerUrlTemplate = offer.tracking_url
      this.thumbnail = offer.icon
      this.isDesktop = os.web ? 1 : 0
      this.isAndroid = os.android ? 1 : 0
      this.isIos = os.ios ? 1 : 0
      this.externalOfferId = offer.campaign_id.toString()
    }
  }
}

export interface IOffer {
  name: string
  slug: string
  description: string
  requirements: string
  thumbnail: string
  isDesktop: number
  isAndroid: number
  isIos: number
  offerUrlTemplate: string
  providerName: string
  externalOfferId: string
}

export enum ProviderOnePlatformEnum {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
}

export class ProviderOneOffer {
  // should be mapped to `externalOfferId`
  @IsString()
  @IsNotEmpty()
  offer_id: string

  // should be mapped to `name`
  @IsString()
  @IsNotEmpty()
  offer_name: string

  // should be mapped to `description`
  @IsString()
  @IsNotEmpty()
  offer_desc: string

  // should be mapped to `requirements`
  @IsString()
  @IsNotEmpty()
  call_to_action: string

  // should be mapped to offerUrlTemplate
  @IsString()
  @IsNotEmpty()
  offer_url: string

  // should be mapped to `thumbnail`
  @IsString()
  @IsNotEmpty()
  image_url: string

  // combine platform and device to map to `isDesktop`, `isAndroid`, `isIos`
  @IsString()
  @IsNotEmpty()
  @IsEnum(ProviderOnePlatformEnum)
  platform: ProviderOnePlatformEnum // possible values are "desktop" | "mobile"

  @IsString()
  @IsNotEmpty()
  device: string //"iphone_ipad", // anything else should be considered as android
}

export class ProviderOneInnerResponse {
  @IsArray()
  @ArrayNotEmpty()
  offers: ProviderOneOffer[]
}

export class ProviderDto {}

export class ProviderOneResponseDto extends ProviderDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProviderOneInnerResponse)
  response: ProviderOneInnerResponse
}

export class ProviderTwoResponseDto extends ProviderDto {
  @IsNotEmpty()
  @ValidateNested({each: true})
  @Type(() => ProviderTwoDataObject)
  data: Map<string, ProviderTwoDataObject>
}

export class ProviderTwoOffer {
  // should be mapped to `externalOfferId`
  @IsNumber()
  @IsNotEmpty()
  campaign_id: number

  // should be mapped to `thumbnail`
  @IsString()
  @IsNotEmpty()
  icon: string

  // should be mapped to `name`
  @IsString()
  @IsNotEmpty()
  name: string

  // should be mapped to `offerUrlTemplate`
  @IsString()
  @IsNotEmpty()
  tracking_url: string

  // should be mapped to `requirements`
  @IsString()
  @IsNotEmpty()
  instructions: string

  // should be mapped to `description`
  @IsString()
  @IsNotEmpty()
  description: string
}

export class ProviderTwoOS {
  // this should be mapped to `isAndroid`
  @IsBoolean()
  @IsNotEmpty()
  android: boolean

  // this should be mapped to `isIos`
  @IsBoolean()
  @IsNotEmpty()
  ios: boolean

  // this should be mapped to `isDesktop`
  @IsBoolean()
  @IsNotEmpty()
  web: boolean
}

export class ProviderTwoDataObject {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProviderTwoOffer)
  Offer: ProviderTwoOffer

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProviderTwoOS)
  OS: ProviderTwoOS
}

export enum ProviderEnum {
  PROVIDER_ONE = 'PROVIDER_ONE',
  PROVIDER_TWO = 'PROVIDER_TWO',
}

export const getProviderName = new Map<ProviderEnum, string>([
  [ProviderEnum.PROVIDER_ONE, 'offer1'],
  [ProviderEnum.PROVIDER_TWO, 'offer2'],
])

export type OfferPayloadType = ProviderOneResponseDto | ProviderTwoResponseDto
