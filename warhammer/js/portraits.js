/* ========================================
   CHARACTER PORTRAITS (SVG)
======================================== */
function portraitHaidi(expr){
  const smile = expr==='smile';
  const serious = expr==='serious';
  const eyeY = smile?192:194;
  const mouthPath = smile
    ?'<path d="M146,244 Q160,254 174,244" stroke="#a05050" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :serious
    ?'<path d="M148,250 L172,250" stroke="#a05050" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M150,248 Q160,250 170,248" stroke="#a05050" stroke-width="2" fill="none" stroke-linecap="round"/>';
  const browPath = serious
    ?'<path d="M118,172 L150,178" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170,178 L202,172" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M120,174 Q135,169 150,174" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170,174 Q185,169 200,174" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const eyeShape = smile
    ?'<path d="M125,196 Q135,189 145,196 Q135,200 125,196" fill="#2a3a5a"/><path d="M175,196 Q185,189 195,196 Q185,200 175,196" fill="#2a3a5a"/><circle cx="135" cy="195" r="3" fill="#6a9fd4"/><circle cx="185" cy="195" r="3" fill="#6a9fd4"/><circle cx="137" cy="193" r="1.5" fill="#fff"/><circle cx="187" cy="193" r="1.5" fill="#fff"/>'
    :serious
    ?'<path d="M125,193 L145,193 L145,199 L125,199 Z" fill="#2a3a5a"/><path d="M175,193 L195,193 L195,199 L175,199 Z" fill="#2a3a5a"/><circle cx="135" cy="196" r="3.5" fill="#4a6fa5"/><circle cx="185" cy="196" r="3.5" fill="#4a6fa5"/><circle cx="136" cy="194" r="1.5" fill="#fff"/><circle cx="186" cy="194" r="1.5" fill="#fff"/>'
    :'<ellipse cx="135" cy="196" rx="9" ry="6" fill="#fff"/><ellipse cx="185" cy="196" rx="9" ry="6" fill="#fff"/><circle cx="135" cy="197" r="4.5" fill="#4a6fa5"/><circle cx="185" cy="197" r="4.5" fill="#4a6fa5"/><circle cx="137" cy="195" r="1.8" fill="#fff"/><circle cx="187" cy="195" r="1.8" fill="#fff"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="hs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d0b0"/><stop offset="1" stop-color="#ddb888"/></linearGradient>
<linearGradient id="hh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a2e"/><stop offset="1" stop-color="#2d2d4e"/></linearGradient>
<linearGradient id="hc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#222238"/><stop offset="1" stop-color="#0d0d18"/></linearGradient>
</defs>
<!-- Coat -->
<path d="M50,480 L50,380 Q50,330 95,312 Q130,300 160,300 Q190,300 225,312 Q270,330 270,380 L270,480 Z" fill="url(#hc)"/>
<!-- Coat highlight -->
<path d="M160,310 L160,480 M120,340 L120,480 M200,340 L200,480" stroke="#2a2a40" stroke-width="1" opacity=".5"/>
<!-- Collar -->
<path d="M95,312 Q130,302 160,300 Q190,302 225,312 L215,335 L160,325 L105,335 Z" fill="#2a2a44"/>
<!-- Collar pin -->
<circle cx="160" cy="325" r="4" fill="#c5a059"/>
<!-- Neck -->
<path d="M142,268 L142,308 Q160,314 178,308 L178,268 Z" fill="url(#hs)"/>
<path d="M142,290 Q160,296 178,290 L178,308 Q160,314 142,308 Z" fill="#cc9a78" opacity=".4"/>
<!-- Hair back -->
<path d="M88,200 Q85,110 160,92 Q235,110 232,200 L230,270 L210,255 Q205,210 160,200 Q115,210 110,255 L90,270 Z" fill="url(#hh)"/>
<!-- Face -->
<path d="M108,165 Q108,108 160,98 Q212,108 212,165 L212,225 Q212,268 160,273 Q108,268 108,225 Z" fill="url(#hs)"/>
<!-- Jaw shadow -->
<path d="M120,240 Q160,275 200,240 L200,260 Q160,275 120,260 Z" fill="#cc9a78" opacity=".2"/>
<!-- Ears -->
<ellipse cx="106" cy="190" rx="7" ry="13" fill="url(#hs)"/>
<ellipse cx="214" cy="190" rx="7" ry="13" fill="url(#hs)"/>
<!-- Hair front -->
<path d="M95,170 Q92,100 160,88 Q228,100 225,170 L220,148 Q210,122 188,118 Q180,138 168,125 Q160,142 148,125 Q140,142 128,125 Q108,130 100,148 Z" fill="url(#hh)"/>
<!-- Hair strands -->
<path d="M100,145 Q105,120 120,115" stroke="#2d2d4e" stroke-width="2" fill="none" opacity=".6"/>
<path d="M220,145 Q215,120 200,115" stroke="#2d2d4e" stroke-width="2" fill="none" opacity=".6"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Glasses -->
<g opacity=".9">
<rect x="116" y="183" width="38" height="26" rx="5" fill="rgba(200,220,255,.06)" stroke="#2a2a3e" stroke-width="2"/>
<rect x="166" y="183" width="38" height="26" rx="5" fill="rgba(200,220,255,.06)" stroke="#2a2a3e" stroke-width="2"/>
<line x1="154" y1="194" x2="166" y2="194" stroke="#2a2a3e" stroke-width="2"/>
<path d="M116,186 L98,182" stroke="#2a2a3e" stroke-width="2" fill="none"/>
<path d="M204,186 L222,182" stroke="#2a2a3e" stroke-width="2" fill="none"/>
</g>
<!-- Lens reflection -->
<line x1="122" y1="187" x2="128" y2="202" stroke="#fff" stroke-width="1.5" opacity=".25"/>
<line x1="172" y1="187" x2="178" y2="202" stroke="#fff" stroke-width="1.5" opacity=".25"/>
<!-- Nose -->
<path d="M158,212 Q155,224 159,228 Q163,224 162,228" stroke="#c4986a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Earring -->
<circle cx="106" cy="205" r="2.5" fill="#c5a059"/>
</svg>`;
}

function portraitDuorou(expr){
  const happy = expr==='happy';
  const normal = expr==='normal';
  const eyeShape = happy
    ?'<path d="M122,196 Q135,188 148,196" stroke="#3a5a2a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,196 Q185,188 198,196" stroke="#3a5a2a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="135" cy="198" r="3" fill="#5a8b3c"/><circle cx="185" cy="198" r="3" fill="#5a8b3c"/><circle cx="136" cy="196" r="1.2" fill="#fff"/><circle cx="186" cy="196" r="1.2" fill="#fff"/>'
    :'<ellipse cx="135" cy="198" rx="10" ry="8" fill="#fff"/><ellipse cx="185" cy="198" rx="10" ry="8" fill="#fff"/><circle cx="135" cy="199" r="6" fill="#5a8b3c"/><circle cx="185" cy="199" r="6" fill="#5a8b3c"/><circle cx="136" cy="197" r="2.5" fill="#fff"/><circle cx="186" cy="197" r="2.5" fill="#fff"/><circle cx="133" cy="200" r="1" fill="#3a5a2a"/><circle cx="183" cy="200" r="1" fill="#3a5a2a"/><circle cx="133" cy="200" r="1" fill="#3a5a2a"/><circle cx="183" cy="200" r="1" fill="#3a5a2a"/><circle cx="133" cy="200" r="1" fill="#3a5a2a"/><circle cx="183" cy="200" r="1" fill="#3a5a2a"/>';
  const mouthPath = happy
    ?'<path d="M142,240 Q160,262 178,240 Q170,252 160,253 Q150,252 142,240" fill="#c44848" opacity=".7"/><path d="M142,240 Q160,260 178,240" stroke="#a02828" stroke-width="1.5" fill="none"/>'
    :'<path d="M148,246 Q160,252 172,246" stroke="#c44848" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  const browPath = normal
    ?'<path d="M118,180 Q135,174 148,180" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M172,180 Q185,174 202,180" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,178 Q135,172 148,178" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M172,178 Q185,172 202,178" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ds" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8d8b8"/><stop offset="1" stop-color="#e8c0a0"/></linearGradient>
<linearGradient id="dh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3c"/><stop offset=".5" stop-color="#7a5a2c"/><stop offset="1" stop-color="#5a4020"/></linearGradient>
<linearGradient id="dc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4856a"/><stop offset="1" stop-color="#b06040"/></linearGradient>
<linearGradient id="da" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e0d0"/><stop offset="1" stop-color="#c8c0b0"/></linearGradient>
</defs>
<!-- Body / hoodie -->
<path d="M50,480 L50,385 Q50,340 100,320 Q135,308 160,306 Q185,308 220,320 Q270,340 270,385 L270,480 Z" fill="url(#dc)"/>
<!-- Hoodie strings -->
<path d="M140,330 Q138,360 135,375" stroke="#a05030" stroke-width="2" fill="none"/>
<path d="M180,330 Q182,360 185,375" stroke="#a05030" stroke-width="2" fill="none"/>
<circle cx="135" cy="378" r="3" fill="#a05030"/>
<circle cx="185" cy="378" r="3" fill="#a05030"/>
<!-- Apron -->
<path d="M110,335 L115,480 L205,480 L210,335 Q185,330 160,328 Q135,330 110,335 Z" fill="url(#da)" opacity=".85"/>
<!-- Paint stains on apron -->
<circle cx="130" cy="380" r="6" fill="#3a6a9a" opacity=".6"/>
<circle cx="180" cy="400" r="5" fill="#a02828" opacity=".6"/>
<circle cx="155" cy="430" r="4" fill="#3a8a3a" opacity=".6"/>
<circle cx="190" cy="365" r="3" fill="#c5a059" opacity=".6"/>
<!-- Neck -->
<path d="M142,265 L142,310 Q160,316 178,310 L178,265 Z" fill="url(#ds)"/>
<!-- Ponytail back -->
<path d="M220,150 Q260,200 255,290 Q250,360 235,400 Q230,380 225,340 Q220,280 215,220 Z" fill="url(#dh)"/>
<!-- Ponytail tie -->
<ellipse cx="222" cy="155" rx="8" ry="6" fill="#c44848"/>
<!-- Hair back -->
<path d="M90,180 Q88,108 160,90 Q232,108 230,180 L228,250 L210,235 Q205,195 160,185 Q115,195 110,235 L90,250 Z" fill="url(#dh)"/>
<!-- Face -->
<path d="M108,158 Q108,102 160,94 Q212,102 212,158 L212,225 Q212,265 160,270 Q108,265 108,225 Z" fill="url(#ds)"/>
<!-- Jaw shadow -->
<path d="M120,235 Q160,270 200,235 L200,258 Q160,270 120,258 Z" fill="#d4a070" opacity=".25"/>
<!-- Ears -->
<ellipse cx="106" cy="186" rx="7" ry="13" fill="url(#ds)"/>
<ellipse cx="214" cy="186" rx="7" ry="13" fill="url(#ds)"/>
<!-- Earring (single stud) -->
<circle cx="106" cy="200" r="2.5" fill="#c5a059"/>
<!-- Hair front - bangs -->
<path d="M92,165 Q90,95 160,85 Q230,95 228,165 L225,140 Q215,115 190,112 Q182,135 170,120 Q160,138 148,120 Q138,138 126,120 Q105,125 95,142 Z" fill="url(#dh)"/>
<!-- Side hair strands -->
<path d="M95,140 Q88,200 92,250" stroke="#8a5a2c" stroke-width="3" fill="none" opacity=".5"/>
<path d="M225,140 Q232,200 228,250" stroke="#8a5a2c" stroke-width="3" fill="none" opacity=".5"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Paintbrush behind ear -->
<g transform="translate(100,175) rotate(-15)">
<rect x="-2" y="-30" width="4" height="40" fill="#8a6a3a"/>
<ellipse cx="0" cy="-32" rx="4" ry="8" fill="#3a6a9a"/>
</g>
<!-- Nose -->
<path d="M158,208 Q155,220 159,224 Q163,220 162,224" stroke="#d4a070" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
</svg>`;
}

