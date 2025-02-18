const i18next = require('i18next');

class EmailTemplateService {
    getVerificationEmail(user, verificationUrl) {
        return {
            subject: i18next.t('email.verification.subject'),
            html: `
                <h2>${i18next.t('email.verification.title', { name: user.name })}</h2>
                <p>${i18next.t('email.verification.message')}</p>
                <a href="${verificationUrl}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                    ${i18next.t('email.verification.button')}
                </a>
                <p>${i18next.t('email.verification.expiry')}</p>
            `
        };
    }

    getResetPasswordEmail(user, resetUrl) {
        return {
            subject: i18next.t('email.resetPassword.subject'),
            html: `
                <h2>${i18next.t('email.resetPassword.title', { name: user.name })}</h2>
                <p>${i18next.t('email.resetPassword.message')}</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
                    ${i18next.t('email.resetPassword.button')}
                </a>
                <p>${i18next.t('email.resetPassword.expiry')}</p>
                <p>${i18next.t('email.resetPassword.ignore')}</p>
            `
        };
    }

    getCourseEnrollmentEmail(user, course) {
        return {
            subject: `Chào mừng bạn đến với khóa học ${course.title}`,
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Cảm ơn bạn đã đăng ký khóa học "${course.title}".</p>
                <div style="margin: 20px 0;">
                    <img src="${course.thumbnail}" alt="${course.title}" style="max-width: 300px;"/>
                </div>
                <p>Bạn có thể bắt đầu học ngay bây giờ bằng cách click vào nút bên dưới:</p>
                <a href="${process.env.FRONTEND_URL}/courses/${course._id}" 
                   style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                    Bắt đầu học
                </a>
            `
        };
    }

    getStudyReminderEmail(user, course, lastAccess) {
        const daysSinceLastAccess = Math.floor((Date.now() - lastAccess) / (1000 * 60 * 60 * 24));
        
        return {
            subject: 'Nhắc nhở học tập',
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Chúng tôi nhận thấy bạn đã không truy cập khóa học "${course.title}" trong ${daysSinceLastAccess} ngày.</p>
                <p>Hãy duy trì thói quen học tập đều đặn để đạt kết quả tốt nhất nhé!</p>
                <a href="${process.env.FRONTEND_URL}/courses/${course._id}" 
                   style="padding: 10px 20px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px;">
                    Tiếp tục học
                </a>
            `
        };
    }

    getNewMessageEmail(user, sender, chatRoom) {
        return {
            subject: 'Tin nhắn mới',
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Bạn có tin nhắn mới từ ${sender.name} trong phòng chat "${chatRoom.name}"</p>
                <a href="${process.env.FRONTEND_URL}/chat/${chatRoom._id}" 
                   style="padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
                    Xem tin nhắn
                </a>
            `
        };
    }

    getVerificationOTPEmail(user, otp) {
        return {
            subject: i18next.t('email:verificationOTP.subject'),
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>${i18next.t('email:verificationOTP.title', { name: user.name })}</h2>
                    <p>${i18next.t('email:verificationOTP.message')}</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                    </div>
                    
                    <p style="color: #f44336;">${i18next.t('email:verificationOTP.expiry')}</p>
                    <p style="color: #666;">${i18next.t('email:verificationOTP.ignore')}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                        <p>${i18next.t('email:footer.contact')}</p>
                        <p>${i18next.t('email:footer.copyright', { year: new Date().getFullYear() })}</p>
                    </div>
                </div>
            `
        };
    }

    getResetPasswordOTPEmail(user, otp) {
        return {
            subject: i18next.t('email:resetPasswordOTP.subject'),
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>${i18next.t('email:resetPasswordOTP.title', { name: user.name })}</h2>
                    <p>${i18next.t('email:resetPasswordOTP.message')}</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                    </div>
                    
                    <p style="color: #f44336;">${i18next.t('email:resetPasswordOTP.warning')}</p>
                    <p style="color: #666;">${i18next.t('email:resetPasswordOTP.footer')}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                        <p>${i18next.t('email:footer.contact')}</p>
                        <p>${i18next.t('email:footer.copyright', { year: new Date().getFullYear() })}</p>
                    </div>
                </div>
            `
        };
    }

    getVerificationReminder(user, verificationUrl) {
        return {
            subject: 'Nhắc nhở: Xác thực tài khoản của bạn',
            html: `
                <h2>Xin chào ${user.name},</h2>
                <p>Chúng tôi nhận thấy bạn vẫn chưa xác thực tài khoản của mình.</p>
                <p>Vui lòng nhấp vào liên kết dưới đây để xác thực:</p>
                <a href="${verificationUrl}">Xác thực tài khoản</a>
                <p>Lưu ý: Liên kết sẽ hết hạn sau 48 giờ kể từ thời điểm đăng ký.</p>
            `
        };
    }

    getOTPReminder(user) {
        return {
            subject: 'Nhắc nhở: Xác thực OTP',
            html: `
                <h2>Xin chào ${user.name},</h2>
                <p>Chúng tôi nhận thấy bạn vẫn chưa xác thực mã OTP.</p>
                <p>Vui lòng nhập mã OTP đã được gửi trước đó để hoàn tất đăng ký.</p>
                <p>Nếu bạn không nhận được mã, có thể yêu cầu gửi lại.</p>
                <p>Lưu ý: Mã OTP sẽ hết hạn sau 24 giờ kể từ thời điểm đăng ký.</p>
            `
        };
    }

    getWelcomeEmail(user) {
        const subject = i18next.t('email.welcome.subject', { name: user.name });
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #f8f9fa; padding: 20px; text-align: center;">
                    <h1 style="color: #0d6efd;">${i18next.t('email.welcome.header')}</h1>
                </div>
                
                <div style="padding: 20px; background: white;">
                    <p>${i18next.t('email.welcome.greeting', { name: user.name })}</p>
                    
                    <p>${i18next.t('email.welcome.message')}</p>
                    
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0;">
                            <span style="color: #0d6efd;">✓</span> 
                            ${i18next.t('email.welcome.feature1')}
                        </li>
                        <li style="margin: 10px 0;">
                            <span style="color: #0d6efd;">✓</span>
                            ${i18next.t('email.welcome.feature2')}
                        </li>
                        <li style="margin: 10px 0;">
                            <span style="color: #0d6efd;">✓</span>
                            ${i18next.t('email.welcome.feature3')}
                        </li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/courses" 
                           style="background: #0d6efd; color: white; padding: 12px 25px; 
                                  text-decoration: none; border-radius: 5px;">
                            ${i18next.t('email.welcome.cta')}
                        </a>
                    </div>
                    
                    <p>${i18next.t('email.welcome.support')}</p>
                    <p>${i18next.t('email.welcome.closing')}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; 
                            font-size: 12px; color: #6c757d;">
                    <p>${i18next.t('email.footer.contact')}</p>
                    <p>${i18next.t('email.footer.copyright', { year: new Date().getFullYear() })}</p>
                </div>
            </div>
        `;

        return { subject, html };
    }
}

module.exports = new EmailTemplateService(); 