<script setup lang="ts"></script>

<template>
  <q-page class="q-pa-xl">
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
