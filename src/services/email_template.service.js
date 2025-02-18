class EmailTemplateService {
    static getVerificationEmail(user, verificationUrl) {
        return {
            subject: 'Xác nhận tài khoản',
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào link bên dưới để xác nhận email:</p>
                <a href="${verificationUrl}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                    Xác nhận email
                </a>
                <p>Link này sẽ hết hạn sau 24 giờ.</p>
            `
        };
    }

    static getResetPasswordEmail(user, resetUrl) {
        return {
            subject: 'Đặt lại mật khẩu',
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link bên dưới để tiếp tục:</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
                    Đặt lại mật khẩu
                </a>
                <p>Link này sẽ hết hạn sau 1 giờ.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            `
        };
    }

    static getCourseEnrollmentEmail(user, course) {
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

    static getStudyReminderEmail(user, course, lastAccess) {
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

    static getNewMessageEmail(user, sender, chatRoom) {
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

    static getVerificationOTPEmail(user, otp) {
        return {
            subject: 'Xác thực tài khoản',
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Mã OTP để xác thực tài khoản của bạn là:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                <p>Mã này sẽ hết hạn sau 5 phút.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
            `
        };
    }

    static getResetPasswordOTPEmail(user, otp) {
        return {
            subject: 'Đặt lại mật khẩu',
            html: `
                <h2>Xin chào ${user.name}!</h2>
                <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
                <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                <p>Mã này sẽ hết hạn sau 5 phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email.</p>
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
}

module.exports = EmailTemplateService; 