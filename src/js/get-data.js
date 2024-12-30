
import { params } from './params';
import { add_rows } from './add-rows';
import { run_scroll_observer, stop_scroll_observer} from './scroll-observer';

async function fetchData() {

  const formData = new FormData();

  formData.set('p', params.pag);
  formData.set('l', params.query_limit);

  params.search_params.q = params.search_input.value.trim() || '';

  Object.keys(params.search_params).filter(k => params.search_params[k] != null && params.search_params[k] !== '').forEach(k => {
    formData.set(k, params.search_params[k]);
  });

  try {
    const response = await fetch(params.api_url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      /* eslint-disable no-console */
      console.error('Ajax error: ', response);
      /* eslint-enable no-console */
      throw `Si è verificato un errore nel caricamento dei dati: ${response.status}`;
    }
    const data = await response.json();

    return data;

  } catch(e) {
    console.error( e ); // eslint-disable-line
  } // finally {}



}

function fetching_mode(active=true) {
  params.spinner_wrapper.classList.toggle('off', !active);
  params.search_fset.disabled = active;
}

export function reset_search(fully=true) {
  window.scrollTo(0, 0);
  params.pag = 0;
  params.result_wrapper.innerHTML = '';
  stop_scroll_observer();
  document.querySelector('.bookend')?.remove();

  if(fully) {
    params.search_params.q = '';
    params.search_input.value = '';
    params.search_input.focus();
    // fetching_mode(false);
    getData();
  }
}

export async function getData() {

  fetching_mode();


  if((params.search_params.q?? '') !== params.search_input.value.trim()) {
    reset_search(false);
  }

  const data = await fetchData();

  if(data.length < params.query_limit && params.observer_on ) {
    stop_scroll_observer();

  } else  if(!params.observer_on && data.length === params.query_limit) {
    run_scroll_observer();
  }

  add_rows(data, data.length < params.query_limit);

  fetching_mode(false);

}
