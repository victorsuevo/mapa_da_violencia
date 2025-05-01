const mapa = L.map('mapa').setView([-32.0349, -52.1071], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(mapa);

let marcadorSelecionado = null;

// Função para obter a cor do marcador com base no tipo de ocorrência
function getMarkerColor(tipo) {
  switch (tipo) {
    case "Violência Física": return "red";
    case "Violência Psicológica": return "purple";
    case "Violência Sexual": return "darkred";
    case "Violência Doméstica": return "orange";
    case "Furto": return "blue";
    case "Roubo": return "black";
    case "Outros": return "cadetblue";
    default: return "gray";
  }
}

// Função para obter o nome do ícone com base no tipo de ocorrência
function getMarkerIconName(tipo) {
  switch (tipo) {
    case "Violência Física": return "hand-fist";
    case "Violência Psicológica": return "brain";
    case "Violência Sexual": return "venus-mars";
    case "Violência Doméstica": return "house";
    case "Furto": return "hand-scissors";
    case "Roubo": return "mask";
    case "Outros": return "question";
    default: return "circle-question";
  }
}

// Função para criar o ícone do marcador
function getMarkerIcon(tipo) {
  const color = getMarkerColor(tipo);
  const iconName = getMarkerIconName(tipo);

  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor: color,
    prefix: 'fa'
  });
}

// Função para carregar a localização atual do usuário
function obterLocalizacaoUsuario() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      mapa.setView([lat, lng], 13);
      L.marker([lat, lng]).addTo(mapa)
        .bindPopup('Sua localização atual')
        .openPopup();
    }, function(error) {
      alert('Erro ao obter localização: ' + error.message);
    });
  } else {
    alert('Geolocalização não é suportada por este navegador.');
  }
}

mapa.on('click', function(e) {
  // Remove o marcador anterior, caso exista
  if (marcadorSelecionado) {
    mapa.removeLayer(marcadorSelecionado);
  }

  // Adiciona o novo marcador no local clicado
  marcadorSelecionado = L.marker(e.latlng).addTo(mapa);
  document.getElementById("latitude").value = e.latlng.lat;
  document.getElementById("longitude").value = e.latlng.lng;
});

// Função para adicionar um marcador ao mapa
function adicionarMarcador(ocorrencia) {
  const marker = L.marker([ocorrencia.latitude, ocorrencia.longitude], {
    icon: getMarkerIcon(ocorrencia.tipo)
  }).addTo(mapa);

  const descricao = ocorrencia.descricao ? `<p><strong>Descrição:</strong> ${ocorrencia.descricao}</p>` : '';
  marker.bindPopup(`<strong>${ocorrencia.tipo}</strong>${descricao}`);
}

// Função para carregar as ocorrências salvas e exibi-las no mapa
async function carregarOcorrenciasSalvas() {
  const resposta = await fetch('http://localhost:5000/ocorrencias');
  const ocorrencias = await resposta.json();

  ocorrencias.forEach(ocorrencia => {
    adicionarMarcador(ocorrencia);
  });
}

// Função que será executada ao submeter o formulário
document.getElementById("formOcorrencia").addEventListener("submit", async function(event) {
  event.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const descricao = document.getElementById("descricao").value;
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  const dados = { tipo, descricao, latitude, longitude };

  const resposta = await fetch("http://localhost:5000/ocorrencias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();
  alert(resultado.mensagem);
  
  // Adiciona o marcador ao mapa, sem removê-lo após o envio
  adicionarMarcador(dados);

  // Não remove o marcador selecionado após o envio
  marcadorSelecionado = null;
});

// Carregar as ocorrências salvas ao carregar a página
carregarOcorrenciasSalvas();

// Carregar a localização do usuário ao carregar a página
obterLocalizacaoUsuario();
