/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import '../webpack-asset-path';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Router from 'vue-router';
import App from '@/App.vue';
import SwiftDocCRenderPlugin from '@/setup-utils/SwiftDocCRenderPlugin';
import SwiftDocCRenderRouter from '@/setup-utils/SwiftDocCRenderRouter';
import SwiftDocCRenderi18n from '@/setup-utils/SwiftDocCRenderi18n';
import FloatingVue from 'floating-vue';

Vue.use(SwiftDocCRenderPlugin);
Vue.use(Router);
Vue.use(VueI18n);
Vue.use(FloatingVue, {
  themes: {
    'quick-help': {
      // Default dropdown placement relative to target element
      placement: 'top',
      // Update popper on content resize
      handleResize: true,
      // Hide on clock outside
      autoHide: true,
      delay: {
        show: 200,
        hide: 0,
      },
      triggers: ['hover', 'touch'],
      popperTriggers: ['hover'],
      overflowPadding: 10,
    },
  },
});

new Vue({
  router: SwiftDocCRenderRouter(),
  render: h => h(App),
  i18n: SwiftDocCRenderi18n(),
}).$mount('#app');
