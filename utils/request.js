// utils/request.js

const BASE_URL = 'https://pay.ooolo.net/a'; // 替换为您的后端 API 基础 URL

const request = async (url, method = 'GET', data = {}, headers = {}) => {
  try {
    const response = await uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    if (response.statusCode === 200) {
        return response.data; // 返回响应数据
      } else {
        throw new Error(`请求失败: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('请求错误:', error);
      uni.showToast({
        title: '请求失败，请重试',
        icon: 'none'
      });
      throw error; // 抛出错误以便后续处理
    }
};

// 登录方法
const login = async (userData) => {
  return await request('/api/wxlogin', 'POST', userData);
};

export default request; // 确保这里是直接导出 request 函数
export { login }; // 导出 login 方法