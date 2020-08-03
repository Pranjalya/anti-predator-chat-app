<template>
	<div class="fit row wrap justify-around items-start content-start">
		<div class=" col-xs-12 col-md-6">
			<q-form @submit="submitForm" class="form">
				<q-input
					v-if="tab == 'register'"
					v-model="formData.name"
					class="q-mb-md form-input"
					outlined
					label="Name"
				/>
				<q-input
					v-if="tab == 'register'"
					v-model="formData.age"
					class=" form-input"
					outlined
					type="number"
					label="Age"
				/>
				<q-input
					v-model="formData.email"
					class=" form-input"
					outlined
					type="email"
					label="Email"
				/>
				<q-input
					v-model="formData.password"
					class=" form-input"
					outlined
					type="password"
					label="Password"
				/>
				<!-- <q-uploader
			:factory="factoryFn"
			v-if="tab == 'register'"
			style="max-width: 300px"
			@failed="uploadFailed" 
		></q-uploader>-->
				<div class="row mt-4">
					<q-space />
					<q-btn color="primary" type="submit" :label="tab" />
				</div>
			</q-form>
		</div>
		<div class="col-xs-12 col-md-6 tagline">
			Chary is a platform where you can have a toxic less conversation with the
			people in your life. <br />
			Even you can help us to make a toxic free environment too!!
			<div>
				<q-img
					transition="fade"
					:src="require('@/assets/map.png')"
					spinner-color="white"
					class="rounded-borders world-img"
				></q-img>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'

export default {
	props: ['tab'],
	data() {
		return {
			formData: {
				name: '',
				age: '',
				email: '',
				password: '',
				ip: '',
				img: '',
			},
		}
	},
	methods: {
		...mapActions('store', ['registerUser', 'loginUser']),
		submitForm() {
			let vm = this
			if (vm.tab == 'login') {
				vm.loginUser(vm.formData)
			} else {
				vm.registerUser(vm.formData)
			}
		},
		uploadFailed(req) {
			console.log('failed', req)
		},
		factoryFn(file) {
			// returning a Promise
			let vm = this
			return new Promise((resolve, reject) => {
				this.getBase64(file)
					.then(data => {
						// data is base64
						console.log('base64', data)
						vm.formData.img = data
						// simulating a delay of 2 seconds
						setTimeout(() => {
							resolve({
								url: 'http://localhost:4444/upload',
								method: 'POST',
								headers: [{ name: 'Content-Type', value: 'application/json' }],
								fields: [{ name: 'data', value: data }],
							})
						}, 2000)
					})
					.catch(err => {
						console.log(err)
						this.$q.notify({
							color: 'negative',
							message: 'Failed to convert file...',
						})
						reject()
					})
			})
		},
		getBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader()
				// reader.onloadend = (e) => resolve(imageToDataUri(e, 400, 400))
				reader.readAsDataURL(file)
				reader.onload = () => resolve(reader.result)
				reader.onerror = error => reject(error)
			})
		},
	},
}
</script>

<style scoped>
/* html { */
/* height: 100%; */
/* } */
/* body { */
/* margin:0; */
/* padding:0; */
/* font-family: sans-serif; */
/* background: linear-gradient(#141e30, #243b55); */
/* } */

.form-input {
	margin-top: 10px;
	margin-bottom: 20px;
}

.form {
	width: 400px;
}

.login-box {
	position: relative;
	top: 50%;
	left: 50%;
	/* bottom: 200px; */
	width: 400px;
	padding: 40px;
	transform: translate(-50%, -50%);
	background: rgba(0, 0, 0, 0.5);
	box-sizing: border-box;
	box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
	border-radius: 10px;
}

.login-box h2 {
	margin: 0 0 30px;
	padding: 0;
	color: #fff;
	text-align: center;
}

.login-box .user-box {
	position: relative;
}

.world-img {
	width: 100%;
	object-fit: contain;
}

.login-box .user-box input {
	width: 100%;
	padding: 10px 0;
	font-size: 16px;
	color: #fff;
	margin-bottom: 30px;
	border: none;
	border-bottom: 1px solid #fff;
	outline: none;
	background: transparent;
}
.login-box .user-box label {
	position: absolute;
	top: 0;
	left: 0;
	padding: 10px 0;
	font-size: 16px;
	color: #fff;
	pointer-events: none;
	transition: 0.5s;
}

.tagline {
	font-size: 1.5rem;
	font-weight: 600;
	text-align: left;
	color: #666;
}

.login-box .user-box input:focus ~ label,
.login-box .user-box input:valid ~ label {
	top: -20px;
	left: 0;
	color: #03e9f4;
	font-size: 12px;
}

.login-box form a {
	position: relative;
	display: inline-block;
	padding: 10px 20px;
	color: #03e9f4;
	font-size: 16px;
	text-decoration: none;
	text-transform: uppercase;
	overflow: hidden;
	transition: 0.5s;
	margin-top: 40px;
	letter-spacing: 4px;
}

.login-box a:hover {
	background: #03e9f4;
	color: #fff;
	border-radius: 5px;
	box-shadow: 0 0 5px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
		0 0 100px #03e9f4;
}

.login-box a span {
	position: absolute;
	display: block;
}

.login-box a span:nth-child(1) {
	top: 0;
	left: -100%;
	width: 100%;
	height: 2px;
	background: linear-gradient(90deg, transparent, #03e9f4);
	animation: btn-anim1 1s linear infinite;
}

@media (max-width: 900px) {
	.form {
		width: 90%;
	}
}

@keyframes btn-anim1 {
	0% {
		left: -100%;
	}
	50%,
	100% {
		left: 100%;
	}
}

.login-box a span:nth-child(2) {
	top: -100%;
	right: 0;
	width: 2px;
	height: 100%;
	background: linear-gradient(180deg, transparent, #03e9f4);
	animation: btn-anim2 1s linear infinite;
	animation-delay: 0.25s;
}

@keyframes btn-anim2 {
	0% {
		top: -100%;
	}
	50%,
	100% {
		top: 100%;
	}
}

.login-box a span:nth-child(3) {
	bottom: 0;
	right: -100%;
	width: 100%;
	height: 2px;
	background: linear-gradient(270deg, transparent, #03e9f4);
	animation: btn-anim3 1s linear infinite;
	animation-delay: 0.5s;
}

@keyframes btn-anim3 {
	0% {
		right: -100%;
	}
	50%,
	100% {
		right: 100%;
	}
}

.login-box a span:nth-child(4) {
	bottom: -100%;
	left: 0;
	width: 2px;
	height: 100%;
	background: linear-gradient(360deg, transparent, #03e9f4);
	animation: btn-anim4 1s linear infinite;
	animation-delay: 0.75s;
}

@keyframes btn-anim4 {
	0% {
		bottom: -100%;
	}
	50%,
	100% {
		bottom: 100%;
	}
}
</style>