function portraitZhou(expr){
  const smile = expr==='smile';
  const shy = expr==='shy';
  const serious = expr==='serious';
  const browPath = serious
    ?'<path d="M116,174 L148,182" stroke="#3a3020" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M172,182 L204,174" stroke="#3a3020" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    :shy
    ?'<path d="M118,178 Q135,182 148,178" stroke="#3a3020" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,178 Q185,182 202,178" stroke="#3a3020" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,176 Q135,170 148,176" stroke="#3a3020" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,176 Q185,170 202,176" stroke="#3a3020" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const eyeShape = smile
    ?'<path d="M122,196 Q135,189 148,196 Q135,200 122,196" fill="#3a2a1a"/><path d="M172,196 Q185,189 198,196 Q185,200 172,196" fill="#3a2a1a"/><circle cx="135" cy="195" r="3" fill="#8a6a3a"/><circle cx="185" cy="195" r="3" fill="#8a6a3a"/><circle cx="137" cy="193" r="1.5" fill="#fff"/><circle cx="187" cy="193" r="1.5" fill="#fff"/>'
    :shy
    ?'<path d="M125,198 Q135,194 145,198" stroke="#3a2a1a" stroke-width="2.5" fill="none"/><path d="M175,198 Q185,194 195,198" stroke="#3a2a1a" stroke-width="2.5" fill="none"/><circle cx="135" cy="198" r="3" fill="#8a6a3a"/><circle cx="185" cy="198" r="3" fill="#8a6a3a"/>'
    :'<ellipse cx="135" cy="197" rx="9" ry="6" fill="#fff"/><ellipse cx="185" cy="197" rx="9" ry="6" fill="#fff"/><circle cx="135" cy="198" r="4.5" fill="#8a6a3a"/><circle cx="185" cy="198" r="4.5" fill="#8a6a3a"/><circle cx="137" cy="196" r="1.8" fill="#fff"/><circle cx="187" cy="196" r="1.8" fill="#fff"/>';
  const mouthPath = smile
    ?'<path d="M144,244 Q160,256 176,244" stroke="#8a5050" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :shy
    ?'<path d="M148,248 Q160,252 172,248" stroke="#a06060" stroke-width="2" fill="none" stroke-linecap="round"/>'
    :'<path d="M150,248 L170,248" stroke="#8a5050" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  const cheekColor = shy ? '<ellipse cx="128" cy="218" rx="12" ry="7" fill="#e89898" opacity=".35"/><ellipse cx="192" cy="218" rx="12" ry="7" fill="#e89898" opacity=".35"/>' : '';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="zs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c8a0"/><stop offset="1" stop-color="#d0a878"/></linearGradient>
<linearGradient id="zh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a2a"/><stop offset="1" stop-color="#2a2015"/></linearGradient>
<linearGradient id="zc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a5a4a"/><stop offset="1" stop-color="#1a3a2a"/></linearGradient>
</defs>
<!-- Coat -->
<path d="M50,480 L50,380 Q50,330 95,312 Q130,300 160,300 Q190,300 225,312 Q270,330 270,380 L270,480 Z" fill="url(#zc)"/>
<!-- Coat detail -->
<path d="M160,310 L160,480" stroke="#2a4a3a" stroke-width="1" opacity=".5"/>
<!-- Collar -->
<path d="M95,312 Q130,302 160,300 Q190,302 225,312 L215,335 L160,325 L105,335 Z" fill="#1a3a2a"/>
<!-- Neck -->
<path d="M142,268 L142,308 Q160,314 178,308 L178,268 Z" fill="url(#zs)"/>
<!-- Hair back -->
<path d="M85,200 Q82,108 160,88 Q238,108 235,200 L233,265 L213,250 Q208,200 160,190 Q112,200 107,250 L87,265 Z" fill="url(#zh)"/>
<!-- Face -->
<path d="M106,162 Q106,105 160,95 Q214,105 214,162 L214,222 Q214,265 160,270 Q106,265 106,222 Z" fill="url(#zs)"/>
<!-- Jaw shadow -->
<path d="M118,235 Q160,270 202,235 L202,255 Q160,270 118,255 Z" fill="#c89868" opacity=".2"/>
<!-- Ears -->
<ellipse cx="104" cy="188" rx="7" ry="13" fill="url(#zs)"/>
<ellipse cx="216" cy="188" rx="7" ry="13" fill="url(#zs)"/>
<!-- Hair front -->
<path d="M93,168 Q90,95 160,85 Q230,95 227,168 L222,145 Q210,118 188,115 Q180,135 168,122 Q160,138 148,122 Q140,138 128,122 Q108,125 98,145 Z" fill="url(#zh)"/>
<!-- Sideburns -->
<path d="M108,155 Q106,200 110,230" stroke="#3a2a1a" stroke-width="4" fill="none" opacity=".4"/>
<path d="M212,155 Q214,200 210,230" stroke="#3a2a1a" stroke-width="4" fill="none" opacity=".4"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Nose -->
<path d="M158,208 Q155,220 159,224 Q163,220 162,224" stroke="#b08858" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
${cheekColor}
<!-- Stubble -->
<rect x="120" y="250" width="80" height="15" fill="#3a2a1a" opacity=".08"/>
</svg>`;
}

function portraitLigong(expr){
  const happy = expr==='happy';
  const nervous = expr==='nervous';
  const eyeShape = happy
    ?'<path d="M122,198 Q135,190 148,198" stroke="#2a3a5a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,198 Q185,190 198,198" stroke="#2a3a5a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="135" cy="200" r="3" fill="#5a7a9a"/><circle cx="185" cy="200" r="3" fill="#5a7a9a"/><circle cx="136" cy="198" r="1.2" fill="#fff"/><circle cx="186" cy="198" r="1.2" fill="#fff"/>'
    :nervous
    ?'<ellipse cx="135" cy="200" rx="11" ry="8" fill="#fff"/><ellipse cx="185" cy="200" rx="11" ry="8" fill="#fff"/><circle cx="138" cy="200" r="5" fill="#5a7a9a"/><circle cx="182" cy="200" r="5" fill="#5a7a9a"/><circle cx="139" cy="198" r="2" fill="#fff"/><circle cx="183" cy="198" r="2" fill="#fff"/>'
    :'<ellipse cx="135" cy="199" rx="10" ry="7" fill="#fff"/><ellipse cx="185" cy="199" rx="10" ry="7" fill="#fff"/><circle cx="136" cy="200" r="5" fill="#5a7a9a"/><circle cx="184" cy="200" r="5" fill="#5a7a9a"/><circle cx="137" cy="198" r="2" fill="#fff"/><circle cx="185" cy="198" r="2" fill="#fff"/>';
  const browPath = nervous
    ?'<path d="M116,178 Q132,172 148,176" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,176 Q188,172 204,178" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,176 Q135,170 148,176" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,176 Q185,170 202,176" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const mouthPath = happy
    ?'<path d="M144,244 Q160,254 176,244" stroke="#a06060" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :nervous
    ?'<path d="M148,250 Q154,248 160,250 Q166,248 172,250" stroke="#a08080" stroke-width="2" fill="none" stroke-linecap="round"/>'
    :'<path d="M150,248 Q160,250 170,248" stroke="#a06060" stroke-width="2" fill="none" stroke-linecap="round"/>';
  const sweatDrop = nervous ? '<path d="M210,165 Q208,175 212,178 Q216,175 214,165 Z" fill="#8ac8f0" opacity=".6"/>' : '';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ls" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d0b0"/><stop offset="1" stop-color="#dcc8a0"/></linearGradient>
<linearGradient id="lh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a4a"/><stop offset="1" stop-color="#1a1a2a"/></linearGradient>
<linearGradient id="lc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a6a"/><stop offset="1" stop-color="#2a3a4a"/></linearGradient>
</defs>
<!-- Hoodie body -->
<path d="M50,480 L50,385 Q50,340 95,320 Q130,308 160,306 Q190,308 225,320 Q270,340 270,385 L270,480 Z" fill="url(#lc)"/>
<!-- Hoodie pocket -->
<path d="M110,400 L110,440 L210,440 L210,400 Q185,395 160,393 Q135,395 110,400 Z" fill="#3a4a5a" opacity=".5"/>
<!-- Hoodie strings -->
<path d="M140,330 Q138,360 133,380" stroke="#2a3a4a" stroke-width="2.5" fill="none"/>
<path d="M180,330 Q182,360 187,380" stroke="#2a3a4a" stroke-width="2.5" fill="none"/>
<circle cx="133" cy="382" r="3" fill="#2a3a4a"/>
<circle cx="187" cy="382" r="3" fill="#2a3a4a"/>
<!-- Neck -->
<path d="M142,265 L142,308 Q160,314 178,308 L178,265 Z" fill="url(#ls)"/>
<!-- Hair back (messy) -->
<path d="M85,195 Q78,100 160,82 Q242,100 235,195 L233,255 Q225,220 215,210 Q205,200 195,195 Q180,185 160,183 Q140,185 125,195 Q115,200 105,210 Q95,220 87,255 Z" fill="url(#lh)"/>
<!-- Face -->
<path d="M108,160 Q108,102 160,92 Q212,102 212,160 L212,220 Q212,260 160,265 Q108,260 108,220 Z" fill="url(#ls)"/>
<!-- Jaw shadow -->
<path d="M120,232 Q160,265 200,232 L200,252 Q160,265 120,252 Z" fill="#ccaa78" opacity=".2"/>
<!-- Ears -->
<ellipse cx="106" cy="186" rx="7" ry="13" fill="url(#ls)"/>
<ellipse cx="214" cy="186" rx="7" ry="13" fill="url(#ls)"/>
<!-- Hair front (messy bangs) -->
<path d="M90,160 Q88,90 160,80 Q232,90 230,160 L225,135 Q215,110 195,108 Q185,130 172,118 Q160,135 148,118 Q135,130 125,108 Q105,112 95,138 Z" fill="url(#lh)"/>
<!-- Messy strands -->
<path d="M100,120 Q95,100 110,95" stroke="#2a2a3a" stroke-width="2.5" fill="none" opacity=".5"/>
<path d="M220,120 Q225,100 210,95" stroke="#2a2a3a" stroke-width="2.5" fill="none" opacity=".5"/>
<path d="M160,95 L165,75" stroke="#2a2a3a" stroke-width="2" fill="none" opacity=".4"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Glasses (square) -->
<g opacity=".85">
<rect x="118" y="188" width="34" height="22" rx="4" fill="rgba(200,210,230,.05)" stroke="#1a1a2a" stroke-width="2"/>
<rect x="168" y="188" width="34" height="22" rx="4" fill="rgba(200,210,230,.05)" stroke="#1a1a2a" stroke-width="2"/>
<line x1="152" y1="197" x2="168" y2="197" stroke="#1a1a2a" stroke-width="2"/>
</g>
${sweatDrop}
<!-- Nose -->
<path d="M158,208 Q155,220 159,224 Q163,220 162,224" stroke="#c4a070" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Blush (nervous) -->
${nervous?'<ellipse cx="128" cy="218" rx="10" ry="6" fill="#e8a0a0" opacity=".25"/><ellipse cx="192" cy="218" rx="10" ry="6" fill="#e8a0a0" opacity=".25"/>':''}
</svg>`;
}

