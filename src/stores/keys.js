import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as openpgp from 'openpgp'

export const useKeyStore = defineStore('keys', () => {
  const privateKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-privkeys')) || [])
  const selectedPrivateKey = ref('')

  const publicKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-pubkeys')) || [])
  const selectedPublicKey = ref('')

  const activePublicKey = computed(() => {
    return publicKeys.value.find(e => e.fingerprint == selectedPublicKey.value) || {}
  })

  const activePrivateKey = computed(() => {
    return privateKeys.value.find(e => e.fingerprint == selectedPrivateKey.value) || {}
  })

  const privateKeyLocked = computed(() => {
    if(!_privateKey.value) {
      // No key selected, so not "locked"
      return false
    }
    return !_privateKey.value.getKeys()[0].isDecrypted()
  })

  const _privateKey = ref()
  async function setPrivateKey(fingerprint) {
    selectedPrivateKey.value = fingerprint
    try {
      _privateKey.value = await openpgp.readKey({ armoredKey: activePrivateKey.value.key })
    } catch (error) {
      _privateKey.value = null
    }
  }

  async function unlock(passphrase) {
    if(!privateKeyLocked.value)
      return Promise.resolve(true)

    _privateKey.value = await openpgp.decryptKey({
      privateKey: await openpgp.readKey({ armoredKey: activePrivateKey.value.key }),
      passphrase
    })
    return Promise.resolve(!privateKeyLocked.value)
  }

  async function setPublicKey(fingerprint) {
    selectedPublicKey.value = fingerprint
  }

  async function addKey(armoredKey) {
    let key = await openpgp.readKey({ armoredKey })
    let newKey = {
      name: (await key.getPrimaryUser()).user.userID.userID,
      fingerprint: key.getFingerprint(),
      key: armoredKey
    }
    if (key.isPrivate()) {
      privateKeys.value.push(newKey)
      localStorage.setItem('pgp-webui-privkeys', JSON.stringify(privateKeys.value))
    } else {
      publicKeys.value.push(newKey)
      localStorage.setItem('pgp-webui-pubkeys', JSON.stringify(publicKeys.value))
    }
  }

  async function checkKey(armoredKey) {
    try {
      let key = await openpgp.readKey({ armoredKey })
      let newKey = {
        name: (await key.getPrimaryUser()).user.userID.userID,
        fingerprint: key.getFingerprint(),
        key: armoredKey
      }
      return newKey
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async function deleteKey(fingerprint) {
    publicKeys.value = publicKeys.value.filter((e) => {
      e.fingerprint != fingerprint
    })
    localStorage.setItem('pgp-webui-pubkeys', JSON.stringify(publicKeys.value))
    privateKeys.value = privateKeys.value.filter((e) => {
      e.fingerprint != fingerprint
    })
    localStorage.setItem('pgp-webui-privkeys', JSON.stringify(privateKeys.value))
  }

  async function encrypt(plaintext) {
    if(!activePublicKey.value.key)
      return Promise.reject(new Error("Select a public key first"))
  
    const publicKey = await openpgp.readKey({ armoredKey: activePublicKey.value.key })
    return openpgp.encrypt({
      message: await openpgp.createMessage({ text: plaintext }),
      encryptionKeys: publicKey
    })
  }

  async function decrypt(ciphertext) {
    if(!activePrivateKey.value.key)
      return Promise.reject(new Error("Select a private key first"))
    if(privateKeyLocked.value)
      return Promise.reject(new Error("Key must be unlocked first"))
    if(!ciphertext) {
      return Promise.reject(new Error("Enter an encrypted message"))
    }
    return openpgp.decrypt({
      message: await openpgp.readMessage({ armoredMessage: ciphertext }),
      decryptionKeys: _privateKey.value
    })
  }
  
  return {
    privateKeys,
    publicKeys,
    activePublicKey,
    activePrivateKey,
    privateKeyLocked,
    setPrivateKey,
    setPublicKey,
    addKey,
    checkKey,
    deleteKey,
    decrypt,
    unlock,
    encrypt
  }
})
