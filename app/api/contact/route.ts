import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@chickenloop.com';

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      // Log the submission for manual processing if SMTP is not configured
      console.log('Contact Form Submission (SMTP not configured):', {
        to: 'hello@chickenloop.com',
        from: email,
        name,
        message,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { 
          error: 'Email service is not configured. Please contact support directly at hello@chickenloop.com',
          fallback: true 
        },
        { status: 503 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: smtpFrom,
      to: 'hello@chickenloop.com',
      replyTo: email,
      subject: `Feedback from ${name}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Feedback Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Thank you for your feedback! We will get back to you soon.' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: errorMessage || 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

