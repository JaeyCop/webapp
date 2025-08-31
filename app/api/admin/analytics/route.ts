import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase } from '../../../lib/db_enhanced';
import { authenticateRequest } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const db = new EnhancedDatabase((request as unknown as { env: { DB: unknown } }).env.DB);

        // Authenticate the request
        const user = await authenticateRequest(request, db);
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = searchParams.get('end') || new Date().toISOString();
        const period = searchParams.get('period') || '30d';

        // Get analytics data
        const analytics = await db.getAnalytics(startDate, endDate);

        // Mock additional data for now (in a real app, you'd calculate these from your analytics events)
        const mockAnalytics = {
            pageViews: analytics.pageViews || 1250,
            uniqueVisitors: Math.floor((analytics.pageViews || 1250) * 0.7),
            avgSessionDuration: 180, // 3 minutes in seconds
            topArticles: analytics.topArticles || [
                { title: 'Getting Started with Next.js', slug: 'getting-started-nextjs', views: 450, reading_time: 5 },
                { title: 'Building a Blog with React', slug: 'building-blog-react', views: 320, reading_time: 8 },
                { title: 'JavaScript Best Practices', slug: 'javascript-best-practices', views: 280, reading_time: 6 },
                { title: 'CSS Grid Layout Guide', slug: 'css-grid-layout-guide', views: 210, reading_time: 7 },
                { title: 'TypeScript for Beginners', slug: 'typescript-beginners', views: 180, reading_time: 10 }
            ],
            deviceBreakdown: {
                desktop: Math.floor((analytics.pageViews || 1250) * 0.6),
                mobile: Math.floor((analytics.pageViews || 1250) * 0.3),
                tablet: Math.floor((analytics.pageViews || 1250) * 0.1)
            },
            trafficSources: [
                { source: 'Direct', visits: Math.floor((analytics.pageViews || 1250) * 0.4), percentage: 40 },
                { source: 'Google', visits: Math.floor((analytics.pageViews || 1250) * 0.35), percentage: 35 },
                { source: 'Social Media', visits: Math.floor((analytics.pageViews || 1250) * 0.15), percentage: 15 },
                { source: 'Referrals', visits: Math.floor((analytics.pageViews || 1250) * 0.1), percentage: 10 }
            ],
            dailyViews: generateDailyViews(period, analytics.pageViews || 1250)
        };

        return NextResponse.json(mockAnalytics);

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

function generateDailyViews(period: string, totalViews: number) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const dailyViews = [];
    const avgViews = Math.floor(totalViews / days);
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add some randomness to make it look realistic
        const variance = Math.floor(Math.random() * avgViews * 0.5);
        const views = Math.max(0, avgViews + (Math.random() > 0.5 ? variance : -variance));
        
        dailyViews.push({
            date: date.toISOString().split('T')[0],
            views
        });
    }
    
    return dailyViews;
}

export async function POST(request: NextRequest) {
    try {
        const db = new EnhancedDatabase((request as unknown as { env: { DB: unknown } }).env.DB);

        const body = await request.json();
        const {
            event_type,
            article_id,
            session_id,
            ip_address,
            user_agent,
            referrer,
            country,
            city,
            device_type
        } = body;

        if (!event_type) {
            return NextResponse.json(
                { message: 'Event type is required' },
                { status: 400 }
            );
        }

        // Track the event
        await db.trackEvent({
            event_type,
            article_id,
            session_id,
            ip_address,
            user_agent,
            referrer,
            country,
            city,
            device_type
        });

        // If it's an article view, increment the view count
        if (event_type === 'article_view' && article_id) {
            await db.incrementViewCount(article_id);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}