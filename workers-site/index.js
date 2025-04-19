/**
 * ไฟล์นี้ใช้สำหรับการรัน Express app บน Cloudflare Workers
 */

import { createRequestHandler } from '@cloudflare/workers-types';
const app = require('../app.js');

/**
 * ตัวจัดการคำขอสำหรับ Cloudflare Workers
 */
const handleRequest = async (request, env, ctx) => {
  // กำหนดตัวแปรสภาพแวดล้อมสำหรับ Cloudflare
  process.env.CLOUDFLARE_PAGES = 'true';
  process.env.NODE_ENV = env.NODE_ENV || 'production';
  
  // แปลงคำขอจาก Cloudflare Workers เป็นคำขอ Express
  const url = new URL(request.url);
  const expressRequest = {
    method: request.method,
    url: url.pathname + url.search,
    headers: request.headers,
    body: request.body,
    query: Object.fromEntries(url.searchParams),
  };

  // สร้าง response object สำหรับ Express
  let expressResponse = {};
  const response = await new Promise((resolve) => {
    expressResponse = {
      statusCode: 200,
      headers: new Headers(),
      body: [],
      set: function(name, value) {
        this.headers.set(name, value);
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      send: function(body) {
        this.body = body;
        resolve(new Response(body, {
          status: this.statusCode,
          headers: this.headers
        }));
      },
      json: function(obj) {
        this.headers.set('Content-Type', 'application/json');
        this.body = JSON.stringify(obj);
        resolve(new Response(this.body, {
          status: this.statusCode,
          headers: this.headers
        }));
      },
      end: function() {
        resolve(new Response(this.body, {
          status: this.statusCode,
          headers: this.headers
        }));
      }
    };
    
    // ส่งคำขอไปยัง Express app
    app(expressRequest, expressResponse);
  });

  return response;
};

// สำหรับ Cloudflare Pages Functions
export default {
  fetch: handleRequest
};