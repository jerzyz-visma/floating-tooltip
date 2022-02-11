<template>
  <component
    :is="triggerTag"
    ref="triggerRef"
    :aria-describedby="tooltipId"
    tabindex="0"
    @blur="onHide"
    @focus="onShow"
    @mouseenter="onShow"
    @mouseout="onMouseOut"
  >
    <slot/>
  </component>
  <teleport to="body">
    <transition :name="hasTransition ? 'fade' : ''">
      <div
        v-if="isOpened"
        :id="tooltipId"
        ref="tooltipRef"
        :class="classes"
        :style="cssVars"
        @mouseenter="onShow"
        @mouseout="onMouseOut"
      >
        <slot name="content">Default content</slot>
        <svg ref="arrowRef" fill="none" height="16" viewBox="0 0 26 16" width="26"
             xmlns="http://www.w3.org/2000/svg">
          <path class="arrow" d="M25 1H1V5C9 5 7 15 13 15C19 15 17 5 25 5V1Z"
                stroke-dasharray="0 31 28 0"/>
        </svg>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, PropType, ref, watch } from "vue";
import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { MiddlewareData, Placement } from '@floating-ui/core'
import { generateId } from "./helpers";
import useWindowResize from "./useWindowResize";

type Trigger = 'hover' | 'focus';
type Variant = '' | 'error' | 'warning' | 'action'

const {hasTransition, offsetProp, placementProp, trigger, triggerTag, variant} = defineProps({
  hasTransition: {
    type: Boolean,
    default: false
  },
  offsetProp: {
    type: Number,
    default: 10
  },
  placementProp: {
    type: String as PropType<Placement>,
    default: 'top'
  },
  trigger: {
    type: [String, Array] as PropType<Trigger | Trigger[]>,
    default: () => ["hover", "focus"]
  },
  triggerTag: {
    type: String,
    default: 'span'
  },
  variant: {
    type: String as PropType<Variant>,
  },
})

const isOpened = ref(false)
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
const position = ref<Placement | null>(null);

onMounted(() => {
})

onUnmounted(() => {
});

async function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value || !arrowRef.value) return

  const {x, y, placement, middlewareData} = await computePosition(
    triggerRef.value,
    tooltipRef.value,
    {
      placement: placementProp || 'top',
      middleware: [
        offset(offsetProp),
        flip(),
        shift({padding: 5}),
        arrow({element: arrowRef.value})
      ]
    }
  );

  position.value = placement;

  Object.assign(tooltipRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  const arrowX = (middlewareData as MiddlewareData)?.arrow?.x || ''
  const arrowY = (middlewareData as MiddlewareData)?.arrow?.y || ''

  const staticSide: string = ({
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]] as string);


  const arrowAdjustments = {
    top: '-11px',
    bottom: '-11px',
    right: '-16px',
    left: '-16px',
  }

  Object.assign(arrowRef.value.style, {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide]: arrowAdjustments[staticSide] // dependent on arrow side, adjust manually
  })
}

const cssVars = computed(() => {
  return {
    ['--offset']: `${offsetProp}px`
  }
});

const classes = computed(() => {
  return {
    ['tooltip']: true,
    [`tooltip-${variant}`]: Boolean(variant),
    [`tooltip-${position.value}`]: Boolean(position.value)
  }
});

const tooltipId = computed(() => {
  return `tooltip-${generateId()}`
})

function toggleVisibility(isOn: boolean) {
  isOpened.value = isOn
}

function handleEscape({code}: KeyboardEvent) {
  if (code === "Escape") toggleVisibility(false);
}

function onShow(event: MouseEvent | FocusEvent) {
  toggleVisibility(true)
}

function onMouseOut(event: MouseEvent) {
  if (!tooltipRef.value?.contains(event.relatedTarget as HTMLElement)) {
    onHide()
  }
}

function onHide() {
  toggleVisibility(false)
}

watch(isOpened, (value) => {
  if (value) {
    nextTick(() => {
      updatePosition()
    })
  }
})

// Resize window
const {width, height} = useWindowResize();

watch([width, height], () => {
  if (isOpened.value) {
    nextTick(() => {
      updatePosition()
    })
  }
})
</script>

<style scoped>
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
  --offset: v-bind(offsetProp);
  background: var(--tooltip-background);
  border: var(--tooltip-border-width) var(--tooltip-border-style) var(--tooltip-border-color);
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
  width: calc(100% + var(--offset) * 2);
  height: calc(100% + var(--offset) * 2);
  position: absolute;
  top: calc(var(--offset) * -1);
  left: calc(var(--offset) * -1);
  z-index: -1;
}

.tooltip strong + p {
  text-align: left;
}

.tooltip svg {
  display: inline-block;
  position: absolute;
  transform-origin: center;
}

.tooltip-left svg {
  transform: rotate(-90deg) translateX(16px);
}

.tooltip-bottom svg {
  transform: rotate(180deg)
}

.tooltip-right svg {
  transform: rotate(90deg) translateX(-22px)
}


.arrow {
  fill: var(--tooltip-background);
  stroke: var(--tooltip-border-color);
  stroke-width: var(--tooltip-border-width);
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
  padding: 8px 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
