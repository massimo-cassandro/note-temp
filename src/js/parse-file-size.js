
export function parse_file_size(bytes, locales = 'it-IT') {
  bytes = +bytes;
  let mega = 1024*1024;
  if(bytes >= mega ) {
    return (bytes/mega).toLocaleString(locales, {maximumFractionDigits: 1}) + '<span class="unit">MB</span>';

  } else if (bytes < 1024) {
    return Number((bytes/1024).toFixed(2)).toLocaleString(locales, {maximumFractionDigits: 2}) +
      '<span class="unit">KB</span>';

  } else {
    return Math.round(bytes/1024).toLocaleString(locales, {maximumFractionDigits: 0}) +
      '<span class="unit">KB</span>';
  }
};
