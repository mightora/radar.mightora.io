// Native Office 2010+ Word shapes, following Microsoft's MS-ODRAWXML group/shape schemas.
// Every visible SVG element becomes an editable shape or text box; no raster fallback.
const xml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[char]));
function solid(color, opacity = 1) {
  if (!color || color === 'none') return '<a:noFill/>';
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = [...hex].map(char => char + char).join('');
  if (hex.length === 8) { opacity *= parseInt(hex.slice(6), 16) / 255; hex = hex.slice(0, 6); }
  const rgb = color.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1].split(/[ ,/]+/).map(Number);
    hex = parts.slice(0, 3).map(value => value.toString(16).padStart(2, '0')).join('');
    opacity *= parts[3] ?? 1;
  }
  return `<a:solidFill><a:srgbClr val="${hex.toUpperCase()}">${opacity < 1 ? `<a:alpha val="${Math.round(opacity * 100000)}"/>` : ''}</a:srgbClr></a:solidFill>`;
}
export function wordRadar(svg, maxWidth = 8229600, maxHeight = 5394960) {
  const root = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  if (root.localName !== 'svg' || root.querySelector('parsererror')) throw new Error('Invalid radar SVG.');
  const [, , width, height] = root.getAttribute('viewBox').split(/\s+/).map(Number);
  root.setAttribute('width', width); root.setAttribute('height', height);
  root.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden';
  document.body.append(root);
  const shapes = [];
  let id = 1;
  function shape(name, box, geometry, fill, stroke = '<a:ln><a:noFill/></a:ln>', text = '', rotation = 0) {
    const x = units(box.x), y = units(box.y), w = Math.max(1, units(box.width)), h = Math.max(1, units(box.height));
    const transform = `<a:xfrm${rotation ? ` rot="${Math.round(((rotation % 360 + 360) % 360) * 60000)}"` : ''}><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>`;
    shapes.push(`<wps:wsp><wps:cNvPr id="${++id}" name="${xml(name)}"/><wps:cNvSpPr${text ? ' txBox="1"' : ''}/><wps:spPr>${transform}${geometry}${fill}${stroke}</wps:spPr>${text ? `<wps:txbx><w:txbxContent>${text}</w:txbxContent></wps:txbx>` : ''}<wps:bodyPr lIns="0" tIns="0" rIns="0" bIns="0" wrap="none" anchor="ctr"><a:noAutofit/></wps:bodyPr></wps:wsp>`);
  }
  const rectangle = '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>';
  function textBox(node, text, box, rotation = 0) {
    const style = getComputedStyle(node), size = parseFloat(style.fontSize);
    const color = style.fill, bold = Number(style.fontWeight) >= 600;
    const pointSize = Math.max(2, Math.round(size * scale / 6350));
    const paragraphs = text.split('\n').map(line => `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="${node.getAttribute('text-anchor') === 'middle' ? 'center' : 'left'}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Manrope" w:hAnsi="Manrope"/>${bold ? '<w:b/>' : ''}<w:color w:val="${solid(color).match(/val="([^"]+)"/)[1]}"/><w:sz w:val="${pointSize}"/></w:rPr><w:t xml:space="preserve">${xml(line)}</w:t></w:r></w:p>`).join('');
    const background = node.hasAttribute('filter') ? solid('#eeeeee', .85) : '<a:noFill/>';
    shape(node.getAttribute('class') || 'Radar text', box, rectangle, background, undefined, paragraphs, rotation);
  }
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const units = value => Math.round(value * scale);
  try {
    for (const node of root.querySelectorAll('circle,line,path,text')) {
      if (node.closest('defs')) continue;
      const style = getComputedStyle(node);
      const fill = solid(style.fill, Number(style.fillOpacity));
      const stroke = `<a:ln w="${units(parseFloat(style.strokeWidth))}">${solid(style.stroke, Number(style.strokeOpacity))}${node.hasAttribute('stroke-dasharray') ? '<a:prstDash val="dash"/>' : ''}</a:ln>`;
      if (node.localName === 'circle') {
        const r = Number(node.getAttribute('r'));
        shape('Radar circle', { x: Number(node.getAttribute('cx')) - r, y: Number(node.getAttribute('cy')) - r, width: 2 * r, height: 2 * r }, '<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>', fill, stroke);
      } else if (node.localName === 'text') {
        const path = node.querySelector('textPath');
        if (path) {
          // Preserve curved lettering as individually editable, rotated character boxes.
          const characters = [...node.textContent];
          for (let index = 0; index < node.getNumberOfChars(); index += 1) {
            const start = node.getStartPositionOfChar(index), end = node.getEndPositionOfChar(index);
            const rotation = node.getRotationOfChar(index), angle = rotation * Math.PI / 180;
            const size = parseFloat(style.fontSize), glyphWidth = Math.hypot(end.x - start.x, end.y - start.y) + 1;
            const cx = (start.x + end.x) / 2 + Math.sin(angle) * size * .35;
            const cy = (start.y + end.y) / 2 - Math.cos(angle) * size * .35;
            textBox(node, characters[index] || '', { x: cx - glyphWidth / 2, y: cy - size * .75, width: glyphWidth, height: size * 1.5 }, rotation);
          }
        } else {
          const bounds = node.getBBox();
          const lines = node.querySelectorAll('tspan');
          textBox(node, lines.length ? [...lines].map(line => line.textContent).join('\n') : node.textContent, { x: bounds.x - 1, y: bounds.y - 2, width: bounds.width + 4, height: bounds.height + 4 });
        }
      } else {
        const box = node.getBBox();
        let points;
        if (node.localName === 'line') points = [{ x: Number(node.getAttribute('x1')), y: Number(node.getAttribute('y1')) }, { x: Number(node.getAttribute('x2')), y: Number(node.getAttribute('y2')) }];
        else {
          // Bounded polyline approximation keeps curved boundaries editable vector paths.
          const length = node.getTotalLength(), count = Math.min(1500, Math.max(2, Math.ceil(length / 3)));
          points = Array.from({ length: count + 1 }, (_, index) => node.getPointAtLength(length * index / count));
        }
        const w = Math.max(1, units(box.width)), h = Math.max(1, units(box.height));
        const commands = points.map((point, index) => `<a:${index ? 'lnTo' : 'moveTo'}><a:pt x="${units(point.x - box.x)}" y="${units(point.y - box.y)}"/></a:${index ? 'lnTo' : 'moveTo'}>`).join('');
        const geometry = `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst><a:path w="${w}" h="${h}">${commands}${/z\s*$/i.test(node.getAttribute('d') || '') ? '<a:close/>' : ''}</a:path></a:pathLst></a:custGeom>`;
        shape(node.getAttribute('class') || 'Radar boundary', box, geometry, fill, stroke);
      }
    }
  } finally { root.remove(); }
  const imageWidth = Math.round(width * scale), imageHeight = Math.round(height * scale);
  const group = `<wpg:wgp><wpg:cNvGrpSpPr><a:grpSpLocks noUngrp="0"/></wpg:cNvGrpSpPr><wpg:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${imageWidth}" cy="${imageHeight}"/><a:chOff x="0" y="0"/><a:chExt cx="${units(width)}" cy="${units(height)}"/></a:xfrm></wpg:grpSpPr>${shapes.join('')}</wpg:wgp>`;
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="0"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="column"><wp:align>center</wp:align></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>0</wp:posOffset></wp:positionV><wp:extent cx="${imageWidth}" cy="${imageHeight}"/><wp:wrapTopAndBottom/><wp:docPr id="1" name="Editable radar"/><wp:cNvGraphicFramePr/><a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup">${group}</a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p>`;
}
