import { useEffect } from 'react';

// Insira seu Pixel ID do Facebook aqui
const FACEBOOK_PIXEL_ID = ''; 

export default function PixelTracker() {
  useEffect(() => {
    if (!FACEBOOK_PIXEL_ID) return;

    // Facebook Pixel Code
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window as any, document, 'script',
      'https://connect.facebook.net/en_US/fbevents.js'));
    
    (window as any).fbq('init', FACEBOOK_PIXEL_ID);
    (window as any).fbq('track', 'PageView');
  }, []);

  return null;
}
