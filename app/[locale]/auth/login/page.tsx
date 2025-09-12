import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

function LoginContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载中...</h2>
          <p className="text-gray-600">正在加载登录页面</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
