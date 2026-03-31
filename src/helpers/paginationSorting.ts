
type IOptions = {
  page?: number | string;
  limit?: number | string;
  sortOrder?: string;
  sortBy?: string;
  defSort?: string;
  defOrder?: string
}

type IOptionsResult = {
  page: number,
  limit: number,
  skip: number,
  sortBy: string,
  sortOrder: string
}

const paginationSortingHelper = (options: IOptions): IOptionsResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 9;
  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || options.defSort || "createdAt";
  const sortOrder = options.sortOrder || options.defOrder || "desc";


  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};


export default paginationSortingHelper;