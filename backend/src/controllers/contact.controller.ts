import { Request, Response, NextFunction } from 'express';

export class ContactController {
  async submitContactForm(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, subject, message } = req.body;

      // Log contact form submission (you can add email notification here)
      console.log('📧 Contact Form Submission:');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Subject:', subject);
      console.log('Message:', message);

      // In a production environment, you would:
      // 1. Save to database
      // 2. Send email notification to admin
      // 3. Send confirmation email to user

      res.status(200).json({
        status: 'success',
        message: 'Thank you for contacting us! We will get back to you soon.',
      });
    } catch (error) {
      next(error);
    }
  }
}
