import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@assuredpartners.com',
  development: process.env.NODE_ENV === 'development',
};

// Email templates
export const EmailTemplates = {
  WELCOME: 'welcome',
  REPORT_READY: 'report-ready',
  EXPORT_COMPLETE: 'export-complete',
  CALCULATION_COMPLETE: 'calculation-complete',
  ERROR_NOTIFICATION: 'error-notification',
  DEMO_SCHEDULED: 'demo-scheduled',
} as const;

type EmailTemplate = typeof EmailTemplates[keyof typeof EmailTemplates];

// Email sending utility with retry logic
export class EmailService {
  private static instance: EmailService;
  private queue: Array<any> = [];
  private processing = false;
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }
  
  // Send email with automatic retry
  async send(options: {
    to: string | string[];
    subject: string;
    template: EmailTemplate;
    data?: Record<string, any>;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // In development, log email instead of sending
      if (EMAIL_CONFIG.development) {
        console.log('📧 Email (DEV MODE):', {
          to: options.to,
          subject: options.subject,
          template: options.template,
          data: options.data,
        });
        return { success: true, id: 'dev-mode-email' };
      }
      
      // Generate HTML content based on template
      const html = this.generateTemplate(options.template, options.data);
      
      // Send email via Resend
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html,
        reply_to: EMAIL_CONFIG.replyTo,
      });
      
      console.log(`✅ Email sent: ${response.id}`);
      return { success: true, id: response.id };
      
    } catch (error: any) {
      console.error('❌ Email send failed:', error);
      
      // Add to retry queue if rate limited
      if (error.message?.includes('rate') || error.status === 429) {
        this.addToQueue(options);
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }
  
  // Generate HTML template
  private generateTemplate(
    template: EmailTemplate,
    data?: Record<string, any>
  ): string {
    const baseStyles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #003D7A; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    `;
    
    switch (template) {
      case EmailTemplates.WELCOME:
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Welcome to Survey & Reporting Platform</h1>
            </div>
            <div class="content">
              <p>Hi ${data?.name || 'there'},</p>
              <p>Welcome to the Assured Partners Survey & Reporting Platform! Your account has been created successfully.</p>
              <p>You can now:</p>
              <ul>
                <li>Upload survey data via CSV</li>
                <li>View real-time analytics and reports</li>
                <li>Run what-if scenarios</li>
                <li>Compare with peer organizations</li>
              </ul>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a></p>
            </div>
            <div class="footer">
              <p>© 2024 Assured Partners. All rights reserved.</p>
            </div>
          </div>
        `;
        
      case EmailTemplates.REPORT_READY:
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Your Report is Ready</h1>
            </div>
            <div class="content">
              <p>Your ${data?.reportType || 'monthly'} report has been generated successfully.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Period: ${data?.period || 'Last 30 days'}</li>
                <li>Organizations: ${data?.orgCount || '40'}</li>
                <li>Total Variance: ${data?.variance || '$2.3M'}</li>
              </ul>
              <p><a href="${data?.downloadUrl || '#'}" class="button">Download Report</a></p>
            </div>
            <div class="footer">
              <p>This report will be available for 30 days.</p>
            </div>
          </div>
        `;
        
      case EmailTemplates.EXPORT_COMPLETE:
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Export Complete</h1>
            </div>
            <div class="content">
              <p>Your data export has been completed successfully.</p>
              <p>Format: ${data?.format || 'CSV'}</p>
              <p>Rows: ${data?.rowCount || '0'}</p>
              <p><a href="${data?.downloadUrl}" class="button">Download Export</a></p>
            </div>
            <div class="footer">
              <p>Download link expires in 24 hours.</p>
            </div>
          </div>
        `;
        
      default:
        return `
          ${baseStyles}
          <div class="container">
            <div class="content">
              <p>${data?.message || 'Notification from Survey Platform'}</p>
            </div>
          </div>
        `;
    }
  }
  
  // Queue management for rate limiting
  private addToQueue(emailOptions: any) {
    this.queue.push({
      ...emailOptions,
      retryCount: 0,
      addedAt: Date.now(),
    });
    
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const email = this.queue.shift();
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, email.retryCount), 60000);
    
    setTimeout(async () => {
      const result = await this.send(email);
      
      if (!result.success && email.retryCount < 3) {
        email.retryCount++;
        this.queue.push(email);
      }
      
      this.processQueue();
    }, delay);
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

// Notification helpers
export const notifications = {
  async sendWelcomeEmail(user: { email: string; name: string }) {
    return emailService.send({
      to: user.email,
      subject: 'Welcome to Survey & Reporting Platform',
      template: EmailTemplates.WELCOME,
      data: { name: user.name },
    });
  },
  
  async sendReportReady(params: {
    email: string;
    reportType: string;
    period: string;
    downloadUrl: string;
    variance: string;
    orgCount: number;
  }) {
    return emailService.send({
      to: params.email,
      subject: `Your ${params.reportType} report is ready`,
      template: EmailTemplates.REPORT_READY,
      data: params,
    });
  },
  
  async sendExportComplete(params: {
    email: string;
    format: string;
    rowCount: number;
    downloadUrl: string;
  }) {
    return emailService.send({
      to: params.email,
      subject: 'Your data export is complete',
      template: EmailTemplates.EXPORT_COMPLETE,
      data: params,
    });
  },
};