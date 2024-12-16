import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('gmail.user'),
        pass: this.configService.get('gmail.password'),
      },
    });
  }

  async sendVerificationEmail(email: string, verificationCode: string) {
    const mailOptions = {
      from: this.configService.get('gmail.user'),
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Verify your email</h1>
        <p>Please enter the following code to verify your email address:</p>
        <p><b>${verificationCode}</b></p>
      `,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');
    } catch (err) {
      console.error('Error sending verification email:', err);
      throw err; 
    }
  }

  generateResetPasswordToken(): string {
    return jwt.sign({ timestamp: Date.now() }, this.configService.get('JWT_SECRET'), { expiresIn: '1h' });
  }

  async sendResetPasswordEmail(email: string, resetPasswordToken: string) {
    const mailOptions = {
      from: this.configService.get('gmail.user'),
      to: email,
      subject: 'Reset Password',
      html: `
        <h1>Reset your password</h1>
        <p>Please click the following link to reset your password:</p>
        <a href="${this.configService.get('frontend.url')}/reset-password/${resetPasswordToken}">Reset Password</a>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Reset password email sent successfully');
    } catch (err) {
      console.error('Error sending reset password email:', err);
      throw err; 
    }
  }
}