export function powerpointRadar(svg, rows, options, zipStore) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
  const inch = 914400, SW = 12192000, SH = 6858000;
  const theme = {
    plain: { name: 'Plain', background: '#FFFFFF', accent: '#25364A', secondary: '#6B7280', text: '#17212E' },
    mightora: { name: 'Mightora', background: '#F7F9FB', accent: '#E76F51', secondary: '#1769AA', text: '#102A43' },
    ocean: { name: 'Ocean', background: '#F0F8FD', accent: '#087E9B', secondary: '#2355B5', text: '#16324F' },
    forest: { name: 'Forest', background: '#F3F9F2', accent: '#287D57', secondary: '#91AD46', text: '#1D382D' },
    sunset: { name: 'Sunset', background: '#FFF8F1', accent: '#CB593E', secondary: '#A9478C', text: '#432A35' }
  }[options.theme] || null;
  const preset = theme || { name: 'Custom', background: '#FFFFFF', accent: '#1769AA', secondary: '#E76F51', text: '#102A43' };
  const colour = (input, fallback) => /^#[0-9A-Fa-f]{6}$/.test(input || '') ? input.toUpperCase() : fallback;
  const colours = {
    background: colour(options.background, preset.background),
    accent: colour(options.accent, preset.accent),
    secondary: colour(options.secondary, preset.secondary),
    text: colour(options.text, preset.text)
  };
  const font = escape(String(options.font || 'Aptos').slice(0, 72));
  const RGB = input => {
    if (!input || input === 'none' || input === 'transparent') return null;
    let c = String(input).trim();
    if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + [...c.slice(1)].map(x => x + x).join('');
    if (/^#[0-9a-f]{6,8}$/i.test(c)) return { hex: c.slice(1, 7).toUpperCase(), alpha: c.length === 9 ? parseInt(c.slice(7), 16) / 255 : 1 };
    const m = c.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const parts = m[1].split(/[,\s/]+/).map(Number);
      if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) return { hex: parts.slice(0, 3).map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('').toUpperCase(), alpha: Number.isFinite(parts[3]) ? parts[3] : 1 };
    }
    return null;
  };
  const fill = (color, opacity = 1) => {
    const c = RGB(color); if (!c || c.alpha * opacity <= 0) return '<a:noFill/>';
    const alpha = Math.max(0, Math.min(1, c.alpha * opacity));
    return `<a:solidFill><a:srgbClr val="${c.hex}">${alpha < 1 ? `<a:alpha val="${Math.round(alpha * 100000)}"/>` : ''}</a:srgbClr></a:solidFill>`;
  };
  const lineStyle = (color, width = 0, dash = false, opacity = 1) => `<a:ln w="${Math.max(0, Math.round(width))}">${fill(color, opacity)}${dash ? '<a:prstDash val="dash"/>' : ''}</a:ln>`;
  const rectangle = '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>';
  const ellipse = '<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>';
  const name = options.title || rows[0]?.[0] || 'Technology Radar';
  const xmlSlideFiles = [];
  let shapes = [], nextId = 1;
  function element(label, x, y, w, h, geom, interior, stroke, paragraphs = '', rotation = 0) {
    if (![x, y, w, h].every(Number.isFinite)) return;
    const id = ++nextId;
    const txBox = paragraphs ? ' txBox="1"' : '';
    const rot = rotation ? ` rot="${Math.round(((rotation % 360) + 360) % 360 * 60000)}"` : '';
    const transform = `<a:xfrm${rot}><a:off x="${Math.round(x)}" y="${Math.round(y)}"/><a:ext cx="${Math.max(1, Math.round(w))}" cy="${Math.max(1, Math.round(h))}"/></a:xfrm>`;
    shapes.push(`<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${escape(label)}"/><p:cNvSpPr${txBox}/><p:nvPr/></p:nvSpPr><p:spPr>${transform}${geom}${interior}${stroke}</p:spPr>${paragraphs ? `<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr"><a:noAutofit/></a:bodyPr><a:lstStyle/>${paragraphs}</p:txBody>` : ''}</p:sp>`);
  }
  function text(label, value, x, y, width, height, size = 16, color = colours.text, bold = false, align = 'l', rotation = 0, face = font) {
    const lines = String(value ?? '').split(/\r?\n/);
    const paragraphs = lines.map(line => `<a:p><a:pPr algn="${align}"/><a:r><a:rPr lang="en-GB" sz="${Math.max(600, Math.round(size * 100))}"${bold ? ' b="1"' : ''}>${fill(color)}<a:latin typeface="${face}"/></a:rPr><a:t>${escape(line)}</a:t></a:r><a:endParaRPr lang="en-GB"/></a:p>`).join('');
    element(label, x, y, width, height, rectangle, '<a:noFill/>', '<a:ln><a:noFill/></a:ln>', paragraphs, rotation);
  }
  function rect(label, x, y, w, h, color, strokeColor = 'none', strokeWidth = 0) {
    element(label, x, y, w, h, rectangle, fill(color), lineStyle(strokeColor, strokeWidth));
  }
  function circle(label, x, y, w, h, color, strokeColor = 'none', strokeWidth = 0) {
    element(label, x, y, w, h, ellipse, fill(color), lineStyle(strokeColor, strokeWidth));
  }
  function slide(label, draw) {
    shapes = []; nextId = 1;
    rect('Editable slide background', 0, 0, SW, SH, colours.background);
    draw();
    const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld name="${escape(label)}"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Slide objects"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes.join('')}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
    xmlSlideFiles.push(content);
  }
  function frame(title, subtitle, page) {
    rect('Accent rule', .48 * inch, .48 * inch, .07 * inch, .56 * inch, colours.accent);
    text('Slide heading', title, .75 * inch, .44 * inch, 11.6 * inch, .45 * inch, 23, colours.text, true);
    if (subtitle) text('Slide subtitle', subtitle, .76 * inch, .99 * inch, 11.7 * inch, .3 * inch, 10, colours.secondary);
    rect('Footer rule', .48 * inch, 7.12 * inch, 12.35 * inch, .014 * inch, '#D5DDE4');
    text('Editable footer', `Mightora Radar  •  ${preset.name}`, .52 * inch, 7.17 * inch, 8 * inch, .19 * inch, 8, colours.secondary);
    text('Slide number', String(page), 12.4 * inch, 7.17 * inch, .35 * inch, .19 * inch, 8, colours.secondary, false, 'r');
  }
  slide('Radar overview', () => {
    rect('Title bar', .7 * inch, 1.7 * inch, .11 * inch, 3.1 * inch, colours.accent);
    text('Editable presentation title', name, 1.15 * inch, 1.88 * inch, 10.8 * inch, 1.55 * inch, 37, colours.text, true);
    text('Editable strapline', 'Technology decisions at a glance', 1.18 * inch, 3.61 * inch, 10 * inch, .53 * inch, 21, colours.secondary);
    text('Editable summary', `${rows.length} technologies  •  ${new Set(rows.map(row => row[1])).size} categories  •  Native PowerPoint shapes`, 1.18 * inch, 4.36 * inch, 10.6 * inch, .4 * inch, 14, colours.text);
    rect('Title accent', 1.18 * inch, 5.15 * inch, 3.4 * inch, .065 * inch, colours.secondary);
    text('Editable attribution', 'Created with Mightora Radar  |  radar.mightora.io', 1.18 * inch, 6.79 * inch, 10 * inch, .3 * inch, 11, colours.secondary);
  });
  slide('Interactive technology radar', () => {
    frame(name, 'Every ring, sector, dot, label and legend is an editable PowerPoint object.', 2);
    const root = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    if (root.localName !== 'svg' || root.querySelector('parsererror')) throw new Error('Invalid SVG supplied for PowerPoint.');
    const viewBox = (root.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    if (viewBox.length !== 4 || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[3] <= 0) throw new Error('Invalid SVG viewBox.');
    root.setAttribute('width', viewBox[2]); root.setAttribute('height', viewBox[3]);
    root.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden';
    document.body.append(root);
    const scale = Math.min((9.15 * inch) / viewBox[2], (5.66 * inch) / viewBox[3]);
    const dx = .4 * inch + (9.15 * inch - viewBox[2] * scale) / 2;
    const dy = 1.38 * inch + (5.58 * inch - viewBox[3] * scale) / 2;
    const u = n => Math.round(n * scale);
    const bounds = box => ({ x: dx + u(box.x), y: dy + u(box.y), w: Math.max(1, u(box.width)), h: Math.max(1, u(box.height)) });
    try {
      for (const node of root.querySelectorAll('circle,line,path,text')) {
        if (node.closest('defs')) continue;
        const style = getComputedStyle(node);
        const interior = fill(style.fill, parseFloat(style.fillOpacity) || (style.fillOpacity === '0' ? 0 : 1));
        const stroke = lineStyle(style.stroke, u(parseFloat(style.strokeWidth) || 0), node.hasAttribute('stroke-dasharray'), parseFloat(style.strokeOpacity) || (style.strokeOpacity === '0' ? 0 : 1));
        if (node.localName === 'circle') {
          const r = Number(node.getAttribute('r')), cx = Number(node.getAttribute('cx')), cy = Number(node.getAttribute('cy'));
          const b = bounds({ x: cx - r, y: cy - r, width: 2 * r, height: 2 * r });
          element('Editable radar circle', b.x, b.y, b.w, b.h, ellipse, interior, stroke);
        } else if (node.localName === 'text') {
          const fontSize = parseFloat(style.fontSize) || 11;
          const size = Math.max(6, fontSize * scale / inch * 72);
          const putText = (content, box, angle = 0) => {
            const b = bounds(box);
            if (node.hasAttribute('filter')) rect('Editable text label backing', b.x - u(2), b.y - u(1), b.w + u(4), b.h + u(2), '#EEEEEE');
            text('Editable radar label', content, b.x, b.y, b.w, b.h, size, style.fill && style.fill !== 'none' ? style.fill : colours.text, Number(style.fontWeight) >= 600, node.getAttribute('text-anchor') === 'middle' ? 'ctr' : 'l', angle);
          };
          if (node.querySelector('textPath') && node.getNumberOfChars) {
            const content = [...node.textContent];
            for (let i = 0; i < node.getNumberOfChars(); i += 1) {
              const ch = content[i] || '';
              if (!ch.trim()) continue;
              const start = node.getStartPositionOfChar(i), end = node.getEndPositionOfChar(i);
              const angle = node.getRotationOfChar(i), radians = angle * Math.PI / 180;
              const glyph = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
              const cx = (start.x + end.x) / 2 + Math.sin(radians) * fontSize * .28;
              const cy = (start.y + end.y) / 2 - Math.cos(radians) * fontSize * .28;
              putText(ch, { x: cx - glyph / 2 - 1, y: cy - fontSize * .65, width: glyph + 3, height: fontSize * 1.4 }, angle);
            }
          } else {
            const b = node.getBBox();
            const lines = node.querySelectorAll('tspan');
            putText(lines.length ? [...lines].map(line => line.textContent).join('\n') : node.textContent, { x: b.x - 2, y: b.y - 2, width: b.width + 5, height: b.height + 5 });
          }
        } else {
          const b = node.getBBox();
          let points;
          if (node.localName === 'line') {
            points = [{ x: Number(node.getAttribute('x1')), y: Number(node.getAttribute('y1')) }, { x: Number(node.getAttribute('x2')), y: Number(node.getAttribute('y2')) }];
          } else {
            const length = node.getTotalLength();
            const count = Math.min(900, Math.max(2, Math.ceil(length / 4)));
            points = Array.from({ length: count + 1 }, (_, i) => node.getPointAtLength(length * i / count));
          }
          const box = bounds(b);
          const cmds = points.map((point, i) => `<a:${i ? 'lnTo' : 'moveTo'}><a:pt x="${Math.round((point.x - b.x) * scale)}" y="${Math.round((point.y - b.y) * scale)}"/></a:${i ? 'lnTo' : 'moveTo'}>`).join('');
          const closed = /z\s*$/i.test(node.getAttribute('d') || '') ? '<a:close/>' : '';
          const geom = `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst><a:path w="${box.w}" h="${box.h}">${cmds}${closed}</a:path></a:pathLst></a:custGeom>`;
          element('Editable radar boundary', box.x, box.y, box.w, box.h, geom, interior, stroke);
        }
      }
    } finally { root.remove(); }
    const x = 9.64 * inch;
    text('Status legend heading', 'STATUS RINGS', x, 1.48 * inch, 3.1 * inch, .3 * inch, 13, colours.text, true);
    const statuses = options.statuses || [];
    statuses.slice(0, 9).forEach((status, i) => {
      const y = (1.91 + i * .37) * inch;
      rect(`Editable ${status.label} swatch`, x, y + .035 * inch, .19 * inch, .19 * inch, status.backgroundColor || '#FFFFFF', colours.secondary, 2000);
      text(`Editable ${status.label} legend`, status.label, x + .29 * inch, y, 2.85 * inch, .27 * inch, 10, colours.text);
    });
    const yBase = 2.08 + Math.min(9, statuses.length) * .37;
    text('Dot legend heading', 'DOT STATUS', x, yBase * inch, 3.1 * inch, .27 * inch, 13, colours.text, true);
    (options.dotStatuses || []).slice(0, 6).forEach((dot, i) => {
      const y = (yBase + .4 + i * .35) * inch;
      circle(`Editable ${dot.label} marker`, x, y + .02 * inch, .18 * inch, .18 * inch, dot.shape === 'ring' ? '#FFFFFF' : dot.color, dot.shape === 'ring' ? dot.color : 'none', 21000);
      text(`Editable ${dot.label} dot legend`, dot.label, x + .29 * inch, y, 2.85 * inch, .27 * inch, 10, colours.text);
    });
  });
  const pageSize = 9;
  const total = Math.max(1, Math.ceil(rows.length / pageSize));
  for (let page = 0; page < total; page += 1) {
    slide('Editable technology details', () => {
      frame('Technology details', `${name}  •  Page ${page + 1} of ${total}`, page + 3);
      const columnStart = [0.53, 4.9, 7.7, 10.15];
      const columnWidth = [4.3, 2.74, 2.4, 2.5];
      const headers = ['TECHNOLOGY / SUBCATEGORY', 'CATEGORY', 'RING', 'DOT STATUS'];
      headers.forEach((header, col) => {
        rect(`Editable header fill ${col}`, columnStart[col] * inch, 1.44 * inch, columnWidth[col] * inch, .42 * inch, colours.accent);
        text(`Editable header ${header}`, header, (columnStart[col] + .12) * inch, 1.5 * inch, (columnWidth[col] - .18) * inch, .27 * inch, 9, '#FFFFFF', true);
      });
      const pageRows = rows.slice(page * pageSize, (page + 1) * pageSize);
      pageRows.forEach((row, index) => {
        const y = (1.93 + index * .54) * inch;
        const items = [`${row[3]}\n${row[2]}`, row[1], row[4], row[5]];
        items.forEach((value, col) => {
          rect(`Editable cell background ${index + 1}-${col + 1}`, columnStart[col] * inch, y, columnWidth[col] * inch, .5 * inch, index % 2 ? '#EDF1F5' : '#FFFFFF', '#DBE2E8', 4000);
          text(`Editable cell ${index + 1}-${col + 1}`, value, (columnStart[col] + .12) * inch, (y / inch + .03) * inch, (columnWidth[col] - .24) * inch, .43 * inch, col ? 9.4 : 9.1, colours.text, col === 0);
        });
      });
      if (!pageRows.length) text('No technology entries', 'No technologies to display.', 1 * inch, 2.55 * inch, 10 * inch, .4 * inch, 17, colours.secondary);
    });
  }
  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${xmlSlideFiles.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join('')}</p:sldIdLst><p:sldSz cx="${SW}" cy="${SH}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle/></p:presentation>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${xmlSlideFiles.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('')}</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
  const presentationRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${xmlSlideFiles.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join('')}</Relationships>`;
  const master = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld name="Mightora Radar"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Group"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`;
  const layout = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Group"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
  const RGBHex = input => colour(input, '#000000').slice(1);
  const fontScheme = `<a:fontScheme name="${escape(preset.name)}"><a:majorFont><a:latin typeface="${font}"/></a:majorFont><a:minorFont><a:latin typeface="${font}"/></a:minorFont></a:fontScheme>`;
  const colourItem = (label, value) => `<a:${label}><a:srgbClr val="${RGBHex(value)}"/></a:${label}>`;
  const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="${escape(preset.name)}"><a:themeElements><a:clrScheme name="${escape(preset.name)}">${colourItem('dk1', colours.text)}${colourItem('lt1', colours.background)}${colourItem('dk2', colours.text)}${colourItem('lt2', '#FFFFFF')}${colourItem('accent1', colours.accent)}${colourItem('accent2', colours.secondary)}${colourItem('accent3', '#4F8A8B')}${colourItem('accent4', '#8A6CB3')}${colourItem('accent5', '#D69C38')}${colourItem('accent6', '#A3B8C8')}${colourItem('hlink', colours.accent)}${colourItem('folHlink', colours.secondary)}</a:clrScheme>${fontScheme}<a:fmtScheme name="Simple"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="accent1"/></a:solidFill><a:solidFill><a:schemeClr val="accent2"/></a:solidFill></a:fillStyleLst><a:lnStyleLst>${[9525, 19050, 28575].map(w => `<a:ln w="${w}"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>`).join('')}</a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="lt1"/></a:solidFill><a:solidFill><a:schemeClr val="lt2"/></a:solidFill><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;
  const files = [
    ['[Content_Types].xml', contentTypes],
    ['_rels/.rels', rels],
    ['ppt/presentation.xml', presentationXml],
    ['ppt/_rels/presentation.xml.rels', presentationRels],
    ['ppt/slideMasters/slideMaster1.xml', master],
    ['ppt/slideMasters/_rels/slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`],
    ['ppt/slideLayouts/slideLayout1.xml', layout],
    ['ppt/slideLayouts/_rels/slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`],
    ['ppt/theme/theme1.xml', themeXml]
  ];
  xmlSlideFiles.forEach((file, i) => {
    files.push([`ppt/slides/slide${i + 1}.xml`, file]);
    files.push([`ppt/slides/_rels/slide${i + 1}.xml.rels`, `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`]);
  });
  return zipStore(files);
}
