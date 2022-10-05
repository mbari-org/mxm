<script setup lang="ts"></script>

<template>
  <q-page class="q-pa-xl">
    <div class="column items-center q-gutter-y-md">
      <div class="row q-gutter-xl">
        <div>
          <q-btn to="/p" class="pageLink" no-caps> Providers </q-btn>
        </div>
        <div>
          <q-btn to="/ac" class="pageLink" no-caps> Asset classes </q-btn>
        </div>
        <div>
          <q-btn to="/a" class="pageLink" no-caps> Assets </q-btn>
        </div>
        <div>
          <q-btn to="/u" class="pageLink" no-caps> Units of measure</q-btn>
        </div>
      </div>

      <div class="q-mt-xl column items-center text-grey-8">
        <p>Welcome to MXM</p>
        <p>This is a prototype of the MXM System</p>
        <a
          v-if="mxmConfig.learnMoreUrl"
          :href="mxmConfig.learnMoreUrl"
          style="font-size: small"
          class="appLink"
          target="mxm_learnMore"
          rel="noopener"
        >
          Learn more
        </a>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
body.body--dark .pageLink {
  text-decoration: none;
  color: aquamarine;
  background: #3d3d37;
}

.pageLink {
  text-decoration: none;
}
</style>
