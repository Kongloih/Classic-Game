const axios = require('axios');
const { RedisHelper } = require('../config/redis');

class SMSService {
  constructor() {
    // 这里可以配置不同的短信服务商
    this.provider = process.env.SMS_PROVIDER || 'mock'; // mock, aliyun, tencent, etc.
    this.config = {
      aliyun: {
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        signName: process.env.ALIYUN_SMS_SIGN_NAME,
        templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
        endpoint: 'https://dysmsapi.aliyuncs.com'
      },
      tencent: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
        sdkAppId: process.env.TENCENT_SMS_SDK_APP_ID,
        signName: process.env.TENCENT_SMS_SIGN_NAME,
        templateId: process.env.TENCENT_SMS_TEMPLATE_ID
      }
    };
  }

  /**
   * 生成验证码
   * @param {number} length 验证码长度
   * @returns {string} 验证码
   */
  generateVerificationCode(length = 6) {
    return Math.random().toString().slice(2, 2 + length);
  }

  /**
   * 发送短信验证码
   * @param {string} phone 手机号
   * @param {string} type 验证码类型 (register, login, reset)
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(phone, type = 'register') {
    try {
      // 标准化手机号格式
      const normalizedPhone = this.normalizePhone(phone);
      
      // 检查手机号格式
      if (!this.isValidPhone(normalizedPhone)) {
        throw new Error('手机号格式不正确');
      }

      // 检查发送频率限制
      const rateLimitKey = `sms_rate_limit:${normalizedPhone}`;
      const rateLimit = await RedisHelper.get(rateLimitKey);
      if (rateLimit) {
        throw new Error('发送过于频繁，请稍后再试');
      }

      // 生成验证码
      const code = this.generateVerificationCode();
      const expireTime = 5 * 60; // 5分钟过期

      // 存储验证码到Redis
      const codeKey = `sms_code:${normalizedPhone}:${type}`;
      await RedisHelper.set(codeKey, code, expireTime);

      // 设置发送频率限制（60秒内只能发送一次）
      await RedisHelper.set(rateLimitKey, '1', 60);

      // 根据配置的提供商发送短信
      let result;
      switch (this.provider) {
        case 'aliyun':
          result = await this.sendViaAliyun(normalizedPhone, code, type);
          break;
        case 'tencent':
          result = await this.sendViaTencent(normalizedPhone, code, type);
          break;
        case 'mock':
        default:
          result = await this.sendViaMock(normalizedPhone, code, type);
          break;
      }

      return {
        success: true,
        message: '验证码发送成功',
        data: {
          phone: normalizedPhone,
          type,
          expireTime
        }
      };

    } catch (error) {
      console.error('发送短信验证码失败:', error);
      return {
        success: false,
        message: error.message || '发送验证码失败'
      };
    }
  }

  /**
   * 验证短信验证码
   * @param {string} phone 手机号
   * @param {string} code 验证码
   * @param {string} type 验证码类型
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyCode(phone, code, type = 'register') {
    try {
      // 标准化手机号格式
      const normalizedPhone = this.normalizePhone(phone);
      const codeKey = `sms_code:${normalizedPhone}:${type}`;
      const storedCode = await RedisHelper.get(codeKey);

      if (!storedCode) {
        return false;
      }

      if (storedCode !== code) {
        return false;
      }

      // 验证成功后删除验证码
      await RedisHelper.del(codeKey);
      return true;

    } catch (error) {
      console.error('验证短信验证码失败:', error);
      return false;
    }
  }

  /**
   * 验证手机号格式
   * @param {string} phone 手机号
   * @returns {boolean} 是否有效
   */
  isValidPhone(phone) {
    // 支持带+86和不带+86的中国手机号格式
    return /^(\+86)?1[3-9]\d{9}$/.test(phone);
  }

  /**
   * 标准化手机号格式
   * @param {string} phone 手机号
   * @returns {string} 标准化后的手机号
   */
  normalizePhone(phone) {
    // 移除所有空格和连字符
    let normalized = phone.replace(/[\s\-]/g, '');
    
    // 如果以+86开头，保持原样
    if (normalized.startsWith('+86')) {
      return normalized;
    }
    
    // 如果以86开头（没有+），添加+
    if (normalized.startsWith('86')) {
      return '+' + normalized;
    }
    
    // 如果是11位数字，添加+86
    if (/^1[3-9]\d{9}$/.test(normalized)) {
      return '+86' + normalized;
    }
    
    return normalized;
  }

  /**
   * 模拟发送短信（开发环境使用）
   * @param {string} phone 手机号
   * @param {string} code 验证码
   * @param {string} type 类型
   * @returns {Promise<Object>} 发送结果
   */
  async sendViaMock(phone, code, type) {
    console.log(`[MOCK SMS] 发送验证码到 ${phone}: ${code} (类型: ${type})`);
    
    // 在开发环境中，将验证码打印到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=== 短信验证码 ===`);
      console.log(`手机号: ${phone}`);
      console.log(`验证码: ${code}`);
      console.log(`类型: ${type}`);
      console.log(`过期时间: 5分钟`);
      console.log(`==================\n`);
    }

    return {
      success: true,
      message: '验证码发送成功（模拟模式）'
    };
  }

  /**
   * 通过阿里云发送短信
   * @param {string} phone 手机号
   * @param {string} code 验证码
   * @param {string} type 类型
   * @returns {Promise<Object>} 发送结果
   */
  async sendViaAliyun(phone, code, type) {
    const { accessKeyId, accessKeySecret, signName, templateCode, endpoint } = this.config.aliyun;
    
    if (!accessKeyId || !accessKeySecret) {
      throw new Error('阿里云短信配置不完整');
    }

    // 这里需要实现阿里云短信API调用
    // 由于需要阿里云SDK，这里只提供基本结构
    console.log(`[ALIYUN SMS] 发送验证码到 ${phone}: ${code}`);
    
    return {
      success: true,
      message: '验证码发送成功（阿里云）'
    };
  }

  /**
   * 通过腾讯云发送短信
   * @param {string} phone 手机号
   * @param {string} code 验证码
   * @param {string} type 类型
   * @returns {Promise<Object>} 发送结果
   */
  async sendViaTencent(phone, code, type) {
    const { secretId, secretKey, sdkAppId, signName, templateId } = this.config.tencent;
    
    if (!secretId || !secretKey) {
      throw new Error('腾讯云短信配置不完整');
    }

    // 这里需要实现腾讯云短信API调用
    // 由于需要腾讯云SDK，这里只提供基本结构
    console.log(`[TENCENT SMS] 发送验证码到 ${phone}: ${code}`);
    
    return {
      success: true,
      message: '验证码发送成功（腾讯云）'
    };
  }
}

module.exports = new SMSService(); 