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
