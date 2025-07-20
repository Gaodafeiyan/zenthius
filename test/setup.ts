import axios from 'axios';

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 设置 axios 默认配置
axios.defaults.baseURL = 'http://localhost:1337/api';
axios.defaults.timeout = 10000;

// 全局测试工具函数
global.createTestUser = async (username: string, email: string, inviteCode: string) => {
  const response = await axios.post('/auth/invite-register', {
    username,
    email,
    password: 'Test123456',
    inviteCode,
  });
  return response.data;
};

global.loginUser = async (identifier: string, password: string) => {
  const response = await axios.post('/auth/local', {
    identifier,
    password,
  });
  return response.data;
}; 