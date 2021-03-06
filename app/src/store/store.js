import Vue from 'vue'
import { firebaseAuth, firebaseDb } from './firebase'
import router from '../router/index'
import axios from 'axios'

let messagesRef

const state = {
    userDetails: {},
    users: {},
    messages: {},
}

const mutations = {
    setUserDetails(state, payload) {
        state.userDetails = payload
    },
    addUser(state, payload) {
        Vue.set(state.users, payload.userId, payload.userDetails)
    },
    updateUser(state, payload) {
        Object.assign(state.users[payload.userId], payload.userDetails)
    },
    addMessage(state, payload) {
        Vue.set(state.messages, payload.messageId, payload.messageDetails)
    },
    clearMessages(state) {
        state.messages = {}
    },
}

const actions = {
    registerUser({ }, payload) {
        axios
            .get('https://api.ipify.org?format=json')
            .then(ip => {
                console.log(ip)
                firebaseAuth
                    .createUserWithEmailAndPassword(payload.email, payload.password)
                    .then(response => {
                        console.log(response)
                        let userId = firebaseAuth.currentUser.uid
                        firebaseDb.ref('users/' + userId).set({
                            name: payload.name,
                            email: payload.email,
                            age: payload.age,
                            negativePoints: 0,
                            ip: ip.data.ip,
                            online: true,
                        })
                    })
                    .catch(error => {
                        console.log(error.message)
                        alert(error.message)
                    })
            })
            .catch(err => {
                alert(
                    "Sorry, there was some trouble. Please perform the ioperation again. Hope you aren't mad at us. 😅"
                )
            })
    },

    loginUser({ }, payload) {
        firebaseAuth
            .signInWithEmailAndPassword(payload.email, payload.password)
            .then(response => {
                console.log(response)
            })
            .catch(error => {
                console.log(error.message)
                alert(error.message)
            })
    },

    logoutUser() {
        firebaseAuth.signOut()
    },

    uploadImage(avatar) {
        if (avatar) {
            let imageFileName
            let imageToBeUploaded = {}
            const uploadTask = firebaseDb
                .ref('users/' + payload.userId)
                .put({ image: avatar })

            uploadTask.on(
                'state_changed',
                null,
                err => {
                    this.props.showToast(0, err.message)
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => { })
                }
            )
        } else {
            this.updateUserInfo(false, null)
        }
    },

    // Handles user status
    handleAuthStateChanged({ commit, dispatch, state }) {
        firebaseAuth.onAuthStateChanged(user => {
            if (user) {
                // User is logged in.
                let userId = firebaseAuth.currentUser.uid
                firebaseDb.ref('users/' + userId).once('value', snap => {
                    let userDetails = snap.val()
                    commit('setUserDetails', {
                        name: userDetails.name,
                        email: userDetails.email,
                        age: userDetails.age,
                        negativePoints: userDetails.negativePoints,
                        userId: userId,
                        ip: userDetails.ip,
                    })
                })
                dispatch('firebaseUpdateUser', {
                    userId: userId,
                    updates: {
                        online: true,
                    },
                })
                dispatch('firebaseGetUsers')
                try {
                    router.push('/')
                } catch (err) {
                    console.log(err);
                }
            } else {
                // User is logged out.
                dispatch('firebaseUpdateUser', {
                    userId: state.userDetails.userId,
                    updates: {
                        online: false,
                    },
                })
                commit('setUserDetails', {})
                router.replace('/auth')
            }
        })
    },

    firebaseUpdateUser({ }, payload) {
        if (payload.userId) {
            firebaseDb.ref('users/' + payload.userId).update(payload.updates)
        }
    },

    firebaseGetUsers({ commit }) {
        firebaseDb.ref('users').on('child_added', snapshot => {
            let userDetails = snapshot.val()
            let userId = snapshot.key
            commit('addUser', {
                userId,
                userDetails,
            })
        })

        firebaseDb.ref('users').on('child_changed', snapshot => {
            let userDetails = snapshot.val()
            let userId = snapshot.key
            commit('updateUser', {
                userId,
                userDetails,
            })
        })
    },

    firebaseGetMessages({ commit, state }, otherUserId) {
        let userId = state.userDetails.userId
        messagesRef = firebaseDb.ref('chats/' + userId + '/' + otherUserId)
        messagesRef.on('child_added', snapshot => {
            let messageDetails = snapshot.val()
            let messageId = snapshot.key
            commit('addMessage', {
                messageId,
                messageDetails,
            })
        })
    },

    firebaseStopGettingMessages({ commit }) {
        if (messagesRef) {
            messagesRef.off('child_added')
            commit('clearMessages')
        }
    },

    firebaseSendMessage({ }, payload) {
        firebaseDb
            .ref('chats/' + state.userDetails.userId + '/' + payload.otherUserId)
            .push(payload.message)

        payload.message.from = 'them'
        firebaseDb
            .ref('chats/' + payload.otherUserId + '/' + state.userDetails.userId)
            .push(payload.message)
    },
	registerUser({}, payload) {
		axios
			.get('https://api.ipify.org?format=json')
			.then(ip => {
				console.log(ip)
				firebaseAuth
					.createUserWithEmailAndPassword(payload.email, payload.password)
					.then(response => {
						console.log(response)
						let userId = firebaseAuth.currentUser.uid
						firebaseDb.ref('users/' + userId).set({
							name: payload.name,
							email: payload.email,
							age: payload.age,
							negativePoints: 0,
							ip: ip.data.ip,
							online: true,
						})
					})
					.catch(error => {
						console.log(error.message)
						alert(error.message)
					})
			})
			.catch(err => {
				alert(
					"Sorry, there was some trouble. Please perform the ioperation again. Hope you aren't mad at us. 😅"
				)
			})
	},

	blockIP() {
		if (ip) {
			firebaseDb
				.ref('blocked')
				.push(ip, err =>
					console.log(err ? 'error while pushing ip' : 'ip pushed successfully')
				)
		}
	},

	isBlockedIP() {
		axios
			.get('https://api.ipify.org?format=json')
			.then(ip => {
				console.log(ip.data.ip)
				console.log('checkingIP')
				var ref = firebaseDb.ref(`blocked`)
				ref
					.once('value')
					.then(function(snap) {
						var array = snap.val()
						for (var i in array) {
							var value = array[i]
							if (value == ip.data.ip) {
								window.location.href = '/404'
								console.log('IP exists!!')
							}
						}
					})
					.catch(err => console.log(err))
			})
			.catch(err => console.error(err))
	},

	loginUser({}, payload) {
		firebaseAuth
			.signInWithEmailAndPassword(payload.email, payload.password)
			.then(response => {
				console.log(response)
			})
			.catch(error => {
				console.log(error.message)
				alert(error.message)
			})
	},

	logoutUser() {
		firebaseAuth.signOut()
	},

	uploadImage(avatar) {
		if (avatar) {
			let imageFileName
			let imageToBeUploaded = {}
			const uploadTask = firebaseDb
				.ref('users/' + payload.userId)
				.put({ image: avatar })

			uploadTask.on(
				'state_changed',
				null,
				err => {
					this.props.showToast(0, err.message)
				},
				() => {
					uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {})
				}
			)
		} else {
			this.updateUserInfo(false, null)
		}
	},

	// Handles user status
	handleAuthStateChanged({ commit, dispatch, state }) {
		firebaseAuth.onAuthStateChanged(user => {
			if (user) {
				// User is logged in.
				let userId = firebaseAuth.currentUser.uid
				firebaseDb.ref('users/' + userId).once('value', snap => {
					let userDetails = snap.val()
					commit('setUserDetails', {
						name: userDetails.name,
						email: userDetails.email,
						age: userDetails.age,
						negativePoints: userDetails.negativePoints,
						userId: userId,
						ip: userDetails.ip,
					})
				})
				dispatch('firebaseUpdateUser', {
					userId: userId,
					updates: {
						online: true,
					},
				})
				dispatch('firebaseGetUsers')
				router.push('/')
			} else {
				// User is logged out.
				dispatch('firebaseUpdateUser', {
					userId: state.userDetails.userId,
					updates: {
						online: false,
					},
				})
				commit('setUserDetails', {})
				router.replace('/auth')
			}
		})
	},

	firebaseUpdateUser({}, payload) {
		if (payload.userId) {
			firebaseDb.ref('users/' + payload.userId).update(payload.updates)
		}
	},

	firebaseGetUsers({ commit }) {
		firebaseDb.ref('users').on('child_added', snapshot => {
			let userDetails = snapshot.val()
			let userId = snapshot.key
			commit('addUser', {
				userId,
				userDetails,
			})
		})

		firebaseDb.ref('users').on('child_changed', snapshot => {
			let userDetails = snapshot.val()
			let userId = snapshot.key
			commit('updateUser', {
				userId,
				userDetails,
			})
		})
	},

	firebaseGetMessages({ commit, state }, otherUserId) {
		let userId = state.userDetails.userId
		messagesRef = firebaseDb.ref('chats/' + userId + '/' + otherUserId)
		messagesRef.on('child_added', snapshot => {
			let messageDetails = snapshot.val()
			let messageId = snapshot.key
			commit('addMessage', {
				messageId,
				messageDetails,
			})
		})
	},

	firebaseStopGettingMessages({ commit }) {
		if (messagesRef) {
			messagesRef.off('child_added')
			commit('clearMessages')
		}
	},

	firebaseSendMessage({}, payload) {
		firebaseDb
			.ref('chats/' + state.userDetails.userId + '/' + payload.otherUserId)
			.push(payload.message)

		payload.message.from = 'them'
		firebaseDb
			.ref('chats/' + payload.otherUserId + '/' + state.userDetails.userId)
			.push(payload.message)
	},
}

const getters = {
    users: state => {
        let usersFiltered = {}
        Object.keys(state.users).forEach(key => {
            if (key !== state.userDetails.userId) {
                usersFiltered[key] = state.users[key]
            }
        })
        return usersFiltered
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
}
