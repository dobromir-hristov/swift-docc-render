<template>
  <div class="QuickHelpContent" v-if="url">
    <div class="loading" v-if="isFetching">
      Loading...
    </div>
    <div v-else-if="json">
      <DocumentationTopic
        v-bind="topicProps"
        enableMinimized
      />
    </div>
    <div v-else-if="error">
      Error...
    </div>
  </div>
</template>

<script>
import { clone, fetchDataForPreview } from '@/utils/data';
import DocumentationTopicStore from '@/stores/DocumentationTopicStore';
import QuickHelpStore from '@/stores/QuickHelpStore';

let extractProps = () => ({});

const DocumentationTopic = import('@/components/DocumentationTopic.vue').then((component) => {
  extractProps = component.default.methods.extractProps;
  return component.default;
});

const HERO_KIND = 'hero';

const QuickHelpStoreTopic = {
  ...DocumentationTopicStore,
  state: clone(DocumentationTopicStore.state),
};
export default {
  name: 'QuickHelpContent',
  components: { DocumentationTopic: () => DocumentationTopic },
  provide() {
    return {
      store: this.store,
      shouldShowQuickHelp: false,
    };
  },
  data() {
    return {
      store: QuickHelpStoreTopic,
      json: null,
      isFetching: false,
      error: false,
    };
  },
  watch: {
    url: {
      immediate: true,
      handler: 'fetchData',
    },
  },
  // created() {
  //   this.fetchData();
  // },
  beforeDestroy() {
    this.stopFetching();
  },
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
    url: () => QuickHelpStore.state.url,
  },
  methods: {
    stopFetching() {
      if (this.abortController) {
        this.abortController.abort();
      }
    },
    async fetchData(url) {
      if (!url) return;
      this.stopFetching();
      this.abortController = new AbortController();
      this.error = false;
      const timeout = setTimeout(() => {
        this.isFetching = true;
      }, 1000);
      try {
        this.json = await fetchDataForPreview(url, {
          signal: this.abortController.signal,
        });
        clearTimeout(timeout);
        this.isFetching = false;
      } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') {
          return;
        }
        this.error = true;
        this.isFetching = false;
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.QuickHelpContent {
  --doc-hero-right-offset: 0px;
  margin-top: $article-stacked-margin-small;
  background: var(--color-fill-secondary);
  border-left: 4px solid var(--color-fill-light-blue-secondary);
  padding-left: 8px;
  padding-right: 8px;
  min-height: 0;
  overflow: auto;

  .loading {
    padding: 8px 8px 8px 0;
  }

  :deep() {
    .minimized-hero, .doc-content .minimized-container {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }
}
</style>
