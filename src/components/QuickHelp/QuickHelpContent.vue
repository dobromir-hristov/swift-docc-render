<template>
  <div class="QuickHelpContent">
    <div v-if="isFetching">
      Loading...
    </div>
    <div v-else-if="json">
      <DocumentationTopic
        v-bind="topicProps"
        enableMinimized
      />
    </div>
    <div v-else>
      Error...
    </div>
  </div>
</template>

<script>
import { clone, fetchDataForPreview } from '@/utils/data';
import DocumentationTopicStore from '@/stores/DocumentationTopicStore';

let extractProps = () => ({});

const DocumentationTopic = import('@/components/DocumentationTopic.vue').then((component) => {
  extractProps = component.default.methods.extractProps;
  return component.default;
});

const HERO_KIND = 'hero';

const QuickHelpStore = {
  ...DocumentationTopicStore,
  state: clone(DocumentationTopicStore.state),
};
export default {
  name: 'QuickHelpContent',
  components: { DocumentationTopic: () => DocumentationTopic },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  provide() {
    return {
      store: this.store,
    };
  },
  data() {
    return {
      store: QuickHelpStore,
      json: null,
      isFetching: false,
    };
  },
  // created() {
  //   this.fetchData();
  // },
  // beforeDestroy() {
  //   this.stopFetching();
  // },
  computed: {
    topicProps: ({ json }) => {
      const props = extractProps(json);

      // massage the render JSON for both /documentation/* and /tutorials/*
      // pages into props that can be safely rendered using a minimized
      // `DocumentationTopic` component
      //
      // for /tutorials/* pages, this means extracting the first `sections`
      // hero item and using its content as the `abstract`
      const { sections = [] } = json;
      let { abstract } = props;
      const hero = sections.find(({ kind }) => kind === HERO_KIND);
      if (!abstract && hero) {
        abstract = hero.content;
      }

      return {
        ...props,
        abstract,
      };
    },
  },
  methods: {
    stopFetching() {
      if (this.abortController) {
        this.abortController.abort();
      }
    },
    async fetchData() {
      this.isFetching = true;
      this.stopFetching();
      this.abortController = new AbortController();
      try {
        this.json = await fetchDataForPreview(this.url, {
          signal: this.abortController.signal,
        });
        this.isFetching = false;
      } catch (e) {
        if (e.name === 'AbortError') {
          return;
        }
        this.isFetching = false;
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

</style>
