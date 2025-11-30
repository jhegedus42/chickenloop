import { NextRequest, NextResponse } from 'next/server';

// POST - Send contact/feedback email
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (e.g., nodemailer, SendGrid, Resend, etc.)
    // For now, we'll log the message. In production, you should:
    // 1. Install nodemailer: npm install nodemailer
    // 2. Configure SMTP settings in environment variables
    // 3. Send email to hello@chickenloop.com
    
    console.log('Contact Form Submission:', {
      to: 'hello@chickenloop.com',
      from: email,
      name,
      message,
      timestamp: new Date().toISOString(),
    });

    // In production, replace the above with actual email sending:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    // 
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM || email,
    //   to: 'hello@chickenloop.com',
    //   subject: `Feedback from ${name}`,
    //   text: `From: ${name} (${email})\n\n${message}`,
    //   html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, '<br>')}</p>`,
    // });

    return NextResponse.json(
      { message: 'Thank you for your feedback! We will get back to you soon.' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

