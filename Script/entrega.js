// 1. Configuração do Mapa
const map = L.map("map").setView([-22.9064, -47.0616], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

// --- NOVO: MARCADOR DO CAFÉ ---
// Substitua estas coordenadas pelas coordenadas REAIS do seu café
const coordsCafe = [-22.92, -47.03];
const cafeMarker = L.marker(coordsCafe).addTo(map);
cafeMarker
  .bindPopup("<b>☕ Nosso Café</b><br>Rua Exemplo, 123 - Centro")
  .openPopup();
// ------------------------------

// 2. Área de Campinas (GeoJSON)
const campinasArea = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-47.01, -22.74],
        [-46.93, -22.8],
        [-46.91, -22.87],
        [-46.95, -22.96],
        [-47.03, -23.04],
        [-47.12, -23.04],
        [-47.21, -22.98],
        [-47.18, -22.88],
        [-47.25, -22.82],
        [-47.15, -22.75],
        [-47.01, -22.74],
      ],
    ],
  },
};

L.geoJSON(campinasArea, {
  style: { color: "#2563eb", weight: 2, fillOpacity: 0.1 },
}).addTo(map);

let marcadorUsuario; // Renomeado para não confundir com o do café

// 3. Função Principal: Buscar Endereço (Mantida original)
async function buscarEndereco() {
  const query = document.getElementById("endereco").value;
  if (!query) return alert("Digite um endereço!");

  const resDiv = document.getElementById("resultado");
  resDiv.style.display = "block";
  resDiv.style.background = "#e5e7eb";
  resDiv.innerHTML = "Buscando...";

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    );
    const data = await response.json();

    if (data.length === 0) {
      resDiv.innerHTML = "Endereço não encontrado. Tente ser mais específico.";
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    map.setView([lat, lon], 15);

    if (marcadorUsuario) map.removeLayer(marcadorUsuario);
    marcadorUsuario = L.marker([lat, lon]).addTo(map);

    const pt = turf.point([lon, lat]);
    const estaDentro = turf.booleanPointInPolygon(pt, campinasArea);

    if (estaDentro) {
      resDiv.style.background = "#dcfce7";
      resDiv.style.color = "#166534";
      resDiv.innerHTML = "✅ Ótima notícia! Entregamos neste endereço.";
      marcadorUsuario.bindPopup("<b>Seu endereço</b>").openPopup();
    } else {
      resDiv.style.background = "#fee2e2";
      resDiv.style.color = "#991b1b";
      resDiv.innerHTML = "❌ Infelizmente ainda não entregamos nesta região.";
      marcadorUsuario.bindPopup("<b>Fora da área</b>").openPopup();
    }
  } catch (error) {
    console.error(error);
    resDiv.innerHTML = "Erro ao buscar endereço. Tente novamente.";
  }
}
