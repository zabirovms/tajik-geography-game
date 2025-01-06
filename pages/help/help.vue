<template>
    <view class="help-container">
        <text class="help-title">帮助中心</text>
        <view class="faq-list">
            <view class="faq-item" v-for="(item, index) in faqs" :key="index">
                <view class="faq-question" @tap="toggleAnswer(index)">
                    <text class="question-text">{{ item.question }}</text>
                    <text class="arrow" :class="{ 'rotate': item.showAnswer }">▼</text> <!-- 箭头指示 -->
                </view>
                <view v-if="item.showAnswer" class="faq-answer">
                    <text>{{ item.answer }}</text>
                </view>
            </view>
        </view>
        <button @tap="closeHelp" class="close-button">关闭</button>
    </view>
</template>

<script>
export default {
    data() {
        return {
            faqs: [
                { question: '如何开始游戏？', answer: '选择您感兴趣的游戏模式，然后点击开始游戏。', showAnswer: false },
                { question: '如何查看排行榜？', answer: '在主界面上，点击排行榜按钮即可查看。', showAnswer: false },
                { question: '如何分享我的成绩？', answer: '在游戏结束后，您可以选择分享您的成绩。', showAnswer: false },
                // 添加更多常见问题
            ]
        };
    },
    methods: {
        toggleAnswer(index) {
            this.faqs[index].showAnswer = !this.faqs[index].showAnswer;
        },
        closeHelp() {
            this.$emit('close'); // 触发关闭事件
        }
    }
}
</script>

<style lang="scss" scoped>
.help-container {
    padding: 20rpx; /* 增加内边距 */
    background: #ffffff; /* 使用白色背景 */
    border-radius: 15rpx; /* 增加圆角 */
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1); /* 更柔和的阴影效果 */
}

.help-title {
    font-size: 34rpx; /* 增加标题字体大小 */
    font-weight: bold;
    margin-bottom: 20rpx; /* 增加底部间距 */
    color: #2c3e50; /* 深色标题 */
    text-align: center; /* 居中对齐 */
}

.faq-list {
    margin-bottom: 20rpx; /* 问题列表的底部间距 */
}

.faq-item {
    margin-bottom: 15rpx; /* 调整每个问题的底部间距 */
    padding: 20rpx; /* 增加内边距 */
    background: #f9f9f9; /* 更柔和的背景 */
    border-radius: 10rpx; /* 增加圆角 */
    transition: background 0.3s, box-shadow 0.3s; /* 增加阴影过渡效果 */
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1); /* 更柔和的阴影效果 */
}

.faq-item:hover {
    background: #e0e0e0; /* 悬停时背景颜色变化 */
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.2); /* 悬停时增加阴影 */
}

.faq-question {
    display: flex;
    justify-content: space-between; /* 问题和箭头之间的空间 */
    align-items: center; /* 垂直居中 */
    cursor: pointer; /* 鼠标指针 */
}

.question-text {
    font-size: 28rpx; /* 增加问题字体大小 */
    color: #2980b9; /* 更柔和的字体颜色 */
}

.arrow {
    font-size: 22rpx; /* 增加箭头字体大小 */
    transition: transform 0.3s; /* 箭头旋转过渡效果 */
}

.rotate {
    transform: rotate(180deg); /* 旋转箭头 */
}

.faq-answer {
    margin-top: 10rpx; /* 调整顶部间距 */
    font-size: 24rpx; /* 增加答案字体大小 */
    color: #555; /* 深色文本 */
    padding: 10rpx; /* 增加内边距 */
    background: #f2f2f2; /* 更柔和的背景色 */
    border-radius: 6rpx; /* 增加圆角 */
}

.close-button {
    margin-top: 20rpx; /* 调整上边距 */
    background: #3498db; /* 调整按钮背景颜色 */
    color: #FFFFFF; /* 字体颜色 */
    padding: 12rpx 24rpx; /* 增加内边距 */
    border-radius: 30rpx; /* 增加圆角 */
    border: none; /* 无边框 */
    cursor: pointer; /* 鼠标指针 */
    transition: background 0.3s, transform 0.3s; /* 增加变换过渡效果 */
}

.close-button:hover {
    background: #2980b9; /* 悬停时变色 */
    transform: scale(1.05); /* 悬停时放大效果 */
}
</style> 