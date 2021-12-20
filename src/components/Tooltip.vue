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
import { nextTick, onMounted, onRenderTriggered, ref, toRefs, watch, watchEffect } from "vue";
import { arrow, autoPlacement, computePosition, offset, shift, flip } from '@floating-ui/dom';
import useWindowResize from "../hooks/useWindowResize";

const props = defineProps({
  offsetProp: {
    type: Number,
    default: 10
  },
  placementProp: {
    type: String,
    default: "bottom"
  }
})

const { offsetProp, placementProp } = toRefs(props);
const { width, height } = useWindowResize();

const buttonRef = ref()
const tooltipRef = ref()
const arrowRef = ref()
const isOpened = ref(false)

async function updatePosition() {
  // if (!buttonRef.value || !tooltipRef.value) return
  const { x, y, placement, middlewareData } = await computePosition(
    buttonRef.value,
    tooltipRef.value,
    {
      placement: placementProp.value,
      middleware: [
        shift(),
        flip(),
        offset(offsetProp.value),
        arrow({
          element: arrowRef.value
        })
      ]
    }
  );

  Object.assign(tooltipRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  const { x: arrowX, y: arrowY } = middlewareData.arrow;

  console.log('arrows: ', arrowX, arrowY);
  Object.assign(arrowRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
    right: '',
    bottom: ''
  })
}

async function toggleTooltip() {
  isOpened.value = !isOpened.value
}


watch(isOpened, (value) => {
  if (value) {
    nextTick(() => {
      updatePosition()
    })
  }
})

watch([width, height], () => {
  if (isOpened.value) {
    nextTick(() => {
      updatePosition()
    })
  }
})

onMounted( () => {
  console.log("props", offsetProp.value, placementProp.value)
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
