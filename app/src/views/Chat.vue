<template>
  <q-page ref="Chat" :class="$q.dark.isActive ? 'chatdark flex column' : 'chatlight flex column'">
    <q-banner inline-actions class="text-white bg-red" v-if="selected!=-1">
      Do you want to report this mesage?
      <template v-slot:action>
        <q-btn flat color="white" label="Dismiss" @click.prevent.stop="selected=-1" />
        <q-btn flat color="white" label="Report this message" @click.prevent.stop="report" />
      </template>
    </q-banner>

    <q-banner
      v-if="!otherUserDetails.online"
      class="bg-grey-4 text-center"
    >{{ otherUserDetails.name }} : offline.</q-banner>
    <!-- overlay in q-drawer-->
    <!-- 
    <q-drawer v-model="left" side="left" elevated>
      <users />
    </q-drawer>-->
    <!-- <div v-if="otherUserDetails.name!='Chary ChatBot'"> -->
      <div
        :class="{ invisible: !showMessages }"
        class="q-pa-md column col justify-end"
        ref="chatArea"
      >
        <q-dialog v-model="card">
          <q-card class="my-card">
            <q-img :src="require('../assets/note.jpg')" />
            <q-card-section>
              <q-btn
                fab
                color="primary"
                icon="place"
                class="absolute"
                style="top: 0; right: 12px; transform: translateY(-50%);"
              />

              <div class="row no-wrap items-center">
                <div class="col text-h6 ellipsis">Report toxic messages</div>
                <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">Help</div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-subtitle1">Please choose labels for the message.</div>
              <div>
                <q-toggle v-model="labels.toxicity" color="red" icon="warning" label="Toxicity" />
                <q-toggle
                  v-model="labels.severe_toxicity"
                  color="orange"
                  icon="warning"
                  label="Severe Toxicity"
                />
                <q-toggle
                  v-model="labels.identity_attack"
                  color="green"
                  icon="warning"
                  label="Identity Attack"
                />
                <q-toggle v-model="labels.insult" color="pink" icon="warning" label="Insult" />
                <q-toggle v-model="labels.obscene" color="teal" icon="warning" label="Obscene" />
                <q-toggle
                  v-model="labels.sexually_explicit"
                  color="blue"
                  icon="warning"
                  label="Sexually Explicit"
                />
                <q-toggle v-model="labels.threat" color="grey" icon="warning" label="Threat" />
              </div>
            </q-card-section>

            <q-item-label header>Please rate the severity of toxicity</q-item-label>
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="warning" />
              </q-item-section>
              <q-item-section>
                <q-rating v-model="stars" icon="warning" :max="5" size="32px" color="red" />
              </q-item-section>
            </q-item>Want to help us build a safer online environment for the society? Share the reported logs with us for research purposes. Your data will be submitted anonymously. Please find the link in bottom right of User list. 😃
            <q-card-actions align="right">
              <q-btn
                v-close-popup
                flat
                color="primary"
                label="Report"
                @click.prevent.stop="submitReport"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-chat-message
          v-for="message in messages"
          :ref="message.id"
          v-bind:key="message.index"
          :name="message.from == 'me' ? userDetails.name : otherUserDetails.name"
          :text="[message.text]"
          :sent="message.from == 'me' ? true : false"
          :bg-color="message.from == 'me' ? 'amber-7' : 'primary'"
          :text-color="message.from == 'me' ? 'black' : 'white'"
          :stamp="message.timestamp"
          :class="message.from != 'me' && checkToxicity(message) && message.blur ? 'blur' : {}"
          @contextmenu.prevent="select(message)"
        />

        <q-footer elevated style="background-color: #010101">
          <q-toolbar>
            <q-form @submit.prevent.stop="sendMessage" class="full-width message-input">
              <q-input
                v-model="newMessage"
                ref="newMessage"
                :bg-color="$q.dark.isActive ? 'grey' : 'white'"
                outlined
                rounded
                label="Message"
                @keydown.enter.prevent="sendMessage"
                dense
              >
                <template v-slot:after>
                  <q-btn
                    round
                    dense
                    flat
                    type="submit"
                    color="white"
                    icon="send"
                    @click.prevent.stop="sendMessage"
                  />
                </template>
              </q-input>
            </q-form>
          </q-toolbar>
        </q-footer>
      </div>
    <!-- </div> -->
    <!-- <div v-else>
      <chatbot />
    </div> -->
  </q-page>