function portraitHuyou(expr){
  const grin = expr==='grin';
  const intense = expr==='intense';
  const browPath = intense
    ?'<path d="M114,170 L150,180" stroke="#2a1a0a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M170,180 L206,170" stroke="#2a1a0a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    :'<path d="M116,172 Q135,166 150,172" stroke="#2a1a0a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M170,172 Q185,166 204,172" stroke="#2a1a0a" stroke-width="4" fill="none" stroke-linecap="round"/>';
  const eyeShape = grin
    ?'<path d="M120,196 Q135,188 150,196" stroke="#1a3a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M170,196 Q185,188 200,196" stroke="#1a3a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="135" cy="198" r="3.5" fill="#2a6a3a"/><circle cx="185" cy="198" r="3.5" fill="#2a6a3a"/><circle cx="136" cy="196" r="1.5" fill="#fff"/><circle cx="186" cy="196" r="1.5" fill="#fff"/>'
    :intense
    ?'<ellipse cx="135" cy="196" rx="10" ry="7" fill="#fff"/><ellipse cx="185" cy="196" rx="10" ry="7" fill="#fff"/><circle cx="137" cy="197" r="6" fill="#1a5a2a"/><circle cx="183" cy="197" r="6" fill="#1a5a2a"/><circle cx="138" cy="195" r="2.5" fill="#fff"/><circle cx="184" cy="195" r="2.5" fill="#fff"/><circle cx="140" cy="199" r="1" fill="#1a3a1a"/><circle cx="181" cy="199" r="1" fill="#1a3a1a"/>'
    :'<ellipse cx="135" cy="197" rx="10" ry="7" fill="#fff"/><ellipse cx="185" cy="197" rx="10" ry="7" fill="#fff"/><circle cx="135" cy="198" r="5.5" fill="#2a6a3a"/><circle cx="185" cy="198" r="5.5" fill="#2a6a3a"/><circle cx="137" cy="196" r="2" fill="#fff"/><circle cx="187" cy="196" r="2" fill="#fff"/>';
  const mouthPath = grin
    ?'<path d="M138,238 Q160,262 182,238 Q175,250 160,252 Q145,250 138,238" fill="#8a3030" opacity=".6"/><path d="M138,238 Q160,260 182,238" stroke="#6a2020" stroke-width="2" fill="none"/><path d="M148,242 L148,252 M172,242 L172,252" stroke="#fff" stroke-width="1.5" opacity=".8"/>'
    :intense
    ?'<path d="M142,244 Q160,250 178,244" stroke="#8a3030" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M140,242 Q160,250 180,242" stroke="#8a3030" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="hs2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0b888"/><stop offset="1" stop-color="#c89868"/></linearGradient>
<linearGradient id="hh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a0a"/><stop offset="1" stop-color="#1a1005"/></linearGradient>
<linearGradient id="hc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a2a2a"/><stop offset="1" stop-color="#5a1a1a"/></linearGradient>
</defs>
<!-- Body (broad shoulders) -->
<path d="M35,480 L35,370 Q35,325 90,305 Q125,295 160,293 Q195,295 230,305 Q285,325 285,370 L285,480 Z" fill="url(#hc2)"/>
<!-- Jersey detail -->
<path d="M160,298 L160,480" stroke="#6a1a1a" stroke-width="1.5" opacity=".4"/>
<path d="M120,340 L120,480 M200,340 L200,480" stroke="#6a1a1a" stroke-width="1" opacity=".3"/>
<!-- Number on jersey -->
<text x="160" y="400" font-size="32" font-weight="bold" fill="#c5a059" opacity=".5" text-anchor="middle" font-family="Arial">77</text>
<!-- Neck (thick) -->
<path d="M136,260 L136,300 Q160,308 184,300 L184,260 Z" fill="url(#hs2)"/>
<!-- Hair back (short, cropped) -->
<path d="M82,190 Q78,98 160,82 Q242,98 238,190 L235,230 Q230,200 220,190 Q210,180 200,175 L160,170 L120,175 Q110,180 100,190 Q90,200 85,230 Z" fill="url(#hh2)"/>
<!-- Face (strong jaw) -->
<path d="M100,155 Q100,100 160,90 Q220,100 220,155 L220,225 Q220,270 160,278 Q100,270 100,225 Z" fill="url(#hs2)"/>
<!-- Jaw shadow (strong) -->
<path d="M112,230 Q160,275 208,230 L208,260 Q160,278 112,260 Z" fill="#b08050" opacity=".3"/>
<!-- Strong jaw lines -->
<path d="M105,200 Q100,230 115,255" stroke="#a07040" stroke-width="2" fill="none" opacity=".2"/>
<path d="M215,200 Q220,230 205,255" stroke="#a07040" stroke-width="2" fill="none" opacity=".2"/>
<!-- Ears -->
<ellipse cx="102" cy="188" rx="8" ry="14" fill="url(#hs2)"/>
<ellipse cx="218" cy="188" rx="8" ry="14" fill="url(#hs2)"/>
<!-- Hair front (short buzz cut style) -->
<path d="M95,150 Q92,88 160,78 Q228,88 225,150 L220,125 Q210,100 188,98 Q180,115 168,105 Q160,118 148,105 Q140,118 128,98 Q108,102 100,125 Z" fill="url(#hh2)"/>
<!-- Fade line -->
<path d="M100,155 Q160,148 220,155" stroke="#1a1005" stroke-width="1.5" fill="none" opacity=".3"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Nose (strong) -->
<path d="M156,205 Q152,222 158,228 Q164,222 162,228" stroke="#a87848" stroke-width="2" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Scar on cheek -->
<path d="M205,160 L210,172" stroke="#8a6848" stroke-width="2" fill="none" opacity=".4"/>
</svg>`;
}

/* ========================================
   CHARACTER PORTRAITS — 色孽新角 青嶙 (Slaneesh Cultist)
======================================== */
function portraitShalaxi(expr){
  const alluring = expr==='alluring';
  const amused = expr==='amused';
  const intense = expr==='intense';
  const browPath = intense
    ?'<path d="M116,170 L150,180" stroke="#1a0a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M170,180 L204,170" stroke="#1a0a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    : alluring
    ?'<path d="M118,174 Q135,166 148,174" stroke="#1a0a2a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,174 Q185,166 202,174" stroke="#1a0a2a" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,172 Q135,168 148,172" stroke="#1a0a2a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,172 Q185,168 202,172" stroke="#1a0a2a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const eyeShape = amused
    ?'<path d="M124,194 Q135,186 146,194 Q135,200 124,194" fill="#1a0a3a"/><path d="M174,194 Q185,186 196,194 Q185,200 174,194" fill="#1a0a3a"/><circle cx="135" cy="194" r="4" fill="#d040ff"/><circle cx="185" cy="194" r="4" fill="#d040ff"/><circle cx="137" cy="192" r="1.8" fill="#fff"/><circle cx="187" cy="192" r="1.8" fill="#fff"/>'
    : intense
    ?'<ellipse cx="135" cy="196" rx="10" ry="7" fill="#fff"/><ellipse cx="185" cy="196" rx="10" ry="7" fill="#fff"/><circle cx="137" cy="197" r="6" fill="#8020c0"/><circle cx="183" cy="197" r="6" fill="#8020c0"/><circle cx="138" cy="194" r="2.5" fill="#fff"/><circle cx="184" cy="194" r="2.5" fill="#fff"/>'
    :'<ellipse cx="135" cy="197" rx="9" ry="7" fill="#fff"/><ellipse cx="185" cy="197" rx="9" ry="7" fill="#fff"/><circle cx="136" cy="197" r="5" fill="#a050e0"/><circle cx="184" cy="197" r="5" fill="#a050e0"/><circle cx="137" cy="194" r="2" fill="#fff"/><circle cx="185" cy="194" r="2" fill="#fff"/>';
  const mouthPath = amused
    ?'<path d="M140,242 Q160,258 180,242" stroke="#c060a0" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    : intense
    ?'<path d="M146,246 Q160,252 174,246" stroke="#c060a0" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M148,248 Q160,250 172,248" stroke="#c060a0" stroke-width="2" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ss1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c0d0"/><stop offset="1" stop-color="#d0a0b8"/></linearGradient>
<linearGradient id="sh1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8020a0"/><stop offset=".5" stop-color="#c040d0"/><stop offset="1" stop-color="#5a1060"/></linearGradient>
<linearGradient id="sc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0a3a"/><stop offset="1" stop-color="#15051a"/></linearGradient>
</defs>
<!-- Robed body -->
<path d="M40,480 L40,370 Q40,320 88,305 Q130,295 160,292 Q190,295 232,305 Q280,320 280,370 L280,480 Z" fill="url(#sc1)"/>
<path d="M160,302 L160,480 M120,340 L120,480 M200,340 L200,480" stroke="#3a1a4a" stroke-width="1" opacity=".4"/>
<!-- Collar -->
<path d="M88,305 Q130,295 160,292 Q190,295 232,305 L220,330 L160,318 L100,330 Z" fill="#3a1a4a"/>
<!-- Neck -->
<path d="M142,265 L142,305 Q160,312 178,305 L178,265 Z" fill="url(#ss1)"/>
<!-- Hair back (flowing tendrils) -->
<path d="M78,190 Q70,95 160,80 Q250,95 242,190 L240,285 L218,270 Q214,210 160,198 Q106,210 102,270 L80,285 Z" fill="url(#sh1)"/>
<!-- Face (ethereal) -->
<path d="M104,158 Q104,100 160,90 Q216,100 216,158 L216,222 Q216,265 160,272 Q104,265 104,222 Z" fill="url(#ss1)"/>
<path d="M116,232 Q160,270 204,232 L204,260 Q160,272 116,260 Z" fill="#c090a0" opacity=".2"/>
<!-- Ears (slightly pointed) -->
<path d="M102,186 Q96,180 98,192 Q100,202 104,196" fill="url(#ss1)"/>
<path d="M218,186 Q224,180 222,192 Q220,202 216,196" fill="url(#ss1)"/>
<!-- Jewel earrings -->
<circle cx="100" cy="202" r="3" fill="#d040ff"/>
<circle cx="220" cy="202" r="3" fill="#d040ff"/>
<line x1="100" y1="205" x2="100" y2="220" stroke="#d040ff" stroke-width="1.5"/>
<line x1="220" y1="205" x2="220" y2="220" stroke="#d040ff" stroke-width="1.5"/>
<!-- Hair front -->
<path d="M88,158 Q85,85 160,76 Q235,85 232,158 L226,128 Q215,105 190,102 Q182,126 170,112 Q160,128 148,112 Q138,126 125,102 Q105,108 94,138 Z" fill="url(#sh1)"/>
<path d="M92,135 Q85,195 90,250" stroke="#6a1a8a" stroke-width="3" fill="none" opacity=".5"/>
<path d="M228,135 Q235,195 230,250" stroke="#6a1a8a" stroke-width="3" fill="none" opacity=".5"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Eyeshadow -->
<ellipse cx="135" cy="188" rx="15" ry="7" fill="#7a2a9a" opacity=".2"/>
<ellipse cx="185" cy="188" rx="15" ry="7" fill="#7a2a9a" opacity=".2"/>
<!-- Nose -->
<path d="M158,210 Q155,222 159,226 Q163,222 162,226" stroke="#c0889a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Choker with slaanesh rune -->
<path d="M140,265 L160,272 L180,265" stroke="#c040d0" stroke-width="3" fill="none"/>
<path d="M156,272 L160,278 L164,272" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>
<circle cx="160" cy="272" r="3" fill="#d040ff"/>
</svg>`;
}

