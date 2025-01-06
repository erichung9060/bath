import body from './index.html';

export default {
  async fetch(request, env) {
      const url = new URL(request.url);
      const path = url.pathname;

      // API 路由處理
      if (path === '/api/getTimer') {
          const timer = await env.COUNTER_KV.get('current_timer', 'json');

          return new Response(JSON.stringify({
              endTime: timer ? timer.endTime : null
              
          }), {
              headers: { 'Content-Type': 'application/json' }
          });
      }

      if (path === '/api/startTimer' && request.method === 'POST') {
          // 檢查是否已有計時器在運行
          const existingTimer = await env.COUNTER_KV.get('current_timer', 'json');
          if (existingTimer && existingTimer.endTime > Date.now()) {
              return new Response(JSON.stringify({ 
                  success: false, 
                  message: 'Timer already running' 
              }), {
                  headers: { 'Content-Type': 'application/json' }
              });
          }

          const data = await request.json();
          const endTime = Date.now() + (data.duration * 1000);
          
          await env.COUNTER_KV.put('current_timer', JSON.stringify({
              endTime: endTime
          }));

          return new Response(JSON.stringify({ success: true }), {
              headers: { 'Content-Type': 'application/json' }
          });
      }

      // 預設回傳 HTML
      return new Response(body, {
          headers: { 'Content-Type': 'text/html' }
      });
  }
};
