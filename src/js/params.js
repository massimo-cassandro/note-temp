/* global process */

export const params = {

  query_limit       : 20,
  pag               : 0,
  search_params     : {},
  token             : null,
  api_url           : new URL(process.env.GET_DATA_URL, location.href).toString(),
  get_file_url      : new URL(process.env.GET_FILE_URL, location.href).toString(),
};
