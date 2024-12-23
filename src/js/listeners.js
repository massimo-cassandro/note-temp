import { params } from './params';
import { getData } from './get-data';
import { reset_search } from './get-data';

export function setListeners() {

  params.search_form.addEventListener('submit', e => {
    e.preventDefault();
    getData();
  }, false);


  // reset search
  params.search_form.querySelector('.reset-btn').addEventListener('click', () => {
    reset_search();
  }, false);
}

