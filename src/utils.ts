const queryParameters = [
  'chkKeyTitle',
  'chkKeyAuthor',
  'chkKeyPublisher',
  'chkKeyISBN',
  'chkKeyTag',
  // NOTE: 이 두 쿼리는 어디 다 쓰는 지 모르겠음.
  'chkKeyToc',
  'chkKeySubject',
]

const queryTypeSettings = {
  Keyword: ['chkKeyTitle', 'chkKeyAuthor'],
  Title: ['chkKeyTitle'],
  Author: ['chkKeyAuthor'],
  Publisher: ['chkKeyPublisher'],
}

export const generateUrlQueryForType = (queryType: QueryType['value']) => {
  const activeParameters = queryTypeSettings[queryType] || []
  return queryParameters
    .map((param) => `${param}=${activeParameters.includes(param) ? 'on' : ''}`)
    .join('&')
}

export const truncate = (str: string, n: number) => {
  return str.length > n || str.length == 0 ? str.slice(0, n - 1) + '…' : str
}

export const removeExtraSpaces = (str: string) => {
  return str.replace(/\s+/g, ' ')
}

export function extractItemId(url: string): string {
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)
  return params.get('ItemId') as string
}