/* ========================================
   CHARACTER PORTRAITS — SS 比耶鱼
======================================== */
function portraitSS(expr){
  const smile = expr==='smile';
  const tilt = expr==='tilt';
  const shrug = expr==='shrug';
  const mouthPath = smile
    ?'<path d="M150,248 Q160,252 170,248" stroke="#6a8a7a" stroke-width="2" fill="none" stroke-linecap="round"/>'
    : tilt
    ?'<path d="M152,250 L168,248" stroke="#6a8a7a" stroke-width="2" fill="none" stroke-linecap="round"/>'
    :'<path d="M150,250 Q160,248 170,250" stroke="#6a8a7a" stroke-width="2" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ssk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a3a"/><stop offset="1" stop-color="#1a2a2a"/></linearGradient>
<linearGradient id="ssf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b0d0c0"/><stop offset="1" stop-color="#8ab0a0"/></linearGradient>
<linearGradient id="ssh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a6a5a"/><stop offset="1" stop-color="#2a4a3a"/></linearGradient>
</defs>
<!-- Hooded cloak -->
<path d="M45,480 L45,360 Q45,315 90,300 Q130,288 160,286 Q190,288 230,300 Q275,315 275,360 L275,480 Z" fill="url(#ssk)"/>
<path d="M160,295 L160,480 M120,330 L120,480 M200,330 L200,480" stroke="#3a4a4a" stroke-width="1" opacity=".3"/>
<!-- Hood up over head -->
<path d="M75,200 Q70,95 160,78 Q250,95 245,200 L243,270 L223,255 Q218,200 160,190 Q102,200 97,255 L77,270 Z" fill="url(#ssh)"/>
<!-- Hood opening (face zone) -->
<path d="M90,150 Q88,95 160,82 Q232,95 230,150 L226,130 Q215,108 192,105 Q182,130 170,116 Q160,132 148,116 Q138,130 125,105 Q105,112 94,138 Z" fill="url(#ssh)"/>
<!-- Face -->
<path d="M108,155 Q108,100 160,90 Q212,100 212,155 L212,218 Q212,260 160,266 Q108,260 108,218 Z" fill="url(#ssf)"/>
<path d="M120,228 Q160,264 200,228 L200,255 Q160,266 120,255 Z" fill="#8aa898" opacity=".25"/>
<!-- Ears slight point -->
<ellipse cx="106" cy="185" rx="6" ry="12" fill="url(#ssf)"/>
<ellipse cx="214" cy="185" rx="6" ry="12" fill="url(#ssf)"/>
<!-- Eyes — deep, unreadable -->
<ellipse cx="135" cy="196" rx="8" ry="5" fill="#fff"/><ellipse cx="185" cy="196" rx="8" ry="5" fill="#fff"/>
<circle cx="135" cy="196" r="3.5" fill="#3a5a4a"/><circle cx="185" cy="196" r="3.5" fill="#3a5a4a"/>
<circle cx="136" cy="194" r="1.5" fill="#fff"/><circle cx="186" cy="194" r="1.5" fill="#fff"/>
<!-- Eyebrows (slight lift) -->
<path d="M120,178 Q135,174 148,178" stroke="#3a4a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M172,178 Q185,174 200,178" stroke="#3a4a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<!-- Nose -->
<path d="M158,210 Q155,222 159,226 Q163,222 162,226" stroke="#7a9a8a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- 比耶手 (peace sign raised near chin, visible) -->
<g transform="translate(76,280) rotate(-10)">
<path d="M0,0 L0,-28" stroke="#b0d0c0" stroke-width="7" stroke-linecap="round" fill="none"/>
<path d="M0,-28 L-6,-40" stroke="#b0d0c0" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="M0,-28 L6,-38" stroke="#b0d0c0" stroke-width="4" stroke-linecap="round" fill="none"/>
</g>
</svg>`;
}

/* ========================================
   CHARACTER PORTRAITS — DZ (SS的占有欲朋友)
======================================== */
function portraitDZ(expr){
  const smile = expr==='smile';
  const serious = expr==='serious';
  const browPath = serious
    ?'<path d="M114,172 L150,180" stroke="#1a2a1a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M170,180 L206,172" stroke="#1a2a1a" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,174 Q135,168 150,174" stroke="#1a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170,174 Q185,168 202,174" stroke="#1a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const eyeShape = smile
    ?'<path d="M124,196 Q135,190 146,196 Q135,200 124,196" fill="#1a2a1a"/><path d="M174,196 Q185,190 196,196 Q185,200 174,196" fill="#1a2a1a"/><circle cx="135" cy="195" r="3" fill="#4a7a3a"/><circle cx="185" cy="195" r="3" fill="#4a7a3a"/><circle cx="137" cy="193" r="1.5" fill="#fff"/><circle cx="187" cy="193" r="1.5" fill="#fff"/>'
    :'<ellipse cx="135" cy="197" rx="9" ry="6" fill="#fff"/><ellipse cx="185" cy="197" rx="9" ry="6" fill="#fff"/><circle cx="135" cy="198" r="4.5" fill="#3a5a2a"/><circle cx="185" cy="198" r="4.5" fill="#3a5a2a"/><circle cx="137" cy="196" r="1.8" fill="#fff"/><circle cx="187" cy="196" r="1.8" fill="#fff"/>';
  const mouthPath = smile
    ?'<path d="M146,244 Q160,254 174,244" stroke="#5a6a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M150,248 L170,248" stroke="#5a6a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="dzs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d0b0"/><stop offset="1" stop-color="#d0b088"/></linearGradient>
<linearGradient id="dzh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a1a"/><stop offset="1" stop-color="#1a1a0a"/></linearGradient>
<linearGradient id="dzc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a3a"/><stop offset="1" stop-color="#1a2a1a"/></linearGradient>
</defs>
<!-- Hoodie body -->
<path d="M50,480 L50,380 Q50,330 95,312 Q130,300 160,300 Q190,300 225,312 Q270,330 270,380 L270,480 Z" fill="url(#dzc)"/>
<!-- Shirt collar peeking out (semi-formal) -->
<path d="M140,315 L160,340 L180,315 L175,335 L160,348 L145,335 Z" fill="#e8e0d0"/>
<!-- Neck -->
<path d="M142,268 L142,308 Q160,314 178,308 L178,268 Z" fill="url(#dzs)"/>
<!-- Hair back -->
<path d="M88,200 Q85,110 160,92 Q235,110 232,200 L230,270 L210,255 Q205,210 160,200 Q115,210 110,255 L90,270 Z" fill="url(#dzh)"/>
<!-- Face -->
<path d="M108,165 Q108,108 160,98 Q212,108 212,165 L212,225 Q212,268 160,273 Q108,268 108,225 Z" fill="url(#dzs)"/>
<!-- Jaw shadow -->
<path d="M120,240 Q160,275 200,240 L200,260 Q160,275 120,260 Z" fill="#b89060" opacity=".2"/>
<!-- Ears -->
<ellipse cx="106" cy="190" rx="7" ry="13" fill="url(#dzs)"/>
<ellipse cx="214" cy="190" rx="7" ry="13" fill="url(#dzs)"/>
<!-- Hair front (casual side part) -->
<path d="M95,168 Q92,100 160,88 Q228,100 225,168 L215,132 Q195,115 165,118 Q155,140 148,128 Q135,138 118,125 Q102,132 98,148 Z" fill="url(#dzh)"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Nose -->
<path d="M158,212 Q155,224 159,228 Q163,224 162,228" stroke="#b08858" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- AOS rulebook corner visible (bottom right, subtle) -->
<g transform="translate(232,420)">
<rect x="0" y="0" width="34" height="48" fill="#c8a040" stroke="#8a6a10" stroke-width="1"/>
<rect x="3" y="3" width="28" height="42" fill="#e0b850" opacity=".8"/>
<text x="17" y="22" font-size="9" fill="#5a4a10" text-anchor="middle" font-family="serif" font-weight="bold">AOS</text>
<text x="17" y="34" font-size="7" fill="#5a4a10" text-anchor="middle" font-family="serif">4ED</text>
</g>
</svg>`;
}

