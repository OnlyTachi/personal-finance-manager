import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investmentsService } from '../services/api';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await investmentsService.getHistory();
        // Formata data para o gráfico (DD/MM)
        const formattedData = data.map(item => ({
          ...item,
          dateStr: new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          fullDate: new Date(item.timestamp).toLocaleDateString('pt-BR')
        }));
        setHistory(formattedData);
      } catch (error) {
        console.error("Erro ao carregar histórico");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-white">
        <TrendingUp className="w-8 h-8 text-primary" /> Análise Temporal
      </h1>
      <p className="text-gray-400 mb-8">Acompanhe a evolução do seu patrimônio bruto dia a dia.</p>

      {/* Gráfico Principal */}
      <div className="bg-surface p-6 rounded-xl border border-secondary/30 shadow-lg h-[400px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">Carregando histórico...</div>
        ) : history.length < 2 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Calendar className="w-12 h-12 mb-4 opacity-20" />
            <p>Dados insuficientes.</p>
            <p className="text-sm mt-2">O histórico é gerado automaticamente a cada dia que você acessa o app.</p>
            <p className="text-xs mt-1 text-gray-600">Volte amanhã para ver a evolução!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="dateStr" 
                stroke="#94a3b8" 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Patrimônio Total']}
                labelFormatter={(label, payload) => payload[0]?.payload.fullDate}
              />
              <Area 
                type="monotone" 
                dataKey="valor_total_bruto" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorValor)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabela de Dados (Opcional) */}
      <div className="mt-8 bg-surface rounded-xl border border-secondary/30 overflow-hidden">
        <div className="p-4 border-b border-secondary/30 font-bold text-white">
          Registros Diários
        </div>
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/50 text-gray-400 sticky top-0">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Patrimônio Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/30">
              {[...history].reverse().map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-3">{item.fullDate}</td>
                  <td className="px-6 py-3 text-right font-medium text-white">
                    R$ {item.valor_total_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}