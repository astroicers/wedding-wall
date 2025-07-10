<template>
  <el-dialog
    v-model="visible"
    title="創建新祝福牆"
    width="600px"
    :before-close="handleClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="left"
    >
      <el-form-item label="祝福牆名稱" prop="name" required>
        <el-input
          v-model="form.name"
          placeholder="請輸入祝福牆名稱"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="請輸入祝福牆描述 (可選)"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>


      <el-form-item label="背景顏色" prop="backgroundColor">
        <el-color-picker v-model="form.settings.backgroundColor" show-alpha />
      </el-form-item>

      <el-form-item label="字體選擇" prop="fontFamily">
        <el-select v-model="form.settings.fontFamily" placeholder="選擇字體" style="width: 100%">
          <el-option value="Microsoft JhengHei" label="微軟正黑體" />
          <el-option value="Noto Sans TC" label="思源黑體" />
          <el-option value="PingFang TC" label="蘋方-繁" />
          <el-option value="Helvetica Neue" label="Helvetica Neue" />
          <el-option value="Arial" label="Arial" />
        </el-select>
      </el-form-item>

      <el-form-item label="公開設定">
        <el-switch
          v-model="form.isPublic"
          active-text="公開"
          inactive-text="私人"
        />
        <div class="form-help-text">
          公開的祝福牆可以被其他人查看，私人祝福牆僅創建者可見
        </div>
      </el-form-item>

      <el-form-item label="自動審核">
        <el-switch
          v-model="form.settings.autoApprove"
          active-text="開啟"
          inactive-text="關閉"
        />
        <div class="form-help-text">
          開啟後新訊息將自動顯示，關閉則需要手動審核
        </div>
      </el-form-item>

      <el-form-item label="訪問密碼">
        <el-switch
          v-model="form.settings.requirePassword"
          active-text="需要密碼"
          inactive-text="無需密碼"
        />
        <el-input
          v-if="form.settings.requirePassword"
          v-model="form.settings.password"
          type="password"
          placeholder="請設置訪問密碼"
          style="margin-top: 10px"
          maxlength="20"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          創建祝福牆
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateWallData, WallSettings } from '~/types/wall'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', wall: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const wallsStore = useWallsStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref<CreateWallData & { isPublic: boolean; settings: WallSettings }>({
  name: '',
  description: '',
  isPublic: true,
  settings: {
    displayMode: 'grid',
    theme: 'default',
    backgroundColor: '#ffffff',
    fontFamily: 'Microsoft JhengHei',
    autoApprove: true,
    showUnmoderated: false,
    autoApproveKeywords: '',
    autoRejectKeywords: '',
    requirePassword: false,
    password: '',
    textColor: '#333333',
    autoplayDelay: 4,
    imageExtraDelay: 1,
    wallTitle: '',
    wallSubtitle: '',
    fontSize: 48
  }
})

const rules: FormRules = {
  name: [
    { required: true, message: '請輸入祝福牆名稱', trigger: 'blur' },
    { min: 2, max: 50, message: '名稱長度應在 2 到 50 個字符之間', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超過 200 個字符', trigger: 'blur' }
  ]
}

// Reset form when dialog opens
watch(visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  form.value = {
    name: '',
    description: '',
    isPublic: true,
    settings: {
      displayMode: 'grid',
      theme: 'default',
      backgroundColor: '#ffffff',
      fontFamily: 'Microsoft JhengHei',
      autoApprove: true,
      showUnmoderated: false,
      autoApproveKeywords: '',
      autoRejectKeywords: '',
      requirePassword: false,
      password: '',
      textColor: '#333333',
      autoplayDelay: 4,
      imageExtraDelay: 1,
      wallTitle: '',
      wallSubtitle: '',
      fontSize: 48
    }
  }
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function handleClose() {
  visible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // Prepare wall data
    const wallData: CreateWallData & { userId: string; isPublic: boolean } = {
      ...form.value,
      userId: authStore.userId!
    }
    
    // Clear password if not required
    if (!wallData.settings.requirePassword) {
      delete wallData.settings.password
    }
    
    // Create wall via store
    const newWall = await wallsStore.createWall(wallData)
    
    ElMessage.success('祝福牆創建成功！')
    emit('created', newWall)
    handleClose()
    
  } catch (error: any) {
    console.error('Failed to create wall:', error)
    ElMessage.error(error.message || '創建祝福牆失敗，請稍後重試')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-help-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>