(()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const els={period:$('#periodFilter'),seller:$('#sellerFilter'),store:$('#storeFilter'),product:$('#productFilter'),updated:$('#updatedAt'),live:$('#liveBadge'),connDot:$('#connectionDot'),connTitle:$('#connectionTitle'),connSub:$('#connectionSub'),alertBadge:$('#alertBadge'),drawer:$('#drawer'),drawerBack:$('#drawerBackdrop'),drawerTitle:$('#drawerTitle'),drawerLabel:$('#drawerLabel'),drawerBody:$('#drawerBody'),modal:$('#connectionModal'),managerUrl:$('#managerUrl'),managerKey:$('#managerKey'),connMsg:$('#connectionMessage')};
  const DEMO=window.REPOSICAO_DEMO_DATA||{state:[],history:[],sellers:[]};
  let data={state:DEMO.state||[],history:DEMO.history||[],sellers:DEMO.sellers||[],updatedAt:DEMO.generatedAt||new Date().toISOString(),demo:true};
  const clean=v=>String(v??'').trim();
  const n=v=>{if(typeof v==='number')return Number.isFinite(v)?v:0;let s=String(v??'').trim();if(!s)return 0;const isPct=s.endsWith('%');if(isPct)s=s.slice(0,-1).trim();if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(',')){s=s.replace(/\./g,'').replace(',','.')}s=s.replace(/[^0-9.\-]/g,'');const x=Number(s);return Number.isFinite(x)?(isPct?x/100:x):0};
  const fmt=v=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(Math.round(n(v))), pct=v=>new Intl.NumberFormat('pt-BR',{style:'percent',maximumFractionDigits:1}).format(n(v));
  const esc=v=>clean(v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dateMs=v=>{
    if(v===null||v===undefined||v==='')return NaN;
    let s=String(v).trim();
    if(typeof v==='number'||/^-?\d+(?:[.,]\d+)?$/.test(s)){
      const x=Number(s.replace(',','.'));
      if(Number.isFinite(x)){if(x>20000&&x<100000)return Math.round((x-25569)*86400000);if(x>1e12)return x;if(x>1e9)return x*1000;}
    }
    const br=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if(br){const [,dd,mm,yyyy,hh='0',mi='0',ss='0']=br;return new Date(Number(yyyy),Number(mm)-1,Number(dd),Number(hh),Number(mi),Number(ss)).getTime();}
    const t=Date.parse(s);return Number.isFinite(t)?t:NaN;
  };
  const dateObj=v=>{const t=dateMs(v);return Number.isFinite(t)?new Date(t):null};
  const dateFmt=v=>{const d=dateObj(v);return d?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'}).format(d):'—'};
  const dateTimeFmt=v=>{const d=dateObj(v);return d?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d):'—'};
  const isoDay=v=>{const d=dateObj(v);return d?d.toISOString().slice(0,10):''};
  const cfg=()=>({url:localStorage.getItem('reposicao_v4_manager_url')||'',key:localStorage.getItem('reposicao_v4_manager_key')||''});
  const AUTO_REFRESH_MS=30000;
  let liveTimer=null,isLoading=false,lastLoadAt=0,failCount=0;

  function normalizeState(rows){return (rows||[]).map(r=>({vendedor:clean(r.vendedor??r.Vendedor),cliente:clean(r.cliente??r.Cliente),produto:clean(r.produto??r.Produto),estoqueAtual:n(r.estoqueAtual??r['Estoque Atual']),mediaVendasSemanal:n(r.mediaVendasSemanal??r['Média Vendas Semanal']),estoqueIdeal:n(r.estoqueIdeal??r['Estoque Ideal']),sugestao:n(r.sugestao??r['Sugestão Reposição']),ultimoPedido:n(r.ultimoPedido??r['Último Pedido Confirmado']),vendaEstimada:n(r.vendaEstimada??r['Venda Estimada Último Ciclo']),trocas:n(r.trocas??r['Trocas Último Ciclo']),atualizadoEm:clean(r.atualizadoEm??r['Última Atualização']),status:clean(r.status??r.Status)})).filter(r=>r.cliente&&r.produto)}
  function normalizeHistory(rows){return (rows||[]).map(r=>({id:clean(r.id??r.ID),dataHora:clean(r.dataHora??r['Data/Hora']),data:clean(r.data??r.Data),vendedor:clean(r.vendedor??r.Vendedor),cliente:clean(r.cliente??r.Cliente),produto:clean(r.produto??r.Produto),estoqueContado:n(r.estoqueContado??r['Estoque Contado']),vendaEstimada:n(r.vendaEstimada??r['Venda Estimada']),estoqueIdeal:n(r.estoqueIdeal??r['Estoque Ideal']),sugestao:n(r.sugestao??r['Sugestão Sistema']),pedidoConfirmado:n(r.pedidoConfirmado??r['Pedido Confirmado']),diferencaPedido:n(r.diferencaPedido??r['Diferença Pedido']),aderencia:n(r.aderencia??r['Aderência %']),excessoPotencial:n(r.excessoPotencial??r['Excesso Potencial']),trocas:n(r.trocas??r['Trocas/Devoluções']),taxaTrocas:n(r.taxaTrocas??r['Taxa Trocas %']),status:clean(r.status??r.Status),origem:clean(r.origem??r.Origem),cicloId:clean(r.cicloId??r['Ciclo ID'])})).filter(r=>r.vendedor&&r.cliente&&r.produto)}
  function normalizeSellers(rows){return (rows||[]).map(r=>({vendedor:clean(r.vendedor??r.Vendedor),lojas:r.lojas||[r['Loja 1'],r['Loja 2']].map(clean).filter(Boolean),ativo:r.ativo!==false&&clean(r.Ativo||'SIM').toUpperCase()!=='NÃO'})).filter(r=>r.vendedor)}

  function setData(raw,demo=false){
    const wasDemo=data.demo;
    data={state:normalizeState(raw.state||raw.rowsState||DEMO.state),history:normalizeHistory(raw.history||raw.rowsHistory||DEMO.history),sellers:normalizeSellers(raw.sellers||DEMO.sellers),updatedAt:raw.updatedAt||raw.serverTime||new Date().toISOString(),dataUpdatedAt:raw.dataUpdatedAt||'',demo};
    if(wasDemo&&!demo){els.seller.value='';els.store.value='';els.product.value='';}
    fillFilters();setMode(!demo);renderAll()
  }
  function setMode(live){els.live.classList.toggle('live',live);els.live.querySelector('span').textContent=live?'AO VIVO · 30s':'DEMO';els.connDot.classList.toggle('live',live);els.connTitle.textContent=live?'Planilha conectada':'Modo demonstração';els.connSub.textContent=live?'Atualização automática a cada 30 segundos':'Conecte o n8n para dados ao vivo'}
  function fillFilters(){
    const current={seller:els.seller.value,store:els.store.value,product:els.product.value};
    const sellerSource=[...data.sellers.map(x=>x.vendedor),...data.state.map(r=>r.vendedor),...data.history.map(r=>r.vendedor)].filter(Boolean);
    const sellers=[...new Set(sellerSource)].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    let storeSource=[...data.state.map(r=>({cliente:r.cliente,vendedor:r.vendedor})),...data.history.map(r=>({cliente:r.cliente,vendedor:r.vendedor}))];
    if(current.seller)storeSource=storeSource.filter(r=>r.vendedor===current.seller);
    const stores=[...new Set(storeSource.map(r=>r.cliente).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const products=[...new Set([...data.state.map(r=>r.produto),...data.history.map(r=>r.produto)].filter(Boolean))];
    els.seller.innerHTML='<option value="">Todos</option>'+sellers.map(x=>`<option>${esc(x)}</option>`).join('');
    els.store.innerHTML='<option value="">Todas</option>'+stores.map(x=>`<option>${esc(x)}</option>`).join('');
    els.product.innerHTML='<option value="">Todos</option>'+products.map(x=>`<option>${esc(x)}</option>`).join('');
    if(sellers.includes(current.seller))els.seller.value=current.seller;
    if(stores.includes(current.store))els.store.value=current.store;
    if(products.includes(current.product))els.product.value=current.product;
  }
  function filteredHistory(){
    let rows=[...data.history];const days=els.period.value;
    if(days!=='all'){
      const cutoff=Date.now()-Number(days)*86400000;
      rows=rows.filter(r=>{const t=dateMs(r.dataHora||r.data);return Number.isFinite(t)&&t>=cutoff});
    }
    if(els.seller.value)rows=rows.filter(r=>r.vendedor===els.seller.value);
    if(els.store.value)rows=rows.filter(r=>r.cliente===els.store.value);
    if(els.product.value)rows=rows.filter(r=>r.produto===els.product.value);
    return rows;
  }
  function sum(rows,key){return rows.reduce((a,r)=>a+n(r[key]),0)}
  function avg(rows,key){return rows.length?sum(rows,key)/rows.length:0}
  function visits(rows){return new Set(rows.map(r=>r.cicloId||`${r.dataHora}|${r.vendedor}|${r.cliente}`)).size}
  function aggBy(rows,key){const m=new Map();for(const r of rows){const k=r[key]||'Não informado';if(!m.has(k))m.set(k,[]);m.get(k).push(r)}return [...m.entries()].map(([name,rr])=>({name,rows:rr,suggested:sum(rr,'sugestao'),confirmed:sum(rr,'pedidoConfirmado'),excess:sum(rr,'excessoPotencial'),sales:sum(rr,'vendaEstimada'),returns:sum(rr,'trocas'),adherence:avg(rr,'aderencia'),visits:visits(rr)}))}
  function statusClass(diff,sug){return Math.abs(diff)<=Math.max(5,sug*.15)?'ok':diff>0?'high':'warn'}

  function renderOverview(){
    const rows=filteredHistory(),orders=sum(rows,'pedidoConfirmado'),suggested=sum(rows,'sugestao'),excess=sum(rows,'excessoPotencial'),sales=sum(rows,'vendaEstimada'),adherence=avg(rows,'aderencia'),visitCount=visits(rows),returnTotal=sum(rows,'trocas');
    $('#kpiOrders').textContent=fmt(orders);$('#kpiSuggested').textContent=fmt(suggested);$('#kpiExcess').textContent=fmt(excess);$('#kpiExcessPct').textContent=`${pct(excess/Math.max(orders,1))} do pedido`;$('#kpiSales').textContent=fmt(sales);$('#kpiAdherence').textContent=pct(adherence);$('#kpiVisits').textContent=fmt(visitCount);$('#kpiVisitsSub').textContent=`${new Set(rows.map(r=>r.cliente)).size} lojas no período`;
    const sellerAgg=aggBy(rows,'vendedor').sort((a,b)=>b.excess-a.excess),worst=sellerAgg[0];const alert=$('#executiveAlert');const problem=excess>Math.max(30,orders*.05);
    alert.className='executive-alert '+(problem?'':'good');alert.innerHTML=`<div class="alert-icon">${problem?'!':'✓'}</div><div><span class="section-label">DIAGNÓSTICO AUTOMÁTICO</span><h3>${problem?'Há pedidos acima da recomendação que merecem revisão':'Operação dentro de uma faixa saudável'}</h3><p>${problem?`Foram identificadas ${fmt(excess)} unidades de excesso potencial no período${worst?`, com maior concentração em ${esc(worst.name)}`:''}.`:`A aderência média está em ${pct(adherence)} e o excesso potencial está controlado.`}</p></div><div class="alert-score"><strong>${fmt(returnTotal)}</strong><span>trocas/devoluções</span></div>`;
    renderSellerChart(sellerAgg);renderTrend(rows);renderEfficiency(rows);renderTopRisks(rows);renderLatest(rows);
  }
  function renderEfficiency(rows){
    const adherence=avg(rows,'aderencia'),orders=sum(rows,'pedidoConfirmado'),excess=sum(rows,'excessoPotencial'),ret=sum(rows,'trocas'),sales=sum(rows,'vendaEstimada'),excessRate=excess/Math.max(orders,1),returnRate=ret/Math.max(sales+ret,1),coverage=new Set(rows.map(r=>r.cliente)).size/20;
    const metrics=[['Aderência à recomendação',adherence,'green',pct(adherence)],['Pedidos sem excesso',Math.max(0,1-excessRate),'green',pct(Math.max(0,1-excessRate))],['Controle de trocas',Math.max(0,1-returnRate*5),'orange',pct(returnRate)+' taxa'],['Cobertura de lojas',coverage,'blue',`${new Set(rows.map(r=>r.cliente)).size}/20`]];
    $('#efficiencyCards').innerHTML=metrics.map(([label,val,color,shown])=>`<div class="efficiency"><div class="efficiency-top"><span>${label}</span><strong>${shown}</strong></div><div class="progress ${color}"><i style="width:${Math.max(0,Math.min(100,val*100))}%"></i></div></div>`).join('')
  }
  function renderTopRisks(rows){const groups=aggBy(rows,'cliente').sort((a,b)=>b.excess-a.excess).slice(0,6);$('#topRisks').innerHTML=groups.length?groups.map((g,i)=>`<div class="risk-item" data-kind="store" data-name="${esc(g.name)}"><div class="risk-rank">${i+1}</div><div><b>${esc(g.name)}</b><small>${g.visits} visitas · aderência ${pct(g.adherence)}</small></div><div class="risk-value"><strong>${fmt(g.excess)}</strong><span>un. excesso</span></div></div>`).join(''):'<p>Sem riscos relevantes.</p>';$$('.risk-item').forEach(x=>x.onclick=()=>openEntity('store',x.dataset.name))}
  function groupVisits(rows){const m=new Map();for(const r of rows){const k=r.cicloId||`${r.dataHora}|${r.vendedor}|${r.cliente}`;if(!m.has(k))m.set(k,{id:k,dataHora:r.dataHora,vendedor:r.vendedor,cliente:r.cliente,rows:[]});m.get(k).rows.push(r)}return [...m.values()].map(v=>({...v,suggested:sum(v.rows,'sugestao'),confirmed:sum(v.rows,'pedidoConfirmado'),diff:sum(v.rows,'diferencaPedido'),adherence:avg(v.rows,'aderencia'),excess:sum(v.rows,'excessoPotencial')})).sort((a,b)=>dateMs(b.dataHora)-dateMs(a.dataHora))}
  function renderLatest(rows){const vv=groupVisits(rows).slice(0,12);$('#latestVisits').innerHTML=vv.map(v=>`<tr data-visit="${esc(v.id)}"><td>${dateTimeFmt(v.dataHora)}</td><td><b>${esc(v.vendedor)}</b></td><td>${esc(v.cliente)}</td><td>${fmt(v.suggested)}</td><td><b>${fmt(v.confirmed)}</b></td><td>${v.diff>0?'+':''}${fmt(v.diff)}</td><td>${pct(v.adherence)}</td><td><span class="status ${statusClass(v.diff,v.suggested)}">${statusClass(v.diff,v.suggested)==='ok'?'ALINHADO':v.diff>0?'ACIMA':'ABAIXO'}</span></td></tr>`).join('');$$('#latestVisits tr').forEach(tr=>tr.onclick=()=>openVisit(vv.find(v=>v.id===tr.dataset.visit)))}
  function renderSellers(){const rows=filteredHistory(),ag=aggBy(rows,'vendedor').sort((a,b)=>b.confirmed-a.confirmed);$('#sellerCards').innerHTML=ag.map(g=>`<article class="seller-card" data-name="${esc(g.name)}"><div class="seller-card-top"><div class="avatar">${esc(g.name.split(' ').pop())}</div><div><h3>${esc(g.name)}</h3><small>${(data.sellers.find(s=>s.vendedor===g.name)?.lojas||[]).join(' · ')}</small></div></div><div class="seller-score ${g.adherence>=.9?'good':g.adherence>=.8?'warn':''}">${pct(g.adherence)}</div><span class="section-label">ADERÊNCIA À SUGESTÃO</span><div class="mini"><span>${g.visits} visitas</span><span>${fmt(g.excess)} un. excesso</span></div></article>`).join('');$$('.seller-card').forEach(c=>c.onclick=()=>openEntity('seller',c.dataset.name));$('#sellerTable').innerHTML=ag.map(g=>`<tr data-name="${esc(g.name)}"><td><b>${esc(g.name)}</b></td><td>${(data.sellers.find(s=>s.vendedor===g.name)?.lojas||[]).join(', ')}</td><td>${g.visits}</td><td>${fmt(g.suggested)}</td><td>${fmt(g.confirmed)}</td><td>${fmt(g.excess)}</td><td>${pct(g.adherence)}</td><td>${fmt(g.returns)}</td></tr>`).join('');$$('#sellerTable tr').forEach(c=>c.onclick=()=>openEntity('seller',c.dataset.name))}
  function renderEntities(kind){const rows=filteredHistory(),key=kind==='store'?'cliente':'produto',target=kind==='store'?$('#storeGrid'):$('#productGrid');const ag=aggBy(rows,key).sort((a,b)=>b.confirmed-a.confirmed);target.innerHTML=ag.map(g=>`<article class="entity-card" data-name="${esc(g.name)}" data-kind="${kind}"><span>${kind==='store'?'LOJA':'PRODUTO'}</span><h3>${esc(g.name)}</h3><div class="entity-kpis"><div><span>Pedido</span><strong>${fmt(g.confirmed)}</strong></div><div><span>Excesso</span><strong>${fmt(g.excess)}</strong></div><div><span>Aderência</span><strong>${pct(g.adherence)}</strong></div><div><span>Trocas</span><strong>${fmt(g.returns)}</strong></div></div></article>`).join('');target.querySelectorAll('.entity-card').forEach(c=>c.onclick=()=>openEntity(kind,c.dataset.name))}
  function renderHistory(){const rows=filteredHistory().sort((a,b)=>dateMs(b.dataHora)-dateMs(a.dataHora)).slice(0,600);$('#historyTable').innerHTML=rows.map(r=>`<tr><td>${dateFmt(r.dataHora)}</td><td>${esc(r.vendedor)}</td><td>${esc(r.cliente)}</td><td>${esc(r.produto)}</td><td>${fmt(r.estoqueContado)}</td><td>${fmt(r.vendaEstimada)}</td><td>${fmt(r.sugestao)}</td><td><b>${fmt(r.pedidoConfirmado)}</b></td><td>${r.diferencaPedido>0?'+':''}${fmt(r.diferencaPedido)}</td><td>${pct(r.aderencia)}</td><td>${fmt(r.trocas)}</td></tr>`).join('')}
  function alerts(rows=filteredHistory()){
    const out=[];for(const r of rows){const delta=r.pedidoConfirmado-r.sugestao;if(delta>Math.max(10,r.sugestao*.18))out.push({level:delta>Math.max(30,r.sugestao*.3)?'high':'warn',score:delta,title:`Pedido acima da recomendação`,text:`${r.vendedor} · ${r.cliente} · ${r.produto}: sugerido ${fmt(r.sugestao)}, confirmado ${fmt(r.pedidoConfirmado)}.`,meta:`+${fmt(delta)} un.`,row:r});if(r.aderencia<.7&&r.sugestao>20)out.push({level:'warn',score:(1-r.aderencia)*100,title:'Baixa aderência à sugestão',text:`${r.vendedor} · ${r.cliente} · ${r.produto}: aderência de ${pct(r.aderencia)}.`,meta:pct(r.aderencia),row:r});if(r.trocas>=8||r.taxaTrocas>.07)out.push({level:'high',score:r.trocas*2,title:'Trocas/devoluções elevadas',text:`${r.cliente} · ${r.produto}: ${fmt(r.trocas)} unidades registradas.`,meta:`${fmt(r.trocas)} un.`,row:r})}return out.sort((a,b)=>b.score-a.score)}
  function renderAlerts(){const aa=alerts();els.alertBadge.textContent=aa.length;$('#alertsList').innerHTML=aa.length?aa.slice(0,100).map((a,i)=>`<article class="alert-card ${a.level}" data-i="${i}"><div><h3>${esc(a.title)}</h3><p>${esc(a.text)} · ${dateFmt(a.row.dataHora)}</p></div><aside><strong>${esc(a.meta)}</strong><span>revisar</span></aside></article>`).join(''):'<article class="panel">Nenhum alerta relevante para os filtros atuais.</article>';$$('.alert-card').forEach(x=>x.onclick=()=>openRow(aa[Number(x.dataset.i)].row))}
  function renderAll(){els.updated.textContent=dateTimeFmt(data.updatedAt);renderOverview();renderSellers();renderEntities('store');renderEntities('product');renderHistory();renderAlerts()}

  function openVisit(v){if(!v)return;els.drawerLabel.textContent='VISITA';els.drawerTitle.textContent=`${v.cliente} · ${v.vendedor}`;els.drawerBody.innerHTML=`<div class="drawer-grid"><div class="drawer-metric"><span>Data</span><strong>${dateFmt(v.dataHora)}</strong></div><div class="drawer-metric"><span>Aderência</span><strong>${pct(v.adherence)}</strong></div><div class="drawer-metric"><span>Sugerido</span><strong>${fmt(v.suggested)}</strong></div><div class="drawer-metric"><span>Confirmado</span><strong>${fmt(v.confirmed)}</strong></div></div><div class="drawer-section"><h3>Produtos</h3><div class="drawer-list">${v.rows.map(r=>`<div class="drawer-row"><span>${esc(r.produto)}<br><small>estoque ${fmt(r.estoqueContado)} · venda est. ${fmt(r.vendaEstimada)}</small></span><b>${fmt(r.sugestao)} → ${fmt(r.pedidoConfirmado)}</b></div>`).join('')}</div></div>`;openDrawer()}
  function openRow(r){openVisit(groupVisits([r])[0])}
  function openEntity(kind,name){const key=kind==='seller'?'vendedor':kind==='store'?'cliente':'produto',rows=filteredHistory().filter(r=>r[key]===name),g=aggBy(rows,key)[0];if(!g)return;els.drawerLabel.textContent=kind==='seller'?'VENDEDOR':kind==='store'?'LOJA':'PRODUTO';els.drawerTitle.textContent=name;const latest=groupVisits(rows).slice(0,6);els.drawerBody.innerHTML=`<div class="drawer-grid"><div class="drawer-metric"><span>Pedidos</span><strong>${fmt(g.confirmed)}</strong></div><div class="drawer-metric"><span>Sugerido</span><strong>${fmt(g.suggested)}</strong></div><div class="drawer-metric"><span>Excesso</span><strong>${fmt(g.excess)}</strong></div><div class="drawer-metric"><span>Aderência</span><strong>${pct(g.adherence)}</strong></div><div class="drawer-metric"><span>Vendas estimadas</span><strong>${fmt(g.sales)}</strong></div><div class="drawer-metric"><span>Trocas</span><strong>${fmt(g.returns)}</strong></div></div><div class="drawer-section"><h3>Últimas movimentações</h3><div class="drawer-list">${latest.map(v=>`<div class="drawer-row"><span>${dateFmt(v.dataHora)} · ${esc(v.cliente)}<br><small>${esc(v.vendedor)}</small></span><b>${fmt(v.confirmed)} un.</b></div>`).join('')}</div></div>`;openDrawer()}
  function openDrawer(){els.drawerBack.classList.remove('hidden');els.drawer.classList.add('open');els.drawer.setAttribute('aria-hidden','false')}
  function closeDrawer(){els.drawerBack.classList.add('hidden');els.drawer.classList.remove('open');els.drawer.setAttribute('aria-hidden','true')}

  function canvasSetup(canvas){const dpr=Math.max(1,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect(),w=Math.max(300,rect.width),h=Number(canvas.getAttribute('height'))||300;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.height=h+'px';const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c,w,h}}
  function renderSellerChart(groups){const canvas=$('#sellerChart'),{c,w,h}=canvasSetup(canvas);c.clearRect(0,0,w,h);const pad={l:36,r:12,t:20,b:55},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b,max=Math.max(1,...groups.flatMap(g=>[g.suggested,g.confirmed]));c.strokeStyle='#e7ebf1';c.lineWidth=1;for(let i=0;i<5;i++){const y=pad.t+ch*i/4;c.beginPath();c.moveTo(pad.l,y);c.lineTo(w-pad.r,y);c.stroke()}const groupW=cw/Math.max(groups.length,1),barW=Math.min(17,groupW*.28);groups.forEach((g,i)=>{const cx=pad.l+groupW*i+groupW/2,hs=ch*g.suggested/max,hc=ch*g.confirmed/max;c.fillStyle='#c8d9ff';c.fillRect(cx-barW-2,pad.t+ch-hs,barW,hs);c.fillStyle='#2563eb';c.fillRect(cx+2,pad.t+ch-hc,barW,hc);c.fillStyle='#7b879b';c.font='9px system-ui';c.textAlign='center';c.fillText(g.name.replace('Vendedor ','V'),cx,h-30)})}
  function renderTrend(rows){const canvas=$('#trendChart'),{c,w,h}=canvasSetup(canvas);c.clearRect(0,0,w,h);const daily=new Map();for(const r of rows){const d=isoDay(r.dataHora||r.data);if(!d)continue;daily.set(d,(daily.get(d)||0)+r.pedidoConfirmado)}const pts=[...daily.entries()].sort((a,b)=>a[0].localeCompare(b[0]));const pad={l:30,r:14,t:16,b:36},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b,max=Math.max(1,...pts.map(p=>p[1]));c.strokeStyle='#e7ebf1';for(let i=0;i<4;i++){const y=pad.t+ch*i/3;c.beginPath();c.moveTo(pad.l,y);c.lineTo(w-pad.r,y);c.stroke()}if(pts.length<2)return;c.strokeStyle='#2563eb';c.lineWidth=2.5;c.beginPath();pts.forEach((p,i)=>{const x=pad.l+cw*i/(pts.length-1),y=pad.t+ch-ch*p[1]/max;i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();c.fillStyle='#2563eb';pts.forEach((p,i)=>{const x=pad.l+cw*i/(pts.length-1),y=pad.t+ch-ch*p[1]/max;c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();if(i===0||i===pts.length-1||i%Math.max(1,Math.floor(pts.length/5))===0){c.fillStyle='#7b879b';c.font='9px system-ui';c.textAlign='center';c.fillText(p[0].slice(5).split('-').reverse().join('/'),x,h-14);c.fillStyle='#2563eb'}})}

  function csv(rows){const headers=['Data','Vendedor','Loja','Produto','Estoque Contado','Venda Estimada','Sugestão','Pedido Confirmado','Diferença','Aderência','Trocas'];const body=rows.map(r=>[r.dataHora,r.vendedor,r.cliente,r.produto,r.estoqueContado,r.vendaEstimada,r.sugestao,r.pedidoConfirmado,r.diferencaPedido,r.aderencia,r.trocas]);const text='\ufeff'+[headers,...body].map(a=>a.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob([text],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reposicao-historico.csv';a.click();URL.revokeObjectURL(a.href)}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
  function setView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));$$('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('#pageTitle').textContent={overview:'Visão geral',sellers:'Vendedores',stores:'Lojas',products:'Produtos',history:'Histórico',alerts:'Alertas'}[name]||'Gestão';$('#sidebar').classList.remove('open');if(name==='overview')setTimeout(()=>{renderSellerChart(aggBy(filteredHistory(),'vendedor').sort((a,b)=>b.excess-a.excess));renderTrend(filteredHistory())},20)}

  async function loadLive(test=false,silent=false){
    const c=cfg();
    if(!c.url){stopAutoRefresh();setData(DEMO,true);return false}
    if(isLoading)return false;
    isLoading=true;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
    try{
      if(test)els.connMsg.textContent='Testando conexão...';
      els.live.querySelector('span').textContent='ATUALIZANDO...';
      const sep=c.url.includes('?')?'&':'?';
      const res=await fetch(`${c.url}${sep}chave=${encodeURIComponent(c.key)}&_ts=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal});
      const text=await res.text();
      if(!text.trim())throw new Error(`O n8n respondeu sem conteúdo (HTTP ${res.status}).`);
      let raw;try{raw=JSON.parse(text)}catch{throw new Error(`O n8n respondeu em formato inválido (HTTP ${res.status}).`)}
      if(!res.ok||raw.ok===false)throw new Error(raw.error||`Erro HTTP ${res.status}`);
      if(!Array.isArray(raw.history)||!Array.isArray(raw.state))throw new Error('O webhook não retornou state + history.');
      setData(raw,false);lastLoadAt=Date.now();failCount=0;
      els.connSub.textContent='Atualização automática a cada 30 segundos';
      if(test)els.connMsg.textContent=`Conectado: ${raw.history.length} registros históricos.`;
      return true;
    }catch(e){
      failCount++;
      const msg=e.name==='AbortError'?'Tempo limite ao consultar o n8n.':e.message;
      els.live.querySelector('span').textContent=data.demo?'DEMO':'AO VIVO · INSTÁVEL';
      if(!data.demo)els.connSub.textContent=`Falha de sincronização · nova tentativa automática`;
      if(test)els.connMsg.textContent=msg;else if(!silent)toast('Não foi possível atualizar. Mantendo os últimos dados.');
      return false;
    }finally{clearTimeout(timeout);isLoading=false}
  }
  function stopAutoRefresh(){if(liveTimer){clearInterval(liveTimer);liveTimer=null}}
  function startAutoRefresh(){stopAutoRefresh();if(!cfg().url)return;liveTimer=setInterval(()=>{if(!document.hidden&&!isLoading)loadLive(false,true)},AUTO_REFRESH_MS)}
  function refreshIfStale(){if(cfg().url&&!document.hidden&&!isLoading&&Date.now()-lastLoadAt>15000)loadLive(false,true)}
  function openConnection(){const c=cfg();els.managerUrl.value=c.url;els.managerKey.value=c.key;els.connMsg.textContent='';els.modal.classList.remove('hidden')}
  function closeConnection(){els.modal.classList.add('hidden')}

  els.period.addEventListener('change',renderAll);els.seller.addEventListener('change',()=>{els.store.value='';fillFilters();renderAll()});els.store.addEventListener('change',renderAll);els.product.addEventListener('change',renderAll);$$('.nav').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.go)));$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');$('#refreshBtn').onclick=()=>cfg().url?loadLive(false,false):renderAll();$('#connectionBtn').onclick=openConnection;$('#closeModal').onclick=closeConnection;els.modal.onclick=e=>{if(e.target===els.modal)closeConnection()};$('#useDemo').onclick=()=>{stopAutoRefresh();localStorage.removeItem('reposicao_v4_manager_url');localStorage.removeItem('reposicao_v4_manager_key');setData(DEMO,true);els.connMsg.textContent='Modo demonstração ativado.';setTimeout(closeConnection,500)};$('#saveConnection').onclick=async()=>{const u=els.managerUrl.value.trim(),k=els.managerKey.value.trim();if(!/^https?:\/\//i.test(u)){els.connMsg.textContent='Informe uma URL completa.';return}localStorage.setItem('reposicao_v4_manager_url',u);localStorage.setItem('reposicao_v4_manager_key',k);const ok=await loadLive(true,false);if(ok){startAutoRefresh();setTimeout(closeConnection,700)}};$('#drawerClose').onclick=closeDrawer;els.drawerBack.onclick=closeDrawer;$('#exportOverview').onclick=()=>csv(filteredHistory());$('#exportHistory').onclick=()=>csv(filteredHistory());window.addEventListener('resize',()=>{if($('#view-overview').classList.contains('active')){renderSellerChart(aggBy(filteredHistory(),'vendedor').sort((a,b)=>b.excess-a.excess));renderTrend(filteredHistory())}});

  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshIfStale()});
  window.addEventListener('focus',refreshIfStale);

  setData(DEMO,true);
  if(cfg().url){loadLive(false,true).finally(startAutoRefresh)}
})();
