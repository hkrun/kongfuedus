import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const courseId = searchParams.get('courseId');
  const sessionId = searchParams.get('session_id');

  console.log('=== Stripe 重定向处理 ===');
  console.log('成功状态:', success);
  console.log('取消状态:', canceled);
  console.log('课程ID:', courseId);
  console.log('Session ID:', sessionId);

  // 构建重定向URL
  let redirectUrl = '';

      if (success) {
      // 支付成功
      if (courseId) {
        // 如果有课程ID，返回到课程页面
        if (success === 'one-time') {
          redirectUrl = `/courses/${courseId}?success=one-time`;
          console.log('✅ 重定向到课程页面（一次性购买成功）:', redirectUrl);
        } else {
          redirectUrl = `/courses/${courseId}?success=${success}`;
          console.log('✅ 重定向到课程页面:', redirectUrl);
        }
      } else {
        // 没有课程ID，返回到dashboard
        redirectUrl = `/dashboard?success=${success}`;
        console.log('✅ 重定向到dashboard:', redirectUrl);
      }
    } else if (canceled) {
    // 支付取消
    if (courseId) {
      // 如果有课程ID，返回到课程页面
      redirectUrl = `/courses/${courseId}?canceled=true`;
      console.log('❌ 重定向到课程页面（取消）:', redirectUrl);
    } else {
      // 没有课程ID，返回到课程列表
      redirectUrl = `/courses?canceled=true`;
      console.log('❌ 重定向到课程列表（取消）:', redirectUrl);
    }
  } else {
    // 默认情况，返回到首页
    redirectUrl = '/';
    console.log('🏠 重定向到首页');
  }

  console.log('=== 重定向处理完成 ===');
  
  // 使用Next.js的redirect函数进行重定向
  redirect(redirectUrl);
}
