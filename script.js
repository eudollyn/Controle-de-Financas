// Variáveis
let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];

// Elementos do DOM
const body = document.body;
const alternarTemaBtn = document.getElementById('alternar-tema');
const form = document.getElementById('transacao-form');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const tipoSelect = document.getElementById('tipo');
const categoriaSelect = document.getElementById('categoria');
const erroMensagem = document.getElementById('erro-mensagem');
const lista = document.getElementById('lista');
const ganhosSpan = document.getElementById('ganhos');
const gastosSpan = document.getElementById('gastos');
const saldoSpan = document.getElementById('saldo');
const buscaInput = document.getElementById('busca');
const filtroTipo = document.getElementById('filtro-tipo');
const ordenarSelect = document.getElementById('ordenar');
const importarBtn = document.getElementById('importar-btn');
const importarArquivo = document.getElementById('importar-arquivo');
const exportarBtn = document.getElementById('exportar-btn');
const limparTudoBtn = document.getElementById('limpar-tudo-btn');
const resumoMensalLista = document.getElementById('resumo-mensal-lista');
const toggleChatbot = document.getElementById('toggle-chatbot');
const fecharChatbot = document.getElementById('fechar-chatbot');
const chatbotConversa = document.getElementById('chatbot-conversa');
const chatbotMensagens = document.getElementById('chatbot-mensagens');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotEnviar = document.getElementById('chatbot-enviar');
const opcoesChatbot = document.querySelectorAll('.opcao-chatbot');
const notificacao = document.getElementById('notificacao');

// Inicializar Tema
const temaSalvo = localStorage.getItem('tema') || 'tema-claro';
body.classList.add(temaSalvo);
if (temaSalvo === 'tema-escuro') {
  alternarTemaBtn.innerHTML = '<i class="fas fa-sun"></i>';
} else {
  alternarTemaBtn.innerHTML = '<i class="fas fa-moon"></i>';
}

// Inicializar Interface
atualizarInterface();

// Eventos
alternarTemaBtn.addEventListener('click', () => {
  const novoTema = body.classList.contains('tema-claro') ? 'tema-escuro' : 'tema-claro';
  body.classList.remove('tema-claro', 'tema-escuro');
  body.classList.add(novoTema);
  localStorage.setItem('tema', novoTema);
  alternarTemaBtn.innerHTML = novoTema === 'tema-claro' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  adicionarTransacao();
});

buscaInput.addEventListener('input', atualizarInterface);
filtroTipo.addEventListener('change', atualizarInterface);
ordenarSelect.addEventListener('change', atualizarInterface);

limparTudoBtn.addEventListener('click', () => {
  if (transacoes.length === 0) {
    mostrarNotificacao('Nenhuma transação para limpar.', 'error');
    return;
  }
  if (confirm('Tem certeza que deseja limpar todas as transações?')) {
    transacoes = [];
    salvarTransacoes();
    atualizarInterface();
    mostrarNotificacao('Todas as transações foram limpas.', 'success');
  }
});

importarBtn.addEventListener('click', () => {
  importarArquivo.click();
});

importarArquivo.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) throw new Error('Arquivo inválido.');
      transacoes = importedData;
      salvarTransacoes();
      atualizarInterface();
      mostrarNotificacao('Transações importadas com sucesso!', 'success');
    } catch (error) {
      mostrarNotificacao('Erro ao importar transações: ' + error.message, 'error');
    }
    importarArquivo.value = '';
  };
  reader.readAsText(file);
});

exportarBtn.addEventListener('click', () => {
  if (transacoes.length === 0) {
    mostrarNotificacao('Nenhuma transação para exportar.', 'error');
    return;
  }
  const dados = JSON.stringify(transacoes, null, 2);
  const blob = new Blob([dados], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transacoes.json';
  a.click();
  URL.revokeObjectURL(url);
  mostrarNotificacao('Transações exportadas com sucesso!', 'success');
});

toggleChatbot.addEventListener('click', () => {
  chatbotConversa.style.display = 'block';
  chatbotInput.focus();
});

fecharChatbot.addEventListener('click', () => {
  chatbotConversa.style.display = 'none';
});

chatbotEnviar.addEventListener('click', enviarMensagemChatbot);
chatbotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') enviarMensagemChatbot();
});

opcoesChatbot.forEach((botao) => {
  botao.addEventListener('click', () => {
    const mensagem = botao.dataset.mensagem;
    exibirMensagemUsuario(mensagem);
    responderMensagem(mensagem);
  });
});

