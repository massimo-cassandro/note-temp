import { params } from './params';
import DOMPurify from 'dompurify';
import { marked } from 'node_modules/marked/lib/marked';
import row_template from './row-template.html';
import logo_mini from '../favicons-src/favicon-verde-small-src.svg';
import { parse_file_size } from './parse-file-size';
import iconaPdf from '../imgs/file-pdf.svg';
/*
[
  {
      "id": 288,
      "title": "xxxxx",
      "archived": 0,
      "trash": 0,
      "updated": "2024-08-01 17:04:40",
      "content": "",
      "tags": "[{\"id\":3,\"tag\":\"Casa\"}]",
      "attachments": [{"id":18,"filename":"00033-00018-cinghia-valigie.pdf","display_name":"cinghia valigie.pdf","caption":null,"mime":"application/pdf","width":null,"height":null,"size":361692}]'
  },
]
*/

// var render = new marked.Renderer();
// render.link = function (href, title, text) {
//   if (this.options.sanitize) {
//     try {
//       var prot = decodeURIComponent(unescape(href))
//         .replace(/[^\w:]/g, '')
//         .toLowerCase();
//     // eslint-disable-next-line no-unused-vars
//     } catch (err) {
//       return '';
//     }
//     if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
//       return '';
//     }
//   }

//   if (href === text && title == null) {
//     return href;
//   }
//   var out = '<a href="' + href + '"';
//   if (title) {
//     out += ' title="' + title + '"';
//   }
//   out += '>' + text + '</a>';
//   return out;
// };
marked.use({
  // renderer: render,
  // async: true,
  breaks: true,
  gfm: true,
});

function create_row(item) {

  // tags.map(t => `<span role="button" data-tag-id="${t.id}">${t.tag}</span>`).join('')
  item.tags = JSON.parse(item.tags ?? '[]').map(t => `<span class="badge">${t.tag}</span>`).join('');
  item.content = DOMPurify.sanitize(marked.parse(item.content));

  item.updated = new Date(item.updated).toLocaleString('it-IT', {
    year: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  item.attachments = JSON.parse(item.attachments ?? '[]');
  if (item.attachments.length) {
    item.attachments = '<ul class="attachments">' +
      item.attachments.map(a => {
        let att, icon = '';
        if (a.mime.includes('image')) {
          att = `<img src="${params.get_file_url}?id=${a.id}" alt="${a.caption ?? a.display_name ?? a.filename}" width="${a.width}" height="${a.height}" loading="lazy">`;

        } else {
          if (a.mime.includes('pdf')) {
            icon = `<img src="${iconaPdf}" class="icon" alt="pdf" width="16" height="16" loading="lazy">`;
          }
          att = `${icon} <a href="${params.get_file_url}?id=${a.id}" title="${a.display_name ?? a.filename}" download="${a.display_name ?? a.filename}">${a.caption ?? a.display_name ?? a.filename}</a> <small>(${parse_file_size(a.size)})</small>`;
        }

        return `<li>${att}</li>`;
      }).join('') +
      '</ul>';
  } else {
    item.attachments = '';
  }
  // item.updated = new Date(item.updated).toLocaleDateString();

  return row_template.replace(/\{\{(.*?)\}\}/g, (match, keys_string) => {

    const keys = keys_string.split('.');
    return keys.reduce((obj, current) => {
      return obj[ current ];
    }, item) ?? ''; // .replace(/\r\n|\n\r|\r|\n/g, '<br>\n');
  });
}

export function add_rows(data, add_bookend = false) {

  params.result_wrapper.insertAdjacentHTML('beforeend', data.map(create_row).join(''));

  if (add_bookend) {
    params.result_wrapper.insertAdjacentHTML('beforeend',
      `<div class="bookend"><img src="${logo_mini}" alt=""></div>`
    );
  }
}
