import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wejctwhecokotewclknk.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamN0d2hlY29rb3Rld2Nsa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNzkxOTcsImV4cCI6MjA5OTg1NTE5N30.f6bIJ07OfWUWxuVrLVrUl3wP7S-EWSKLXP-a4D1Anko'
);

export default function App() {
  const [grade, setGrade] = useState<any[]>([]);
  const [terapeutas, setTerapeutas] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [filtroDia, setFiltroDia] = useState("Segunda");
  const [filtroTurno, setFiltroTurno] = useState("Manhã");
  const [novoNomeT, setNovoNomeT] = useState("");

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    const { data: g } = await supabase.from('grade_fixa').select('*, pacientes(nome)');
    const { data: t } = await supabase.from('terapeutas').select('*');
    setGrade(g || []);
    setTerapeutas(t || []);
  }

  async function cadastrarTerapeuta() {
    if (!novoNomeT) return;
    await supabase.from('terapeutas').insert({ nome: novoNomeT, dia: filtroDia, turno: filtroTurno });
    setNovoNomeT("");
    carregarDados();
  }

  async function editarTerapeuta(t: any) {
    const novoNome = prompt("Editar nome (deixe vazio para excluir):", t.nome);
    if (novoNome === null) return;
    if (novoNome === "") await supabase.from('terapeutas').delete().eq('id', t.id);
    else await supabase.from('terapeutas').update({ nome: novoNome }).eq('id', t.id);
    carregarDados();
  }

  async function gerenciarPaciente(ag: any) {
    const acao = prompt("Digite 'editar' ou 'excluir':", "editar");
    if (acao === 'editar') {
      const novoNome = prompt("Novo nome:", ag.pacientes?.nome);
      if (novoNome) await supabase.from('pacientes').update({ nome: novoNome }).eq('id', ag.paciente_id);
    } else if (acao === 'excluir') {
      if (confirm("Remover agendamento?")) await supabase.from('grade_fixa').delete().eq('id', ag.id);
    }
    carregarDados();
  }

  async function atualizarStatus(ag: any) {
    const novoStatus = ag.status === 'Não vem' ? 'Confirmado' : 'Não vem';
    await supabase.from('grade_fixa').update({ status: novoStatus }).eq('id', ag.id);
    carregarDados();
  }

  async function adicionarPaciente(terapeutaId: any, dia: string, hora: string, slot: number) {
    const nome = prompt("Nome do Paciente:");
    if (!nome) return;
    const { data: p } = await supabase.from('pacientes').insert({ nome }).select().single();
    await supabase.from('grade_fixa').insert({ 
      dia_semana: dia, horario_inicio: hora + ":00", 
      terapeuta_id: terapeutaId, paciente_id: p?.id, slot: slot, status: 'Confirmado' 
    });
    carregarDados();
  }

  function isHorarioNoTurno(horaStr: string, filtroSelecionado: string) {
    const hora = parseInt(horaStr.split(':')[0]);
    if (filtroSelecionado === 'Dia todo') return true;
    if (filtroSelecionado === 'Manhã') return hora < 12;
    if (filtroSelecionado === 'Tarde') return hora >= 12;
    return true;
  }

  const getHorarios = () => {
    if (filtroTurno === 'Manhã') return ['08:00', '09:00', '10:00', '11:00'];
    if (filtroTurno === 'Tarde') return ['13:00', '14:00', '15:00', '16:00'];
    return ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <img src="https://i.ibb.co/kVxhMRtT/LOGO.jpg" alt="Logo" style={{ height: '50px' }} />
        <button onClick={() => isAdmin ? setIsAdmin(false) : prompt("Senha:") === "AIMA2026" ? setIsAdmin(true) : alert("Senha errada")}>
          {isAdmin ? "Sair" : "Login"}
        </button>
      </header>

      {isAdmin && (
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Modo Administrador</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="Nome do terapeuta" value={novoNomeT} onChange={(e) => setNovoNomeT(e.target.value)} style={{ padding: '8px', flex: 1 }} />
            <button onClick={cadastrarTerapeuta} style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Cadastrar Terapeuta</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} style={{ padding: '10px', flex: 1 }}>
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} style={{ padding: '10px', flex: 1 }}>
          <option>Manhã</option>
          <option>Tarde</option>
          <option>Dia todo</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px' }}>
        <tbody>
          {getHorarios().map(h => (
            <tr key={h}>
              <td style={{ fontWeight: 'bold' }}>{h}</td>
              {terapeutas.filter((t: any) => t.dia === filtroDia && isHorarioNoTurno(h, filtroTurno)).map((t: any) => (
                <td key={t.id} style={{ padding: '10px', background: 'white', borderRadius: '8px', verticalAlign: 'top' }}>
                  <strong style={{ color: '#0056b3', cursor: 'pointer' }} onClick={() => isAdmin && editarTerapeuta(t)}>{t.nome}</strong>
                  {[1, 2].map((slot) => {
                    const ag = grade.find((g: any) => g.terapeuta_id === t.id && g.horario_inicio.includes(h) && g.dia_semana === filtroDia && g.slot === slot);
                    return (
                      <div key={slot} style={{ marginTop: '5px', padding: '5px', background: '#f8f9fa', borderRadius: '4px' }}>
                        {ag ? (
                          <>
                            <div style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => isAdmin && gerenciarPaciente(ag)}>{ag.pacientes?.nome}</div>
                            {isAdmin && (
                              <button onClick={() => atualizarStatus(ag)} style={{ marginTop: '5px', fontSize: '10px', background: ag.status === 'Não vem' ? '#ffcccc' : '#ccffcc', border: '1px solid #ccc' }}>
                                {ag.status === 'Não vem' ? 'Faltou/Não vem' : 'Confirmado'}
                              </button>
                            )}
                          </>
                        ) : isAdmin && <button onClick={() => adicionarPaciente(t.id, filtroDia, h, slot)}>+ Agendar</button>}
                      </div>
                    );
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
