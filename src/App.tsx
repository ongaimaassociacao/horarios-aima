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

  async function atualizarStatus(ag: any, novoStatus: string) {
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

  function isHorarioNoTurno(horaStr: string, turnoTerapeuta: string, filtroSelecionado: string) {
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
    <div style={{ 
      padding: '20px', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh',
      WebkitUserSelect: 'none', userSelect: 'none'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <img src="https://i.ibb.co/kVxhMRtT/LOGO.jpg" alt="Logo" style={{ height: '50px' }} />
        <button onClick={() => isAdmin ? setIsAdmin(false) : prompt("Senha:") === "AIMA2026" ? setIsAdmin(true) : alert("Senha errada")}>
          {isAdmin ? "Sair" : "Login"}
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: '#e9ecef', padding: '15px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} style={{ padding: '10px', flex: 1 }}>
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} style={{ padding: '10px', flex: 1 }}>
            <option>Manhã</option>
            <option>Tarde</option>
            <option>Dia todo</option>
          </select>
        </div>
      </div>

      <h2 style={{ color: '#0056b3' }}>{filtroDia} - {filtroTurno}</h2>
      
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px' }}>
        <tbody>
          {getHorarios().map(h => (
            <tr key={h}>
              <td style={{ fontWeight: 'bold', width: '60px' }}>{h}</td>
              {terapeutas.filter((t: any) => t.dia === filtroDia && isHorarioNoTurno(h, t.turno, filtroTurno)).map((t: any) => (
                <td key={t.id} style={{ padding: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', verticalAlign: 'top' }}>
                  <strong style={{ color: '#0056b3', cursor: 'pointer' }} onClick={() => isAdmin && editarTerapeuta(t)}>{t.nome}</strong>
                  {[1, 2].map((slot) => {
                    const ag = grade.find((g: any) => g.terapeuta_id === t.id && g.horario_inicio.includes(h) && g.dia_semana === filtroDia && g.slot === slot);
                    return (
                      <div key={slot} style={{ marginTop: '8px', padding: '8px', background: ag?.status === 'Não vem' ? '#ffebee' : '#f1f8ff', borderRadius: '6px' }}>
                        {ag ? (
                          <>
                            <div style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => isAdmin && gerenciarPaciente(ag)}>{ag.pacientes?.nome}</div>
                            <div style={{ fontSize: '10px', color: ag.status === 'Não vem' ? 'red' : 'green' }}>{ag.status}</div>
                            {isAdmin && <button onClick={() => atualizarStatus(ag, ag.status === 'Confirmado' ? 'Não vem' : 'Confirmado')}>Trocar</button>}
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