import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investmentsService } from '../services/api';
import { ArrowLeft, Calendar, ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';

export default function AssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('Aporte'); 
  const [simulation, setSimulation] = useState(null);
  const [formData, setFormData] = useState({ valor: '', quantidade: '', data: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAsset = async () => {
    try {
      const data = await investmentsService.getAssetById(id);
      setAsset(data);
    } catch (error) {
      console.error("Erro", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAsset(); }, [id]);

  const resetModal = () => {
    setShowModal(false);
    setFormData({ valor: '', quantidade: '', data: '' });
    setSimulation(null);
    setIsProcessing(false);
  };

  const handleSimulate = async () => {
    if (!formData.valor) return;
    setIsProcessing(true);
    try {
      const result = await investmentsService.api.post("/investments/transactions/simulate-withdrawal", {
        ativo_id: id,
        valor: parseFloat(formData.valor)
      });
      setSimulation(result.data);
    } catch (error) {
      alert(error.response?.data?.detail || "Erro na simulação");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        ativo_id: id,
        tipo: modalType,
        valor: parseFloat(formData.valor),
        quantidade: formData.quantidade ? parseFloat(formData.quantidade) : 0,
        timestamp: formData.data ? new Date(formData.data).toISOString() : new Date().toISOString()
      };

      if (modalType === 'Saque' && simulation) {
        payload.valor_liquido = simulation.valor_liquido;
        payload.iof_pago = simulation.iof;
        payload.ir_pago = simulation.ir;
        payload.rendimento_realizado = simulation.lucro_realizado;
      } else if (modalType === 'Aporte') {
        payload.valor_liquido = payload.valor;
      }

      await investmentsService.createTransaction(payload);
      resetModal();
      fetchAsset();
    } catch (error) {
      alert("Erro ao salvar transação");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTransaction = async (transacaoId) => {
    if (confirm("Tem certeza? Isso irá reverter o impacto no saldo do ativo.")) {
      try {
        await investmentsService.deleteTransaction(transacaoId);
        fetchAsset();
      } catch (error) {
        alert("Erro ao excluir transação.");
      }
    }
  };

  const handleDeleteAsset = async () => {
    if (confirm("ATENÇÃO: Isso excluirá o ativo e TODO o histórico dele. Não há volta.")) {
      try {
        await investmentsService.deleteAsset(id);
        navigate('/dashboard');
      } catch (error) {
        alert("Erro ao excluir ativo.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Carregando...</div>;
  if (!asset) return <div className="p-10 text-center text-red-400">Ativo não encontrado.</div>;

  const sortedTransactions = [...asset.transacoes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const isRV = ['B3', 'CRYPTO', 'USA', 'Ações', 'FIIs', 'Criptomoedas'].includes(asset.tipo_indexador) || ['Ações', 'FIIs', 'Criptomoedas'].includes(asset.categoria);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{asset.nome}</h1>
          <p className="text-gray-400">{asset.tipo_indexador} • {asset.categoria} {asset.ticker && `• ${asset.ticker}`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setModalType('Aporte'); setShowModal(true); }} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4"/> Aportar
          </button>
          <button onClick={() => { setModalType('Saque'); setShowModal(true); }} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4"/> Sacar
          </button>
          <button onClick={handleDeleteAsset} className="bg-red-900/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded flex items-center gap-2 border border-red-800 ml-4">
            <Trash2 className="w-4 h-4"/> Excluir Ativo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-xs uppercase">Saldo Bruto</p>
          <p className="text-2xl font-bold text-white">R$ {asset.valor_atual_bruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-red-900/30">
          <p className="text-red-300/70 text-xs uppercase">Impostos (Est.)</p>
          <p className="text-2xl font-bold text-red-400">R$ {asset.imposto_estimado?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-xs uppercase">Saldo Líquido (Est.)</p>
          <p className="text-2xl font-bold text-green-400">R$ {asset.valor_liquido_estimado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 font-bold flex gap-2">
          <Calendar className="w-5 h-5"/> Histórico
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-900/50 text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3 text-right">Valor</th>
              <th className="px-6 py-3 text-right">Imposto Pago</th>
              <th className="px-6 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedTransactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-700/50 group">
                <td className="px-6 py-3">{new Date(t.timestamp).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-3">{t.tipo}</td>
                <td className="px-6 py-3 text-right">R$ {t.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td className="px-6 py-3 text-right text-red-400">{(t.iof_pago + t.ir_pago) > 0 ? `- R$ ${(t.iof_pago + t.ir_pago).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '-'}</td>
                <td className="px-6 py-3 text-right">
                    <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir Transação">
                        <Trash2 className="w-4 h-4 inline" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">{modalType === 'Aporte' ? '💰 Novo Aporte' : '💸 Realizar Saque'}</h2>
            {(!simulation || modalType === 'Aporte') ? (
              <form onSubmit={modalType === 'Aporte' ? handleSubmit : (e) => { e.preventDefault(); handleSimulate(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valor Total (R$)</label>
                    <input autoFocus type="number" step="0.01" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
                  </div>
                  {isRV && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Quantidade (Cotas/Moedas)</label>
                      <input type="number" step="0.00000001" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={formData.quantidade} onChange={e => setFormData({...formData, quantidade: e.target.value})} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Data (Opcional)</label>
                    <input type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={resetModal} className="flex-1 bg-slate-700 text-white py-2 rounded">Cancelar</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded">{isProcessing ? '...' : (modalType === 'Saque' && !isRV ? 'Simular' : 'Confirmar')}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-700 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400"><span>Bruto</span><span>R$ {simulation.valor_bruto.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-red-400"><span>Impostos</span><span>- R$ {simulation.total_imposto.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-green-400 border-t border-slate-700 pt-2"><span>Líquido</span><span>R$ {simulation.valor_liquido.toFixed(2)}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSimulation(null)} className="flex-1 bg-slate-700 text-white py-2 rounded">Voltar</button>
                  <button onClick={handleSubmit} disabled={isProcessing} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded">Confirmar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}