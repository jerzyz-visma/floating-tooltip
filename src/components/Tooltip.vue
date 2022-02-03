<template>
  <component
    :is="triggerTag"
    ref="triggerRef"
    aria-describedby="tooltip"
    tabindex="0"
    @click="onToggle"
    @mouseenter="onMouseEnter"
    @mouseout="onMouseOut"
  >
    <slot/>
  </component>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpened"
        ref="tooltipRef"
        :class="classes"
        :style="cssVars"
        class="tooltip"
        role="tooltip"
        @mouseenter="onMouseEnter"
        @mouseout="onMouseOut"
      >
        <slot name="content">Default content</slot>
        <div ref="arrowRef" class="arrow"/>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, PropType, ref, watch } from "vue";
import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { MiddlewareData, Placement } from '@floating-ui/core'
import useWindowResize from "./useWindowResize";

type Trigger = 'hover' | 'focus' | 'toggle';
type Variant = '' | 'error' | 'warning' | 'action'

const {offsetProp, placementProp, trigger, triggerTag, variant} = defineProps({
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
  if (!triggerRef.value || !tooltipRef.value || !arrowRef.value) return

  const {x, y, placement, middlewareData} = await computePosition(
    triggerRef.value,
    tooltipRef.value,
    {
      placement: placementProp || 'top',
      middleware: [
        offset(offsetProp), // Middleware behavior is dependent on order.
        flip(),
        shift({padding: 5}),
        arrow({element: arrowRef.value})
      ]
    }
  );

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

  Object.assign(arrowRef.value.style, {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide]: '-7px' // dependent on arrow side, adjust manually
  })
}

function toggleVisibility(isOn: boolean) {
  isOpened.value = isOn
}

const getParentList = (element: HTMLElement): HTMLElement[] =>
  element.parentElement === null
    ? []
    : [element.parentElement].concat(getParentList(element.parentElement));

function onToggle() {
  toggleVisibility(!isOpened.value)
}

function onMouseEnter(event: MouseEvent) {
  toggleVisibility(true)
}

function onMouseOut(event: MouseEvent) {
  const parentList = getParentList(event.relatedTarget as HTMLElement)

  const isTooltipHovered = parentList.some(
    (el) => el === tooltipRef.value || el === triggerRef.value
  ) || event.relatedTarget === tooltipRef.value

  if (isTooltipHovered) return;
  toggleVisibility(false)
}

function onFocus(event: FocusEvent) {
  toggleVisibility(true)
}

function onBlur(event: FocusEvent) {
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

function handleTriggers() {
  ([] as Trigger[]).concat(trigger).forEach((t: Trigger) => {
    switch (t) {
      case "toggle": {
        if (!triggerRef.value) return;
        triggerRef.value.addEventListener("click", onToggle);
        break;
      }

      case "hover": {
        if (!triggerRef.value || !tooltipRef.value) return;

        triggerRef.value.addEventListener("mouseenter", onMouseEnter)
        triggerRef.value.addEventListener("mouseout", onMouseOut)
        tooltipRef.value.addEventListener("mouseenter", onMouseEnter)
        tooltipRef.value.addEventListener("mouseout", onMouseOut)
        break;
      }

      case "focus": {
        if (!triggerRef.value) return;

        triggerRef.value.addEventListener("focus", onFocus);
        triggerRef.value.addEventListener("blur", onBlur);
        break;
      }
    }
  });
}

onMounted(() => {
  handleTriggers();
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.code === 'Escape') toggleVisibility(false)
  })
})

onUnmounted(() => {
  // controller.abort();
  // documentController?.abort();
});
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
  --offset: 10px;
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

.tooltip .arrow {
  position: absolute;
  background: var(--tooltip-background);
  border: var(--tooltip-border-width) var(--tooltip-border-style) var(--tooltip-border-color);
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
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
