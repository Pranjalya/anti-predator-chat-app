<template>
  <div :class="{ invisible: !showMessages }" class="q-pa-md column col justify-end" ref="chatArea">
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
      :name="'Chary Chatbot'"
      :text="['Welcome to the Chary Chatbot! Want to help build a better environment for the society? Well, what we provide is as unique as anything can get! We will provide you with some AI generated abuses, please try to label them accordingly, so we can build a more robust toxicity classifier for you and rest of the world. Also, your work will not go in vain. You will be rewarded accordingly. 😉', 'To start, please type /start', 'Then please select the text, report and label it accordingly.', 'You can leave the chat at any time. Thank you!']"
      :bg-color="message.from == 'me' ? 'amber-7' : 'primary'"
      :text-color="message.from == 'me' ? 'black' : 'white'"
      :sent="message.from == 'me' ? true : false"
      :stamp="message.timestamp"
      @contextmenu.prevent="select(message)"
    />

    <q-chat-message
      v-for="message in messages"
      v-bind:key="message.index"
      :name="message.from == 'me' ? 'Me' : 'Chary Chatbot'"
      :text="[message.text]"
      :sent="message.from == 'me' ? true : false"
      :bg-color="message.from == 'me' ? 'amber-7' : 'primary'"
      :text-color="message.from == 'me' ? 'black' : 'white'"
      :stamp="message.timestamp"
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
</template>

<script>
import axios from "axios";
const fs = require("fs");
var reported = require("@/assets/data/reported.json");

export default {
  data() {
    return {
      newMessage: "",
      messages: [],
      showMessages: true,
      count: 0,
      selected: -1,
      stars: 3,
      card: false,
      severity: 0,
      selectedmessage: "",
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
  methods: {
    sendMessage() {
      this.messages.push({
        id: this.count,
        from: "me",
        text: this.newMessage,
        timestamp: new Date().toLocaleString(),
        blur: false,
      });
      if (this.newMessage.startsWith("/start")) {
        axios
          .post("http://15.207.99.158:6000/gettoxic")
          .then(function (response) {
            console.log(response);
          });
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
      this.selectedmessage = message,text;
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
  },
};
</script>

<style lang="scss" scoped>
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

</style>