</template>

<script>
// <q-menu>
// <q-item clickable v-close-popup>
// <q-item-section>New tab</q-item-section>
// </q-item>
// </q-menu>
// </q-chat-message>
import users from "./Users";
import chatbot from "../components/ChatBot.vue";
import { mapState, mapActions } from "vuex";
import mixinOtherUserDetails from "@/mixins/OtherUserDetails.js";
// import reported from "../assets/data/reported.json";
// console.log(reported);
import * as toxicity from "@tensorflow-models/toxicity";
import * as tf from "@tensorflow/tfjs";

let min_diff, hour_diff;
const threshold = 0.85;

export default {
  mixins: [mixinOtherUserDetails],
  data() {
    return {
      newMessage: "",
      showMessages: false,
      selected: -1,
      stars: 3,
      card: false,
      severity: 0,
      labels: {
        toxicity: true,
        severe_toxicity: false,
        identity_attack: false,
        insult: false,
        obscene: false,
        sexually_explicit: false,
        threat: false,
      },
    };
  },

  components: {
    users,
    chatbot,
  },

  computed: {
    ...mapState("store", ["messages", "userDetails"]),
    getSelected() {
      return this.selected;
    },
    getMessages() {
      return this.messages;
    },
  },
  methods: {
    ...mapActions("store", [
      "firebaseGetMessages",
      "firebaseStopGettingMessages",
      "firebaseSendMessage",
    ]),
    sendMessage() {
      if (this.newMessage != "") {
        console.log("sending message");
        console.log(this.userDetails.userId + new Date().toLocaleString());
        this.firebaseSendMessage({
          message: {
            text: this.newMessage,
            timestamp: new Date().toLocaleString(),
            from: "me",
            blur: "false",
            id: this.userDetails.userId + new Date().toLocaleString(),
          },
          otherUserId: this.$route.params.otherUserId,
        });
        this.clearMessage();
      }
    },
    clearMessage() {
      this.newMessage = "";
      this.$refs.newMessage.focus();
    },
    scrollToBottom() {
      let chat = this.$refs.Chat.$el;
      setTimeout(() => {
        window.scrollTo(0, chat.scrollHeight);
      }, 20);
    },
    getStamp(timestamp) {
      return timestamp;
    },
    select(message) {
      console.log("selected", message);
      (this.selectedmessage = message), text;
      this.selected = message;
    },
    report() {
      this.card = true;
      this.selected = -1;
    },
    submitReport() {
      console.log("message");
      reported.push({
        message: this.selectedmessage,
        toxicity: this.severity,
        labels: {
          toxicity: this.labels.toxicity,
          severe_toxicity: this.labels.toxicity,
          identity_attack: this.labels.toxicity,
          insult: this.labels.toxicity,
          obscene: this.labels.toxicity,
          sexually_explicit: this.labels.toxicity,
          threat: this.labels.toxicity,
        },
      });
      fs.writeFile(
        "@/assets/data/reported.json",
        JSON.stringify(reported),
        (err) => {
          console.log("Done writing"); // Success
        }
      );
      this.selected = -1;
      this.card = false;
    },
    activateOnlineGroomingDetector() {},
    checkToxicity(message) {
      var res = false;
      // tf.engine().startScope();
      // toxicity
      //   .load(threshold, ["toxicity"])
      //   .then((model) => {
      //     // Now you can use the `model` object to label sentences.
      //     model.classify([message.text]).then((predictions) => {
      //       message.blur = true;
      //       res = predictions[0].results[0].match;
      //       console.log("Result. ", res);
      //     });
      //   })
      //   .catch((err) => console.log);
      // tf.engine().endScope();
      return res;
    },
  },
  watch: {
    messages: function (val) {
      if (Object.keys(val).length) {
        this.scrollToBottom();
        setTimeout(() => {
          this.showMessages = true;
        }, 200);
      }
    },
  },
  mounted() {
    let vm = this;
    this.firebaseGetMessages(this.$route.params.otherUserId).then(() => {});
    if (this.userDetails.age < 16) {
      this.activateOnlineGroomingDetector();
    }
  },
  destroyed() {
    this.firebaseStopGettingMessages();
  },
};
</script>