/* ========================================
   CHARACTER PORTRAITS — 谭老师 (Rules Expert)
======================================== */
function portraitTan(expr){
  const smile = expr==='smile';
  const serious = expr==='serious';
  const browPath = serious
    ?'<path d="M116,174 L150,178" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170,178 L204,174" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,176 Q135,172 150,176" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170,176 Q185,172 202,176" stroke="#2a2a3a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const eyeShape = smile
    ?'<path d="M124,196 Q135,190 146,196 Q135,200 124,196" fill="#2a3a4a"/><path d="M174,196 Q185,190 196,196 Q185,200 174,196" fill="#2a3a4a"/><circle cx="135" cy="195" r="3" fill="#5a7a9a"/><circle cx="185" cy="195" r="3" fill="#5a7a9a"/><circle cx="137" cy="193" r="1.5" fill="#fff"/><circle cx="187" cy="193" r="1.5" fill="#fff"/>'
    :'<ellipse cx="135" cy="197" rx="9" ry="6" fill="#fff"/><ellipse cx="185" cy="197" rx="9" ry="6" fill="#fff"/><circle cx="135" cy="198" r="4.5" fill="#3a5a7a"/><circle cx="185" cy="198" r="4.5" fill="#3a5a7a"/><circle cx="137" cy="196" r="1.8" fill="#fff"/><circle cx="187" cy="196" r="1.8" fill="#fff"/>';
  const mouthPath = smile
    ?'<path d="M146,244 Q160,254 174,244" stroke="#8a5050" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M150,248 L170,248" stroke="#8a5050" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ts" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d0b0"/><stop offset="1" stop-color="#d0b088"/></linearGradient>
<linearGradient id="th" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a3a"/><stop offset=".7" stop-color="#3a3a4a"/><stop offset="1" stop-color="#5a5a6a"/></linearGradient>
<linearGradient id="tc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a5a"/><stop offset="1" stop-color="#1a2a3a"/></linearGradient>
</defs>
<!-- Sweater / cardigan body -->
<path d="M50,480 L50,380 Q50,330 95,312 Q130,300 160,300 Q190,300 225,312 Q270,330 270,380 L270,480 Z" fill="url(#tc)"/>
<!-- Sweater pattern (V-neck lines) -->
<path d="M140,315 L160,345 L180,315" stroke="#2a3a4a" stroke-width="2" fill="none"/>
<path d="M100,340 L100,480 M220,340 L220,480" stroke="#2a3a4a" stroke-width="1" opacity=".4"/>
<!-- Shirt collar peeking out -->
<path d="M140,315 L160,340 L180,315 L175,335 L160,348 L145,335 Z" fill="#e8e0d0"/>
<!-- Neck -->
<path d="M142,268 L142,308 Q160,314 178,308 L178,268 Z" fill="url(#ts)"/>
<!-- Hair back (with some silver on temples) -->
<path d="M88,200 Q85,110 160,92 Q235,110 232,200 L230,270 L210,255 Q205,210 160,200 Q115,210 110,255 L90,270 Z" fill="url(#th)"/>
<!-- Face -->
<path d="M108,165 Q108,108 160,98 Q212,108 212,165 L212,225 Q212,268 160,273 Q108,268 108,225 Z" fill="url(#ts)"/>
<!-- Jaw shadow -->
<path d="M120,240 Q160,275 200,240 L200,260 Q160,275 120,260 Z" fill="#b89060" opacity=".2"/>
<!-- Ears -->
<ellipse cx="106" cy="190" rx="7" ry="13" fill="url(#ts)"/>
<ellipse cx="214" cy="190" rx="7" ry="13" fill="url(#ts)"/>
<!-- Hair front (side-parted, tidy) -->
<path d="M95,168 Q92,100 160,88 Q228,100 225,168 L215,132 Q195,115 165,118 Q155,140 148,128 Q135,138 118,125 Q102,132 98,148 Z" fill="url(#th)"/>
<!-- Silver strands at temples -->
<path d="M100,150 Q98,180 104,210" stroke="#a0a0b0" stroke-width="2" fill="none" opacity=".6"/>
<path d="M220,150 Q222,180 216,210" stroke="#a0a0b0" stroke-width="2" fill="none" opacity=".6"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Reading glasses (rectangular, thin) -->
<g opacity=".95">
<rect x="116" y="184" width="38" height="24" rx="3" fill="rgba(220,230,240,.05)" stroke="#3a3a4a" stroke-width="1.8"/>
<rect x="166" y="184" width="38" height="24" rx="3" fill="rgba(220,230,240,.05)" stroke="#3a3a4a" stroke-width="1.8"/>
<line x1="154" y1="195" x2="166" y2="195" stroke="#3a3a4a" stroke-width="1.8"/>
<path d="M116,187 L98,184" stroke="#3a3a4a" stroke-width="1.8" fill="none"/>
<path d="M204,187 L222,184" stroke="#3a3a4a" stroke-width="1.8" fill="none"/>
</g>
<line x1="122" y1="188" x2="128" y2="203" stroke="#fff" stroke-width="1" opacity=".2"/>
<line x1="172" y1="188" x2="178" y2="203" stroke="#fff" stroke-width="1" opacity=".2"/>
<!-- Nose -->
<path d="M158,212 Q155,224 159,228 Q163,224 162,228" stroke="#b08858" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Rulebook in hand (bottom right corner detail) -->
<g transform="translate(230,410)">
<rect x="0" y="0" width="40" height="52" fill="#8a2a2a" stroke="#2a0a0a" stroke-width="1.5"/>
<rect x="3" y="4" width="34" height="44" fill="#b04040" opacity=".7"/>
<text x="20" y="30" font-size="10" fill="#f0d060" text-anchor="middle" font-family="serif" font-weight="bold">40K</text>
<text x="20" y="42" font-size="7" fill="#f0d060" text-anchor="middle" font-family="serif">11ED</text>
</g>
</svg>`;
}

/* ========================================
   CHARACTER PORTRAITS — 药师傅 (Lawyer)
======================================== */
function portraitYao(expr){
  const smile = expr==='smile';
  const serious = expr==='serious';
  const browPath = serious
    ?'<path d="M114,172 L150,180" stroke="#1a1a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M170,180 L206,172" stroke="#1a1a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,174 Q135,168 150,174" stroke="#1a1a2a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170,174 Q185,168 202,174" stroke="#1a1a2a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const eyeShape = smile
    ?'<path d="M124,196 Q135,190 146,196 Q135,200 124,196" fill="#1a1a2a"/><path d="M174,196 Q185,190 196,196 Q185,200 174,196" fill="#1a1a2a"/><circle cx="135" cy="195" r="3" fill="#4a4a5a"/><circle cx="185" cy="195" r="3" fill="#4a4a5a"/><circle cx="137" cy="193" r="1.5" fill="#fff"/><circle cx="187" cy="193" r="1.5" fill="#fff"/>'
    :'<ellipse cx="135" cy="197" rx="9" ry="6" fill="#fff"/><ellipse cx="185" cy="197" rx="9" ry="6" fill="#fff"/><circle cx="135" cy="198" r="4.5" fill="#2a2a3a"/><circle cx="185" cy="198" r="4.5" fill="#2a2a3a"/><circle cx="137" cy="196" r="1.8" fill="#fff"/><circle cx="187" cy="196" r="1.8" fill="#fff"/>';
  const mouthPath = smile
    ?'<path d="M146,244 Q160,254 174,244" stroke="#7a4040" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M148,248 Q160,250 172,248" stroke="#7a4040" stroke-width="2" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ys" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d0b0"/><stop offset="1" stop-color="#d0b088"/></linearGradient>
<linearGradient id="yh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a1a"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient>
<linearGradient id="ysu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a2a"/><stop offset="1" stop-color="#0a0a15"/></linearGradient>
<linearGradient id="ysh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f0f0"/><stop offset="1" stop-color="#c0c0c8"/></linearGradient>
</defs>
<!-- Suit jacket -->
<path d="M45,480 L45,375 Q45,325 92,308 Q128,296 160,294 Q192,296 228,308 Q275,325 275,375 L275,480 Z" fill="url(#ysu)"/>
<!-- Jacket lapel (V) -->
<path d="M110,320 L160,360 L210,320 L200,360 L180,395 L160,395 L140,395 L120,360 Z" fill="url(#ysh)"/>
<path d="M130,325 L160,360 L190,325 L185,355 L160,375 L135,355 Z" fill="url(#ysu)"/>
<!-- White shirt -->
<path d="M145,340 L160,365 L175,340 L175,395 L145,395 Z" fill="url(#ysh)"/>
<!-- Tie (red) -->
<path d="M155,340 L165,340 L168,395 L160,410 L152,395 Z" fill="#8a2020"/>
<path d="M155,340 L165,340 L163,360 L157,360 Z" fill="#a03030"/>
<!-- Jacket pocket square (fold) -->
<path d="M85,370 L115,370 L115,385 L85,385 Z" fill="#e8e0d0" opacity=".9"/>
<path d="M90,370 L92,378 M100,370 L98,382 M110,370 L108,378" stroke="#c0b090" stroke-width="1" opacity=".6"/>
<!-- Neck -->
<path d="M142,268 L142,308 Q160,314 178,308 L178,268 Z" fill="url(#ys)"/>
<!-- Hair back (short, business cut) -->
<path d="M92,190 Q88,105 160,88 Q232,105 228,190 L226,245 Q220,215 210,205 Q195,192 175,188 L160,186 L145,188 Q125,192 110,205 Q100,215 94,245 Z" fill="url(#yh)"/>
<!-- Face -->
<path d="M108,160 Q108,105 160,95 Q212,105 212,160 L212,222 Q212,267 160,272 Q108,267 108,222 Z" fill="url(#ys)"/>
<!-- Jaw shadow (well groomed) -->
<path d="M118,235 Q160,272 202,235 L202,258 Q160,272 118,258 Z" fill="#a87848" opacity=".2"/>
<!-- Ears -->
<ellipse cx="106" cy="188" rx="7" ry="13" fill="url(#ys)"/>
<ellipse cx="214" cy="188" rx="7" ry="13" fill="url(#ys)"/>
<!-- Hair front (side-parted, sharp) -->
<path d="M95,163 Q92,98 160,86 Q228,98 225,163 L212,128 Q195,110 172,113 Q160,138 148,122 Q130,128 115,118 Q102,128 98,148 Z" fill="url(#yh)"/>
<!-- Hair part line -->
<path d="M135,118 Q133,140 130,168" stroke="#0a0a0a" stroke-width="1.5" fill="none" opacity=".6"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Nose -->
<path d="M158,210 Q155,222 159,226 Q163,222 162,226" stroke="#a87848" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Peppa Pig doodle in corner (signature detail) -->
<g transform="translate(238,420)" opacity=".85">
<ellipse cx="15" cy="15" rx="14" ry="12" fill="#f8a8c8"/>
<ellipse cx="8" cy="10" rx="5" ry="7" fill="#f8a8c8"/>
<circle cx="7" cy="10" r="2" fill="#000"/>
<circle cx="13" cy="12" r="1.5" fill="#000"/>
<circle cx="19" cy="12" r="1.5" fill="#000"/>
<path d="M10,18 Q15,20 20,18" stroke="#000" stroke-width="1" fill="none"/>
<circle cx="6" cy="9" r="1" fill="#000"/>
<circle cx="9" cy="8" r="1" fill="#000"/>
</g>
<!-- Genestealer cult subtle badge on lapel -->
<circle cx="115" cy="345" r="4" fill="#a04040" opacity=".8"/>
<path d="M112,342 L118,348 M118,342 L112,348" stroke="#f0d060" stroke-width="1.2"/>
</svg>`;
}

