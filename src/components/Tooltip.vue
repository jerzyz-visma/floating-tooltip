<template>
  <div
    class="tooltip-trigger"
    ref="triggerRef"
    aria-describedby="tooltip"
    @click="onClick"
    @mouseenter="onHover"
    @mouseout="onLeave"

  >
    <slot />
  </div>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpened"
        class="tooltip"
        ref="tooltipRef"
        role="tooltip"
        @mouseenter="onHover"
        @mouseout="onLeave"
        :style="cssVars"
        :class="classes"
      >
        <slot name="content">Default Tooltip content</slot>
        <div class="arrow" ref="arrowRef" />
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onRenderTriggered, ref, toRefs, watch, watchEffect } from "vue";
import { arrow, computePosition, shift, flip, offset } from '@floating-ui/dom';
import useWindowResize from "../hooks/useWindowResize";

interface Props {
  variant?: string,
  offsetProp?: number,
  placementProp?: string,
}
type Variants = ''|'error'|'warning'|'action'

const { variant, offsetProp = 10, placementProp = 'top'} = defineProps<Props>()

// const { offsetProp, placementProp } = toRefs(props);
const { width, height } = useWindowResize();

const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
const isOpened = ref(false)

const cssVars = computed(() =>
  `--offset: ${offsetProp}px`
);

const classes = computed(() => {
  return {
    [`tooltip-${variant}`]: Boolean(variant)
  }
});

async function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return
  console.log(arrowRef.value)
  const { x, y, placement, middlewareData } = await computePosition(
    triggerRef.value,
    tooltipRef.value,
    {
      placement: placementProp,
      middleware: [
        offset(offsetProp), // Middleware behavior is dependent on order.
        flip(),
        shift({ padding: 5 }),
        arrow({ element: arrowRef.value })
      ]
    }
  );

  Object.assign(tooltipRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  const { x: arrowX, y: arrowY } = middlewareData.arrow;

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]];

  Object.assign(arrowRef.value.style, {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide]: '-7px' // dependent on arrow side, adjust manually
  })
}

const getParentList = (element: HTMLElement): HTMLElement[] =>
  element.parentElement === null
    ? []
    : [element.parentElement].concat(getParentList(element.parentElement));

async function onClick() {
  isOpened.value = !isOpened.value
}

function onHover(event: MouseEvent) {
  isOpened.value = true
}

function onLeave(event: MouseEvent) {
  const parentList = getParentList(event.relatedTarget as HTMLElement)

  const isTooltipHovered = parentList.some(
    (el) => el === tooltipRef.value || el === triggerRef.value
  ) || event.relatedTarget === tooltipRef.value

  if (isTooltipHovered) return;
  isOpened.value = false;
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

<style scoped>
.tooltip-trigger {
  display: inline-block;
}
.tooltip {
  --tooltip-background: var(--neutral-05);
  --tooltip-border-color: var(--neutral-70);
  --tooltip-content-color: var(--neutral-90);
  --tooltip-title-color: var(--neutral-90);
  --tooltip-border-width: 1px;
  --tooltip-border-style: solid;
  --tooltip-border-radius: 10px;
  --tooltip-shadow: rgba(22, 62, 89, 0.15);
  --arrow-size: 12px;
  --offset: 10px;
  background: var(--tooltip-background);
  border:
    var(--tooltip-border-width)
    var(--tooltip-border-style)
    var(--tooltip-border-color);
  color: var(--tooltip-content-color);
  border-radius: var(--tooltip-border-radius);
  box-shadow: 0 5px 10px var(--tooltip-shadow);
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  min-width: 80px;
  padding: 16px 20px;
  position: absolute;
  text-align: center;
  z-index: 1000;
}
.tooltip::before {
  content: '';
  display: block;
  background: transparent;
  width:  calc(100% + var(--offset)*2);
  height: calc(100% + var(--offset)*2);
  position: absolute;
  top: calc(var(--offset)*-1);
  left: calc(var(--offset)*-1);
  z-index: -1;
}

.tooltip strong + p {
  text-align: left;
}

.tooltip .arrow {
  position: absolute;
  background: var(--tooltip-background);
  border:
    var(--tooltip-border-width)
    var(--tooltip-border-style)
    var(--tooltip-border-color);
  border-left: none;
  border-top: none;
  width: var(--arrow-size);
  height: var(--arrow-size);
  transform: rotate(45deg);
}

:slotted(p) {
  margin: 0;
}
:slotted(strong) {
  color: var(--tooltip-title-color);
  display: block;
  text-align: left;
}

.tooltip-warning {
  --tooltip-background: var(--orange-05);
  --tooltip-border-color: var(--orange-40);
  --tooltip-title-color: var(--orange-90);
  --tooltip-shadow: rgba(242, 141, 0, 0.15);
}

.tooltip-error {
  --tooltip-background: var(--neutral-05);
  --tooltip-border-color: var(--red-70);
  --tooltip-title-color: var(--red-80);
  --tooltip-shadow: rgba(217, 54, 68, 0.15);
}
.tooltip-action {
  --tooltip-background: var(--neutral-90);
  --tooltip-border-color: var(--neutral-90);
  --tooltip-title-color: var(--neutral-05);
  --tooltip-content-color: var(--neutral-05);
  padding: 6px 12px;
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
