<template>
  <view class="settings-page">
    <view class="settings-group">
      <!-- 账号设置 -->
    <!--  <view class="settings-title">账号设置</view>
      <view class="settings-list">
        <view class="settings-item" @tap="updateUserInfo">
          <text>修改个人信息</text>
          <text class="arrow">></text>
        </view>
        <view class="settings-item">
          <text>消息通知</text>
          <switch :checked="notificationEnabled" @change="toggleNotification" color="#2979ff"/>
        </view>
      </view> -->
    </view>

    <view class="settings-group">
      <!-- 通用设置 -->
      <view class="settings-title">通用设置</view>
      <view class="settings-list">
        <view class="settings-item">
          <text>声音效果</text>
          <switch :checked="soundEnabled" @change="toggleSound" color="#2979ff"/>
        </view>
        <view class="settings-item">
          <text>震动效果</text>
          <switch :checked="vibrationEnabled" @change="toggleVibration" color="#2979ff"/>
        </view>
      </view>
    </view>

    <view class="settings-group">
      <!-- 其他设置 -->
      <view class="settings-list">
        <view class="settings-item" @tap="clearCache">
          <text>清除缓存</text>
          <text class="sub-text">{{ cacheSize }}</text>
        </view>
        <view class="settings-item" @tap="aboutUs">
          <text>关于我们</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-btn" @tap="handleLogout" v-if="isLoggedIn">退出登录</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notificationEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      cacheSize: '0MB',
      isLoggedIn: false
    }
  },

  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
    this.checkLoginStatus()
  },

  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      this.isLoggedIn = !!(userInfo)
    },

    // 加载设置
    loadSettings() {
      const settings = uni.getStorageSync('userSettings') || {}
      this.notificationEnabled = settings.notification !== false
      this.soundEnabled = settings.sound !== false
      this.vibrationEnabled = settings.vibration !== false
    },

    // 保存设置
    saveSettings() {
      const settings = {
        notification: this.notificationEnabled,
        sound: this.soundEnabled,
        vibration: this.vibrationEnabled
      }
      uni.setStorageSync('userSettings', settings)
    },

    // 切换通知
    toggleNotification(e) {
      this.notificationEnabled = e.detail.value
      this.saveSettings()
    },

    // 切换声音
    toggleSound(e) {
      this.soundEnabled = e.detail.value
      this.saveSettings()
    },

    // 切换震动
    toggleVibration(e) {
      this.vibrationEnabled = e.detail.value
      this.saveSettings()
    },

    // 修改个人信息
    updateUserInfo() {
      uni.navigateTo({
        url: '/pages/my/userInfo'
      })
    },

    // 计算缓存大小
    calculateCacheSize() {
      // 实际项目中需要调用相关API计算缓存大小
      this.cacheSize = '2.5MB'
    },

    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '清理中...'
            })
            
            setTimeout(() => {
              uni.hideLoading()
              this.cacheSize = '0MB'
              uni.showToast({
                title: '清除成功',
                icon: 'success'
              })
            }, 1000)
          }
        }
      })
    },

    // 关于我们
    aboutUs() {
      uni.navigateTo({
        url: '/pages/my/about'
      })
    },

    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户信息
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')
            
            // 返回登录页
            uni.reLaunch({
              url: '/pages/my/index'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

.settings-group {
  margin-bottom: 20rpx;
}

.settings-title {
  padding: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.settings-list {
  background-color: #fff;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 30rpx;
  color: #333;

  &:last-child {
    border-bottom: none;
  }

  switch {
    transform: scale(0.8);
  }
}

.arrow {
  color: #999;
  font-size: 28rpx;
}

.sub-text {
  color: #999;
  font-size: 28rpx;
}

.logout-btn {
  margin: 40rpx 20rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: #2979ff;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;

  &:active {
    opacity: 0.8;
  }
}
</style> 