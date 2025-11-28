import React, { useState, useEffect } from 'react';
import { investmentsService } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, BarChart3, Trophy, Percent, Siren, Activity, 
  Target, Zap, Swords, ArrowRight, ArrowLeft, Calculator, ChevronDown, ChevronUp
} from 'lucide-react';

// --- MENU DE SELEÇÃO ---
function CalculatorMenu({ onSelect }) {
  const tools = [
    { id: 'juros_compostos', title: 'Juros Compostos', desc: 'Veja quantas vezes o seu dinheiro pode se multiplicar.', icon: TrendingUp, color: 'text-green-500' },
    { id: 'juros_simples', title: 'Juros Simples', desc: 'Crescimento linear com taxa fixa.', icon: BarChart3, color: 'text-blue-400' },
    { id: 'primeiro_milhao', title: 'Primeiro Milhão', desc: 'Quanto investir para chegar lá?', icon: Trophy, color: 'text-yellow-500' },
    { id: 'porcentagem', title: '% Porcentagem', desc: 'Cálculos rápidos de descontos e aumentos.', icon: Percent, color: 'text-purple-400' },
    { id: 'reserva', title: 'Reserva de Emergência', desc: 'Calcule seu colchão de segurança.', icon: Siren, color: 'text-red-500' },
    { id: 'cdi', title: 'CDI', desc: 'Simule rendimento baseado no CDI atual.', icon: Activity, color: 'text-white' },
    { id: 'projetar_ativo', title: 'Projetar Ativo', desc: 'Simule o futuro de um ativo da sua carteira.', icon: Target, color: 'text-red-400' },
    { id: 'simulador_rapido', title: 'Simulador Rápido (RF)', desc: 'CDB (Tributável) vs LCI (Isento).', icon: Zap, color: 'text-yellow-400' },
    { id: 'comparador', title: 'Comparador de Cenários', desc: 'A vs B: Qual rende mais?', icon: Swords, color: 'text-blue-300' }
  ];

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CALCULADORAS</h1>
        <p className="text-gray-400">Selecione uma ferramenta para simular cenários financeiros.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} onClick={() => onSelect(tool.id)} className="bg-surface border border-slate-700 rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg group flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <tool.icon className={`w-8 h-8 ${tool.color}`} />
                <h3 className="text-xl font-bold text-white">{tool.title}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">{tool.desc}</p>
            </div>
            <div className="w-full py-3 rounded-lg border border-slate-600 group-hover:bg-slate-700/50 text-center text-sm font-medium text-gray-300 transition-colors flex items-center justify-center gap-2">
              SIMULAR <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENTE DE ACORDEÃO PARA INFO EDUCATIVA ---