<style lang="scss">
$light: #e2dfd5;
$white: #fff;
$beige: #c0c0c0;
$dark: #000;
$grey: #282828;
$lightgrey: #484848;

.message-input {
  padding: 10px;
}

.blur {
  filter: blur(2px);
  -webkit-filter: blur(2px);
}

.chatlight {
  background: $light;
}
.chatlight:after {
  content: "";
  display: block;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.1;
  background-image: radial-gradient(
      circle at 100% 150%,
      $beige 35%,
      $white 25%,
      $white 28%,
      $beige 29%,
      $beige 36%,
      $white 36%,
      $white 40%,
      transparent 40%,
      transparent
    ),
    radial-gradient(
      circle at 0 150%,
      $beige 24%,
      $white 25%,
      $white 28%,
      $beige 29%,
      $beige 36%,
      $white 36%,
      $white 40%,
      transparent 40%,
      transparent
    ),
    radial-gradient(
      circle at 50% 100%,
      $white 10%,
      $beige 11%,
      $beige 23%,
      $white 24%,
      $white 30%,
      $beige 31%,
      $beige 43%,
      $white 44%,
      $white 50%,
      $beige 51%,
      $beige 63%,
      $white 64%,
      $white 71%,
      transparent 71%,
      transparent
    ),
    radial-gradient(
      circle at 100% 50%,
      $white 5%,
      $beige 6%,
      $beige 15%,
      $white 16%,
      $white 20%,
      $beige 21%,
      $beige 30%,
      $white 31%,
      $white 35%,
      $beige 36%,
      $beige 45%,
      $white 46%,
      $white 49%,
      transparent 50%,
      transparent
    ),
    radial-gradient(
      circle at 0 50%,
      $white 5%,
      $beige 6%,
      $beige 15%,
      $white 16%,
      $white 20%,
      $beige 21%,
      $beige 30%,
      $white 31%,
      $white 35%,
      $beige 36%,
      $beige 45%,
      $white 46%,
      $white 49%,
      transparent 50%,
      transparent
    );
  background-size: 100px 50px;
}

.chatdark {
  background: $dark;
}
.chatdark:after {
  content: "";
  display: block;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.1;
  background-image: radial-gradient(
      circle at 100% 150%,
      $lightgrey 35%,
      $grey 25%,
      $grey 28%,
      $lightgrey 29%,
      $lightgrey 36%,
      $grey 36%,
      $grey 40%,
      transparent 40%,
      transparent
    ),
    radial-gradient(
      circle at 0 150%,
      $lightgrey 24%,
      $grey 25%,
      $grey 28%,
      $lightgrey 29%,
      $lightgrey 36%,
      $grey 36%,
      $grey 40%,
      transparent 40%,
      transparent
    ),
    radial-gradient(
      circle at 50% 100%,
      $grey 10%,
      $lightgrey 11%,
      $lightgrey 23%,
      $grey 24%,
      $grey 30%,
      $lightgrey 31%,
      $lightgrey 43%,
      $grey 44%,
      $grey 50%,
      $lightgrey 51%,
      $lightgrey 63%,
      $grey 64%,
      $grey 71%,
      transparent 71%,
      transparent
    ),
    radial-gradient(
      circle at 100% 50%,
      $grey 5%,
      $lightgrey 6%,
      $lightgrey 15%,
      $grey 16%,
      $grey 20%,
      $lightgrey 21%,
      $lightgrey 30%,
      $grey 31%,
      $grey 35%,
      $lightgrey 36%,
      $lightgrey 45%,
      $grey 46%,
      $grey 49%,
      transparent 50%,
      transparent
    ),
    radial-gradient(
      circle at 0 50%,
      $grey 5%,
      $lightgrey 6%,
      $lightgrey 15%,
      $grey 16%,
      $grey 20%,
      $lightgrey 21%,
      $lightgrey 30%,
      $grey 31%,
      $grey 35%,
      $lightgrey 36%,
      $lightgrey 45%,
      $grey 46%,
      $grey 49%,
      transparent 50%,
      transparent
    );
  background-size: 100px 50px;
}

.q-banner {
  top: 50px;
  z-index: 2;
  opacity: 0.8;
}
.q-message {
  z-index: 1;
}
</style>
