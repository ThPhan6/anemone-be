export function convertQueryParams(query: any) {
  try {
    const { page, perPage, filter, ...otherParams } = query;

    return {
      ...otherParams,
      page: page ? parseInt(page, 10) || 1 : 1,
      perPage: perPage ? parseInt(perPage, 10) || 10 : 10,
      filter: JSON.parse(filter || '{}'),
    };
  } catch (error) {
    return {
      page: 1,
      perPage: 10,
      filter: {},
    };
  }
}