function AccordionItem({ title, children, isOpenDefault = false }) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors text-left"
      >
        <span className="font-medium text-gray-300 flex items-center gap-2">
          {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          {title}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-900/30 text-gray-400 text-sm leading-relaxed border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

// --- COMPONENTES AUXILIARES PARA FORMATAÇÃO ---
const FormulaBox = ({ children }) => (
  <div className="bg-slate-950 p-4 rounded border border-slate-800 text-center font-mono text-primary mb-4 overflow-x-auto whitespace-nowrap">
    {children}
  </div>
);

const ExampleBox = ({ children }) => (
  <div className="bg-slate-800/30 p-4 rounded border-l-4 border-blue-500 mb-4 italic text-gray-300">
    {children}
  </div>
);

// --- CONTEÚDO EDUCATIVO DINÂMICO ---
function EducationalInfo({ type }) {
  
  // 1. JUROS COMPOSTOS
  if (type === 'juros_compostos') {
    const tableData = [
      { mes: 0, juros: '--', investido: 'R$ 10.000,00', jurosAcum: '--', total: 'R$ 10.000,00' },
      { mes: 1, juros: 'R$ 79,74', investido: 'R$ 10.000,00', jurosAcum: 'R$ 79,74', total: 'R$ 10.079,74' },
      { mes: 2, juros: 'R$ 80,38', investido: 'R$ 10.000,00', jurosAcum: 'R$ 160,12', total: 'R$ 10.160,12' },
      { mes: 12, juros: 'R$ 87,02', investido: 'R$ 10.000,00', jurosAcum: 'R$ 1.000,00', total: 'R$ 11.000,00' },
      { mes: 24, juros: 'R$ 95,72', investido: 'R$ 10.000,00', jurosAcum: 'R$ 2.100,00', total: 'R$ 12.100,00' },
      { mes: 36, juros: 'R$ 105,30', investido: 'R$ 10.000,00', jurosAcum: 'R$ 3.310,00', total: 'R$ 13.310,00' },
    ];

    return (
      <div className="mt-12 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-4">Saiba mais sobre Juros Compostos</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Os juros compostos são juros calculados não apenas sobre o valor inicial, 
          mas sobre a soma do montante inicial mais os juros acumulados ao longo 
          do tempo, resultando no famoso "juros sobre juros".<br/><br/>
          Na prática, isso gera um efeito de crescimento exponencial, que é 
          muito positivo para quem investe no longo prazo, mas prejudicial para quem contrata empréstimos de longa duração.
        </p>

        <div className="space-y-2">
          <AccordionItem title="Como funciona a fórmula?">
            <p className="mb-2">A fórmula dos juros compostos é a seguinte:</p>
            <FormulaBox>M = C × (1 + i)ᵗ</FormulaBox>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>M:</strong> Montante total (principal + juros).</li>
              <li><strong>C:</strong> Capital inicial investido.</li>
              <li><strong>i:</strong> Taxa de juros do período.</li>
              <li><strong>t:</strong> Tempo de aplicação.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Exemplo prático">
            <p className="mb-2">Suponha investimento inicial de <strong>R$ 10.000,00</strong>, taxa de <strong>10% ao ano</strong>, por <strong>3 anos</strong>.</p>
            <FormulaBox>
              M = 10.000 × (1 + 0,10)³<br/>
              M = 10.000 × 1,331<br/>
              M = R$ 13.310,00
            </FormulaBox>
            <p>O montante final seria de <strong>R$ 13.310,00</strong>.</p>
          </AccordionItem>

          <AccordionItem title="Tabela de evolução (Exemplo)">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-400 border border-slate-700">
                <thead className="bg-slate-900 text-gray-200 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2">Mês</th>
                    <th className="px-4 py-2">Juros Mês</th>
                    <th className="px-4 py-2">Total Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-mono text-center">{row.mes}</td>
                      <td className="px-4 py-2 text-green-400">{row.juros}</td>
                      <td className="px-4 py-2 text-white font-bold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">* Tabela simplificada mostrando meses chave.</p>
            </div>
          </AccordionItem>

          <AccordionItem title="Diferença entre Simples e Compostos">
            <ul className="space-y-2">
              <li><strong className="text-blue-400">Juros Simples:</strong> Calculados apenas sobre o valor inicial. Crescimento linear.</li>
              <li><strong className="text-green-400">Juros Compostos:</strong> Calculados sobre valor inicial + juros acumulados. Crescimento exponencial.</li>
            </ul>
          </AccordionItem>
        </div>
      </div>
    );
  }

  // 2. JUROS SIMPLES
  if (type === 'juros_simples') {
    return (
      <div className="mt-12 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-4">O que são Juros Simples?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Os juros simples são uma forma de cálculo onde o valor dos juros é calculado exclusivamente com base no valor inicial, 
          sem levar em consideração os juros acumulados ao longo do tempo.
          Isso significa que o montante total cresce de maneira linear, sem o efeito "bola de neve" dos juros compostos.
        </p>

        <div className="space-y-2">
          <AccordionItem title="Como funciona a fórmula?">
            <p className="mb-2">A fórmula clássica é:</p>
            <FormulaBox>J = C × i × t</FormulaBox>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>J:</strong> Valor dos juros.</li>
              <li><strong>C:</strong> Capital inicial.</li>
              <li><strong>i:</strong> Taxa de juros (decimal).</li>
              <li><strong>t:</strong> Tempo.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Exemplo prático e Tabela">
            <p className="mb-2">Investimento de <strong>R$ 10.000,00</strong> a <strong>10% ao ano</strong> por <strong>3 anos</strong>.</p>
            <FormulaBox>
              J = 10.000 × 0,10 × 3 = 3.000,00<br/>
              Total = 10.000 + 3.000 = 13.000,00
            </FormulaBox>
            <p className="mb-4 text-sm">Curiosidade: Nos juros compostos, o total seria R$ 13.310,00.</p>
            
            <table className="w-full text-xs text-left text-gray-400 border border-slate-700">
              <thead className="bg-slate-900 text-gray-200">
                <tr><th className="px-4 py-2">Ano</th><th className="px-4 py-2">Juros</th><th className="px-4 py-2">Total Acumulado</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr><td className="px-4 py-2">0</td><td>--</td><td>R$ 10.000,00</td></tr>
                <tr><td className="px-4 py-2">1</td><td>R$ 1.000,00</td><td>R$ 11.000,00</td></tr>
                <tr><td className="px-4 py-2">2</td><td>R$ 1.000,00</td><td>R$ 12.000,00</td></tr>
                <tr><td className="px-4 py-2">3</td><td>R$ 1.000,00</td><td className="font-bold text-white">R$ 13.000,00</td></tr>
              </tbody>
            </table>
          </AccordionItem>
        </div>
      </div>
    );
  }

  // 3. PRIMEIRO MILHÃO
  if (type === 'primeiro_milhao') {
    return (
      <div className="mt-12 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-4">O que é a Calculadora do Milhão?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          O sonho de conquistar o primeiro milhão é comum a muitos. Esta calculadora estima quanto você precisa investir mensalmente 
          para alcançar essa meta dentro de um prazo, utilizando o poder dos juros compostos a seu favor.
        </p>

        <div className="space-y-2">
          <AccordionItem title="Como funciona o cálculo?">
            <p className="mb-2">A fórmula para encontrar o Pagamento Mensal (PMT) necessário é:</p>
            <FormulaBox>
              PMT = [FV - PV × (1+r)ⁿ] ÷ [((1+r)ⁿ - 1) ÷ r]
            </FormulaBox>
            <ul className="space-y-1 list-disc pl-5 text-xs">
              <li><strong>PMT:</strong> Aporte mensal necessário.</li>
              <li><strong>FV:</strong> Valor Futuro (R$ 1.000.000).</li>
              <li><strong>PV:</strong> Valor Presente (quanto já tem).</li>
              <li><strong>r:</strong> Taxa de juros mensal.</li>
              <li><strong>n:</strong> Número de meses.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Exemplo prático">
            <p className="mb-2">
              Meta: 1 Milhão em <strong>20 anos</strong> (240 meses).<br/>
              Já tenho: <strong>R$ 10.000</strong>.<br/>
              Taxa: <strong>0,5% ao mês</strong>.
            </p>
            <ExampleBox>
              O cálculo resulta em um aporte mensal aproximado de <strong>R$ 2.134,64</strong>.
            </ExampleBox>
            <p className="text-sm text-gray-400">
              Isso significa que, além dos seus 10k iniciais, você investe ~2.1k todo mês.
              No final, você terá investido cerca de 522k do seu bolso, e o restante (478k) virá apenas dos juros!
            </p>
          </AccordionItem>

          <AccordionItem title="Dicas para chegar lá">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Comece cedo:</strong> O tempo é o maior multiplicador nos juros compostos.</li>
              <li><strong>Constância:</strong> Aporte todo mês, mesmo que pouco.</li>
              <li><strong>Reinvista dividendos:</strong> Não gaste os rendimentos, use-os para comprar mais ativos.</li>
              <li><strong>Diversifique:</strong> Proteja-se de riscos concentrados.</li>
            </ul>
          </AccordionItem>
        </div>
      </div>
    );
  }

  // 4. PORCENTAGEM
  if (type === 'porcentagem') {
    return (
      <div className="mt-12 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-4">Entendendo os Cálculos</h2>
        <div className="space-y-2">
          <AccordionItem title="Cálculo Básico (Quanto é % de Y?)">
            <p>Essencial para descobrir a parte de um todo. <br/>Ex: <strong>15% de R$ 300</strong>.</p>
            <FormulaBox>300 × 0,15 = 45</FormulaBox>
            <p>R$ 45,00 corresponde a 15% do total.</p>
          </AccordionItem>

          <AccordionItem title="Proporção (X é qual % de Y?)">
            <p>Usado para comparar um valor em relação ao total. <br/>Ex: <strong>R$ 300 de R$ 5.000</strong>.</p>
            <FormulaBox>(300 ÷ 5.000) × 100 = 6%</FormulaBox>
          </AccordionItem>

          <AccordionItem title="Aumento (X + %)">
            <p>Descobrir o valor final após um acréscimo. <br/>Ex: <strong>R$ 1.500 + 10%</strong>.</p>
            <FormulaBox>1.500 × (1 + 0,10) = 1.650</FormulaBox>
          </AccordionItem>

          <AccordionItem title="Desconto/Redução (X - %)">
            <p>Calcular o valor final após um desconto. <br/>Ex: <strong>R$ 1.500 - 10%</strong>.</p>
            <FormulaBox>1.500 × (1 - 0,10) = 1.350</FormulaBox>
          </AccordionItem>
        </div>
      </div>
    );
  }

  // 5. RESERVA DE EMERGÊNCIA
  if (type === 'reserva') {
    return (
      <div className="mt-12 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-4">O que é Reserva de Emergência?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          É um montante financeiro guardado exclusivamente para lidar com imprevistos que podem impactar suas finanças, 
          como perda de emprego, emergências médicas ou reparos urgentes. Não é investimento para ficar rico, é <strong>segurança</strong>.
        </p>

        <div className="space-y-2">
          <AccordionItem title="Quando usar a reserva?">
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-green-400"><strong>Use para:</strong> Despesas médicas, desemprego, reparos essenciais na casa/carro.</li>
              <li className="text-red-400"><strong>Não use para:</strong> Viagens de férias, compras de luxo, trocar de carro por capricho, investimentos de risco.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Quantos meses guardar?">
            <p className="mb-2">A regra geral depende da sua estabilidade:</p>
            <ul className="space-y-2 bg-slate-900 p-3 rounded border border-slate-700">
              <li>🏛️ <strong>Servidor Público:</strong> 3 meses de custos fixos.</li>
              <li>💼 <strong>CLT:</strong> 6 meses de custos fixos.</li>
              <li>🚀 <strong>Autônomo/PJ:</strong> 12 meses de custos fixos.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Onde investir a reserva?">
            <p className="mb-2">O foco é <strong>Liquidez Diária</strong> e <strong>Segurança</strong>. Rentabilidade é secundário.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Tesouro Selic:</strong> O mais seguro do país.</li>
              <li><strong>CDB com Liquidez Diária:</strong> Bancos (Inter, Itaú, Nubank, etc) que paguem 100% do CDI.</li>
              <li><strong>Fundos DI:</strong> Taxa zero e resgate D+0 ou D+1.</li>
            </ul>
          </AccordionItem>
        </div>
      </div>
    );
  }

  // 6. CDI
  if (type === 'cdi') {
    return (
      <div className="mt-12 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-4">O que é CDI?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          O CDI (Certificado de Depósito Interbancário) é a taxa que os bancos cobram para emprestar dinheiro uns aos outros por curtíssimo prazo. 
          Ela caminha muito próxima da taxa Selic e serve de referência para a maioria dos investimentos de Renda Fixa (CDB, LCI, LCA).
        </p>

        <div className="space-y-2">
          <AccordionItem title="Como é calculado o rendimento?">
            <p className="mb-2">O CDI é uma taxa anual, mas o rendimento é creditado todo dia útil.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>O banco divide a taxa anual por ~252 dias úteis.</li>
              <li>Se seu CDB paga <strong>100% do CDI</strong>, ele rende exatamente a taxa média daquele dia.</li>
              <li>Se paga <strong>110% do CDI</strong>, rende 1.1x a taxa do dia.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Comparativo: 100% vs 110% vs 120%">
            <p className="mb-3 text-sm">Simulação para R$ 10.000 em 1 mês (21 dias úteis) com IR de 20%:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-400 border border-slate-700">
                <thead className="bg-slate-900 text-gray-200">
                  <tr>
                    <th className="px-3 py-2">% CDI</th>
                    <th className="px-3 py-2">Bruto</th>
                    <th className="px-3 py-2">IR (20%)</th>
                    <th className="px-3 py-2">Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr><td className="px-3 py-2 font-bold text-blue-400">100%</td><td>R$ 109,27</td><td>R$ 21,85</td><td className="font-bold text-white">R$ 87,42</td></tr>
                  <tr><td className="px-3 py-2 font-bold text-blue-400">110%</td><td>R$ 120,26</td><td>R$ 24,05</td><td className="font-bold text-white">R$ 96,21</td></tr>
                  <tr><td className="px-3 py-2 font-bold text-blue-400">120%</td><td>R$ 131,26</td><td>R$ 26,25</td><td className="font-bold text-white">R$ 105,01</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">* Valores aproximados baseados em CDI de ~13.65% a.a.</p>
          </AccordionItem>
        </div>
      </div>
    );
  }

  return null;
}

// --- SIMULADOR DE PORCENTAGEM (CLIENT-SIDE) ---
function PercentageSimulator() {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [res, setRes] = useState(null);

  const inputClass = "w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-purple-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* CÁLCULO 1: % de Y */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-purple-400">Cálculo Simples</h3>
          <p className="text-gray-400 text-sm mb-4">Quanto é <strong>X%</strong> de <strong>Y</strong>?</p>
          <div className="flex gap-2 items-center mb-4">
            <input type="number" placeholder="%" className={inputClass} value={val2} onChange={e=>setVal2(e.target.value)} />
            <span className="text-gray-400">% de</span>
            <input type="number" placeholder="Valor" className={inputClass} value={val1} onChange={e=>setVal1(e.target.value)} />
          </div>
          <button onClick={() => setRes(Number(val1) * (Number(val2)/100))} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded font-medium">Calcular</button>
          {res !== null && <p className="mt-4 text-xl text-center font-bold text-white border-t border-slate-700 pt-3">Resultado: {res.toLocaleString('pt-BR', {maximumFractionDigits: 2})}</p>}
        </div>
      </div>
      
      {/* Aqui poderiam entrar as outras 3 calculadoras de porcentagem se necessário, 
          mas por enquanto mantive a principal funcional e a explicação completa abaixo. */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex items-center justify-center">
         <p className="text-gray-400 text-center">
           Use o painel ao lado para cálculos rápidos.<br/>
           Consulte a seção "Entendendo os Cálculos" abaixo para aprender as fórmulas.
         </p>
      </div>
    </div>
  );
}

// --- SIMULADOR INTELIGENTE (GERAL) ---
function SmartSimulator({ type, onBack }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [myAssets, setMyAssets] = useState([]);
  
  // Estado gigante para todos os campos
  const [form, setForm] = useState({
    valor_inicial: 1000, aporte_mensal: 100, meses: 12, anos: 1,
    taxa_anual: 10.5, is_isento: false,
    despesa_mensal: 3000, meses_protecao: 6,
    taxa_a: 10, isento_a: false, taxa_b: 8, isento_b: true,
    percentual_cdi: 100, taxa_di_atual: 13.65,
    ativo_id: '',
    taxa_cdb: 100, taxa_lci: 90
  });

  useEffect(() => {
    if (type === 'projetar_ativo') {
      investmentsService.getAssets().then(setMyAssets).catch(console.error);
    }
  }, [type]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : (e.target.name === 'ativo_id' ? e.target.value : Number(e.target.value));
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let data;
      if (type === 'juros_compostos') data = await investmentsService.simulateFixedIncome({ ...form, meses: form.meses });
      else if (type === 'juros_simples') data = await investmentsService.simulateSimpleInterest(form);
      else if (type === 'primeiro_milhao') data = await investmentsService.simulateFirstMillion(form);
      else if (type === 'reserva') data = await investmentsService.simulateEmergencyFund(form);
      else if (type === 'comparador') data = await investmentsService.compareScenarios(form);
      else if (type === 'cdi') data = await investmentsService.simulateCDI(form);
      else if (type === 'projetar_ativo') data = await investmentsService.projectAsset(form);
      else if (type === 'simulador_rapido') data = await investmentsService.simulateQuickRF({ ...form, taxa_di: form.taxa_di_atual });
      
      setResult(data);
    } catch (error) {
      // alert("Erro na simulação."); 
      // Em produção usar toast ou mensagem inline
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Renderização Dinâmica dos Campos
  const renderInputs = () => {
    if (type === 'porcentagem') return <PercentageSimulator />;

    switch(type) {
      case 'juros_compostos':
        return <><Input label="Valor Inicial" name="valor_inicial" value={form.valor_inicial} onChange={handleChange} /><Input label="Aporte Mensal" name="aporte_mensal" value={form.aporte_mensal} onChange={handleChange} /><Input label="Meses" name="meses" value={form.meses} onChange={handleChange} /><Input label="Taxa Anual (%)" name="taxa_anual" value={form.taxa_anual} onChange={handleChange} step="0.1" /><Checkbox label="Isento IR" name="is_isento" checked={form.is_isento} onChange={handleChange} /></>;
      case 'juros_simples': case 'primeiro_milhao':
        return <><Input label="Valor Inicial" name="valor_inicial" value={form.valor_inicial} onChange={handleChange} /><Input label="Anos" name="anos" value={form.anos} onChange={handleChange} /><Input label="Taxa Anual (%)" name="taxa_anual" value={form.taxa_anual} onChange={handleChange} step="0.1" /></>;
      case 'reserva':
        return <><Input label="Gasto Mensal" name="despesa_mensal" value={form.despesa_mensal} onChange={handleChange} /><Input label="Meses Proteção" name="meses_protecao" value={form.meses_protecao} onChange={handleChange} /></>;
      case 'cdi':
        return <><Input label="Valor Inicial" name="valor_inicial" value={form.valor_inicial} onChange={handleChange} /><Input label="Aporte Mensal" name="aporte_mensal" value={form.aporte_mensal} onChange={handleChange} /><Input label="Anos" name="anos" value={form.anos} onChange={handleChange} /><Input label="% do CDI" name="percentual_cdi" value={form.percentual_cdi} onChange={handleChange} /><Input label="Taxa DI Atual (%)" name="taxa_di_atual" value={form.taxa_di_atual} onChange={handleChange} step="0.01" /></>;
      case 'projetar_ativo':
        return (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Selecione o Ativo</label>
              <select name="ativo_id" value={form.ativo_id} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none">
                <option value="">Selecione...</option>
                {myAssets.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.valor_atual_bruto})</option>)}
              </select>
            </div>
            <Input label="Aporte Mensal Futuro" name="aporte_mensal" value={form.aporte_mensal} onChange={handleChange} />
            <Input label="Anos" name="anos" value={form.anos} onChange={handleChange} />
          </>
        );
      case 'simulador_rapido':
        return <><Input label="Valor Inicial" name="valor_inicial" value={form.valor_inicial} onChange={handleChange} /><Input label="Anos" name="anos" value={form.anos} onChange={handleChange} /><Input label="Taxa CDB (% CDI)" name="taxa_cdb" value={form.taxa_cdb} onChange={handleChange} /><Input label="Taxa LCI (% CDI)" name="taxa_lci" value={form.taxa_lci} onChange={handleChange} /><Input label="Taxa DI Atual (%)" name="taxa_di_atual" value={form.taxa_di_atual} onChange={handleChange} step="0.01" /></>;
      case 'comparador':
        return (
          <>
            <Input label="Valor Inicial" name="valor_inicial" value={form.valor_inicial} onChange={handleChange} /><Input label="Aporte Mensal" name="aporte_mensal" value={form.aporte_mensal} onChange={handleChange} /><Input label="Meses" name="meses" value={form.meses} onChange={handleChange} />
            <div className="col-span-full border-t border-slate-700 mt-2 pt-2 text-blue-400 font-bold">Cenário A</div>
            <Input label="Taxa (%)" name="taxa_a" value={form.taxa_a} onChange={handleChange} /><Checkbox label="Isento A" name="isento_a" checked={form.isento_a} onChange={handleChange} />
            <div className="col-span-full border-t border-slate-700 mt-2 pt-2 text-yellow-400 font-bold">Cenário B</div>
            <Input label="Taxa (%)" name="taxa_b" value={form.taxa_b} onChange={handleChange} /><Checkbox label="Isento B" name="isento_b" checked={form.isento_b} onChange={handleChange} />
          </>
        );
      default: return null;
    }
  };

  const renderResults = () => {
    if (!result) return null;
    if (type === 'reserva') return <div className="bg-slate-900 p-6 rounded text-center animate-in zoom-in"><Siren className="w-12 h-12 text-red-500 mx-auto mb-2"/><h2 className="text-3xl font-bold text-white">R$ {result.valor_reserva.toLocaleString('pt-BR')}</h2><p className="text-gray-400 mt-2">{result.descricao}</p></div>;
    if (type === 'primeiro_milhao') return <div className="bg-slate-900 p-6 rounded text-center animate-in zoom-in"><Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2"/><p className="text-gray-400 text-xs uppercase">Aporte Mensal Necessário</p><h2 className="text-4xl font-bold text-green-400">R$ {result.aporte_mensal_necessario.toLocaleString('pt-BR')}</h2></div>;
    if (type === 'comparador' || type === 'simulador_rapido') return (
      <div className="space-y-4 animate-in fade-in">
        <div className="bg-slate-900 p-4 rounded text-center"><p className="text-gray-400 text-xs">Vencedor</p><h2 className="text-2xl font-bold text-green-400">{result.melhor_cenario}</h2><p className="text-sm text-gray-300">Vantagem: R$ {result.diferenca_liquida.toLocaleString('pt-BR')}</p></div>
        <div className="grid grid-cols-2 gap-4"><ResultCard label="Líquido A (CDB)" value={result.cenario_a.valor_liquido} color="text-blue-400" /><ResultCard label="Líquido B (LCI)" value={result.cenario_b.valor_liquido} color="text-yellow-400" /></div>
      </div>
    );

    // Default Plot (Gráficos)
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><ResultCard label="Valor Bruto" value={result.valor_bruto} color="text-green-400" /><ResultCard label="Total Investido" value={result.total_investido} color="text-white" /><ResultCard label="Valor Líquido" value={result.valor_liquido} color="text-primary" /></div>
        <div className="h-[300px] w-full"><ResponsiveContainer><LineChart data={result.projecao_mensal}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="mes" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} /><Line type="monotone" dataKey="patrimonio_bruto" stroke="#3b82f6" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="total_investido" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer></div>
      </div>
    );
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</button>
      <h1 className="text-3xl font-bold mb-8 text-white capitalize flex items-center gap-2"><Calculator className="text-primary"/> {type.replace(/_/g, ' ')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-lg h-fit border border-slate-700">
          {type !== 'porcentagem' && <form onSubmit={handleSimulate} className="grid grid-cols-1 gap-4">{renderInputs()}<button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg shadow-blue-900/20">{loading ? 'Calculando...' : 'Simular'}</button></form>}
          {type === 'porcentagem' && renderInputs()}
        </div>
        <div className="md:col-span-2">
          {renderResults() || (type !== 'porcentagem' && <div className="h-full flex items-center justify-center text-gray-500 bg-surface rounded-xl p-10 border-2 border-dashed border-slate-700"><Zap className="w-16 h-16 mb-4 opacity-20" /><p>Preencha e simule</p></div>)}
        </div>
      </div>

      <EducationalInfo type={type} />
    </div>
  );
}

const Input = ({ label, name, value, onChange, step=1 }) => (<div><label className="block text-sm text-gray-400 mb-1">{label}</label><input type="number" step={step} name={name} value={value} onChange={onChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" /></div>);
const Checkbox = ({ label, name, checked, onChange }) => (<div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"><input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} className="w-5 h-5 text-primary rounded bg-slate-700 border-slate-600 focus:ring-offset-0 focus:ring-0" /><label htmlFor={name} className="text-sm text-gray-300 cursor-pointer select-none">{label}</label></div>);
const ResultCard = ({ label, value, color }) => (<div className="bg-surface p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"><p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p><p className={`text-2xl font-bold ${color}`}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>);

export default function CalculatorPage() {
  const [selectedTool, setSelectedTool] = useState(null);
  return (
    <div className="p-6 max-w-6xl mx-auto pb-20">
      {selectedTool ? <SmartSimulator type={selectedTool} onBack={() => setSelectedTool(null)} /> : <CalculatorMenu onSelect={setSelectedTool} />}
    </div>
  );
}