<template>
  <div class="QuickHelpContent" v-if="url">
    <div class="loading" v-if="isFetching">
      Loading...
    </div>
    <div v-else-if="json">
      <button class="hide-qh" @click="hideQuickHelp">
        <InlineCloseIcon class="icon-inline" />
      </button>
      <DocumentationTopic
        v-bind="topicProps"
        enableMinimized
        hidePrimaryContentSection
      />
    </div>
    <div v-else-if="error">
      Error fetching help content
    </div>
  </div>
</template>

<script>
import { clone, fetchDataForPreview } from '@/utils/data';
import DocumentationTopicStore from '@/stores/DocumentationTopicStore';
import QuickHelpStore from '@/stores/QuickHelpStore';
import InlineCloseIcon from '@/components/Icons/InlineCloseIcon.vue';

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
  components: {
    InlineCloseIcon,
    DocumentationTopic: () => DocumentationTopic,
  },
  provide() {
    return {
      store: this.store,
      shouldShowQuickHelp: false,
    };
  },
  inject: {
    docStore: 'store',
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
        this.collapseOnThisPageIfNeeded();
      } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') {
          return;
        }
        this.error = true;
        this.isFetching = false;
      }
    },
    async collapseOnThisPageIfNeeded() {
      await this.$nextTick();
      // TODO provide this class name somehow from parent...
      const container = document.querySelector('.OnThisPageStickyContainer');
      if (container.scrollHeight > container.clientHeight) {
        this.docStore.collapseOnThisPage();
      }
    },
    hideQuickHelp() {
      this.json = null;
      QuickHelpStore.resetStore();
      // TODO: Should we re-expand OTP, if we collapsed it?
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.QuickHelpContent {
  --doc-hero-right-offset: 0px;
  background: var(--color-fill-secondary);
  border-left: 4px solid var(--color-fill-light-blue-secondary);
  padding-left: 8px;
  padding-right: 8px;
  position: relative;

  .hide-qh {
    width: 1rem;
    position: absolute;
    right: 0;
    top: -5px;
    z-index: 10;
    padding: 10px;
  }

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
