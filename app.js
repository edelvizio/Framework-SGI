<!-- ===== (2) app.js ===== -->
function addKPI(){ state.e4.kpis.push({freq:'Mensal'}); renderKPIs(); save(); }
on(el('addKPI'), 'click', addKPI);
on(el('kpiList'), 'input', (e)=>{ const card = e.target.closest('[data-idx]'); if(!card) return; const idx = Number(card.getAttribute('data-idx')); const field = e.target.getAttribute('data-field'); if(!field) return; state.e4.kpis[idx][field] = e.target.value; save(); });
on(el('kpiList'), 'click', (e)=>{ if(e.target.matches('[data-del]')){ const card = e.target.closest('[data-idx]'); const idx = Number(card.getAttribute('data-idx')); state.e4.kpis.splice(idx,1); renderKPIs(); save(); }});


// Relatório
function buildReport(){
save();
const gv = (id)=>{ const n = document.getElementById(id); return n ? (n.value || '') : ''; };
const e1i = state.e1.ini || gv('e1_ini');
const e1f = state.e1.fim || gv('e1_fim');
const e2i = state.e2.ini || gv('e2_ini');
const e2f = state.e2.fim || gv('e2_fim');
const e3i = state.e3.ini || gv('e3_ini');
const e3f = state.e3.fim || gv('e3_fim');
const e4i = state.e4.ini || gv('e4_ini');
const e4f = state.e4.fim || gv('e4_fim');


const rows = [];
rows.push(['Unidade', state.e1.org || gv('org')]);
rows.push(['Período (Etapa 1)', formatPeriod(e1i, e1f)]);
rows.push(['Itens ISO 56002 críticos', state.e1.itensISO || gv('itensISO') || '—']);
rows.push(['Justificativa', state.e1.justISO || gv('justISO') || '—']);
rows.push(['Notas AHP/Fuzzy', state.e1.ahpNotas || gv('ahpNotas') || '—']);


rows.push(['Período (Etapa 2)', formatPeriod(e2i, e2f)]);
rows.push(['Problema (TRIZ)', state.e2.defProblema || gv('defProblema') || '—']);
rows.push(['Recursos', state.e2.recursos || gv('recursos') || '—']);
rows.push(['Heurísticas (MPI/TRIZ)', state.e2.heuristicas || gv('heuristicas') || '—']);
rows.push(['Ideias priorizadas', state.e2.ideias || gv('ideias') || '—']);


rows.push(['Período (Etapa 3)', formatPeriod(e3i, e3f)]);


let html = '<table><thead><tr><th>Campo</th><th>Conteúdo</th></tr></thead><tbody>' + rows.map(r=>'<tr><td>'+escapeHtml(r[0])+'</td><td>'+escapeHtml(r[1])+'</td></tr>').join('') + '</tbody></table>';


if(state.e3.incertezas && state.e3.incertezas.length){
const ordenado = state.e3.incertezas.slice().sort((a,b)=>{ const ra = Number(a.ref)||0, rb = Number(b.ref)||0; return ra - rb; });
html += '<h3 style="margin-top:16px">Etapa 3 – Incertezas</h3>';
html += '<table><thead><tr><th>Referência</th><th>Incógnita</th><th>Impacto</th><th>Ação tática</th><th>Tempo</th><th>Despesas</th><th>Homem/hora</th><th>Est. Implementação</th><th>Fator crítico</th></tr></thead><tbody>' +
ordenado.map(k=>'<tr>'+['ref','incognita','impacto','acao','tempo','despesas','hh','estimativa','fator'].map(f=>'<td>'+escapeHtml(k[f]||'')+'</td>').join('')+'</tr>').join('') +
'</tbody></table>';
}


if(state.e4.kpis.length){
html += '<h3 style="margin-top:16px">KPIs</h3>';
html += '<table><thead><tr><th>KPI</th><th>Métrica</th><th>Meta</th><th>Atual</th><th>Frequência</th><th>Responsável</th><th>Fonte</th><th>Validação</th></tr></thead><tbody>' +
state.e4.kpis.map(k=>'<tr>'+['nome','metrica','meta','atual','freq','owner','fonte','valid'].map(f=>'<td>'+escapeHtml(k[f]||'')+'</td>').join('')+'</tr>').join('') +
'</tbody></table>';
}


const container = el('report'); container && (container.innerHTML = html);
}
on(el('btnBuild'), 'click', buildReport);


function formatPeriod(ini, fim){ if(!ini && !fim) return '—'; if(ini && fim) return ini+' → '+fim; if(ini && !fim) return ini+' → (em andamento)'; return '(início não informado) → '+fim; }
function escapeHtml(str){ const d = document.createElement('div'); d.textContent = (str==null? '' : String(str)); return d.innerHTML; }
function escapeAttr(str){ return String(str==null? '' : str).replace(/"/g,'&quot;'); }


// Export/Import/Print/Clear
on(el('btnSave'), 'click', ()=>{ save(); alert('Salvo localmente.'); });
on(el('btnLoad'), 'click', ()=>{ load(); alert('Dados recarregados.'); });
on(el('btnExport'), 'click', ()=>{ save(); const name = 'sgi-'+(state.e1.org||'unidade')+'.json'; const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); });
on(el('fileImport'), 'change', (e)=>{ const file = e.target.files && e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = () => { try{ const data = JSON.parse(reader.result); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); load(); alert('Importado com sucesso.'); }catch(err){ alert('Arquivo inválido.'); } }; reader.readAsText(file); });
on(el('btnPrint'), 'click', ()=>{ buildReport(); setTimeout(()=>window.print(), 100); });
on(el('btnClear'), 'click', ()=>{ if(confirm('Tem certeza que deseja apagar todos os dados locais?')){ localStorage.removeItem(STORAGE_KEY); location.reload(); } });


// Autosave
document.addEventListener('input', (e)=>{ if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) save(); });
document.addEventListener('change', (e)=>{ if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) save(); });


// Inicialização
load();
buildReport();
}catch(err){
console.error(err);
setStatus('erro – abra o Console (F12)');
const box = document.createElement('div');
box.style.cssText = 'position:fixed;bottom:10px;left:10px;right:10px;background:#3b0d0d;color:#ffdede;padding:10px;border:1px solid #a33;border-radius:10px;z-index:9999;font-family:system-ui';
box.textContent = 'Ocorreu um erro no script: '+ (err && err.message ? err.message : err);
document.body.appendChild(box);
}
})();
