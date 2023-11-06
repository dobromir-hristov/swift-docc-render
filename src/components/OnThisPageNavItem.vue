<template>
  <li :class="getItemClasses">
    <router-link
      :to="item.url"
      class="base-link"
      @click.native="handleFocusAndScroll(item.anchor)"
    >
      <component :is="item.isSymbol ? 'WordBreak' : 'span'">
        {{ item.i18n ? $t(item.title) : item.title }}
      </component>
    </router-link>
    <slot name="post" />
  </li>
</template>

<script>

import WordBreak from '@/components/WordBreak.vue';
import ScrollToElement from '@/mixins/scrollToElement';

export default {
  name: 'OnThisPageNavItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
    current: {
      type: String,
      default: '',
    },
  },
  components: {
    WordBreak,
  },
  mixins: [ScrollToElement],
  computed: {
    getItemClasses({
      item,
      current,
    }) {
      return {
        active: item.anchor === current,
        'parent-item': item.level <= 2,
        'child-item': item.level === 3,
      };
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.parent-item .base-link {
  font-weight: $font-weight-bold;
}

.base-link {
  color: var(--color-figure-gray-secondary);
  @include font-styles(body-reduced-tight);
  display: inline-block;
  margin: 5px 0;
  transition: color 0.15s ease-in;
  max-width: 100%;
}

.active .base-link {
  color: var(--color-text);
}
</style>
