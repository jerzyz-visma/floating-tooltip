<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Tooltip from './components/Tooltip.vue'</script>

<template>
  <h1>Tooltip test</h1>

  <Tooltip>
    Click default tooltip
    <template #content>
      <strong>Tooltip title</strong>
      <p>Default Tooltip <a href="#" tabindex="5">link</a></p>
    </template>
  </Tooltip>
  <br><br><br><br>
  <Tooltip hasTransition triggerTag="button" variant="warning">
    Show warning tooltip
    <template #content>
      <strong>Tooltip title</strong>
      <p>Warning Tooltip <a href="#">link</a></p>
    </template>
  </Tooltip>
  <br><br><br><br>
  <Tooltip variant="error">
    Show error tooltip
    <template #content>
      <strong>Tooltip title</strong>
      <p>Error Tooltip <a href="#">link</a></p>
    </template>
  </Tooltip>
  <br><br><br><br>
  <Tooltip variant="action">
    Show action tooltip
    <template #content>
      <p>Action Tooltip <a href="#">link</a></p>
    </template>
  </Tooltip>
</template>

<style>
:root {
  --neutral-05: #fff;
  --neutral-70: #959799;
  --neutral-90: #252626;
  --orange-05: #fffcf5;
  --orange-40: #ffcf8b;
  --orange-50: #ffc46f;
  --orange-90: #b35300;
  --red-05: #fff2f3;
  --red-70: #d93644;
  --red-80: #d11525;
}

html, body, #app {
  height: 100%;
  min-height: 100vh;
}

body {
  position: relative;
  margin: 0;
}

h1 {
  margin: 0 0 100px 0;
}

#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 1000px;
  margin: auto
}
</style>