function adicionarTransacao() {
  const descricao = (descricaoInput.value || '').trim();
  const valor = parseFloat(valorInput.value) || 0;
  const tipo = tipoSelect.value;
  const categoria = categoriaSelect.value;

  let valido = true;
  if (valor <= 0) {
    valorInput.classList.add('invalido');
    valido = false;
  } else {
    valorInput.classList.remove('invalido');
  }
  if (!tipo) {
    tipoSelect.classList.add('invalido');
    valido = false;
  } else {
    tipoSelect.classList.remove('invalido');
  }
  if (!categoria) {
    categoriaSelect.classList.add('invalido');
    valido = false;
  } else {
    categoriaSelect.classList.remove('invalido');
  }

  if (!valido) {
    erroMensagem.textContent = 'Por favor, preencha todos os campos corretamente.';
    erroMensagem.style.display = 'block';
    return;
  }

  erroMensagem.style.display = 'none';

  const transacao = {
    id: Date.now(),
    descricao: descricao || 'Sem descrição',
    valor,
    tipo,
    categoria,
    data: new Date().toLocaleString('pt-BR')
  };

  transacoes.push(transacao);
  salvarTransacoes();
  atualizarInterface();
  form.reset();
  mostrarNotificacao('Transação adicionada com sucesso!', 'success');
}

function excluirTransacao(id) {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
  transacoes = transacoes.filter(t => t.id !== id);
  salvarTransacoes();
  atualizarInterface();
  mostrarNotificacao('Transação excluída com sucesso!', 'success');
}

function atualizarInterface() {
  lista.innerHTML = '';
  let totalGanhos = 0;
  let totalGastos = 0;
  const filtro = filtroTipo.value;
  const busca = buscaInput.value.toLowerCase();
  const ordenar = ordenarSelect.value;

  let transacoesFiltradas = transacoes.filter(transacao => {
    const matchesFiltro = filtro === 'todos' || transacao.tipo === filtro;
    const matchesBusca = transacao.descricao.toLowerCase().includes(busca) || transacao.categoria.toLowerCase().includes(busca);
    return matchesFiltro && matchesBusca;
  });

  transacoesFiltradas.sort((a, b) => {
    if (ordenar === 'data-desc') return new Date(b.data) - new Date(a.data);
    if (ordenar === 'data-asc') return new Date(a.data) - new Date(b.data);
    if (ordenar === 'valor-desc') return b.valor - a.valor;
    return a.valor - b.valor;
  });

  transacoesFiltradas.forEach((transacao) => {
    if (transacao.tipo === 'ganho') {
      totalGanhos += transacao.valor;
    } else {
      totalGastos += transacao.valor;
    }

    const li = document.createElement('li');
    li.classList.add(transacao.tipo);
    li.innerHTML = `
      <span>${transacao.descricao} (${transacao.categoria}): R$ ${transacao.valor.toFixed(2)} - ${transacao.data}</span>
      <button onclick="excluirTransacao(${transacao.id})"><i class="fas fa-trash"></i> Excluir</button>
    `;
    lista.appendChild(li);
  });

  const saldo = totalGanhos - totalGastos;

  ganhosSpan.textContent = totalGanhos.toFixed(2);
  gastosSpan.textContent = totalGastos.toFixed(2);
  saldoSpan.textContent = saldo.toFixed(2);
  saldoSpan.classList.toggle('negativo', saldo < 0);

  atualizarResumoMensal();
  atualizarMeta();
}

function atualizarResumoMensal() {
  const resumoPorMes = {};

  transacoes.forEach(transacao => {
    const data = new Date(transacao.data);
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
    if (!resumoPorMes[mesAno]) {
      resumoPorMes[mesAno] = { ganhos: 0, gastos: 0 };
    }
    if (transacao.tipo === 'ganho') {
      resumoPorMes[mesAno].ganhos += transacao.valor;
    } else {
      resumoPorMes[mesAno].gastos += transacao.valor;
    }
  });

  resumoMensalLista.innerHTML = '';
  for (const [mes, valores] of Object.entries(resumoPorMes)) {
    const saldoMensal = valores.ganhos - valores.gastos;
    const p = document.createElement('p');
    p.innerHTML = `${mes}: Ganhos R$ ${valores.ganhos.toFixed(2)} | Gastos R$ ${valores.gastos.toFixed(2)} | Saldo R$ ${saldoMensal.toFixed(2)}`;
    resumoMensalLista.appendChild(p);
  }
}

function salvarTransacoes() {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
}

function enviarMensagemChatbot() {
  const mensagem = chatbotInput.value.trim();
  if (!mensagem) return;

  exibirMensagemUsuario(mensagem);
  responderMensagem(mensagem);
  chatbotInput.value = '';
}

