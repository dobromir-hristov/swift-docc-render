<template>
  <span
    class="QuickHelpTooltip"
    :class="{ 'qh-highlighted': isHighlighted }"
    @mouseenter="initiateQuickHelp"
    @mouseleave="stopQuickHelp"
    @focusin="initiateQuickHelp"
    @focusout="stopQuickHelp"
  >
    <slot />
  </span>
</template>

<script>

import QuickHelpStore from '@/stores/QuickHelpStore';

export default {
  name: 'QuickHelpTooltip',
  data() {
    return {
      timeout: 0,
    };
  },
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  computed: {
    isHighlighted({ url }) {
      return url === QuickHelpStore.state.url;
    },
  },
  methods: {
    initiateQuickHelp() {
      this.timeout = setTimeout(() => {
        QuickHelpStore.setUrl(this.url);
      }, 250);
    },
    stopQuickHelp() {
      clearTimeout(this.timeout);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.QuickHelpTooltip {
  display: inline;

  &.qh-highlighted {
    &:deep(a code) {
      background: var(--color-fill-tertiary);
      box-shadow: 0 0 0 1px var(--color-figure-gray-secondary-alt);
    }
  }

  &:deep(a code) {
    background: var(--color-fill-tertiary);
    padding: 2px 4px;
    border-radius: 2px;
  }
}
</style>
