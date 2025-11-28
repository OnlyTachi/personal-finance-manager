import React from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  CreditCard, 
  Trash2,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-200 pb-20 animate-in fade-in duration-500">
      {/* Header e Navegação */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
      </button>

      <div className="flex items-center gap-3 mb-8">
        <HelpCircle className="w-10 h-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-white">Manual do Sistema</h1>
          <p className="text-gray-400 text-sm">Entenda como seu patrimônio é calculado.</p>
        </div>
      </div>

      <div className="space-y-10">
        
        {/* SEÇÃO 1: Conceito Geral */}
        <section className="bg-surface p-6 rounded-xl border border-secondary/30">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Como funciona o Dashboard?</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            O objetivo deste app é mostrar o seu <strong>Patrimônio Líquido Real</strong>. Para isso, o cálculo é simples:
          </p>
          <div className="bg-slate-900 p-4 rounded-lg text-center font-mono text-lg text-white border border-slate-700">
            (Total de Investimentos) - (Total de Dívidas) = <span className="text-green-400 font-bold">Patrimônio Líquido</span>
          </div>
        </section>

        {/* SEÇÃO 2: Investimentos */}
        <section className="bg-surface p-6 rounded-xl border border-secondary/30">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Investimentos (Ativos)</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                Renda Fixa (CDI, IPCA)
              </h3>
              <p className="text-sm text-gray-400 text-justify">
                Ideal para CDBs e Tesouro. O sistema projeta o valor baseado na taxa contratada (ex: 100% do CDI).
                <br/><br/>
                <strong>Importante:</strong> Ao realizar um saque, o sistema usa a lógica <em>FIFO (First-In, First-Out)</em>. Ele "vende" virtualmente os aportes mais antigos primeiro para calcular o Imposto de Renda (tabela regressiva) e IOF corretamente.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                Renda Variável (Ações, Cripto)
              </h3>
              <p className="text-sm text-gray-400 text-justify">
                O sistema conecta-se ao <strong>Yahoo Finance</strong> (B3/EUA) e <strong>CoinGecko</strong> (Cripto) para atualizar o preço automaticamente.
                <br/><br/>
                <strong>Dica:</strong> Use tickers com final <code>.SA</code> para ações brasileiras (ex: <code>PETR4.SA</code>). Para cripto, use o ID da moeda (ex: <code>bitcoin</code>).
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: Dívidas */}
        <section className="bg-surface p-6 rounded-xl border border-red-900/30 bg-red-900/5">
          <div className="flex items-center gap-2 mb-6 border-b border-red-900/30 pb-4">
            <CreditCard className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Gestão de Dívidas (Passivos)</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Aqui você cadastra financiamentos, empréstimos ou saldos de cartão. Essas dívidas são subtraídas do seu total de ativos.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
            <li><strong>Saldo Devedor:</strong> É o valor que impacta o cálculo do patrimônio. Atualize-o manualmente conforme for pagando as parcelas.</li>
            <li><strong>Taxa e Prazo:</strong> Servem apenas para sua referência e organização, não alteram o saldo automaticamente.</li>
          </ul>
        </section>

        {/* SEÇÃO 4: Gestão e Correção */}
        <section className="bg-surface p-6 rounded-xl border border-secondary/30">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
            <Trash2 className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Correção de Erros (Edição)</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Excluir Transação</h4>
              <p className="text-sm text-gray-400">
                Errou um aporte? Vá nos detalhes do ativo. No histórico, passe o mouse sobre a transação errada e clique na <strong>Lixeira</strong>.
                <br/>
                <span className="text-green-400 text-xs mt-2 block">O sistema reverte o saldo automaticamente.</span>
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Excluir Ativo/Dívida</h4>
              <p className="text-sm text-gray-400">
                Vendeu tudo ou quitou a dívida? Você pode excluir o item inteiro clicando no botão "Excluir" na página de detalhes.
                <br/>
                <span className="text-red-400 text-xs mt-2 block">Cuidado: Isso apaga todo o histórico daquele item.</span>
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 5: Calculadoras */}
        <section className="bg-surface p-6 rounded-xl border border-secondary/30">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
            <Calculator className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Ferramentas de Simulação</h2>
          </div>
          <p className="text-gray-300 mb-4">Acesse a aba <strong>Calculadora</strong> para planejar o futuro:</p>
          <ul className="grid gap-3 md:grid-cols-2 text-sm text-gray-400">
            <li className="flex gap-2 items-start"><span className="text-purple-400 font-bold">•</span> <span><strong>Juros Compostos:</strong> Veja a mágica do tempo no seu dinheiro.</span></li>
            <li className="flex gap-2 items-start"><span className="text-purple-400 font-bold">•</span> <span><strong>Simulador Rápido (RF):</strong> Compare CDB vs LCI (Isento de IR) para saber qual rende mais.</span></li>
            <li className="flex gap-2 items-start"><span className="text-purple-400 font-bold">•</span> <span><strong>Primeiro Milhão:</strong> Quanto falta investir por mês para chegar lá?</span></li>
            <li className="flex gap-2 items-start"><span className="text-purple-400 font-bold">•</span> <span><strong>Projetar Ativo:</strong> Simula o futuro de um ativo que você já tem na carteira.</span></li>
          </ul>
        </section>

      </div>

      <div className="mt-12 text-center pt-8 border-t border-slate-800">
        <p className="text-gray-600 text-sm">Criado por OnlyLuccs</p>
      </div>
    </div>
  );
}