type QueryType =
  | {
      name: '제목+저자'
      value: 'Keyword'
    }
  | {
      name: '제목'
      value: 'Title'
    }
  | {
      name: '저자'
      value: 'Author'
    }
  | {
      name: '출판사'
      value: 'Publisher'
    }

type SearchTarget =
  | {
      name: '도서'
      value: 'Book'
    }
  | {
      name: '외국도서'
      value: 'Foreign'
    }
  | {
      name: '음반'
      value: 'Music'
    }
  | {
      name: 'dvd'
      value: 'DVD'
    }
  | {
      name: '중고'
      value: 'Used'
    }
  | {
      name: '전자책'
      value: 'eBook'
    }
  | {
      name: '통합검색'
      value: 'All'
    }
