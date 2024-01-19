type ItemLookUpResponse = ItemSearchResponse

type ItemSearchResponse = {
  version: string
  logo: string
  title: string
  link: string
  pubDate: string
  totalResults: number
  startIndex: number
  itemPerPage: 5
  query: string
  searchCategoryId: number
  searchCategoryName: string
  item: Array<ItemInfo>
}

type ItemInfo = {
  title: string
  link: string
  author: string
  pubDate: `${number}-${number}-${number}`
  description: ''
  isbn: string
  isbn13: string
  itemId: number
  priceSales: number
  priceStandard: number
  mallType: 'BOOK' | 'MUSIC' | 'DVD' | 'FOREIGN' | 'EBOOK' | 'USED'
  stockStatus: string
  mileage: number
  cover: string
  categoryId: number
  categoryName: string
  publisher: string
  salesPoint: number
  adult: boolean
  fixedPrice: boolean
  customerReviewRank: number
  // 항상 포함되지 않는 요소에 관한 정보는 뭔가 좀 이상하다.
  bestDuration?: string
  bestRank?: number
  seriesInfo?: SeriesInfo
  subInfo: SubInfo
}

type SeriesInfo = {
  seriesId: number
  seriesLink: string
  seriesName: string
}

type SubInfo = {
  ebookList?: unknown
  usedList?: unknown
  newBookList?: unknown
  paperBookList?: unknown
}
