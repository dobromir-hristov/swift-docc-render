<template>
  <VTooltip
    class="QuickHelpTooltip"
    theme="quick-help"
    @hide="handleHide"
    @apply-show="$refs.qhContent?.fetchData()"
  >
    <template #default="{ show }">
      <span ref="trigger" @keydown.alt.up.exact.prevent="handleAltUp(show)" @click.capture.prevent>
        <slot />
      </span>
    </template>
    <template #popper>
      <QuickHelpContent ref="qhContent" :url="url" />
    </template>
  </VTooltip>
</template>

<script>
import QuickHelpContent from '@/components/QuickHelp/QuickHelpContent.vue';
import { focusableSelector } from '@/utils/TabManager';

export default {
  name: 'QuickHelpTooltip',
  components: { QuickHelpContent },
  data() {
    return {
      openViaShortcut: false,
    };
  },
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleAltUp(show) {
      show();
      this.openViaShortcut = true;
    },
    handleHide() {
      this.$refs.qhContent?.stopFetching();
      // re-focus the trigger
      if (this.openViaShortcut) {
        const firstTabbable = this.$refs.trigger.querySelector(focusableSelector);
        if (firstTabbable) {
          firstTabbable.focus();
        }
      }
      this.openViaShortcut = false;
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.QuickHelpTooltip {
  display: inline-block;
}

.QuickHelpTooltip :deep(a) {
  color: var(--color-figure-gray-tertiary);
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 5px;
  cursor: help;
}
</style>