function exibirMensagemUsuario(mensagem) {
  const userMsg = document.createElement('div');
  userMsg.classList.add('chatbot-mensagem', 'usuario');
  userMsg.textContent = mensagem;
  chatbotMensagens.appendChild(userMsg);
  chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

function responderMensagem(mensagem) {
  const botMsg = document.createElement('div');
  botMsg.classList.add('chatbot-mensagem', 'bot');
  botMsg.textContent = analisarGastos(mensagem);
  chatbotMensagens.appendChild(botMsg);
  chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

function analisarGastos(mensagem) {
  const gastosPorCategoria = {};
  let totalGanhos = 0;
  let totalGastos = 0;

  transacoes.forEach(t => {
    if (t.tipo === 'ganho') {
      totalGanhos += t.valor;
    } else {
      totalGastos += t.valor;
      gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.valor;
    }
  });

  const saldo = totalGanhos - totalGastos;

  mensagem = mensagem.toLowerCase();

  if (mensagem.includes('analise') || mensagem.includes('gastos')) {
    if (totalGastos === 0) return 'Você ainda não registrou gastos.';
    let resposta = 'Análise dos seus gastos:\n';
    for (const [cat, valor] of Object.entries(gastosPorCategoria)) {
      const porcentagem = ((valor / totalGastos) * 100).toFixed(2);
      resposta += `- ${cat}: R$ ${valor.toFixed(2)} (${porcentagem}%)\n`;
    }
    if (gastosPorCategoria.alimentacao > totalGastos * 0.4) {
      resposta += '⚠️ Seus gastos com alimentação estão altos. Tente planejar refeições em casa!';
    } else if (gastosPorCategoria.lazer > totalGastos * 0.3) {
      resposta += '⚠️ Gastos com lazer estão elevados. Que tal buscar atividades gratuitas?';
    }
    if (saldo < -500) {
      resposta += '⚠️ Seu saldo está muito negativo (R$ ' + saldo.toFixed(2) + '). Considere reduzir gastos ou aumentar seus ganhos.';
    }
    return resposta;
  } else if (mensagem.includes('dica')) {
    return '💡 Reserve 20% dos seus ganhos para poupança. Evite compras por impulso e priorize o essencial!';
  } else if (mensagem.includes('saldo')) {
    return `Seu saldo atual é R$ ${saldo.toFixed(2)}. ${saldo > 0 ? 'Ótimo, você está no positivo!' : 'Cuidado, seu saldo está negativo.'}`;
  } else if (mensagem.includes('meta')) {
    if (saldo <= 0) return 'Seu saldo está zerado ou negativo. Tente aumentar seus ganhos ou reduzir gastos antes de definir uma meta.';
    const metaSugerida = (saldo * 0.2).toFixed(2);
    return `Com base no seu saldo de R$ ${saldo.toFixed(2)}, sugiro uma meta de poupança de R$ ${metaSugerida}. Isso representa 20% do seu saldo atual.`;
  } else if (mensagem.includes('ajuda')) {
    return 'Aqui estão os comandos disponíveis:\n- "Analise meus gastos": Veja uma análise detalhada dos seus gastos.\n- "Dê uma dica financeira": Receba uma dica para melhorar suas finanças.\n- "Como está meu saldo?": Verifique seu saldo atual.\n- "Sugira uma meta": Receba uma sugestão de meta de poupança.\n- "Ajuda": Liste os comandos disponíveis.';
  } else {
    return 'Desculpe, não entendi. Tente perguntar sobre "gastos", "saldo", pedir uma "dica", "sugira uma meta" ou digite "Ajuda" para ver os comandos.';
  }
}

function mostrarNotificacao(mensagem, tipo = 'success') {
  notificacao.textContent = mensagem;
  notificacao.style.display = 'block';
  notificacao.style.background = tipo === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
  setTimeout(() => {
    notificacao.style.display = 'none';
  }, 3000);
}


function atualizarMeta() {
  const saldo = transacoes.reduce((acc, t) => t.tipo === 'ganho' ? acc + t.valor : acc - t.valor, 0);
  const metaPercentual = 0.2;
  const meta = saldo * metaPercentual;

  document.getElementById("meta-valor").textContent = `R$ ${meta.toFixed(2)}`;

  const poupado = transacoes
    .filter(t => t.tipo === "ganho" && t.categoria === "poupança")
    .reduce((acc, cur) => acc + cur.valor, 0);

  document.getElementById("poupado").textContent = `R$ ${poupado.toFixed(2)}`;

  const progresso = meta > 0 ? Math.min((poupado / meta) * 100, 100) : 0;
  document.getElementById("barra-progresso").style.width = `${progresso}%`;
}
