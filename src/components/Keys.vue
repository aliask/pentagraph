<script setup>
import { ref, watch } from 'vue'
import { useKeyStore } from '@/stores/keys'

const keys = useKeyStore()

const showAddPrivateKeys = ref(false)
const newPrivateKey = ref('')
const newPrivateKeyName = ref('')
const newPrivateKeyIsValid = ref(false)
const passphrase = ref('')

const showAddPublicKeys = ref(false)
const newPublicKey = ref('')
const newPublicKeyName = ref('')
const newPublicKeyIsValid = ref(false)

async function checkPrivateKey(event) {
  let newKey = await keys.checkKey(newPrivateKey.value)
  if(newKey) {
    newPrivateKeyIsValid.value = true
    newPrivateKeyName.value = newKey.name
  } else {
    newPrivateKeyIsValid.value = false
    newPrivateKeyName.value = ''
  }
}
watch(newPrivateKey, checkPrivateKey)

async function checkPublicKey(event) {
  let newKey = await keys.checkKey(newPublicKey.value)
  if(newKey) {
    newPublicKeyIsValid.value = true
    newPublicKeyName.value = newKey.name
  } else {
    newPublicKeyIsValid.value = false
    newPublicKeyName.value = ''
  }
}
watch(newPublicKey, checkPublicKey)

async function doUnlock() {
  return keys.unlock(passphrase.value)
    .then(unlocked => {
      if(unlocked)
        passphrase.value = ''
    }).catch(e => {})
}
watch(passphrase, doUnlock)

async function addPrivateKey(newKey) {
  keys.addKey(newKey).then(e => {
    newPrivateKey.value = ""
    showAddPrivateKeys.value = false
  })
}

async function addPublicKey(newKey) {
  keys.addKey(newKey).then(e => {
    newPublicKey.value = ""
    showAddPublicKeys.value = false
  })
}

const isDragging = ref(false)

async function onDrag(e) {
  isDragging.value = true
}

async function onDragLeave(e) {
  isDragging.value = false
}

async function onDrop(dropEvent) {
  [...dropEvent.dataTransfer.files].forEach(file => {
    let reader = new FileReader()
    reader.onload = (readEvent => {
      keys.addKey(readEvent.target.result)
    })
    reader.readAsText(file)
  })
  isDragging.value = false
}
</script>

<template>
  <h2>Keys</h2>
  <span class="info">Drag key files in to load</span>
  <div class="keys" @drop.stop.prevent="onDrop" @dragover.prevent="onDrag" @dragleave="onDragLeave">
    <div id="dropzone" v-if="isDragging"><span>Drop keys to load</span></div>
    <div v-if="!isDragging">
      <h3>Private Keys</h3>
      <ul class="keyList">
        <li
          v-for="privKey in keys.privateKeys"
          :title="'Fingerprint: ' + privKey.fingerprint"
          :class="[
            { active: privKey == keys.activePrivateKey },
            { locked: keys.privateKeyLocked }
          ]"
        >
          <a href="#" class="key" @click="keys.setPrivateKey(privKey.fingerprint)">{{ privKey.name }}</a>
          -
          <a href="#" @click="keys.deletePrivateKey(privKey.fingerprint)">Delete</a>
        </li>
        
        <li v-if="keys.privateKeyLocked">
          <h3>Passphrase</h3>
          <input v-model="passphrase" type="password">
        </li>
        <li v-if="!showAddPrivateKeys">
          <button @click="showAddPrivateKeys = true">
            Add a new private key
          </button>
        </li>
      </ul>

      <div v-if="showAddPrivateKeys" class="addKeyAside">
        <textarea
          @keydown.esc="showAddPrivateKeys = false"
          v-model="newPrivateKey"
          class="keyInput"
          :class="{ finished: newPrivateKeyIsValid }"
        ></textarea>
        <span v-if="newPrivateKeyIsValid">Key UserID: {{ newPrivateKeyName }}</span>
        <div class="buttongroup">
          <button @click="showAddPrivateKeys = false">Cancel</button>
          <button class="accept" @click="addPrivateKey(newPrivateKey)" :disabled="!newPrivateKeyIsValid">Add</button>
        </div>
      </div>
    </div>

    <div v-if="!isDragging">
      <h3>Public Keys</h3>
      <ul class="keyList">
        <li v-for="pubKey in keys.publicKeys" :title="'Fingerprint: ' + pubKey.fingerprint" :class="{ active: pubKey == keys.activePublicKey }">
          <a href="#" class="key" @click="keys.setPublicKey(pubKey.fingerprint)">{{ pubKey.name }}</a>
          -
          <a href="#" @click="keys.deletePublicKey(pubKey.fingerprint)">Delete</a>
        </li>
        <li v-if="!showAddPublicKeys">
          <button @click="showAddPublicKeys = true">
            Add a new public key
          </button>
        </li>
      </ul>

      <div v-if="showAddPublicKeys" class="addKeyAside">
        <textarea
          @keydown.esc="showAddPublicKeys = false"
          v-model="newPublicKey"
          class="keyInput"
          :class="{ finished: newPublicKeyIsValid }"
        ></textarea>
        <span v-if="newPublicKeyIsValid">Key UserID: {{ newPublicKeyName }}</span>
        <div class="buttongroup">
          <button @click="showAddPublicKeys = false">Cancel</button>
          <button class="accept" @click="addPublicKey(newPublicKey)" :disabled="!newPublicKeyIsValid">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .keys {
    display: flex;
    flex-direction: row;
    gap: 2em;
    place-items: center;
    width: 100%;
  }
}

.keys > * {
  flex: 1;
}

.info {
  font-size: small;
}

.info:before {
  content: 'ℹ️';
  margin-right: 0.1em;
}

#dropzone {
  height: 10em;
  border-radius: 1em;
  margin: 1em;
  border: 3px dashed var(--vt-c-primary);
  display: flex;
  place-items: center;
}

#dropzone > span {
  flex: 1;
  color: var(--vt-c-primary);
  font-weight: 700;
}

.keyList {
  list-style: none;
  padding: 0.5em;
}

.keyList > * {
  padding: 0.3em;
}

a.key::before {
  content: '⚫';
  margin-right: 0.1em;
}

.active.locked > a.key::before {
  content: '🔒';
  margin-right: 0.1em;
}

.active > a.key::before {
  content: '🟢';
  margin-right: 0.1em;
}

button {
  display: inline-block;
  outline: none;
  cursor: pointer;
  border-radius: 0.25em;
  padding: 0.5em 1em;
  border: none;
  color: #fff;
  background-color: hsl(220, 10%, 30%);
  transition: background-color 0.2s ease, color 0.2s ease;
}

button:hover {
  background-color: hsl(220, 10%, 40%);
}

button.accept {
  background-color: var(--vt-c-primary);
  font-weight: 700;
}

button.accept:hover {
  background-color: var(--vt-c-primary-highlight);
}

.buttongroup {
  display: flex;
  flex-direction: row;
  gap: 2em;
}

.buttongroup > * {
  flex: 1;
}

.addKeyAside {
  display: flex;
  flex-direction: column;
  gap: 1em;
  justify-items: start;
}
</style>
