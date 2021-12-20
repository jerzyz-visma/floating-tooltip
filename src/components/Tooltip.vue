<template>
  <button
    id="button"
    ref="buttonRef"
    aria-describedby="tooltip"
    @click="toggleTooltip">
    My button
  </button>
  <teleport to="#floating-container">
    <transition name="fade">
      <div
        v-if="isOpened"
        id="tooltip"
        ref="tooltipRef"
        role="tooltip">
        My tooltip
        <div
          id="arrow"
          ref="arrowRef"
        />
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { nextTick, onRenderTriggered, ref, toRefs, watch, watchEffect } from "vue";
import { arrow, autoPlacement, computePosition, offset, shift } from '@floating-ui/dom';
import useWindowResize from "../hooks/useWindowResize";

const props = defineProps({
  offsetVal: {
    type: Number,
    default: 10
  }
})

const {offsetVal} = toRefs(props);
const {width, height} = useWindowResize();

const buttonRef = ref()
const tooltipRef = ref()
const arrowRef = ref()
const isOpened = ref(false)
const placement = ref('left')

const options = {
  placement: placement.value,
  middleware: [
    // autoPlacement(),
    shift(),
    offset(10)
  ]
}

async function toggleTooltip() {
  isOpened.value = !isOpened.value

  await nextTick();

  console.log(tooltipRef.value, arrowRef.value);

  if (!buttonRef.value || !tooltipRef.value) return

  computePosition(
    buttonRef.value,
    tooltipRef.value,
    options
  ).then(({x, y}) => {
    Object.assign(tooltipRef.value.style, {
      left: `${x}px`,
      top: `${y}px`
    })
  })
}

async function updatePosition() {
  if (!buttonRef.value || !tooltipRef.value) return

  const {x, y} = await computePosition(
    buttonRef.value,
    tooltipRef.value,
    options,
  );

  Object.assign(tooltipRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
}

watch([width, height], () => {
  updatePosition();
})

onRenderTriggered(() => {
  console.log('render triggered');
})


</script>

<style>
#tooltip {
  --arrow-size: 8px;
  position: absolute;
  background: #222;
  color: white;
  font-weight: bold;
  padding: 5px;
  border-radius: 4px;
  font-size: 90%;
  pointer-events: none;
}

#arrow {
  width: 0;
  height: 0;
  border-left: var(--arrow-size) solid transparent;
  border-right: var(--arrow-size) solid transparent;
  border-top: var(--arrow-size) solid tomato;
  position: absolute;
  top: 100%;
}

#arrow::before {
  content: '';
  display: inline-block;
  position: absolute;
  border-color: transparent;
  border-style: solid;
  border-width: 0 3px 3px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
