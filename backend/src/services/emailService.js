// src/services/emailService.js
module.exports = {
    sendEmail: async (to, subject, text) => {
        console.log(`模拟发送邮件到 ${to}: ${subject} - ${text}`);
        // 实际实现应使用 nodemailer 或其他邮件服务
        return true;
    }
};