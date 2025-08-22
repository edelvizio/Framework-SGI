<!-- ===== (2) app.js ===== -->
(function(){
  const setStatus = (txt) => {
    const s1 = document.getElementById('jsStatus'); if(s1) s1.textContent = txt;
    const s2 = document.getElementById('jsStatusFoot'); if(s2) s2.textContent = txt;
  };
  try{
    setStatus('ok');
    document.documentElement.classList.add('js');

    const STORAGE_KEY = 'sgi-prototipo-v04';
    const el = id => document.getElementById(id);
    const on = (node, evt, fn) => node && node.addEventListener(evt, fn);

    const state = {
      e1: { org:'', ini:'', fim:'', itensISO:'', justISO:'', ahpNotas:'' },
      e2: { ini:'', fim:'', defProblema:'', recursos:'', heuristicas:'', ideias:'' },
      e3: { ini:'', fim:'', incertezas: [] },
      e4: { ini:'', fim:'', kpis: [] }
    };

    function load(){
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        try{
          const data = JSON.parse(raw);
          if(data.e1) Object.assign(state.e1, data.e1);
          if(data.e2) Object.assign(state.e2, data.e2);
          if(data.e3){ Object.assign(state.e3, data.e3); if(!Array.isArray(state.e3.incertezas)) state.e3.incertezas=[]; }
          if(data.e4){ Object.assign(state.e4, data.e4); if(!Array.isArray(state.e4.kpis)) state.e4.kpis=[]; }
        }catch(e){ console.error('Erro ao parsear storage', e); }
      }
      // preencher inputs
      el('org') && (el('org').value = state.e1.org || '');
      el('e1_ini') && (el('e1_ini').value = state.e1.ini || '');
      el('e1_fim') && (el('e1_fim').value = state.e1.fim || '');
      el('itensISO') && (el('itensISO').value = state.e1.itensISO || '');
      el('justISO') && (el('justISO').value = state.e1.justISO || '');
      el('ahpNotas') && (el('ahpNotas').value = state.e1.ahpNotas || '');

      el('e2_ini') && (el('e2_ini').value = state.e2.ini || '');
      el('e2_fim') && (el('e2_fim').value = state.e2.fim || '');
      el('defProblema') && (el('defProblema').value = state.e2.defProblema || '');
      el('recursos') && (el('recursos').value = state.e2.recursos || '');
      el('heuristicas') && (el('heuristicas').value = state.e2.heuristicas || '');
      el('ideias') && (el('ideias').value = state.e2.ideias || '');

      el('e3_ini') && (el('e3_ini').value = state.e3.ini || '');
      el('e3_fim') && (el('e3_fim').value = state.e3.fim || '');
      renderIncertezas();

      el('e4_ini') && (el('e4_ini').value = state.e4.ini || '');
      el('e4_fim') && (el('e4_fim').value = state.e4.fim || '');
      renderKPIs();
    }

    function save(){
      el('org') && (state.e1.org = el('org').value.trim());
      el('e1_ini') && (state.e1.ini = el('e1_ini').value);
      el('e1_fim') && (state.e1.fim = el('e1_fim').value);
      el('itensISO') && (state.e1.itensISO = el('itensISO').value.trim());
      el('justISO') && (state.e1.justISO = el('justISO').value.trim());
      el('ahpNotas') && (state.e1.ahpNotas = el('ahpNotas').value.trim());

      el('e2_ini') && (state.e2.ini = el('e2_ini').value);
      el('e2_fim') && (state.e2.fim = el('e2_fim').value);
      el('defProblema') && (state.e2.defProblema = el('defProblema').value.trim());
      el('recursos') && (state.e2.recursos = el('recursos').value.trim());
      el('heuristicas') && (state.e2.heuristicas = el('heuristicas').value.trim());
      el('ideias') && (state.e2.ideias = el('ideias').value.trim());

      el('e3_ini') && (state.e3.ini = el('e3_ini').value);
      el('e3_fim') && (state.e3.fim = el('e3_fim').value);

      el('e4_ini') && (state.e4.ini = el('e4_ini').value);
      el('e4_fim') && (state.e4.fim = el('e4_fim').value);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Abas
    const tabs = el('tabs');
    on(tabs, 'click', (e)=>{
      const btn = e.target.closest('button[data-tab]');
      if(!btn) return;
      const tabId = btn.getAttribute('data-tab');
      tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current','false'));
      btn.setAttribute('aria-current','true');
      document.querySelectorAll('.tab').forEach(p=>p.hidden = true);
      const pane = document.getElementById(tabId);
      pane && (pane.hidden = false);
    });

    // Etapa 3 – Incertezas
    function defaultInc(){
      return { ref:'', incognita:'Proposta 1', impacto:'Mediano', acao:'', tempo:'MePr', despesas:'', hh:'', estimativa:'', fator:'' };
    }
    function incTemplate(item, idx){
      const propostas = Array.from({length:20}, (_,i)=>'Proposta '+(i+1));
      const tempos = ['LoPr','MePr','Imed'];
      return (
        '<div class="card" data-idx="'+idx+'">'+
          '<div class="grid cols-3">'+
            '<div><label>Referência</label><input type="number" min="1" step="1" value="'+escapeAttr(item.ref||'')+'" data-field="ref" placeholder="1, 2, 3..." /></div>'+
            '<div><label>Incertezas/incógnitas críticas</label><select data-field="incognita">'+ propostas.map(p=>'
<option '+(item.incognita===p?'selected':'')+'>'+p+'</option>').join('') +'</select></div>'+
            '<div><label>Impacto no problema</label><select data-field="impacto">'+ ['Crítico','Alto','Mediano','Baixo'].map(p=>'
<option '+(item.impacto===p?'selected':'')+'>'+p+'</option>').join('') +'</select></div>'+
          '</div>'+
          '<div><label>Ação tática para reduzir a incerteza</label><textarea rows="3" data-field="acao" placeholder="Ex.: Apresentar resultados à CGPCT/DIRPA">'+escapeHtml(item.acao||'')+'</textarea></div>'+ 
          '<div class="grid cols-3">'+
            '<div><label>Tempo de resposta da ação tática</label><select data-field="tempo">'+ tempos.map(p=>'
<option '+(item.tempo===p?'selected':'')+'>'+p+'</option>').join('') +'</select><small class="help">LoPr: > 1 ano • MePr: até 12 meses • Imed: < 1 mês</small></div>'+ 
            '<div><label>Despesas diretas</label><input type="number" min="0" step="0.01" data-field="despesas" value="'+escapeAttr(item.despesas||'')+'" placeholder="Ex.: 15000" /></div>'+ 
            '<div><label>Homem/hora</label><input type="number" min="0" step="0.1" data-field="hh" value="'+escapeAttr(item.hh||'')+'" placeholder="Ex.: 80" /></div>'+ 
          '</div>'+ 
          '<div class="grid cols-2">'+ 
            '<div><label>Estimativa de Implementação</label><input type="date" data-field="estimativa" value="'+escapeAttr(item.estimativa||'')+'" /></div>'+ 
            '<div><label>Fator crítico de inviabilização da oportunidade</label><textarea rows="2" data-field="fator" placeholder="Ex.: dependência externa, limitação legal">'+escapeHtml(item.fator||'')+'</textarea></div>'+ 
          '</div>'+ 
          '<div class="toolbar"><button class="danger" data-del>Remover</button></div>'+ 
        '</div>'
      );
    }
    function renderIncertezas(){
      const list = el('incList'); if(!list) return;
      if(!state.e3.incertezas.length){ list.innerHTML = '<p class="help">Nenhuma incerteza adicionada ainda.</p>'; return; }
      list.innerHTML = state.e3.incertezas.map((it,i)=>incTemplate(it,i)).join('');
    }
    function addIncerteza(){ state.e3.incertezas.push(defaultInc()); renderIncertezas(); save(); }
    on(el('addInc'), 'click', addIncerteza);
    on(el('incList'), 'input', (e)=>{ const card = e.target.closest('[data-idx]'); if(!card) return; const idx = Number(card.getAttribute('data-idx')); const field = e.target.getAttribute('data-field'); if(!field) return; state.e3.incertezas[idx][field] = e.target.value; save(); });
    on(el('incList'), 'change', (e)=>{ const card = e.target.closest('[data-idx]'); if(!card) return; const idx = Number(card.getAttribute('data-idx')); const field = e.target.getAttribute('data-field'); if(!field) return; state.e3.incertezas[idx][field] = e.target.value; save(); });
    on(el('incList'), 'click', (e)=>{ if(e.target.matches('[data-del]')){ const card = e.target.closest('[data-idx]'); const idx = Number(card.getAttribute('data-idx')); state.e3.incertezas.splice(idx,1); renderIncertezas(); save(); }});

    // KPIs
    function kpiTemplate(kpi, idx){
      return (
        '<div class="card" data-idx="'+idx+'">'+
          '<div class="grid cols-2">'+
            '<div><label>Nome do KPI</label><input value="'+escapeAttr(kpi.nome||'')+'" data-field="nome" placeholder="Ex.: Tempo médio de exame PCT" /></div>'+ 
            '<div><label>Frequência</label><select data-field="freq">'+ ['Mensal','Trimestral','Semestral','Anual'].map(f=>'
<option '+(kpi.freq===f?'selected':'')+'>'+f+'</option>').join('') +'</select></div>'+ 
          '</div>'+ 
          '<div class="grid cols-2">'+ 
            '<div><label>Métrica (definição)</label><input value="'+escapeAttr(kpi.metrica||'')+'" data-field="metrica" placeholder="Como é calculado?" /></div>'+ 
            '<div><label>Meta</label><input value="'+escapeAttr(kpi.meta||'')+'" data-field="meta" placeholder="Ex.: ≤ 30 dias" /></div>'+ 
          '</div>'+ 
          '<div class="grid cols-2">'+ 
            '<div><label>Responsável</label><input value="'+escapeAttr(kpi.owner||'')+'" data-field="owner" placeholder="Equipe/Servidor" /></div>'+ 
            '<div><label>Fonte de dados</label><input value="'+escapeAttr(kpi.fonte||'')+'" data-field="fonte" placeholder="Sistema/planilha" /></div>'+ 
          '</div>'+ 
          '<div class="grid cols-2">'+ 
            '<div><label>Valor atual</label><input value="'+escapeAttr(kpi.atual||'')+'" data-field="atual" placeholder="Ex.: 45 dias (jul/2025)" /></div>'+ 
            '<div><label>Critério de validação</label><input value="'+escapeAttr(kpi.valid||'')+'" data-field="valid" placeholder="Ex.: 3 ciclos seguidos ≤ meta" /></div>'+ 
          '</div>'+ 
          '<div class="toolbar"><button class="danger" data-del>Remover</button></div>'+ 
        '</div>'
      );
    }
    function renderKPIs(){ const list = el('kpiList'); if(!list) return; list.innerHTML = state.e4.kpis.map((k, i)=>kpiTemplate(k,i)).join(''); }
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
