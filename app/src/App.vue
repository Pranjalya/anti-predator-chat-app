<template>
	<div id="q-app">
		<router-view />
	</div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'

export default {
	methods: {
		...mapActions('store', ['handleAuthStateChanged', 'isBlockedIP']),
	},
	mounted() {
		this.handleAuthStateChanged()
		this.isBlockedIP()
	},
}
</script>

<style></style>
