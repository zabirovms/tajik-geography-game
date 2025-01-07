<template>
  <view class="my-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
        <view class="info-right">
          <!-- 未登录时显示登录按钮 -->
          <button v-if="!userInfo.nickName" 
                  class="login-btn" 
                  open-type="getPhoneNumber" 
                  @getphonenumber="handleGetPhoneNumber">
            点击登录
          </button>
          <!-- 已登录时显示用户信息 -->
          <block v-else>
            <text class="nickname">{{ userInfo.nickName }}</text>
            <text class="user-id">ID: {{ userInfo.userId || '-' }}</text>
          </block>
        </view>
      </view>
    </view>

    <!-- 统计数据卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-num">{{ stats.totalGames || 0 }}</text>
        <text class="stats-label">总游戏数</text>
      </view>
      <view class="divider"></view>
      <view class="stats-item">
        <text class="stats-num">{{ stats.correctRate || '0%' }}</text>
        <text class="stats-label">正确率</text>
      </view>
      <view class="divider"></view>
      <view class="stats-item">
        <text class="stats-num">{{ stats.bestScore || 0 }}</text>
        <text class="stats-label">最高分</text>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" 
            v-for="(item, index) in menuItems" 
            :key="index"
            @tap="handleMenuClick(item)">
        <view class="menu-item-left">
          <uni-icons :type="item.icon" size="20" color="#666"></uni-icons>
          <text class="menu-text">{{ item.text }}</text>
        </view>
        <uni-icons type="right" size="16" color="#666"></uni-icons>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view v-if="userInfo.nickName" class="logout-section">
      <button class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { login } from '@/utils/request'; // 导入 login 方法

