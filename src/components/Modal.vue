<template>
	<div class="modal-backdrop" @click="$emit( 'close' )">
		<div class="modal" @click.stop>
			<button class="close-button" @click="$emit( 'close' )">&times;</button>
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
/*scripthere*/
</script>

<style scoped>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.modal {
		background-color: var(--color-background);
		padding: 1rem;
		border-radius: 8px;
		width: 80%;
		height: 80%;
		overflow: auto;
		position: relative;
	}

	.close-button {
		position: absolute;
		top: 2px;
		right: 2px;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-text);
		cursor: pointer;
		z-index:1000;
	}
</style>