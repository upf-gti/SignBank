<template>
    <div>
        <div v-if="loading" class="flex flex-center q-pa-xl">
            <q-spinner size="3em" color="primary" />
            <span class="q-ml-sm">{{ translate('common.loading') }}</span>
        </div>
        
        <div v-else-if="error" class="text-center q-pa-md">
            <div class="text-negative text-h6">{{ error }}</div>
            <q-btn color="primary" :label="translate('common.goBack')" @click="$router.go(-1)" class="q-mt-md" />
        </div>
        
        <div v-else>
            <div class="row justify-between items-center q-pb-md">
                <q-btn flat icon="arrow_back" :label="translate('common.back')" @click="$router.go(-1)" />
                
                <div class="row q-gutter-sm" v-if="editMode === 'none'">
                    <q-btn outline color="primary" :label="translate('word_detail.action.requestEdit')" @click="startEdit('strict')" />
                    <q-btn outline color="primary" :label="translate('word_detail.action.createNewWord')" @click="startEdit('full')" />
                </div>
            </div>
            
            <WordDetail 
                :word="wordData" 
                :editMode="editMode"
                @save="saveWord"
                @cancel="cancelEdit"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { api } from 'src/services/api'
import WordDetail from 'src/components/WordDetail.vue'
import { useQuasar } from 'quasar'
import { Words, WordStatus } from 'src/types/word'
import translate from 'src/utils/translate'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const word = route.params.word as string

// State
const wordData = ref<Words | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const editMode = ref<'none' | 'strict' | 'full'>('none')

// Fetch the word data
async function fetchWordData() {
    try {
        loading.value = true
        error.value = null
        
        // Get the word ID from the route
        const response = await api.words.details(word)
        
        if (response.data) {
            wordData.value = response.data
        } else {
            error.value = translate('word_detail.error.notFound')
        }
    } catch (err) {
        console.error('Error fetching word details:', err)
        error.value = translate('word_detail.error.loadingFailed')
    } finally {
        loading.value = false
    }
}

// Start editing in selected mode
function startEdit(mode: 'strict' | 'full') {
    editMode.value = mode
    
    if (mode === 'full') {
        // For full edit, we start with a new word
        wordData.value = {
            id: '',
            word: '',
            description: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorId: '', // This will be set by the backend
            isNative: true,
            status: WordStatus.PUBLISHED,
            currentVersion: 1,
            isCreatedFromRequest: false,
            isCreatedFromEdit: false,
            senses: []
        }
    }
}

// Save edited word
async function saveWord(updatedWord: Words) {
    try {
        loading.value = true
        
        if (editMode.value === 'strict') {
            // Request edit to existing word
            await api.words.requestEdit(updatedWord)
            $q.notify({
                color: 'positive',
                message: translate('word_detail.success.editSubmitted'),
                icon: 'check_circle'
            })
        } else if (editMode.value === 'full') {
            // Create new word
            await api.words.create(updatedWord)
            $q.notify({
                color: 'positive',
                message: translate('word_detail.success.created'),
                icon: 'check_circle'
            })
        }
        
        // Reset edit mode
        editMode.value = 'none'
        
        // If we're editing an existing word, refresh the data
        if (wordData.value && wordData.value.id) {
            fetchWordData()
        } else {
            // For new words, go back to the search page
            router.push({ name: 'home' })
        }
    } catch (err) {
        console.error('Error saving word:', err)
        $q.notify({
            color: 'negative',
            message: translate('word_detail.error.savingFailed'),
            icon: 'error'
        })
    } finally {
        loading.value = false
    }
}

// Cancel editing
function cancelEdit() {
    if (editMode.value === 'strict') {
        // If we're editing an existing word, reload it
        fetchWordData()
    }
    
    editMode.value = 'none'
}

// Load data when component mounts
onMounted(() => {
    fetchWordData()
})
</script>