import { params } from './params';
import { getData } from './get-data';

const observer_markup = '<div id="scroll-observer" class="p-1"></div>'
  ,scrolling_observer = new IntersectionObserver( (entries) => {
    if( entries[0].isIntersecting) {

      params.pag++;
      getData();
    }
  },{
    threshold: 0,
    rootMargin: '40px 0px' // NB: valori bassi (20px) possono influire con browser mobili con barra indirizzi a scomparsa
  });

let observer_element = null;

params.observer_on = false;


export function run_scroll_observer() {
  if(!observer_element) {
    params.result_wrapper.insertAdjacentHTML('afterend', observer_markup);
    observer_element = document.getElementById('scroll-observer');
    scrolling_observer.observe(observer_element);
  }
  params.observer_on = true;
}

export function stop_scroll_observer() {
  if(observer_element) {
    scrolling_observer.unobserve(observer_element);
    observer_element.remove();
    observer_element = null;
  }
  params.observer_on = false;
}
