/**
 * Service Worker para Instituto Buriti PWA
 * Implementa cache, offline e notificações
 */

const CACHE_NAME = 'instituto-buriti-v1.0.0';
const STATIC_CACHE = 'instituto-buriti-static-v1.0.0';
const DYNAMIC_CACHE = 'instituto-buriti-dynamic-v1.0.0';

// Arquivos essenciais para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/auth-real.css',
  '/css/chat.css',
  '/css/gamification.css',
  '/css/payments.css',
  '/css/analytics.css',
  '/js/auth-real.js',
  '/js/chat-client.js',
  '/js/gamification.js',
  '/js/payments.js',
  '/js/analytics.js',
  '/js/supabase-integration.js',
  '/pages/login-real.html',
  '/pages/registro-real.html',
  '/pages/cursos.html',
  '/pages/chat.html',
  '/pages/gamificacao.html',
  '/pages/pagamentos.html',
  '/pages/materiais.html',
  '/manifest.json'
];

// URLs da API para cache dinâmico
const API_URLS = [
  'https://zmhqivcvkygp.manus.space/api',
  'https://zmhqivcvkygp.manus.space/api/auth',
  'https://zmhqivcvkygp.manus.space/api/courses',
  'https://zmhqivcvkygp.manus.space/api/gamification',
  'https://zmhqivcvkygp.manus.space/api/payments'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Cacheando arquivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia Cache First para arquivos estáticos
  if (STATIC_FILES.includes(url.pathname) || request.destination === 'image') {
    event.respondWith(cacheFirst(request));
  }
  // Estratégia Network First para APIs
  else if (isApiRequest(request.url)) {
    event.respondWith(networkFirst(request));
  }
  // Estratégia Stale While Revalidate para páginas
  else if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Estratégia Network First para outros recursos
  else {
    event.respondWith(networkFirst(request));
  }
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First falhou:', error);
    return new Response('Offline - Recurso não disponível', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 Network falhou, tentando cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar página offline para documentos
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    return new Response('Offline - Recurso não disponível', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Verificar se é requisição de API
function isApiRequest(url) {
  return API_URLS.some(apiUrl => url.startsWith(apiUrl));
}

// Notificações Push
self.addEventListener('push', event => {
  console.log('📱 Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Instituto Buriti',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/images/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Instituto Buriti', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Função de sincronização
async function doBackgroundSync() {
  try {
    // Sincronizar dados offline
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
      await clearOfflineData();
    }
    
    console.log('✅ Background sync concluído');
  } catch (error) {
    console.error('❌ Erro no background sync:', error);
  }
}

// Obter dados offline
async function getOfflineData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    return keys.filter(request => request.url.includes('offline-data'));
  } catch (error) {
    console.error('❌ Erro ao obter dados offline:', error);
    return [];
  }
}

// Sincronizar dados offline
async function syncOfflineData(data) {
  for (const item of data) {
    try {
      await fetch(item.url, {
        method: 'POST',
        body: item.data
      });
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
    }
  }
}

// Limpar dados offline
async function clearOfflineData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    
    for (const request of keys) {
      if (request.url.includes('offline-data')) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar dados offline:', error);
  }
}

// Mensagens do cliente
self.addEventListener('message', event => {
  console.log('💬 Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Logs de debug
console.log('🚀 Service Worker carregado - Instituto Buriti PWA');
console.log('📦 Cache estático:', STATIC_CACHE);
console.log('🔄 Cache dinâmico:', DYNAMIC_CACHE);
console.log('📱 PWA pronto para instalação');

