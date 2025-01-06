<template>
  <view class="about-page">
    <!-- Logo区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/images/logo.jpg" mode="aspectFit"></image>
      <text class="app-name">趣味地理挑战</text>
      <text class="version">版本 1.0.0</text>
    </view>

    <!-- 功能介绍 -->
    <view class="section">
      <view class="section-title">产品介绍</view>
      <view class="content">
        趣味地理挑战是一款专注于地理知识的趣味问答小程序。通过有趣且具有教育意义的问答形式，
        为儿童、学生、成人和老年人提供丰富的地理知识学习体验。涵盖世界各国地理、
        自然地理、人文地理等多个方面，帮助用户在轻松愉快的答题过程中提升地理知识水平。
      </view>
    </view>

    <!-- 特色功能 -->
    <view class="section">
      <view class="section-title">特色功能</view>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-title">趣味问答</text>
          <text class="feature-desc">寓教于乐的地理知识问答</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">全球视野</text>
          <text class="feature-desc">覆盖世界各地的地理知识</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">适合全年龄</text>
          <text class="feature-desc">适合不同年龄段用户使用</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="section">
      <view class="section-title">联系我们</view>
      <view class="contact-list">
        <view class="contact-item" @tap="copyText('custom@ooolo.net')">
          <uni-icons type="email" size="20" color="#666"></uni-icons>
          <text>custom@ooolo.net</text>
        </view>
        <!-- <view class="contact-item" @tap="copyText('趣味地理')">
          <uni-icons type="weixin" size="20" color="#666"></uni-icons>
          <text>微信公众号：趣味地理</text>
        </view> -->
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="section">
      <view class="link-list">
        <view class="link-item" @tap="navigateTo('/pages/about/privacy')">
          <text>隐私政策</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        <view class="link-item" @tap="navigateTo('/pages/about/agreement')">
          <text>用户协议</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="copyright">
      Copyright © 2024 趣味地理挑战 All Rights Reserved
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    // 复制文本
    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },

    // 页面跳转
    navigateTo(url) {
      uni.navigateTo({
        url,
        fail: () => {
          uni.showToast({
            title: '页面开发中',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 40rpx;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.version {
  font-size: 24rpx;
  color: #999;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
}

.content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.contact-list {
  .contact-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    
    uni-icons {
      margin-right: 20rpx;
    }
  }
}

.link-list {
  .link-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    font-size: 28rpx;
    color: #333;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }
}

.copyright {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 40rpx 0;
}

// 添加特色功能样式
.feature-list {
  margin-top: 20rpx;
}

.feature-item {
  margin-bottom: 20rpx;
  
  .feature-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 8rpx;
    display: block;
  }
  
  .feature-desc {
    font-size: 26rpx;
    color: #666;
    display: block;
  }
}
</style> 