/* ========================================
   CHARACTER PORTRAITS — Alex (Creepy Collector)
======================================== */
function portraitAlex(expr){
  const grin = expr==='grin';
  const unsettling = expr==='unsettling';
  const browPath = unsettling
    ?'<path d="M118,178 Q135,182 148,180" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,180 Q185,182 202,178" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>'
    :'<path d="M118,174 Q135,170 148,174" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M172,174 Q185,170 202,174" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  // Eyes are large, glassy, and slightly asymmetric — the "wrong" feeling
  const eyeShape = grin
    ?'<path d="M122,196 Q135,192 148,196 Q135,204 122,196" fill="#3a1a1a"/><path d="M172,196 Q185,192 198,196 Q185,204 172,196" fill="#3a1a1a"/><circle cx="135" cy="198" r="4" fill="#a02020"/><circle cx="185" cy="198" r="4" fill="#a02020"/><circle cx="137" cy="196" r="1.5" fill="#fff"/><circle cx="187" cy="196" r="1.5" fill="#fff"/>'
    : unsettling
    ?'<ellipse cx="135" cy="196" rx="11" ry="9" fill="#fff"/><ellipse cx="185" cy="196" rx="11" ry="9" fill="#fff"/><circle cx="135" cy="197" r="4" fill="#8a1a1a"/><circle cx="187" cy="197" r="4" fill="#8a1a1a"/><circle cx="136" cy="196" r="1.8" fill="#fff"/><circle cx="188" cy="196" r="1.8" fill="#fff"/><path d="M124,192 L146,192" stroke="#3a1a1a" stroke-width="0.5" opacity=".4"/><path d="M174,192 L196,192" stroke="#3a1a1a" stroke-width="0.5" opacity=".4"/>'
    :'<ellipse cx="135" cy="197" rx="10" ry="7" fill="#fff"/><ellipse cx="185" cy="197" rx="10" ry="7" fill="#fff"/><circle cx="135" cy="198" r="5" fill="#6a2020"/><circle cx="185" cy="198" r="5" fill="#6a2020"/><circle cx="137" cy="196" r="2" fill="#fff"/><circle cx="187" cy="196" r="2" fill="#fff"/>';
  // Mouth — the "wrong" smile that's too wide
  const mouthPath = grin
    ?'<path d="M132,240 Q160,270 188,240 Q175,258 160,260 Q145,258 132,240" fill="#4a1010" opacity=".7"/><path d="M132,240 Q160,268 188,240" stroke="#2a0505" stroke-width="2" fill="none"/><path d="M140,248 L140,255 M155,252 L155,258 M170,252 L170,258 M182,248 L182,255" stroke="#fff" stroke-width="1" opacity=".7"/>'
    : unsettling
    ?'<path d="M138,246 Q160,254 182,246" stroke="#5a1010" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M138,246 Q145,252 155,250 M182,246 Q175,252 165,250" stroke="#5a1010" stroke-width="1" fill="none"/>'
    :'<path d="M146,246 Q160,252 174,246" stroke="#5a1010" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="as" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0c8a8"/><stop offset="1" stop-color="#c8a878"/></linearGradient>
<linearGradient id="ah" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#1a1005"/></linearGradient>
<linearGradient id="ac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4030"/><stop offset="1" stop-color="#2a2418"/></linearGradient>
<linearGradient id="acs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7050"/><stop offset="1" stop-color="#5a4530"/></linearGradient>
</defs>
<!-- Vest/waistcoat body (military hobbyist vibe) -->
<path d="M50,480 L50,380 Q50,330 95,312 Q130,300 160,300 Q190,300 225,312 Q270,330 270,380 L270,480 Z" fill="url(#ac)"/>
<!-- Vest pockets (little compartments for "collecting") -->
<rect x="80" y="350" width="40" height="30" fill="url(#acs)" stroke="#2a2418" stroke-width="1"/>
<rect x="200" y="350" width="40" height="30" fill="url(#acs)" stroke="#2a2418" stroke-width="1"/>
<rect x="130" y="390" width="60" height="35" fill="url(#acs)" stroke="#2a2418" stroke-width="1"/>
<!-- Pocket flaps with buttons -->
<circle cx="100" cy="352" r="2" fill="#c5a059"/>
<circle cx="220" cy="352" r="2" fill="#c5a059"/>
<circle cx="160" cy="392" r="2" fill="#c5a059"/>
<!-- Neck -->
<path d="M142,268 L142,308 Q160,314 178,308 L178,268 Z" fill="url(#as)"/>
<!-- Collar (buttoned up, slightly off) -->
<path d="M95,312 Q130,302 160,300 Q190,302 225,312 L215,335 L160,325 L105,335 Z" fill="#2a2418"/>
<!-- Hair back -->
<path d="M88,200 Q85,110 160,92 Q235,110 232,200 L230,270 L210,255 Q205,210 160,200 Q115,210 110,255 L90,270 Z" fill="url(#ah)"/>
<!-- Face -->
<path d="M108,165 Q108,108 160,98 Q212,108 212,165 L212,225 Q212,268 160,273 Q108,268 108,225 Z" fill="url(#as)"/>
<!-- Jaw shadow -->
<path d="M120,240 Q160,275 200,240 L200,260 Q160,275 120,260 Z" fill="#a88858" opacity=".25"/>
<!-- Face pallor — subtle dark tint under eyes -->
<ellipse cx="135" cy="212" rx="12" ry="4" fill="#8a5050" opacity=".2"/>
<ellipse cx="185" cy="212" rx="12" ry="4" fill="#8a5050" opacity=".2"/>
<!-- Ears -->
<ellipse cx="106" cy="190" rx="7" ry="13" fill="url(#as)"/>
<ellipse cx="214" cy="190" rx="7" ry="13" fill="url(#as)"/>
<!-- Hair front (neatly combed but a strand out of place — the "off" detail) -->
<path d="M95,168 Q92,100 160,88 Q228,100 225,168 L215,135 Q195,115 168,118 Q160,140 148,125 Q130,135 115,120 Q102,132 98,148 Z" fill="url(#ah)"/>
<!-- The single wrong strand -->
<path d="M158,90 Q170,80 168,110" stroke="#1a1005" stroke-width="3" fill="none" opacity=".8"/>
<!-- Eyebrows -->
${browPath}
<!-- Eyes -->
${eyeShape}
<!-- Nose -->
<path d="M158,212 Q155,224 159,228 Q163,224 162,228" stroke="#a87848" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- Mouth -->
${mouthPath}
<!-- Notepad / clipboard in vest pocket (tiny detail — his "records") -->
<g transform="translate(206,354)">
<rect x="0" y="0" width="16" height="20" fill="#e8e0c0" stroke="#3a2a1a" stroke-width="0.8"/>
<line x1="2" y1="4" x2="14" y2="4" stroke="#3a2a1a" stroke-width="0.4"/>
<line x1="2" y1="8" x2="14" y2="8" stroke="#3a2a1a" stroke-width="0.4"/>
<line x1="2" y1="12" x2="14" y2="12" stroke="#3a2a1a" stroke-width="0.4"/>
<line x1="2" y1="16" x2="10" y2="16" stroke="#3a2a1a" stroke-width="0.4"/>
</g>
<!-- Tiny model head "trophy" in other pocket -->
<g transform="translate(90,358)">
<circle cx="10" cy="10" r="6" fill="#4a4a5a"/>
<circle cx="8" cy="9" r="1" fill="#a02020"/>
<circle cx="12" cy="9" r="1" fill="#a02020"/>
</g>
<!-- Faint reflection in one eye (creepy asymmetry) -->
<circle cx="140" cy="195" r="0.8" fill="#fff" opacity=".9"/>
</svg>`;
}