export default {
  data() {
    return {
      userInfo: {
        nickName: '',
        avatarUrl: '/static/images/default-avatar.png',
        userId: ''
      },
      stats: {
        totalGames: 0,
        correctRate: '0%',
        bestScore: 0
      },
      menuItems: [
        { 
          text: '游戏历史', 
          icon: 'calendar', 
          path: '/pages/my/history',
          requireLogin: true  // 需要登录
        },
        { 
          text: '我的收藏', 
          icon: 'star', 
          path: '/pages/my/favorites',
          requireLogin: true  // 需要登录
        },
        { 
          text: '消息通知', 
          icon: 'notification', 
          path: '/pages/my/notifications',
          requireLogin: true  // 需要登录
        },
        { 
          text: '设置', 
          icon: 'gear', 
          path: '/pages/my/settings',
          requireLogin: false  // 不需要登录
        },
        { 
          text: '反馈', 
          icon: 'chat', 
          path: '/pages/my/feedback',
          requireLogin: false  // 不需要登录
        },
        { 
          text: '关于我们', 
          icon: 'info', 
          path: '/pages/my/about',
          requireLogin: false  // 不需要登录
        }
      ],
      isLoading: false,
      refreshing: false
    }
  },

  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  methods: {
    // 加载用户信息
    async loadUserInfo() {
      const cachedInfo = uni.getStorageSync('userInfo')
      if (cachedInfo) {
        this.userInfo = JSON.parse(cachedInfo)
      }
    },

    // 加载用户统计数据
    async loadUserStats() {
      if (!this.userInfo.userId) return
      
      try {
        this.isLoading = true
        const res = await this.$api.getUserStats(this.userInfo.userId)
        this.stats = {
          totalGames: res.totalGames || 0,
          correctRate: res.correctRate ? `${res.correctRate}%` : '0%',
          bestScore: res.bestScore || 0
        }
      } catch (error) {
        uni.showToast({
          title: '获取统计数据失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    // 刷新数据
    async refreshData() {
      if (this.refreshing) return
      this.refreshing = true
      
      try {
        await Promise.all([
          this.loadUserInfo(),
          this.loadUserStats()
        ])
      } catch (error) {
        console.error('刷新数据失败:', error)
      } finally {
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },

    // 编辑用户信息
    async handleEditUserInfo() {
      if (!this.userInfo.nickName) return
      
      uni.navigateTo({
        url: '/pages/my/edit-profile'
      })
    },

    // 处理菜单点击 - 优化逻辑
    handleMenuClick(item) {
      // 只有需要登录的功能才检查登录状态
      if (item.requireLogin && !this.userInfo.nickName) {
        return this.showLoginTips()
      }
      
      uni.navigateTo({
        url: item.path,
        fail: () => {
          uni.showToast({
            title: '功能开发中',
            icon: 'none'
          })
        }
      })
    },

    // 处理设置
    handleSettings() {
      uni.navigateTo({
        url: '/pages/my/settings',
        success: () => {
          // 可以传递一些设置项
          uni.$emit('settings:init', {
            theme: uni.getStorageSync('theme') || 'light',
            notification: uni.getStorageSync('notification') || false
          })
        }
      })
    },

    // 处理获取手机号
    async handleGetPhoneNumber(e) {
      try {
        // 用户拒绝授权手机号
        if (e.detail.errMsg !== "getPhoneNumber:ok") {
          uni.showToast({
            title: '需要授权手机号才能登录',
            icon: 'none'
          });
          return;
        }

        // 先获取用户信息
        uni.showModal({
          title: '提示',
          content: '需要获取您的头像和昵称',
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({ 
                  title: '登录中...' 
                });
                
                // 获取用户信息
                const userProfile = await this.getUserProfile();
                
                // 获取登录凭证
                const { code } = await this.wxLogin();

                // 发送登录请求到后端
                const response = await login({ 
                  code,
                  encryptedData: e.detail.encryptedData,
                  iv: e.detail.iv,
                  nickname: userProfile.nickName,
                  avatarUrl: userProfile.avatarUrl
                });

                // 更新用户信息
                this.userInfo = response;
                uni.setStorageSync('userInfo', JSON.stringify(response));
                
                uni.showToast({ 
                  title: '登录成功', 
                  icon: 'success' 
                });
              } catch (error) {
                console.error('登录错误:', error);
                uni.showToast({ 
                  title: error.message || '登录失败', 
                  icon: 'none' 
                });
              } finally {
                uni.hideLoading();
              }
            } else {
              uni.showToast({
                title: '您取消了授权',
                icon: 'none'
              });
            }
          }
        });
      } catch (error) {
        console.error('登录错误:', error);
        uni.showToast({ 
          title: error.message || '登录失败', 
          icon: 'none' 
        });
      }
    },

    // 获取用户信息
    getUserProfile() {
      return new Promise((resolve, reject) => {
        uni.getUserProfile({
          desc: '用于完善会员资料', // 声明获取用户个人信息后的用途
          success: (res) => {
            resolve(res.userInfo);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },

    // 微信登录
    wxLogin() {
      return new Promise((resolve, reject) => {
        uni.login({
          success: res => resolve(res),
          fail: err => reject(err)
        });
      });
    },

    // 处理退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.userInfo = {
              nickName: '',
              avatarUrl: '/static/images/default-avatar.png',
              userId: ''
            }
            uni.removeStorageSync('userInfo')
            uni.showToast({ title: '已退出登录', icon: 'success' })
          }
        }
      })
    },

    // 显示登录提示
    showLoginTips() {
      uni.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            this.handleLogin()
          }
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx 20rpx;
}

/* 用户信息卡片样式 */
.user-card {
  background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.info-right {
  flex: 1;
  margin-left: 30rpx;
}

.login-btn {
  margin: 0;
  padding: 0;
  background: none;
  font-size: 36rpx;
  color: #ffffff;
  text-align: left;
  line-height: 1.4;
}

.login-btn::after {
  border: none;
}

.nickname {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 10rpx;
  display: block;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 统计卡片样式 */
.stats-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  text-align: center;
}

.divider {
  width: 2rpx;
  height: 50rpx;
  background-color: #eee;
}

.stats-num {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

/* 菜单列表样式 */
.menu-list {
  background: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

/* 退出登录按钮样式 */
.logout-section {
  margin: 60rpx 30rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #ffffff;
  color: #ff4444;
  border-radius: 44rpx;
  font-size: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.logout-btn::after {
  border: none;
}
</style> 