<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Tooltip from './components/Tooltip.vue'
</script>

<template>
  <h1>Tooltip test</h1>
	<Tooltip/>
</template>

<style>
html, body, #app {
  height: 100%;
  min-height: 100vh;
}
body {
  position: relative;
  margin: 0;
}
h1 {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
