<script lang="ts">
  import type { Snippet } from "svelte";
  import { useWindowSize } from "../../lib/runes/useWindowSize.svelte.ts";
  import { clsx } from "clsx";
  import AnimatedHeroSlice from "./AnimatedHeroSlice.svelte";

  let props: { class: string; children: Snippet } = $props();
  let windowSize = useWindowSize();
  const sliceWidth = 72
  let slices = $derived(Math.floor(windowSize.width / sliceWidth));
  let duration = $derived(0.015 * windowSize.width);
</script>

<div class={clsx(props.class, "relative hero overflow-hidden")}>
  <div class="container max-w-[960px]">
    {@render props.children()}
  </div>

  <div class="absolute inset-0 flex -z-1 overflow-hidden hero-bg">
  </div>

</div>

<style>

</style>
