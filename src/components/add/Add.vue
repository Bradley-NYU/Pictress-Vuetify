<template>
    <v-container fluid>
        <v-row>
            <!-- Left Upload Card -->
            <v-col cols="12" md="6">
                <v-card class="d-flex flex-column align-center justify-center pa-6" height="400" outlined>
                    <v-icon size="48" color="grey">mdi-upload</v-icon>
                    <div class="text-center my-2">Select or drag a file here</div>
                    <div class="text-caption grey--text">
                        We recommend uploading a .jpg file under 20 MB or a .mp4 file under 200 MB.
                    </div>
                    <v-file-input v-model="file" label="Select File" class="mt-4" accept="image/*,video/mp4"
                        prepend-icon="" />
                </v-card>
                <v-btn block class="mt-4" color="grey-lighten-2" @click="onConfirm">Confirm</v-btn>
            </v-col>

            <!-- Right Form Area -->
            <v-col cols="12" md="6">
                <v-text-field label="Title" v-model="title" outlined />
                <v-textarea label="Description" v-model="description" outlined />
                <v-select label="Board" :items="boards" v-model="selectedBoard" outlined />
                <v-combobox label="Tags" v-model="tags" multiple chips outlined />
                <v-text-field label="Product Tag" v-model="productTag" outlined />
                <v-btn text @click="showMore = !showMore">More Options</v-btn>
                <div v-if="showMore" class="mt-2">
                    <v-textarea label="Additional Notes" outlined />
                </div>
            </v-col>
        </v-row>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
        {{ snackbarText }}
    </v-snackbar>
</template>
<script setup>
import { ref } from 'vue'
import COS from 'cos-js-sdk-v5'
import axios from '@/plugins/axios'

const cos = ref(null)
const file = ref(null)
const title = ref('')
const description = ref('')
const boards = ['旅行', '美食', '摄影']
const selectedBoard = ref('')
const tags = ref([])
const productTag = ref('')
const showMore = ref(false)
const imageUrl = ref(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const onConfirm = async () => {
    if (!file.value) {
        return
    }
    if (!cos.value) {
        await getSTSKey()
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const username = user.username
    const filename = `pictress-${username}-${Date.now()}.jpg`
    try {
        const data = await cos.value.uploadFile({
            Bucket: 'nyu-database-pro-1302493622', // 填入您自己的存储桶，必须字段
            Region: 'na-ashburn',  // 存储桶所在地域，例如 ap-beijing，必须字段
            Key: filename,  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
            Body: file.value, // 必须，上传文件对象，可以是 input[type="file"]标签选择本地文件后得到的 file 对象
            SliceSize: 1024 * 1024 * 5,     // 触发分块上传的阈值，超过5MB使用分块上传，默认 1MB，非必须
            ChunkSize: 1024 * 1024, // 分块大小，默认 1MB，非必须
            onTaskReady: function (taskId) {  // 非必须
                console.log(taskId);
            },
            onProgress: function (progressData) { // 非必须
                console.log(JSON.stringify(progressData));
            },
        });
        imageUrl.value = data.Location;
        await createPin();
    } catch (err) {
        snackbarText.value = 'Upload failed.'
        snackbarColor.value = 'error'
        snackbar.value = true
    }
}

async function createPin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user?.userId ?? null

    const res = await axios.post('/iapi/api/pin/create', {
        title: title.value || null,
        description: description.value || null,
        imageUrl: imageUrl.value, // COS 上传成功后赋值
        tags: tags.value,
        userId: userId,                
        boardId: selectedBoard.value || null
    })
    const data = res.data

    snackbarText.value = 'Upload successful!'
    snackbarColor.value = 'success'
    snackbar.value = true

}

async function getSTSKey() {
    const res = await axios.get('/iapi/api/cos/sts')
    const data = res.data

    cos.value = new COS({
        getAuthorization: (_, callback) => {
            callback({
                TmpSecretId: data.credentials.tmpSecretId,
                TmpSecretKey: data.credentials.tmpSecretKey,
                XCosSecurityToken: data.credentials.sessionToken,
                StartTime: data.startTime,
                ExpiredTime: data.expiredTime,
            })
        }
    })

}
</script>