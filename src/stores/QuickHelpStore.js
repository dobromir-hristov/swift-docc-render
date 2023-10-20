import { reactive } from 'vue';

const store = {
  state: reactive({
    url: '',
  }),
  setUrl(url) {
    store.state.url = url;
  },
  resetStore() {
    store.state.url = '';
  },
};
export default store;
