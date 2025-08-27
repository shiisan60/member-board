import { NextRequest, NextResponse } from 'next/server';
import { getEmailHealthStatus, testEmailConnection } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    // Check if this is an authorized request (simple auth check)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.API_MONITORING_TOKEN;
    
    // For production, require authentication
    if (process.env.NODE_ENV === 'production' && expectedToken) {
      if (authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Get health status
    const healthStatus = await getEmailHealthStatus();
    const connectionTest = await testEmailConnection();

    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      health: healthStatus,
      configuration: {
        EMAIL_FROM: !!process.env.EMAIL_FROM,
        EMAIL_FROM_NAME: !!process.env.EMAIL_FROM_NAME,
        EMAIL_HOST: !!process.env.EMAIL_HOST,
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
        SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
        AWS_SES_REGION: !!process.env.AWS_SES_REGION
      },
      connectionTest: connectionTest.success,
      details: process.env.NODE_ENV !== 'production' ? connectionTest.details : undefined
    };

    // Determine HTTP status based on health
    let status = 200;
    if (healthStatus.overallHealth === 'critical') {
      status = 503; // Service Unavailable
    } else if (healthStatus.overallHealth === 'degraded') {
      status = 200; // Still operational but degraded
    }

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-Health-Status', healthStatus.overallHealth);

    return NextResponse.json(response, { status, headers });

  } catch (error: any) {
    console.error('Email health check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Health check failed',
        message: process.env.NODE_ENV !== 'production' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}