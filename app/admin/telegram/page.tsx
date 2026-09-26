import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminTelegramStatus() {
  const { data: logs } = await supabase.from('sync_logs').select('*').order('created_at', { ascending: false }).limit(5);
  const { data: lastPost } = await supabase.from('telegram_posts').select('*').order('created_at', { ascending: false }).limit(1).single();

  const botTokenSet = !!process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecretSet = !!process.env.TELEGRAM_WEBHOOK_SECRET;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || 'غير محدد';

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">حالة اتصال Telegram Webhook</h1>
          <Link href="/admin" className="text-gray-600 hover:underline">← رجوع للوحة الإدارة</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 mb-6">
          <div className="flex justify-between border-b pb-3">
            <span className="font-medium text-gray-600">Telegram Connection:</span>
            <span className={`px-2 py-1 rounded text-sm font-bold ${botTokenSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {botTokenSet ? 'Connected (Token Active)' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="font-medium text-gray-600">Webhook Secret Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-bold ${webhookSecretSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {webhookSecretSet ? 'Active / Secure' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="font-medium text-gray-600">Channel ID:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{channelId}</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="font-medium text-gray-600">Last Message Received:</span>
            <span className="text-sm">{lastPost ? `Message ID ${lastPost.message_id} at ${new Date(lastPost.processed_at).toLocaleString('ar-IQ')}` : 'لا توجد رسائل بعد'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">سجل الأخطاء والعمليات (Sync Logs)</h2>
          {(!logs || logs.length === 0) ? (
            <p className="text-gray-500 text-sm">لا توجد أخطاء مسجلة، كل شيء يعمل بسلاسة.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
                  <p className="font-bold">{log.error}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(log.created_at).toLocaleString('ar-IQ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
