import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, TrendingUp, DollarSign, Calculator, 
  CreditCard, Trash2, Activity, RefreshCw, Calendar, 
  PieChart, Search, AlertTriangle, CheckCircle2, MousePointerClick,
  ArrowRight, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Componentes Visuais para "Ilustração" ---

const MockCard = ({ title, value, color, icon: Icon }) => (
  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col justify-between h-24 w-full opacity-90">
    <div className="flex justify-between items-start">
      <span className="text-[10px] uppercase text-gray-400 font-bold">{title}</span>
      {Icon && <Icon className={`w-4 h-4 ${color}`} />}
    </div>
    <span className={`text-lg font-bold ${color}`}>{value}</span>
  </div>
);

const MockChart = () => (
  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 h-32 flex items-end justify-between gap-1">
    {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
      <div key={i} className="bg-blue-500/50 hover:bg-blue-500 w-full rounded-t" style={{ height: `${h}%` }}></div>
    ))}
  </div>
);

const TipBox = ({ title, children }) => (
  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex gap-3 my-4">
    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
    <div>
      <h4 className="font-bold text-blue-300 mb-1">{title}</h4>
      <div className="text-sm text-gray-300 space-y-2">{children}</div>
    </div>
  </div>
);

// --- Navegação Interna do Manual ---
const SECTIONS = [
  { id: 'visao-geral', label: 'Visão Geral & Dashboard', icon: Activity },
  { id: 'ativos', label: 'Gestão de Ativos (Investimentos)', icon: TrendingUp },
  { id: 'passivos', label: 'Gestão de Passivos (Dívidas)', icon: CreditCard },
  { id: 'calculadoras', label: 'Ferramentas & Calculadoras', icon: Calculator },
  { id: 'automacao', label: 'Automação & Inteligência', icon: RefreshCw },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('visao-geral');

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500 flex flex-col md:flex-row gap-8">
      
      {/* SIDEBAR DE NAVEGAÇÃO */}
      <aside className="md:w-64 shrink-0">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao App
        </button>
        
        <nav className="space-y-1 sticky top-24">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">Índice do Manual</div>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id 
                  ? 'bg-primary/20 text-primary border border-primary/20' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 space-y-16">
        
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-10 h-10 text-primary" /> Manual do Sistema
          </h1>
          <p className="text-xl text-gray-400">Domine todas as funcionalidades do seu Gerenciador Financeiro.</p>
        </div>

        {/* 1. VISÃO GERAL */}
        <section id="visao-geral" className="scroll-mt-24 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="text-blue-400" /> 1. O Dashboard
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                O Dashboard é o centro de comando. Ele calcula automaticamente o seu <strong>Patrimônio Líquido Real</strong> subtraindo suas dívidas dos seus investimentos.
              </p>
              <ul className="space-y-3 text-gray-400 text-sm mb-6">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> <strong>Total em Ativos:</strong> Soma de todos os investimentos (Renda Fixa atualizada + Cotações de Mercado).</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500"/> <strong>Total em Dívidas:</strong> Soma dos saldos devedores cadastrados.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500"/> <strong>Patrimônio Líquido:</strong> O dinheiro que é "realmente seu".</li>
              </ul>
              
              <TipBox title="Dica de Ouro">
                O gráfico de "Alocação por Categoria" só aparece se você tiver ativos cadastrados com categorias diferentes (ex: Ações, FIIs, Renda Fixa). Use isso para balancear sua carteira!
              </TipBox>
            </div>

            {/* Ilustração do Dashboard */}
            <div className="bg-surface p-6 rounded-xl border border-secondary/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-500 mb-4 font-mono">Simulação Visual do Painel</div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MockCard title="Ativos" value="R$ 50k" color="text-white" icon={TrendingUp} />
                <MockCard title="Dívidas" value="R$ 10k" color="text-red-400" icon={CreditCard} />
              </div>
              <MockCard title="Patrimônio Líquido" value="R$ 40k" color="text-green-400" icon={DollarSign} />
            </div>
          </div>
        </section>

        {/* 2. GESTÃO DE ATIVOS */}
        <section id="ativos" className="scroll-mt-24 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-400" /> 2. Investimentos (Ativos)
          </h2>

          <div className="space-y-8">
            {/* Renda Fixa vs Variável */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Tipos de Cadastro</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Renda Fixa (CDB/LCI)</h4>
                  <p className="text-sm text-gray-400">
                    O sistema projeta o valor futuro baseado na taxa cadastrada.
                    <br/>
                    <strong>Exemplo:</strong> CDB 110% do CDI. O sistema pega o valor do CDI atual (automático) e aplica a taxa dia a dia.
                  </p>
                </div>
                <div>
                  <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-orange-400 rounded-full"></div> Renda Variável (B3/Cripto)</h4>
                  <p className="text-sm text-gray-400">
                    O valor é atualizado via integração. Você informa a quantidade de cotas e o sistema multiplica pelo preço de mercado.
                    <br/>
                    <strong>Exemplo:</strong> 100 ações de PETR4.SA. Se a ação subir, seu saldo sobe.
                  </p>
                </div>
              </div>
            </div>

            {/* Explicação FIFO */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">A Lógica FIFO (First-In, First-Out)</h3>
              <p className="text-gray-300 mb-4">
                Esta é a funcionalidade mais poderosa do app. Diferente de planilhas simples, o sistema sabe que 
                <strong> aportes diferentes têm datas diferentes</strong>, o que muda o Imposto de Renda.
              </p>
              
              <div className="relative pl-8 border-l-2 border-slate-700 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[39px] bg-slate-800 border-2 border-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                  <h4 className="font-bold text-white">Você faz Aportes</h4>
                  <div className="text-sm text-gray-400 mt-1">
                    Jan 2023: R$ 1.000<br/>
                    Mar 2024: R$ 500
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[39px] bg-slate-800 border-2 border-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                  <h4 className="font-bold text-white">Você pede um Saque de R$ 800</h4>
                  <div className="text-sm text-gray-400 mt-1">
                    O sistema retira dinheiro <strong>do aporte mais antigo (Jan 2023)</strong> primeiro.
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[39px] bg-green-600 border-2 border-green-400 w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</div>
                  <h4 className="font-bold text-green-400">Cálculo de Imposto Correto</h4>
                  <div className="text-sm text-gray-400 mt-1">
                    Como o aporte de 2023 tem mais de 720 dias (hipotético), o sistema aplica a <strong>alíquota mínima de 15%</strong> de IR apenas sobre o lucro dessa parcela.
                    Se usasse média, você pagaria imposto errado!
                  </div>
                </div>
              </div>
            </div>

            <TipBox title="Como usar os Tickers?">
              <p>Para o sistema atualizar os preços automaticamente, preencha o campo <strong>Ticker</strong> corretamente:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Ações/FIIs (Brasil):</strong> Use o código + <code>.SA</code>. Ex: <code>WEGE3.SA</code>, <code>HGLG11.SA</code>.</li>
                <li><strong>Ações (EUA):</strong> Use o código direto. Ex: <code>AAPL</code>, <code>MSFT</code>.</li>
                <li><strong>Criptomoedas:</strong> Use o <strong>ID</strong> da CoinGecko (geralmente o nome em minúsculo). Ex: <code>bitcoin</code>, <code>ethereum</code>, <code>solana</code>.</li>
              </ul>
            </TipBox>
          </div>
        </section>

        {/* 3. PASSIVOS */}
        <section id="passivos" className="scroll-mt-24 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="text-red-400" /> 3. Passivos (Dívidas)
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-300 mb-4">
                Passivos são subtraídos do seu patrimônio. É crucial mantê-los atualizados para não ter uma falsa sensação de riqueza.
              </p>
              <h4 className="font-bold text-white mb-2">O que cadastrar?</h4>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Financiamento de Imóvel/Carro.</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Empréstimos Pessoais.</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Dívidas de Cartão de Crédito (Parceladas).</li>
              </ul>
              <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
                <strong className="text-red-400 block mb-1">Atenção:</strong>
                <span className="text-sm text-gray-400">
                  O sistema <strong>não</strong> amortiza a dívida automaticamente mês a mês. Você deve entrar e editar o "Saldo Devedor" conforme for pagando as parcelas.
                </span>
              </div>
            </div>
            
            {/* Visualização Card Dívida */}
            <div className="bg-surface p-5 rounded-xl border border-red-900/40 shadow-lg relative opacity-90">
              <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">EXEMPLO</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-900/20 p-2 rounded"><CreditCard className="text-red-500 w-6 h-6"/></div>
                <div>
                  <div className="font-bold text-white">Financiamento Apê</div>
                  <div className="text-xs text-gray-400">Imobiliário</div>
                </div>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-700 pb-2 mb-2">
                <span className="text-gray-400">Saldo Devedor</span>
                <span className="text-red-400 font-bold">R$ 180.000,00</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Taxa: 9% a.a.</span>
                <span>360 meses</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CALCULADORAS */}
        <section id="calculadoras" className="scroll-mt-24 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calculator className="text-purple-400" /> 4. Ferramentas de Simulação
          </h2>
          <p className="text-gray-400 mb-6">
            O sistema inclui 9 calculadoras poderosas para ajudar na tomada de decisão.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Juros Compostos', d: 'Simule o crescimento exponencial do seu dinheiro ao longo dos anos.' },
              { t: 'Simulador Rápido RF', d: 'Compare CDB (com IR) vs LCI/LCA (isento) para ver qual rende mais líquido.' },
              { t: 'Primeiro Milhão', d: 'Descubra quanto investir por mês para chegar em R$ 1.000.000,00.' },
              { t: 'Reserva Emergência', d: 'Calcule o valor ideal de segurança baseado nos seus gastos mensais.' },
              { t: 'Projetar Ativo', d: 'Pegue um ativo da sua carteira e projete o futuro dele com aportes mensais.' },
              { t: 'Comparador A vs B', d: 'Compare dois cenários de investimento genéricos lado a lado.' },
              { t: 'CDI', d: 'Simule rendimento de 100% ou 110% do CDI com a taxa Selic atual.' },
              { t: 'Porcentagem', d: 'Calculadora rápida de descontos, aumentos e proporções.' },
              { t: 'Juros Simples', d: 'Para fins educativos ou empréstimos informais.' }
            ].map((calc, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors">
                <h4 className="font-bold text-white mb-2">{calc.t}</h4>
                <p className="text-xs text-gray-400">{calc.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. AUTOMAÇÃO */}
        <section id="automacao" className="scroll-mt-24 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <RefreshCw className="text-yellow-400" /> 5. Automação & Inteligência
          </h2>
          
          <div className="bg-slate-900/80 p-6 rounded-xl border border-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <RefreshCw className="w-64 h-64" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">O Sistema trabalha enquanto você dorme 🌙</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="bg-slate-800 p-2 rounded h-fit"><Activity className="text-blue-400 w-5 h-5"/></div>
                <div>
                  <strong className="text-white block">Auto-Correção do CDI (Selic)</strong>
                  <span className="text-sm text-gray-400">
                    O sistema monitora o Banco Central. Assim que o Copom muda a taxa Selic, o sistema atualiza a taxa global automaticamente. 
                    Seus investimentos pós-fixados (ex: 100% do CDI) passam a render com a nova taxa imediatamente.
                  </span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-slate-800 p-2 rounded h-fit"><TrendingUp className="text-green-400 w-5 h-5"/></div>
                <div>
                  <strong className="text-white block">Atualização de Preços</strong>
                  <span className="text-sm text-gray-400">
                    Um "robô" roda duas vezes ao dia (09:00 e 18:00) para buscar as cotações mais recentes de suas ações e criptomoedas. 
                    Isso mantém seu gráfico de histórico preciso sem "buracos".
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* FOOTER */}
      <div className="mt-12 text-center pt-8 border-t border-slate-800">
        <p className="text-gray-600 text-sm">Criado por OnlyLuccs</p>
      </div>
      </div>
    </div>
  );
}