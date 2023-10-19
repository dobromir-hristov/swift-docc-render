<template>
  <VTooltip
    class="QuickHelpTooltip"
    theme="quick-help"
    @hide="$refs.qhContent?.stopFetching()"
    @apply-show="$refs.qhContent?.fetchData()"
  >
    <slot />
    <template #popper>
      <QuickHelpContent ref="qhContent" :url="url" />
    </template>
  </VTooltip>
</template>

<script>
import QuickHelpContent from '@/components/QuickHelp/QuickHelpContent.vue';

export default {
  name: 'QuickHelpTooltip',
  components: { QuickHelpContent },
  props: {
    url: {
      type: String,
      default: '',
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
  text-decoration: underline;
  text-decoration-style: dotted;
}
</style>
