<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="OnThisPageNav">
    <ul class="items">
      <OnThisPageNavItem
        :item="onThisPageSections[0]"
        :current="currentPageAnchor"
      >
        <template #post>
          <button class="toggle" @click="store.toggleOnThisPage()">
            <InlineChevronDownIcon
              class="icon-inline toggle-icon"
              :class="{ flip: collapsed }" />
          </button>
        </template>
      </OnThisPageNavItem>
      <template v-if="!collapsed">
        <OnThisPageNavItem
          v-for="item in collapsableSections"
          :key="item.anchor"
          :item="item"
          :current="currentPageAnchor"
        />
      </template>
    </ul>
  </div>
</template>

<script>
import throttle from 'docc-render/utils/throttle';
import { waitFrames } from 'docc-render/utils/loading';
import { buildUrl } from 'docc-render/utils/url-helper';
import OnThisPageNavItem from '@/components/OnThisPageNavItem.vue';
import InlineChevronDownIcon from '@/components/Icons/InlineChevronDownIcon.vue';

export default {
  name: 'OnThisPageNav',
  components: {
    InlineChevronDownIcon,
    OnThisPageNavItem,
  },
  inject: {
    store: {
      default() {
        return {
          state: {
            onThisPageSections: [],
            currentPageAnchor: null,
            onThisPageCollapsed: false,
          },
        };
      },
    },
  },
  computed: {
    collapsed: ({ store }) => store.state.onThisPageCollapsed,
    onThisPageSections: ({
      store,
      $route,
      collapsed,
    }) => store.state.onThisPageSections.slice(0, collapsed ? 1 : undefined)
      .map(item => ({
        ...item,
        url: buildUrl(`#${item.anchor}`, $route.query),
      })),
    collapsableSections: ({ onThisPageSections }) => onThisPageSections.slice(1),
    currentPageAnchor: ({ store }) => store.state.currentPageAnchor,
  },
  async mounted() {
    window.addEventListener('scroll', this.onScroll, false);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('scroll', this.onScroll);
    });
  },
  watch: {
    onThisPageSections: {
      immediate: true,
      async handler() {
        await waitFrames(8);
        this.onScroll();
      },
    },
  },
  methods: {
    onScroll: throttle(function onScroll() {
      // if there are no sections, exit early
      const len = this.onThisPageSections.length;
      if (!len) return;
      // get the point at which we intercept, 1/3 of screen
      const {
        scrollY,
        innerHeight,
      } = window;
      const { scrollHeight } = document.body;
      const isBottom = scrollY + innerHeight >= scrollHeight;
      const isTop = scrollY <= 0;
      const intersectionPoint = (innerHeight * 0.3) + scrollY;
      if (isTop || isBottom) {
        const index = isTop ? 0 : len - 1;
        this.store.setCurrentPageSection(this.onThisPageSections[index].anchor);
        return;
      }
      // init loop vars
      let nearestAnchor = null;
      let i;
      let item;
      for (i = 0; i < len; i += 1) {
        item = this.onThisPageSections[i];
        // get the element's offset
        const tempItem = document.getElementById(item.anchor);
        if (!tempItem) break;
        const { offsetTop } = item;
        // if the element is above the intersection point, it is "active".
        if (offsetTop < intersectionPoint) {
          nearestAnchor = item.anchor;
        } else {
          // item is below the intersectionPoint, so we bail
          break;
        }
      }
      // set the nearest index as active
      if (nearestAnchor !== null) {
        this.store.setCurrentPageSection(nearestAnchor);
      }
    }, 100),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

ul {
  list-style-type: none;
  margin: 0;

  :deep(li:first-child .base-link) {
    margin-top: 0;
  }

  .toggle {
    margin-left: 1rem;

    .toggle-icon {
      width: 1rem;

      &.flip {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
