<template>
  <view class="feedback-page">
    <!-- 反馈类型选择 -->
    <view class="section">
      <view class="section-title">反馈类型</view>
      <view class="type-list">
        <view 
          v-for="(type, index) in feedbackTypes" 
          :key="index"
          :class="['type-item', { active: selectedType === type.value }]"
          @tap="selectedType = type.value"
        >
          {{ type.label }}
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="section">
      <view class="section-title">问题描述</view>
      <textarea
        class="feedback-content"
        v-model="content"
        placeholder="请详细描述您遇到的问题或建议..."
        :maxlength="500"
      ></textarea>
      <view class="word-count">{{ content.length }}/500</view>
    </view>

    <!-- 图片上传 -->
    <view class="section">
      <view class="section-title">上传截图（选填）</view>
      <view class="image-upload">
        <view 
          class="image-item" 
          v-for="(img, index) in images" 
          :key="index"
        >
          <image :src="img" mode="aspectFill"></image>
          <view class="delete-btn" @tap="deleteImage(index)">×</view>
        </view>
        <view 
          class="upload-btn" 
          @tap="chooseImage" 
          v-if="images.length < 3"
        >
          <uni-icons type="camera" size="24" color="#999"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
   <!-- <view class="section">
      <view class="section-title">联系方式（选填）</view>
      <input 
        class="contact-input"
        v-model="contact"
        placeholder="请留下您的手机号或邮箱"
      />
    </view> -->

    <!-- 提交按钮 -->
    <button 
      class="submit-btn" 
      :disabled="!isValid"
      @tap="submitFeedback"
    >
      提交反馈
    </button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedbackTypes: [
        { label: '功能异常', value: 'bug' },
        { label: '体验问题', value: 'experience' },
        { label: '功能建议', value: 'suggestion' },
        { label: '其他', value: 'other' }
      ],
      selectedType: 'bug',
      content: '',
      images: [],
      contact: '',
      isSubmitting: false
    }
  },

  computed: {
    isValid() {
      return this.selectedType && this.content.trim().length > 0 && !this.isSubmitting
    }
  },

  methods: {
    // 选择图片
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 3 - this.images.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        })
        this.images = [...this.images, ...res.tempFilePaths]
      } catch (error) {
        console.error('选择图片失败：', error)
      }
    },

    // 删除图片
    deleteImage(index) {
      this.images.splice(index, 1)
    },

    // 提交反馈
    async submitFeedback() {
      if (!this.isValid) return

      try {
        this.isSubmitting = true
        uni.showLoading({ title: '提交中...' })

        // 上传图片
        const imageUrls = []
        for (const image of this.images) {
          const uploadRes = await this.uploadImage(image)
          imageUrls.push(uploadRes.url)
        }

        // 提交反馈数据
        await this.$api.submitFeedback({
          type: this.selectedType,
          content: this.content,
          images: imageUrls,
          contact: this.contact
        })

        uni.showToast({ 
          title: '提交成功，感谢您的反馈！', 
          icon: 'success' 
        })
        
        // 延迟返回上一页
        setTimeout(() => uni.navigateBack(), 1500)
      } catch (error) {
        uni.showToast({ 
          title: error.message || '提交失败，请重试', 
          icon: 'none' 
        })
      } finally {
        this.isSubmitting = false
        uni.hideLoading()
      }
    },

    // 上传单张图片
    uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: 'YOUR_UPLOAD_API',
          filePath,
          name: 'file',
          success: res => {
            const data = JSON.parse(res.data)
            resolve(data)
          },
          fail: reject
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-page {
  padding: 30rpx;
  min-height: 100vh;
  background: #f5f7fa;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.type-item {
  padding: 16rpx 30rpx;
  background: #f5f7fa;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #e1f0ff;
    color: #2979ff;
  }
}

.feedback-content {
  width: 100%;
  height: 300rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item, .upload-btn {
  width: 180rpx;
  height: 180rpx;
  border-radius: 8rpx;
  position: relative;
}

.image-item {
  image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
  }

  .delete-btn {
    position: absolute;
    right: -16rpx;
    top: -16rpx;
    width: 40rpx;
    height: 40rpx;
    line-height: 40rpx;
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 50%;
    font-size: 24rpx;
  }
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 2rpx dashed #ddd;
}

.contact-input {
  background: #f5f7fa;
  height: 80rpx;
  padding: 0 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.submit-btn {
  margin-top: 60rpx;
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  background: #2979ff;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;

  &:disabled {
    background: #ccc;
  }
}
</style> 