import { onLCP, onINP, onCLS } from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js';

// Abrir/crear IndexedDB
const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open('WebVitalsRUM', 1);
  
  request.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('metricas')) {
      db.createObjectStore('metricas', { autoIncrement: true });
    }
  };
  
  request.onsuccess = e => resolve(e.target.result);
  request.onerror = e => reject(e);
});

// Función para guardar métrica
async function guardarMetrica(metrica) {
  const data = {
    nombre: metrica.name,
    valor: metrica.value,
    valorRedondeado: Math.round(metrica.value),
    calificacion: metrica.rating,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };

  // Imprimir en consola
  console.log(`[Web Vitals RUM] ${data.nombre}: ${data.valorRedondeado}ms - ${data.calificacion}`, data);

  // Guardar en IndexedDB
  try {
    const db = await dbPromise;
    const tx = db.transaction('metricas', 'readwrite');
    tx.objectStore('metricas').add(data);
  } catch(err) {
    console.error('[Web Vitals RUM] Error guardando en IndexedDB:', err);
  }
}

// Capturar las 3 métricas Core Web Vitals
onLCP(guardarMetrica);
onINP(guardarMetrica);
onCLS(guardarMetrica);

// Ver datos guardados escribiendo verMetricasRUM() en consola
window.verMetricasRUM = async function() {
  const db = await dbPromise;
  const tx = db.transaction('metricas', 'readonly');
  const store = tx.objectStore('metricas');
  const request = store.getAll();
  request.onsuccess = () => {
    console.table(request.result);
  };
};

console.log('[Web Vitals RUM] Monitoreo iniciado. Escribe verMetricasRUM() en consola para ver los datos.');